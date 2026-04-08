import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';

/**
 * src/services/firebaseData.js (Modo Migración y Subcolecciones)
 * Administra el estado en una nueva colección de "versions" y un documento "metadata",
 * manteniendo soporte para lectura del antiguo "mainDoc".
 */

// Referencias de la nueva y vieja estructura
const APP_STATE_DOC_REF = doc(db, 'appState', 'mainDoc');
const METADATA_DOC_REF = doc(db, 'appState', 'metadata');
const VERSIONS_COL_REF = collection(db, 'versions');

// Cache para evitar sobreescribir documentos en Firebase si no han cambiado en memoria
let cachedVersions = {};

/**
 * Se suscribe a:
 * 1. Colección de versiones (nueva)
 * 2. Documento de metadata (version en prod)
 * 3. Documento legacy (mainDoc) por si la nueva colección está vacía (migración en progreso)
 */
export function subscribeToAppState(callback) {
    let metadata = { versionEnProduccionId: null };
    let versionsMap = new Map();
    let legacyVersions = null;

    let isMetadataLoaded = false;
    let isVersionsLoaded = false;
    let isLegacyLoaded = false;

    const emitIfReady = () => {
        if (isMetadataLoaded && isVersionsLoaded && isLegacyLoaded) {
            let finalVersions = Array.from(versionsMap.values());
            
            // Si la nueva colección no tiene datos pero la estructura antigua sí, caemos en el fallback
            if (finalVersions.length === 0 && legacyVersions && legacyVersions.length > 0) {
                finalVersions = legacyVersions;
                console.log("🔥 Firebase: Cargado estado LEGACY (migración pendiente).", finalVersions.length, "versiones.");
            } else {
                console.log("🔥 Firebase: Cargado estado ACTUALIZADO (colecciones).", finalVersions.length, "versiones.");
            }

            callback({
                versions: finalVersions,
                versionEnProduccionId: metadata.versionEnProduccionId
            });
        }
    };

    const unsubMetadata = onSnapshot(METADATA_DOC_REF, (docSnap) => {
        if (docSnap.exists()) {
            metadata = docSnap.data();
        }
        isMetadataLoaded = true;
        emitIfReady();
    }, (err) => console.error("🔥 Error Metadata:", err));

    const unsubVersions = onSnapshot(VERSIONS_COL_REF, (colSnap) => {
        versionsMap.clear();
        colSnap.forEach(docSnap => {
            const data = docSnap.data();
            versionsMap.set(docSnap.id, data);
            
            // Llenamos el caché con lo que viene de Firebase para no sobreescribir innecesariamente después
            cachedVersions[docSnap.id] = JSON.stringify(data);
        });
        isVersionsLoaded = true;
        emitIfReady();
    }, (err) => console.error("🔥 Error Versions:", err));

    const unsubLegacy = onSnapshot(APP_STATE_DOC_REF, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            legacyVersions = Array.isArray(data.versiones) ? data.versiones : [];
            // Usamos legacy production ID solo si el nuevo no existe
            if (!isMetadataLoaded && data.versionEnProduccionId && !metadata.versionEnProduccionId) {
                metadata.versionEnProduccionId = data.versionEnProduccionId;
            }
        }
        isLegacyLoaded = true;
        emitIfReady();
    }, (err) => console.error("🔥 Error Legacy:", err));

    return () => {
        unsubMetadata();
        unsubVersions();
        unsubLegacy();
    };
}

/**
 * Guarda el estado en la nueva estructura basada en colecciones usando batch.
 */
export async function saveAppState(fullState) {
    try {
        let batches = [];
        let currentBatch = writeBatch(db);
        let operationsCount = 0;
        let totalOperationsCount = 0;

        const commitCurrentBatch = () => {
            batches.push(currentBatch.commit());
            currentBatch = writeBatch(db);
            operationsCount = 0;
        };

        const incrementAndCheck = () => {
            operationsCount++;
            totalOperationsCount++;
            if (operationsCount >= 490) { // Límite de 500 por lote
                commitCurrentBatch();
            }
        };

        // 1. Guardar Metadata
        currentBatch.set(METADATA_DOC_REF, {
            versionEnProduccionId: fullState.versionEnProduccionId || null,
            timestamp: new Date().toISOString()
        });
        incrementAndCheck();

        // 2. Determinar versiones eliminadas para borrarlas de la subcolección
        const currentVersionIds = fullState.versions.map(v => String(v.id));
        const deletedIds = Object.keys(cachedVersions).filter(id => !currentVersionIds.includes(id));
        
        let localCacheUpdate = {}; // Para actualizar localmente la caché si tiene éxito
        
        for (const id of deletedIds) {
            currentBatch.delete(doc(db, 'versions', id));
            incrementAndCheck();
            localCacheUpdate[id] = null; // null significa borrado
        }

        // 3. Guardar versiones nuevas o modificadas
        for (const v of fullState.versions) {
            const stringifiedV = JSON.stringify(v);
            const idDoc = String(v.id);

            // Solo enviar a Firebase si es distinta a lo que tenemos en caché
            if (cachedVersions[idDoc] !== stringifiedV) {
                const docRef = doc(db, 'versions', idDoc);
                currentBatch.set(docRef, v);
                incrementAndCheck();
                localCacheUpdate[idDoc] = stringifiedV;
            }
        }

        if (operationsCount > 0) {
            batches.push(currentBatch.commit());
        }

        if (batches.length > 0) {
            await Promise.all(batches);
            console.log(`💾 Estado guardado exitosamente (${totalOperationsCount} operaciones).`);
            
            // Actualizar caché solo si todo salió bien
            for (const [id, value] of Object.entries(localCacheUpdate)) {
                if (value === null) {
                    delete cachedVersions[id];
                } else {
                    cachedVersions[id] = value;
                }
            }
        }
    } catch (error) {
        console.error("❌ Error al guardar estado:", error);
        throw error;
    }
}