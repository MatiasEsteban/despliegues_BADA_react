import React, { useEffect } from 'react';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import { useWorkspaceStore } from './store/workspaceStore';
import Dashboard from './components/Dashboard';

function AppContent() {
    const { initialize } = useWorkspaceStore();

    useEffect(() => {
        const unsub = initialize();
        return () => { if (unsub) unsub(); };
    }, [initialize]);

    return <Dashboard />;
}

function App() {
    return (
        <ModalProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </ModalProvider>
    );
}

export default App;