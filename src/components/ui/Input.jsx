import React from 'react';
import { clsx } from 'clsx';

export function Input({ className, error, label, id, ...props }) {
    return (
        <div className="input-group">
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                className={clsx('filter-input', error && 'campo-invalido', className)} // Usamos 'filter-input' como base genérica de tu CSS
                {...props}
            />
            {error && <span className="validation-message">{error}</span>}
        </div>
    );
}