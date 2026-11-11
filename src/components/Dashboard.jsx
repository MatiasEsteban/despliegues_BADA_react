import React, { useEffect, useRef, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import Header from './layout/Header';
import ChangelogView from './views/ChangelogView';
import VersionList from './views/VersionList';
import DetailView from './views/DetailView';
import LoadingOverlay from './ui/LoadingOverlay';

const VIEW_LABELS = {
    changelog: 'Changelog',
    list: 'Lista',
    detail: 'Detalle',
};

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

    // P4-09.3 / R-A11Y-07: vista realmente renderizada (el detalle solo es
    // válido en workspaces 'full' y con versión seleccionada).
    const activeView = viewMode === 'detail' && selectedVersionId && workspaceType === 'full'
        ? 'detail'
        : viewMode === 'list'
            ? 'list'
            : 'changelog';

    const [viewAnnouncement, setViewAnnouncement] = useState('');
    const previousView = useRef(activeView);

    useEffect(() => {
        // Sin anuncio en el montaje inicial: solo cuando cambia la vista.
        if (previousView.current === activeView) return;
        previousView.current = activeView;
        setViewAnnouncement(`Vista: ${VIEW_LABELS[activeView]}`);
    }, [activeView]);

    const renderContent = () => {
        // Vista detalle solo disponible en workspaces tipo 'full'
        if (activeView === 'detail') return <DetailView />;
        if (activeView === 'list') return <VersionList />;
        return <ChangelogView workspaceType={workspaceType} />;
    };

    return (
        <div className="container">
            <Header workspaceType={workspaceType} />

            <div className="view-container active">
                <div className="visually-hidden" role="status" aria-live="polite">
                    {viewAnnouncement}
                </div>
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