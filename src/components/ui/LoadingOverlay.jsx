import React from 'react';

export default function LoadingOverlay({ message }) {
    return (
        // P4-09.3 / R-A11Y-07: el overlay es una región de estado; al insertarse
        // se anuncia «Cargando…» junto con el mensaje visible.
        <div className="modal-overlay modal-show loading-overlay" role="status" aria-live="polite">
            <div className="modal">
                <div className="modal-body-content">
                    <div className="modal-message">
                        <p className="loading-overlay-message">
                            <span className="visually-hidden">Cargando… </span>
                            {message}
                        </p>
                        {/* Reutilizamos la clase toast-spinner que ya tienes en tus estilos */}
                        <div className="toast-spinner loading-overlay-spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
