import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// Creamos el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
    return useContext(AuthContext);
}

// Proveedor del contexto que envolverá la app
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función de Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Función de Logout
    function logout() {
        return signOut(auth);
    }

    // Efecto para escuchar cambios en la sesión
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false); // Dejamos de cargar cuando Firebase responde
        });

        return unsubscribe; // Limpieza del listener al desmontar
    }, []);

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}