import React from 'react';
import { clsx } from 'clsx';
import { Icons } from './Icons';

export function Toast({ message, type = 'info', onClose }) {
    let Icon = Icons.Info;
    if (type === 'success') Icon = Icons.Check;
    if (type === 'error') Icon = Icons.Error;
    if (type === 'warning') Icon = Icons.Warning;

    return (
        <div
            className={clsx("toast", `toast-${type}`, "toast-show")}
            role={type === 'error' ? 'alert' : 'status'}
        >
            <div className="toast-icon">
                <Icon />
            </div>
            <div className="toast-content">
                <div className="toast-message">{message}</div>
            </div>
            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Cerrar notificación"
            >
                <span aria-hidden="true">×</span>
            </button>
        </div>
    );
}