import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureState } from '../../test/fixtures/appState';

const firebaseMocks = vi.hoisted(() => ({
  subscribeToAppState: vi.fn(),
  saveAppState: vi.fn(),
}));

const workspaceMocks = vi.hoisted(() => ({
  subscribeToWorkspaces: vi.fn(),
  createWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
}));

vi.mock('../../services/firebaseData', () => firebaseMocks);

vi.mock('../../services/workspacesService', () => ({
  VENTAS_B2C_WORKSPACE: {
    id: 'ventas-b2c',
    name: 'Ventas B2C',
    type: 'full',
    protected: true,
  },
  subscribeToWorkspaces: workspaceMocks.subscribeToWorkspaces,
  createWorkspace: workspaceMocks.createWorkspace,
  deleteWorkspace: workspaceMocks.deleteWorkspace,
}));

describe('modo fixtures determinista (A-08.1)', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();

    firebaseMocks.subscribeToAppState.mockReset();
    firebaseMocks.subscribeToAppState.mockImplementation(() => vi.fn());
    firebaseMocks.saveAppState.mockReset();
    firebaseMocks.saveAppState.mockResolvedValue(undefined);

    workspaceMocks.subscribeToWorkspaces.mockReset();
    workspaceMocks.subscribeToWorkspaces.mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('hidrata el store con las 4 versiones del fixture y sin Firestore', async () => {
    vi.stubEnv('VITE_APP_FIXTURES', '1');
    vi.resetModules();

    const { useDataStore } = await import('../dataStore');
    const unsub = useDataStore.getState().initialize('fixture-workspace');

    expect(typeof unsub).toBe('function');

    await vi.waitFor(() => {
      expect(useDataStore.getState().versions).toHaveLength(4);
    });

    const state = useDataStore.getState();
    const fixture = createFixtureState();

    expect(state.workspaceId).toBe(fixture.workspace.id);
    expect(state.versionEnProduccionId).toBe(fixture.versionEnProduccionId);
    expect(state.filteredVersions).toHaveLength(4);
    expect(state.versionStats.totalVersions).toBe(4);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.versions.map((version) => version.id)).toEqual(
      fixture.versions.map((version) => version.id),
    );
    expect(state.versions.some((version) => version.id === fixture.versionEnProduccionId)).toBe(true);

    expect(firebaseMocks.subscribeToAppState).not.toHaveBeenCalled();
    expect(firebaseMocks.saveAppState).not.toHaveBeenCalled();
  });

  it('no programa el Debouncer ni persiste con saveAppState', async () => {
    vi.stubEnv('VITE_APP_FIXTURES', '1');
    vi.resetModules();

    const { useDataStore } = await import('../dataStore');
    useDataStore.getState().initialize('fixture-workspace');
    await vi.waitFor(() => {
      expect(useDataStore.getState().versions).toHaveLength(4);
    });

    vi.useFakeTimers();

    useDataStore.getState().setVersionEnProduccion(null);
    expect(useDataStore.getState().isSaving).toBe(false);

    await vi.advanceTimersByTimeAsync(2000);

    await useDataStore.getState().importData([], null);

    expect(firebaseMocks.saveAppState).not.toHaveBeenCalled();
    expect(firebaseMocks.subscribeToAppState).not.toHaveBeenCalled();
  });

  it('usa el workspace del fixture como activo sin escribir localStorage', async () => {
    vi.stubEnv('VITE_APP_FIXTURES', '1');
    vi.resetModules();
    localStorage.setItem('bada_last_workspace_id', 'ventas-b2c');

    const { useWorkspaceStore } = await import('../workspaceStore');
    useWorkspaceStore.getState().initialize();

    await vi.waitFor(() => {
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe('fixture-workspace');
    });

    expect(useWorkspaceStore.getState().workspaces.map((workspace) => workspace.id)).toEqual([
      'fixture-workspace',
    ]);
    expect(workspaceMocks.subscribeToWorkspaces).not.toHaveBeenCalled();

    useWorkspaceStore.getState().setActiveWorkspace('fixture-workspace');
    expect(localStorage.getItem('bada_last_workspace_id')).toBe('ventas-b2c');
  });

  it('sin VITE_APP_FIXTURES conserva la suscripción a Firestore', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    const { useDataStore } = await import('../dataStore');
    const unsub = useDataStore.getState().initialize('ventas-b2c');

    expect(firebaseMocks.subscribeToAppState).toHaveBeenCalledTimes(1);
    expect(firebaseMocks.subscribeToAppState).toHaveBeenCalledWith(
      'ventas-b2c',
      expect.any(Function),
      expect.any(Function),
    );
    expect(typeof unsub).toBe('function');
  });
});
