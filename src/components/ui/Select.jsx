import React, { useId } from 'react';
import { clsx } from 'clsx';

export function Select({
    children,
    className,
    error,
    label,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
}) {
    // P4-06.2 / R-A11Y-04: mismo fallback que Input para no romper htmlFor.
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    const describedBy = [ariaDescribedBy, error ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <div className="input-group">
            {/* CORRECCIÓN: Clase 'filter-label' para asegurar color del tema */}
            {label && <label htmlFor={selectId} className="filter-label">{label}</label>}

            <select
                id={selectId}
                className={clsx('filter-select', error && 'campo-invalido', className)}
                {...props}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
            >
                {children}
            </select>

            {error && <span id={errorId} className="validation-message">{error}</span>}
        </div>
    );
}
