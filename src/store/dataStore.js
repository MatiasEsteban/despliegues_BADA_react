import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToAppState, saveAppState } from '../services/firebaseData';
import { generateStats } from './statsCalculator';
import { Debouncer } from '../utils/debouncer';

// A-08.1: modo fixtures determinista. Solo se activa con un build/mode
// explícito (`vite build --mode capture`, que carga `.env.capture`). En el
// build de producción la constante queda en `false` y el import() dinámico del
// fixture se elimina del bundle.
const FIXTURES_ENABLED = import.meta.env.VITE_APP_FIXTURES === '1';

// El debouncer necesita saber el workspaceId en el momento de guardar
const debouncedSave = Debouncer.debounce((state) => {
    if (FIXTURES_ENABLED) return;
    saveAppState(state.workspaceId, {
        versions: state.versions,
        versionEnProduccionId: state.versionEnProduccionId,
    });
}, 1500);

// --- HELPERS DE NORMALIZACIÓN ---

export const normalizeCommentEntry = (entry) => {
    if (typeof entry === 'string') return { id: Date.now() + Math.random(), texto: entry, autor: '', cdu: '' };
    if (entry && typeof entry === 'object' && entry.texto !== undefined) {
        return {
            autor: '',
            cdu: entry.cdu || entry.cduNombre || '',
            ...entry,
            cdu: entry.cdu || entry.cduNombre || '',
        };
    }
    return { id: Date.now() + Math.random(), texto: String(entry || ''), autor: '', cdu: '' };
};

export const normalizeCDUChangeEntry = (entry) => {
    if (typeof entry === 'string') return { id: Date.now() + Math.random(), cduNombre: '', texto: entry, autor: '' };
    if (entry && typeof entry === 'object') {
        return {
            id: entry.id || Date.now() + Math.random(),
            cduNombre: entry.cduNombre || '',
            texto: entry.texto || '',
            autor: entry.autor || '',
        };
    }
    return { id: Date.now() + Math.random(), cduNombre: '', texto: String(entry || ''), autor: '' };
};

export const normalizeComments = (comentarios) => {
    if (!comentarios) return { mejoras: [], salidas: [], cambiosCaliente: [], observaciones: [], cambiosCDU: [] };
    return {
        mejoras: (comentarios.mejoras || []).map(normalizeCommentEntry),
        salidas: (comentarios.salidas || []).map(normalizeCommentEntry),
        cambiosCaliente: (comentarios.cambiosCaliente || []).map(normalizeCommentEntry),
        observaciones: (comentarios.observaciones || []).map(normalizeCommentEntry),
        cambiosCDU: (comentarios.cambiosCDU || []).map(normalizeCDUChangeEntry),
    };
};

const EMPTY_COMENTARIOS = { mejoras: [], salidas: [], cambiosCaliente: [], observaciones: [], cambiosCDU: [] };

const initialState = {
    versions: [],
    filteredVersions: [],
    selectedVersionId: null,
    activeCDUs: [],
    versionStats: {},
    versionEnProduccionId: null,
    loading: false,
    error: null,
    viewMode: 'changelog',
    filterText: '',
    unsubscribe: null,
    originalVersionState: null,
    isSaving: false,
    workspaceId: 'ventas-b2c', // se actualiza en initialize()
};

