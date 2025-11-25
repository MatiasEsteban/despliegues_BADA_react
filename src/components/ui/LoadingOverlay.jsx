import React from 'react';

export default function LoadingOverlay({ message }) {
    return (
        <div className="modal-overlay modal-show" style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal" style={{ maxWidth: '300px', textAlign: 'center' }}>
                <div className="modal-body-content">
                    <div className="modal-message">
                        <p style={{ marginBottom: '1rem', fontWeight: '600' }}>{message}</p>
                        {/* Reutilizamos la clase toast-spinner que ya tienes en tus estilos */}
                        <div className="toast-spinner" style={{ margin: '0 auto', width: '30px', height: '30px', borderWidth: '4px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}