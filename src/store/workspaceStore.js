import { create } from 'zustand';
import {
    subscribeToWorkspaces,
    createWorkspace as createWorkspaceInFirebase,
    deleteWorkspace as deleteWorkspaceInFirebase,
    VENTAS_B2C_WORKSPACE,
} from '../services/workspacesService';

const STORAGE_KEY = 'bada_last_workspace_id';
const DEFAULT_ID = 'ventas-b2c';

// A-08.1: mismo switch que dataStore. En el build de producción queda en
// `false`, por lo que ni el import() dinámico ni el workspace de captura
// entran en el bundle.
const FIXTURES_ENABLED = import.meta.env.VITE_APP_FIXTURES === '1';

const getInitialWorkspaceId = () => {
    // En captura no se lee un id real de localStorage: el workspace del
    // fixture se aplica en initialize().
    if (FIXTURES_ENABLED) return DEFAULT_ID;
    try {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_ID;
    } catch {
        return DEFAULT_ID;
    }
};

export const useWorkspaceStore = create((set, get) => ({
    workspaces: [VENTAS_B2C_WORKSPACE], // empieza con legacy hasta que Firestore responda
    activeWorkspaceId: getInitialWorkspaceId(),
    isDropdownOpen: false,
    unsubscribe: null,

    /** Suscribe a la colección de workspaces en Firestore */
    initialize: () => {
        const prev = get().unsubscribe;
        if (prev) prev();

        // Modo fixtures: workspace fijo de captura, sin Firestore.
        if (FIXTURES_ENABLED) {
            let cancelled = false;

            import('../test/fixtures/appState.js')
                .then(({ createFixtureState }) => {
                    if (cancelled) return;
                    const { workspace } = createFixtureState();
                    set({
                        workspaces: [workspace],
                        activeWorkspaceId: workspace.id,
                        isDropdownOpen: false,
                    });
                })
                .catch((error) => {
                    console.error('Error cargando el workspace de fixtures:', error);
                });

            const fixtureUnsubscribe = () => { cancelled = true; };
            set({ unsubscribe: fixtureUnsubscribe });
            return fixtureUnsubscribe;
        }

        const unsub = subscribeToWorkspaces((workspaces) => {
            set({ workspaces });

            // Si el workspace activo fue eliminado, volver al default
            const activeId = get().activeWorkspaceId;
            const stillExists = workspaces.some(w => w.id === activeId);
            if (!stillExists) {
                get().setActiveWorkspace(DEFAULT_ID);
            }
        });

        set({ unsubscribe: unsub });
        return unsub;
    },

    /** Cambia el workspace activo y persiste en localStorage */
    setActiveWorkspace: (id) => {
        // En captura no se persiste: un id de fixture en localStorage
        // contaminaría el arranque real de la app.
        if (!FIXTURES_ENABLED) {
            try { localStorage.setItem(STORAGE_KEY, id); } catch { /* noop */ }
        }
        set({ activeWorkspaceId: id, isDropdownOpen: false });
    },

    /** Crea un nuevo workspace y lo activa */
    createWorkspace: async (name) => {
        if (!name?.trim()) return;
        const id = await createWorkspaceInFirebase(name.trim());
        get().setActiveWorkspace(id);
        return id;
    },

    /** Elimina un workspace (protegido = no se puede borrar) */
    deleteWorkspace: async (id) => {
        const ws = get().workspaces.find(w => w.id === id);
        if (!ws || ws.protected) return;

        await deleteWorkspaceInFirebase(id);

        // Si era el activo, volver al default
        if (get().activeWorkspaceId === id) {
            get().setActiveWorkspace(DEFAULT_ID);
        }
    },

    /** Retorna el objeto workspace activo */
    getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find(w => w.id === activeWorkspaceId) || VENTAS_B2C_WORKSPACE;
    },

    toggleDropdown: () => set(s => ({ isDropdownOpen: !s.isDropdownOpen })),
    closeDropdown: () => set({ isDropdownOpen: false }),
}));
