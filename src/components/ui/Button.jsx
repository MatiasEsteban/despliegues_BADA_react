import React from 'react';
import { clsx } from 'clsx';

// Variante mapea a tus clases css: btn-primary, btn-success, etc.
export function Button({ children, variant = 'primary', className, icon: Icon, ...props }) {
    return (
        <button
            className={clsx('btn', `btn-${variant}`, className)}
            {...props}
        >
            {Icon && <Icon className="icon" />}
            {children}
        </button>
    );
}