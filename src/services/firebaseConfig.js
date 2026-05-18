// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBjoWntpkZLsgH4gD5IqP0jzdqThPXSqK4",
    authDomain: "despliegues-bada-appbe.firebaseapp.com",
    projectId: "despliegues-bada-appbe",
    storageBucket: "despliegues-bada-appbe.firebasestorage.app",
    messagingSenderId: "77032755082",
    appId: "1:77032755082:web:6496965232198670238273",
    measurementId: "G-6BLQ2NWS48"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore forzando long polling para evitar errores JD de WebSocket
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});
export const auth = getAuth(app);