export const useDataStore = create((set, get) => ({
    ...initialState,

    /** Inicializa la suscripción al workspace indicado */
    initialize: (workspaceId) => {
        // Limpiar suscripción anterior
        const prev = get().unsubscribe;
        if (prev) prev();

        set({ loading: true, error: null, workspaceId });

        // Modo fixtures: hidratación local y determinista, sin Firestore.
        // El import() dinámico mantiene el fixture fuera del bundle de producción.
        if (FIXTURES_ENABLED) {
            let cancelled = false;

            import('../test/fixtures/appState.js')
                .then(({ createFixtureState }) => {
                    if (cancelled) return;

                    const { workspace, versions, versionEnProduccionId } = createFixtureState();

                    set({
                        versions,
                        versionEnProduccionId,
                        versionStats: generateStats(versions),
                        filteredVersions: get()._applyFilter(versions, get().filterText),
                        loading: false,
                        error: null,
                        workspaceId: workspace.id,
                    });

                    const selectedId = get().selectedVersionId;
                    if (selectedId) get().selectVersion(selectedId, versions);
                })
                .catch((err) => {
                    console.error('Error cargando los fixtures de captura:', err);
                    set({
                        loading: false,
                        error: 'No se pudieron cargar los fixtures de captura.',
                    });
                });

            const fixtureUnsubscribe = () => { cancelled = true; };
            set({ unsubscribe: fixtureUnsubscribe });
            return fixtureUnsubscribe;
        }

        const newUnsubscribe = subscribeToAppState(workspaceId, (data) => {
            const { versions, versionEnProduccionId } = data;
            const stats = generateStats(versions);
            const filtered = get()._applyFilter(versions, get().filterText);

            set({
                versions,
                versionEnProduccionId,
                versionStats: stats,
                filteredVersions: filtered,
                loading: false,
                error: null,
            });

            const selectedId = get().selectedVersionId;
            if (selectedId) get().selectVersion(selectedId, versions);
        }, (err) => {
            // Si Firestore rechaza por permisos, dejar de spinear
            console.error('Error en suscripción Firebase:', err);
            set({ loading: false, error: 'Sin acceso a Firebase. Verificá las reglas de Firestore.' });
        });

        set({ unsubscribe: newUnsubscribe });
        return newUnsubscribe;
    },

    clearStore: () => {
        const prev = get().unsubscribe;
        if (prev) prev();
        set({ ...initialState });
    },

    _scheduleSave: () => {
        // A-08.1: en captura no se programa el Debouncer ni se toca Firestore.
        if (FIXTURES_ENABLED) return;
        set({ isSaving: true });
        debouncedSave(get());
        setTimeout(() => set({ isSaving: false }), 2000);
    },

    importData: async (newVersions, newProdId) => {
        set({ loading: true });
        try {
            set({
                versions: newVersions,
                versionEnProduccionId: newProdId,
                filteredVersions: get()._applyFilter(newVersions, get().filterText),
            });
            if (!FIXTURES_ENABLED) {
                await saveAppState(get().workspaceId, {
                    versions: newVersions,
                    versionEnProduccionId: newProdId,
                });
            }
            set({ loading: false });
            return true;
        } catch (e) {
            console.error(e);
            set({ loading: false, error: 'Error al guardar datos importados' });
            throw e;
        }
    },

    getVersionEnProduccionId: () => get().versionEnProduccionId,

    // Auto-registra fecha y hora de despliegue cuando se marca como producción
    setVersionEnProduccion: (versionId) => {
        const versions = get().versions;
        let newVersions = versions;

        if (versionId) {
            const now = new Date();
            const fechaHoy = now.toISOString().split('T')[0];
            const horaAhora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            newVersions = versions.map(v =>
                v.id === versionId
                    ? { ...v, fechaDespliegue: fechaHoy, horaDespliegue: horaAhora }
                    : v
            );
        }

        set({
            versions: newVersions,
            versionEnProduccionId: versionId,
            filteredVersions: get()._applyFilter(newVersions, get().filterText),
        });
        get()._scheduleSave();
    },

    addNewEmptyVersion: async () => {
        const versions = get().versions;
        const safeId = Date.now();
        const maxNum = versions.reduce((max, v) => Math.max(max, parseFloat(v.numero) || 0), 0);
        const nextNum = (maxNum + 1).toString();

        const newVersion = {
            id: safeId,
            numero: nextNum,
            fechaCreacion: '',
            horaCreacion: '',
            fuente: 'Nueva',
            fechaDespliegue: '',
            horaDespliegue: '',
            cdus: [],
            comentarios: { ...EMPTY_COMENTARIOS },
            titulo: '',
        };

        const newVersions = [...versions, newVersion];
        set({ versions: newVersions, filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    duplicateVersion: async (sourceVersionId) => {
        const versions = get().versions;
        const sourceVersion = versions.find(v => v.id === sourceVersionId);
        if (!sourceVersion) return;

        const safeId = Date.now();
        const maxNum = versions.reduce((max, v) => Math.max(max, parseFloat(v.numero) || 0), 0);
        const nextNum = (maxNum + 1).toString();

        const clonedCdus = (sourceVersion.cdus || []).map(cdu => ({
            ...cdu,
            uuid: uuidv4(),
            historial: [],
            cambios: [],
        }));

        const newVersion = {
            ...sourceVersion,
            id: safeId,
            numero: nextNum,
            fechaCreacion: '',
            horaCreacion: '',
            fuente: `V${sourceVersion.numero}`,
            fechaDespliegue: '',
            horaDespliegue: '',
            cdus: clonedCdus,
            comentarios: { ...EMPTY_COMENTARIOS },
            titulo: '',
        };

        const newVersions = [...versions, newVersion];
        set({ versions: newVersions, filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    deleteVersion: async (versionId) => {
        const newVersions = get().versions.filter(v => v.id !== versionId);
        let newProdId = get().versionEnProduccionId;
        if (newProdId === versionId) newProdId = null;

        set({ versions: newVersions, versionEnProduccionId: newProdId });
        if (get().selectedVersionId === versionId) get().deselectVersion();
        set({ filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    setFilter: (text) => {
        const filtered = get()._applyFilter(get().versions, text);
        set({ filterText: text, filteredVersions: filtered });
    },

    // Búsqueda profunda: número, fuente, título y contenido de entradas del changelog
    _applyFilter: (versions, text) => {
        if (!text) return versions;
        const lowerText = text.toLowerCase();

        return versions.filter(v => {
            if (v.numero?.toString().toLowerCase().includes(lowerText)) return true;
            if (v.fuente?.toLowerCase().includes(lowerText)) return true;
            if (v.titulo?.toLowerCase().includes(lowerText)) return true;

            const c = v.comentarios || {};
            const stdCats = ['mejoras', 'salidas', 'cambiosCaliente', 'observaciones'];
            for (const cat of stdCats) {
                for (const entry of (c[cat] || [])) {
                    const txt = typeof entry === 'string' ? entry : (entry?.texto || '');
                    if (txt.toLowerCase().includes(lowerText)) return true;
                    if (entry?.autor?.toLowerCase().includes(lowerText)) return true;
                    if (entry?.cdu?.toLowerCase().includes(lowerText)) return true;
                }
            }
            for (const entry of (c.cambiosCDU || [])) {
                const txt = typeof entry === 'string' ? entry : (entry?.texto || '');
                if (txt.toLowerCase().includes(lowerText)) return true;
                if (entry?.cduNombre?.toLowerCase().includes(lowerText)) return true;
                if (entry?.cdu?.toLowerCase().includes(lowerText)) return true;
            }
            return false;
        });
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    selectVersion: (versionId, allVersions = get().versions) => {
        const selectedVersion = allVersions.find(v => v.id === versionId);
        if (!selectedVersion) return;
        set({
            selectedVersionId: versionId,
            viewMode: 'detail',
            activeCDUs: selectedVersion.cdus || [],
            originalVersionState: JSON.parse(JSON.stringify(selectedVersion)),
        });
    },

    deselectVersion: () => {
        set({ selectedVersionId: null, viewMode: 'changelog', activeCDUs: [], originalVersionState: null });
    },

    updateCurrentVersion: (updatedVersionData) => {
        const versions = get().versions;
        const index = versions.findIndex(v => v.id === updatedVersionData.id);
        if (index === -1) return;

        const newVersions = [...versions];
        newVersions[index] = updatedVersionData;
        set({
            versions: newVersions,
            filteredVersions: get()._applyFilter(newVersions, get().filterText),
        });

        if (get().selectedVersionId === updatedVersionData.id) {
            set({ activeCDUs: updatedVersionData.cdus });
        }
        get()._scheduleSave();
    },

    hasVersionChanges: (currentVersionData) => {
        const original = get().originalVersionState;
        if (!original) return false;
        return JSON.stringify(original) !== JSON.stringify(currentVersionData);
    },
}));