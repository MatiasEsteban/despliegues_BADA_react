import React, { useId } from 'react';
import { clsx } from 'clsx';

export function Input({
    className,
    error,
    label,
    id,
    icon: Icon,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props
}) {
    // P4-06.1 / R-A11Y-04: si el consumidor no pasa `id`, se genera uno para
    // que el <label htmlFor> nunca quede apuntando a la nada.
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const describedBy = [ariaDescribedBy, error ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <div className="input-group">
            {/* CORRECCIÓN: Clase 'filter-label' para asegurar color del tema */}
            {label && <label htmlFor={inputId} className="filter-label">{label}</label>}

            <div className="input-wrapper">
                <input
                    id={inputId}
                    className={clsx('filter-input', Icon && 'filter-input--with-icon', error && 'campo-invalido', className)}
                    {...props}
                    required={required}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                />
                {Icon && (
                    <div className="input-icon">
                        <Icon className="icon-small" />
                    </div>
                )}
            </div>

            {error && <span id={errorId} className="validation-message">{error}</span>}
        </div>
    );
}
