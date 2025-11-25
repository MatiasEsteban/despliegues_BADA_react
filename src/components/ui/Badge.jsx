import React from 'react';
import { clsx } from 'clsx';
import { Icons } from './Icons';

const STATE_CONFIG = {
    'En Desarrollo': { color: 'estado-desarrollo', icon: Icons.Desarrollo },
    'Pendiente de Certificacion': { color: 'estado-pendiente', icon: Icons.Pendiente },
    'Certificado OK': { color: 'estado-certificado', icon: Icons.Certificado },
    'En Produccion': { color: 'estado-produccion', icon: Icons.Produccion },
};

const ROLE_ICONS = {
    'DEV': Icons.RoleDev,
    'UX': Icons.RoleDesign, // Mapeo aproximado
    // Puedes agregar más mapeos específicos si los tienes
};

export function StatusBadge({ status }) {
    const config = STATE_CONFIG[status] || STATE_CONFIG['En Desarrollo'];
    const Icon = config.icon;

    // Reutilizamos tus clases .estado-display y .estado-icon
    return (
        <div className={clsx('estado-select-container', config.color)}>
            <div className="estado-display">
                <Icon className="estado-icon" />
                <span>{status}</span>
            </div>
        </div>
    );
}

export function RoleBadge({ role }) {
    const Icon = ROLE_ICONS[role] || Icons.User;

    return (
        <div className="rol-select-container">
            <div className="rol-display">
                <Icon className="rol-icon" />
                <span>{role}</span>
            </div>
        </div>
    );
}