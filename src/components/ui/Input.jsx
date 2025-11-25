import React from 'react';
import { clsx } from 'clsx';

export function Input({ className, error, label, id, icon: Icon, ...props }) {
    return (
        <div className="input-group">
            {/* CORRECCIÓN: Clase 'filter-label' para asegurar color del tema */}
            {label && <label htmlFor={id} className="filter-label">{label}</label>}

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                    id={id}
                    className={clsx('filter-input', error && 'campo-invalido', className)}
                    style={Icon ? { paddingRight: '2.5rem' } : {}}
                    {...props}
                />
                {Icon && (
                    <div style={{ position: 'absolute', right: '0.75rem', color: 'var(--text-secondary)', pointerEvents: 'none', display: 'flex' }}>
                        <Icon className="icon-small" />
                    </div>
                )}
            </div>

            {error && <span className="validation-message">{error}</span>}
        </div>
    );
}