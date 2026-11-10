import React, { useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import Header from './layout/Header';
import ChangelogView from './views/ChangelogView';
import VersionList from './views/VersionList';
import DetailView from './views/DetailView';
import LoadingOverlay from './ui/LoadingOverlay';

export default function Dashboard() {
    const { activeWorkspaceId, getActiveWorkspace } = useWorkspaceStore();
    const activeWorkspace = getActiveWorkspace();
    const workspaceType = activeWorkspace?.type || 'full';

    const {
        initialize,
        clearStore,
        loading,
        error,
        viewMode,
        selectedVersionId,
    } = useDataStore();

    // Re-inicializar cuando cambia el workspace activo
    useEffect(() => {
        clearStore();
        const unsub = initialize(activeWorkspaceId);
        return () => { if (unsub) unsub(); };
    }, [activeWorkspaceId]);

    const renderContent = () => {
        // Vista detalle solo disponible en workspaces tipo 'full'
        if (viewMode === 'detail' && selectedVersionId && workspaceType === 'full') {
            return <DetailView />;
        }
        if (viewMode === 'list') return <VersionList />;
        return <ChangelogView workspaceType={workspaceType} />;
    };

    return (
        <div className="container">
            <Header workspaceType={workspaceType} />

            <div className="view-container active">
                {error && (
                    <div className="login-error login-error--visible">
                        {error}
                    </div>
                )}
                {loading && <LoadingOverlay message="Sincronizando datos..." />}
                {renderContent()}
            </div>
        </div>
    );
}