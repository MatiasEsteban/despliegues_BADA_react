import React from 'react';
import { clsx } from 'clsx';

export function Select({ children, className, error, label, id, ...props }) {
    return (
        <div className="input-group">
            {label && <label htmlFor={id}>{label}</label>}
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