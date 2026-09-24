import { db } from './firebaseConfig';
import {
    doc,
    collection,
    setDoc,
    deleteDoc,
    getDocs,
    onSnapshot,
    writeBatch,
    getDoc,
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Helpers de rutas
// ---------------------------------------------------------------------------

/**
 * Devuelve las referencias para un workspaceId.
 *
 * Estructura nueva (sharded):
 *   appState/meta                     ← { versionEnProduccionId, timestamp }
 *   appState/meta/versions/{id}       ← 1 doc por versión
 *
 * Para workspaces dinámicos:
 *   workspaces/{wsId}/appState/meta
 *   workspaces/{wsId}/appState/meta/versions/{id}
 *
 * Legacy (a migrar):
 *   appState/mainDoc                  ← array completo
 */
function getRefs(workspaceId) {
    const isLegacy = !workspaceId || workspaceId === 'ventas-b2c';

    if (isLegacy) {
        return {
            metaRef:      doc(db, 'appState', 'meta'),
            versionsCol:  collection(db, 'appState', 'meta', 'versions'),
            legacyDocRef: doc(db, 'appState', 'mainDoc'),
        };
    }

    return {
        metaRef:      doc(db, 'workspaces', workspaceId, 'appState', 'meta'),
        versionsCol:  collection(db, 'workspaces', workspaceId, 'appState', 'meta', 'versions'),
        legacyDocRef: doc(db, 'workspaces', workspaceId, 'appState', 'mainDoc'),
    };
}

// ---------------------------------------------------------------------------
// Migración automática (formato viejo → nuevo)
// ---------------------------------------------------------------------------

/**
 * Detecta si existe el documento legacy (mainDoc con array `versiones`)
 * y, de ser así, migra los datos al nuevo formato de subcolección.
 * Es idempotente: si ya migró, no hace nada.
 */
async function migrateIfNeeded(workspaceId) {
    const { metaRef, versionsCol, legacyDocRef } = getRefs(workspaceId);

    // Chequear si ya existe el nuevo formato
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
        // Ya está en el nuevo formato, no migrar
        return;
    }

    // Chequear si existe el documento viejo
    const legacySnap = await getDoc(legacyDocRef);
    if (!legacySnap.exists()) {
        // No hay nada que migrar
        return;
    }

    const legacyData = legacySnap.data();
    const versiones  = Array.isArray(legacyData.versiones) ? legacyData.versiones : [];
    const prodId     = legacyData.versionEnProduccionId || null;

    console.log(`[Firebase] Migrando ${versiones.length} versiones al nuevo formato para workspace "${workspaceId}"...`);

    // Escribir en lotes (Firestore limita 500 ops por batch)
    const BATCH_SIZE = 400;
    for (let i = 0; i < versiones.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = versiones.slice(i, i + BATCH_SIZE);

        for (const version of chunk) {
            const versionId = String(version.id ?? Date.now() + Math.random());
            const vRef = doc(versionsCol, versionId);
            batch.set(vRef, version);
        }
        await batch.commit();
    }

    // Escribir el meta doc con versionEnProduccionId
    await setDoc(metaRef, {
        versionEnProduccionId: prodId,
        timestamp: new Date().toISOString(),
        migratedAt: new Date().toISOString(),
    });

    // Borrar el documento viejo solo si la migración fue exitosa
    await deleteDoc(legacyDocRef);

    console.log(`[Firebase] Migración completada para workspace "${workspaceId}".`);
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Se suscribe al estado de un workspace.
 * Devuelve { versions, versionEnProduccionId }.
 *
 * Primero realiza la migración (si corresponde), luego se suscribe
 * al meta doc y a la subcolección de versiones.
 */
export function subscribeToAppState(workspaceId, callback, onError) {
    const { metaRef, versionsCol } = getRefs(workspaceId);

    let cleanupFn     = null;
    let cancelled     = false;

    // 1. Primero migrar si es necesario, luego suscribirse
    migrateIfNeeded(workspaceId)
        .then(() => {
            if (cancelled) return;

            // Estado combinado: meta + versions
            let currentMeta     = { versionEnProduccionId: null };
            let currentVersions = null; // null = aún no cargó

            const notify = () => {
                if (currentVersions === null) return; // esperar primera carga de versions
                callback({
                    versions: currentVersions,
                    versionEnProduccionId: currentMeta.versionEnProduccionId,
                });
            };

            // Suscripción al meta doc
            const metaUnsub = onSnapshot(metaRef, (snap) => {
                if (snap.exists()) {
                    currentMeta = snap.data();
                } else {
                    currentMeta = { versionEnProduccionId: null };
                }
                notify();
            }, (error) => {
                console.error('Error en suscripción meta:', error);
                if (onError) onError(error);
            });

            // Suscripción a la subcolección de versiones
            const versionsUnsub = onSnapshot(versionsCol, (snap) => {
                currentVersions = snap.docs.map(d => d.data());
                // Ordenar por número de versión para mantener el orden
                currentVersions.sort((a, b) => {
                    const na = parseFloat(a.numero) || 0;
                    const nb = parseFloat(b.numero) || 0;
                    return na - nb;
                });
                notify();
            }, (error) => {
                console.error('Error en suscripción versions:', error);
                if (onError) onError(error);
            });

            // Guardar función de limpieza
            cleanupFn = () => {
                metaUnsub();
                versionsUnsub();
            };
        })
        .catch((error) => {
            console.error('Error en migración Firebase:', error);
            if (onError) onError(error);
        });

    // Devolver función para cancelar (funciona aunque la migración no terminó aún)
    return () => {
        cancelled = true;
        if (cleanupFn) cleanupFn();
    };
}

/**
 * Guarda el estado completo de un workspace en Firebase.
 * Cada versión se escribe en su propio documento en la subcolección `versions/`.
 * El meta doc almacena solo { versionEnProduccionId, timestamp }.
 */
export async function saveAppState(workspaceId, fullState) {
    const { metaRef, versionsCol } = getRefs(workspaceId);
    const { versions, versionEnProduccionId } = fullState;

    try {
        // 1. Obtener IDs actuales en Firestore para detectar versiones borradas
        const existingSnap = await getDocs(versionsCol);
        const existingIds  = new Set(existingSnap.docs.map(d => d.id));
        const newIds       = new Set(versions.map(v => String(v.id)));

        // 2. Escribir/actualizar versiones en lotes
        const BATCH_SIZE = 400;
        for (let i = 0; i < versions.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = versions.slice(i, i + BATCH_SIZE);

            for (const version of chunk) {
                const versionId = String(version.id);
                const vRef = doc(versionsCol, versionId);
                batch.set(vRef, version);
            }
            await batch.commit();
        }

        // 3. Borrar versiones que ya no existen en el estado local
        const toDelete = [...existingIds].filter(id => !newIds.has(id));
        if (toDelete.length > 0) {
            const deleteBatch = writeBatch(db);
            for (const id of toDelete) {
                deleteBatch.delete(doc(versionsCol, id));
            }
            await deleteBatch.commit();
        }

        // 4. Actualizar meta doc
        await setDoc(metaRef, {
            versionEnProduccionId: versionEnProduccionId ?? null,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error al guardar estado en Firebase:', error);
        throw error;
    }
}