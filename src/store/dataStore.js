import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToAppState, saveAppState } from '../services/firebaseData';
import { generateStats } from './statsCalculator';
import { Debouncer } from '../utils/debouncer';

const debouncedSave = Debouncer.debounce((state) => {
    saveAppState({
        versions: state.versions,
        versionEnProduccionId: state.versionEnProduccionId
    });
}, 1500);

const initialState = {
    versions: [],
    filteredVersions: [],
    selectedVersionId: null,
    activeCDUs: [],
    versionStats: {},
    versionEnProduccionId: null,
    loading: false,
    error: null,
    viewMode: 'list',
    filterText: '',
    unsubscribe: null,
    originalVersionState: null,
    isSaving: false,
};

export const useDataStore = create((set, get) => ({
    ...initialState,

    initialize: () => {
        set({ loading: true, error: null });

        const currentUnsubscribe = get().unsubscribe;
        if (currentUnsubscribe) currentUnsubscribe();

        const newUnsubscribe = subscribeToAppState((data) => {
            const { versions, versionEnProduccionId } = data;

            const stats = generateStats(versions);
            const currentFilterText = get().filterText;
            const filtered = get()._applyFilter(versions, currentFilterText);

            set({
                versions: versions,
                versionEnProduccionId: versionEnProduccionId,
                versionStats: stats,
                filteredVersions: filtered,
                loading: false,
            });

            const selectedId = get().selectedVersionId;
            if (selectedId) {
                get().selectVersion(selectedId, versions);
            }
        });

        set({ unsubscribe: newUnsubscribe, loading: false });
        return newUnsubscribe;
    },

    clearStore: () => {
        const currentUnsubscribe = get().unsubscribe;
        if (currentUnsubscribe) currentUnsubscribe();
        set(initialState);
    },

    _scheduleSave: () => {
        const state = get();
        set({ isSaving: true });
        debouncedSave(state);
        setTimeout(() => { set({ isSaving: false }); }, 2000);
    },

    // --- IMPORT DATA (NUEVO) ---
    importData: async (newVersions, newProdId) => {
        set({ loading: true });
        try {
            // Actualizamos estado local inmediatamente
            set({
                versions: newVersions,
                versionEnProduccionId: newProdId,
                filteredVersions: get()._applyFilter(newVersions, get().filterText)
            });

            // Guardado INMEDIATO y completo en Firebase (bypass del debounce)
            await saveAppState({
                versions: newVersions,
                versionEnProduccionId: newProdId
            });

            set({ loading: false });
            return true;
        } catch (e) {
            console.error(e);
            set({ loading: false, error: 'Error al guardar datos importados' });
            throw e;
        }
    },

    getVersionEnProduccionId: () => get().versionEnProduccionId,

    setVersionEnProduccion: (versionId) => {
        set({ versionEnProduccionId: versionId });
        get()._scheduleSave();
    },

    addNewEmptyVersion: async () => {
        const versions = get().versions;
        const safeId = Date.now();
        const maxNum = versions.reduce((max, v) => Math.max(max, parseFloat(v.numero) || 0), 0);
        const nextNum = (maxNum + 1).toString();
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const newVersion = {
            id: safeId,
            numero: nextNum,
            fechaCreacion: currentDate,
            horaCreacion: currentTime,
            fuente: 'Nueva',
            fechaDespliegue: currentDate,
            horaDespliegue: '',
            cdus: [],
            comentarios: { mejoras: [], salidas: [], cambiosCaliente: [], observaciones: [] }
        };

        const newVersions = [...versions, newVersion];
        set({ versions: newVersions });
        set({ filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    duplicateVersion: async (sourceVersionId) => {
        const versions = get().versions;
        const sourceVersion = versions.find(v => v.id === sourceVersionId);
        if (!sourceVersion) return;

        const safeId = Date.now();
        const maxNum = versions.reduce((max, v) => Math.max(max, parseFloat(v.numero) || 0), 0);
        const nextNum = (maxNum + 1).toString();
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const clonedCdus = (sourceVersion.cdus || []).map(cdu => ({
            ...cdu,
            uuid: uuidv4(),
            historial: []
        }));

        const newVersion = {
            ...sourceVersion,
            id: safeId,
            numero: nextNum,
            fechaCreacion: currentDate,
            horaCreacion: currentTime,
            fuente: `V${sourceVersion.numero}`,
            cdus: clonedCdus
        };

        const newVersions = [...versions, newVersion];
        set({ versions: newVersions });
        set({ filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    deleteVersion: async (versionId) => {
        const currentVersions = get().versions;
        const newVersions = currentVersions.filter(v => v.id !== versionId);

        let newProdId = get().versionEnProduccionId;
        if (newProdId === versionId) newProdId = null;

        set({
            versions: newVersions,
            versionEnProduccionId: newProdId
        });

        if (get().selectedVersionId === versionId) {
            get().deselectVersion();
        }

        set({ filteredVersions: get()._applyFilter(newVersions, get().filterText) });
        get()._scheduleSave();
    },

    setFilter: (text) => {
        const versions = get().versions;
        const filtered = get()._applyFilter(versions, text);
        set({ filterText: text, filteredVersions: filtered });
    },

    _applyFilter: (versions, text) => {
        if (!text) return versions;
        const lowerText = text.toLowerCase();
        return versions.filter(v =>
            (v.numero && v.numero.toString().toLowerCase().includes(lowerText)) ||
            (v.fuente && v.fuente.toLowerCase().includes(lowerText))
        );
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    selectVersion: (versionId, allVersions = get().versions) => {
        const selectedVersion = allVersions.find(v => v.id === versionId);
        if (!selectedVersion) return;

        set({
            selectedVersionId: versionId,
            viewMode: 'detail',
            activeCDUs: selectedVersion.cdus || [],
            originalVersionState: JSON.parse(JSON.stringify(selectedVersion))
        });
    },

    deselectVersion: () => {
        set({ selectedVersionId: null, viewMode: 'list', activeCDUs: [], originalVersionState: null });
    },

    updateCurrentVersion: (updatedVersionData) => {
        const versions = get().versions;
        const index = versions.findIndex(v => v.id === updatedVersionData.id);
        if (index === -1) return;

        const newVersions = [...versions];
        newVersions[index] = updatedVersionData;

        set({ versions: newVersions });

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