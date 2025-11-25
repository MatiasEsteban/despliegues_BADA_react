import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';

export default function DeploymentReportModal({ isOpen, onClose, version, isProduccion }) {
    if (!version) return null;

    const { comentarios } = version;

    const categorias = [
        { key: 'mejoras', title: '🛠️ Mejoras y BugFix' },
        { key: 'salidas', title: '⚡ A Producción' },
        { key: 'cambiosCaliente', title: '🔥 Cambios en Caliente' },
        { key: 'observaciones', title: '📋 Observaciones' },
    ];

    const renderCategory = ({ key, title }) => {
        const items = comentarios?.[key] || [];
        if (items.length === 0) return null;

        return (
            <div className="deployment-report-column" key={key}>
                <div className="deployment-report-column-header">
                    <h3 className="deployment-report-column-title">{title}</h3>
                    <span className="deployment-item-count">{items.length}</span>
                </div>
                <ul className="deployment-report-column-list">
                    {items.map((item, i) => (
                        <li key={i} className="deployment-report-item">
                            <Icons.Check className="deployment-check-icon" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // Formateo de fecha para el header
    const formattedDate = version.fechaDespliegue ? version.fechaDespliegue.split('-').reverse().join('/') : 'Sin fecha';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Reporte V${version.numero}`}
            type="info"
            showIcon={false} // <--- CORRECCIÓN: Ocultar icono de info
            actions={<Button onClick={onClose}>Cerrar</Button>}
        >
            <div className="deployment-report-header-compact">
                <div className="deployment-report-header-left">
                    <div className="deployment-report-subtitle">INFO DESPLIEGUE</div>
                    <div className="deployment-report-version-compact">
                        V{version.numero}
                        {isProduccion && <span className="deployment-badge-produccion-compact">PROD</span>}
                    </div>
                </div>
                <div className="deployment-report-header-center">
                    <div className="deployment-datetime-item">
                        <span>{formattedDate}</span>
                    </div>
                    <span className="deployment-datetime-separator">|</span>
                    <div className="deployment-datetime-item">
                        <span>{version.horaDespliegue || '--:--'} hs</span>
                    </div>
                </div>
            </div>

            <div className="deployment-report-body">
                {categorias.map(renderCategory)}
                {(!comentarios || Object.values(comentarios).every(arr => arr.length === 0)) && (
                    <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
                        No hay información registrada para este reporte.
                    </div>
                )}
            </div>
        </Modal>
    );
}