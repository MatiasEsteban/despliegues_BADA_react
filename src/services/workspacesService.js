import { db } from './firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// Workspace de Ventas B2C hardcodeado (legacy, no vive en Firestore)
export const VENTAS_B2C_WORKSPACE = {
    id: 'ventas-b2c',
    name: 'Ventas B2C',
    type: 'full',
    protected: true,
};

/**
 * Se suscribe a la colección de workspaces dinámicos en Firestore.
 * Siempre antepone el workspace legacy "Ventas B2C".
 */
export function subscribeToWorkspaces(callback) {
    const unsubscribe = onSnapshot(
        collection(db, 'workspaces'),
        (snap) => {
            const dynamic = snap.docs.map(d => ({
                id: d.id,
                protected: false,
                ...d.data(),
            }));
            callback([VENTAS_B2C_WORKSPACE, ...dynamic]);
        },
        (error) => {
            console.error('Error suscribiendo a workspaces:', error);
            // Fallback: al menos devuelve el workspace legacy
            callback([VENTAS_B2C_WORKSPACE]);
        }
    );
    return unsubscribe;
}

/**
 * Crea un nuevo workspace en Firestore.
 * Retorna el id generado.
 */
export async function createWorkspace(name) {
    const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    const id = `${slug}-${Date.now()}`;

    await setDoc(doc(db, 'workspaces', id), {
        name: name.trim(),
        type: 'changelog',
        createdAt: new Date().toISOString(),
    });

    return id;
}

/**
 * Elimina un workspace de Firestore (incluyendo su appState si existe).
 * El workspace "ventas-b2c" no se puede eliminar.
 */
export async function deleteWorkspace(id) {
    if (id === 'ventas-b2c') return;

    // Eliminar appState interno si existe
    try {
        await deleteDoc(doc(db, 'workspaces', id, 'appState', 'mainDoc'));
    } catch { /* puede no existir aún */ }

    await deleteDoc(doc(db, 'workspaces', id));
}
