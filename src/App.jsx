import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent = () => {
    const { currentUser } = useAuth();
    return currentUser ? <Dashboard /> : <Login />;
};

function App() {
    return (
        <AuthProvider>
            <ModalProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </ModalProvider>
        </AuthProvider>
    );
}

export default App;