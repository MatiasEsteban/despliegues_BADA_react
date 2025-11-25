import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { Icons } from './Icons';

export function Modal({ isOpen, onClose, title, children, type = 'info', actions, showIcon = true, className }) {
    if (!isOpen) return null;

    // Manejo de ESC para cerrar
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Icono según tipo
    let IconComponent = Icons.Info;
    if (type === 'success') IconComponent = Icons.Check;
    else if (type === 'warning') IconComponent = Icons.Warning;
    else if (type === 'error') IconComponent = Icons.Error;

    return (
        <div className={clsx("modal-overlay", isOpen && "modal-show")}>
            {/* AQUI EL CAMBIO: Agregamos 'className' para permitir personalización externa */}
            <div className={clsx("modal", `modal-${type}`, className)}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                {/* Body */}
                <div className="modal-body-content">
                    <div className="modal-content-container">
                        {/* Renderizado condicional del icono */}
                        {showIcon && (
                            <div className={clsx("modal-icon", `modal-${type}`)}>
                                <IconComponent />
                            </div>
                        )}
                        <div className="modal-message" style={{ width: showIcon ? 'auto' : '100%' }}>
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="modal-actions">
                    {actions}
                </div>
            </div>
        </div>
    );
}