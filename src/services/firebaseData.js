import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * src/services/firebaseData.js (Modo Compatibilidad Legacy)
 * Conecta con el documento único 'appState/mainDoc' para mantener
 * compatibilidad con la estructura de datos original.
 */

// Referencia al documento único donde vive toda la app
const APP_STATE_DOC_REF = doc(db, 'appState', 'mainDoc');

/**
 * Se suscribe al documento global de estado.
 * Devuelve un objeto con { versiones, versionEnProduccionId }
 */
export function subscribeToAppState(callback) {
    const unsubscribe = onSnapshot(APP_STATE_DOC_REF, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("🔥 Firebase: Estado completo recibido", data);

            callback({
                versions: Array.isArray(data.versiones) ? data.versiones : [],
                versionEnProduccionId: data.versionEnProduccionId || null
            });
        } else {
            console.warn("🔥 Firebase: No se encontró el documento appState/mainDoc. Iniciando vacío.");
            callback({ versions: [], versionEnProduccionId: null });
        }
    }, (error) => {
        console.error("🔥 Error en suscripción:", error);
    });

    return unsubscribe;
}

/**
 * Guarda el estado COMPLETO de la aplicación.
 * En este modelo legacy, cualquier cambio (crear, borrar, editar) requiere
 * re-enviar todo el array de versiones.
 */
export async function saveAppState(fullState) {
    const payload = {
        versiones: fullState.versions,
        versionEnProduccionId: fullState.versionEnProduccionId,
        timestamp: new Date().toISOString() // Metadata útil
    };

    try {
        await setDoc(APP_STATE_DOC_REF, payload);
        console.log("💾 Estado guardado exitosamente en Firebase.");
    } catch (error) {
        console.error("❌ Error al guardar estado:", error);
        throw error;
    }
}