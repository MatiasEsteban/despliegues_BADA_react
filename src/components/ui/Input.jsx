import React from 'react';
import { clsx } from 'clsx';

export function Input({ className, error, label, id, icon: Icon, ...props }) {
    return (
        <div className="input-group">
            {/* CORRECCIÓN: Clase 'filter-label' para asegurar color del tema */}
            {label && <label htmlFor={id} className="filter-label">{label}</label>}

            <div className="input-wrapper">
                <input
                    id={id}
                    className={clsx('filter-input', Icon && 'filter-input--with-icon', error && 'campo-invalido', className)}
                    {...props}
                />
                {Icon && (
                    <div className="input-icon">
                        <Icon className="icon-small" />
                    </div>
                )}
            </div>

            {error && <span className="validation-message">{error}</span>}
        </div>
    );
}