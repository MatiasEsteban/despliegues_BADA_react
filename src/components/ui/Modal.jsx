import React, { useId, useRef } from 'react';
import { clsx } from 'clsx';
import { Icons } from './Icons';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Modal({ isOpen, onClose, title, children, type = 'info', actions, showIcon = true, className }) {
    // R-CODE-01: todos los hooks van antes del `return` condicional.
    const titleId = useId();
    const modalRef = useRef(null);

    // P4-02 / R-A11Y-01: foco inicial, ciclo de Tab, Escape, restauración de foco
    // y bloqueo del scroll. Es el único listener de Escape del modal.
    useFocusTrap({
        isActive: isOpen,
        onClose,
        containerRef: modalRef,
    });

    if (!isOpen) return null;

    // Icono según tipo
    let IconComponent = Icons.Info;
    if (type === 'success') IconComponent = Icons.Check;
    else if (type === 'warning') IconComponent = Icons.Warning;
    else if (type === 'error') IconComponent = Icons.Error;

    return (
        <div className={clsx("modal-overlay", isOpen && "modal-show")}>
            {/* AQUI EL CAMBIO: Agregamos 'className' para permitir personalización externa */}
            <div
                ref={modalRef}
                className={clsx("modal", `modal-${type}`, className)}
                role="dialog"
                aria-modal="true"
                {...(title ? { 'aria-labelledby': titleId } : { 'aria-label': 'Diálogo' })}
                tabIndex={-1}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title" id={titleId}>{title}</h2>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
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
                        <div className={clsx('modal-message', !showIcon && 'modal-message--full')}>
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
