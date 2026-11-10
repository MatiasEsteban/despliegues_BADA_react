import React from 'react';

export default function LoadingOverlay({ message }) {
    return (
        <div className="modal-overlay modal-show loading-overlay">
            <div className="modal">
                <div className="modal-body-content">
                    <div className="modal-message">
                        <p className="loading-overlay-message">{message}</p>
                        {/* Reutilizamos la clase toast-spinner que ya tienes en tus estilos */}
                        <div className="toast-spinner loading-overlay-spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}