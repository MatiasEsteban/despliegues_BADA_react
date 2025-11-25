import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../store/dataStore';

// Importamos los componentes REALES
import Header from './layout/Header';
import VersionList from './views/VersionList';
import DetailView from './views/DetailView';
import LoadingOverlay from './ui/LoadingOverlay';

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const {
        initialize,
        clearStore,
        loading,
        error,
        viewMode,
        selectedVersionId,
    } = useDataStore();

    // Inicializa la carga de datos y establece la suscripción en tiempo real
    useEffect(() => {
        let unsubscribe;
        if (currentUser) {
            console.log("Inicializando DataStore...");
            unsubscribe = initialize();
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser, initialize]);

    // Limpiar el store al hacer logout
    const handleLogout = () => {
        clearStore();
        logout();
    };

    // Decidir qué componente mostrar
    const ContentComponent = (viewMode === 'detail' && selectedVersionId)
        ? DetailView
        : VersionList;

    return (
        <div className="container">
            <Header onLogout={handleLogout} />

            <div className="view-container active">
                {error && (
                    <div className="login-error" style={{ display: 'block', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {loading && <LoadingOverlay message="Sincronizando datos..." />}

                <ContentComponent />
            </div>
        </div>
    );
}