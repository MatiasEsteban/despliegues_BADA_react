import React from 'react';
import { clsx } from 'clsx';

export function Select({ children, className, error, label, id, ...props }) {
    return (
        <div className="input-group">
            {/* CORRECCIÓN: Clase 'filter-label' para asegurar color del tema */}
            {label && <label htmlFor={id} className="filter-label">{label}</label>}

            <select
                id={id}
                className={clsx('filter-select', error && 'campo-invalido', className)}
                {...props}
            >
                {children}
            </select>

            {error && <span className="validation-message">{error}</span>}
        </div>
    );
}