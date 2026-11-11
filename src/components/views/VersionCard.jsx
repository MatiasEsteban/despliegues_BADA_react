import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Icons } from '../ui/Icons';
import { useDataStore } from '../../store/dataStore';
import DeploymentReportModal from '../modals/DeploymentReportModal';

export default function VersionCard({ version, isProduccion, onClick }) {
    const { setVersionEnProduccion } = useDataStore();
    const [showReport, setShowReport] = useState(false); // Estado para el modal

    const cdus = Array.isArray(version.cdus) ? version.cdus : [];

    const stats = {
        desarrollo: cdus.filter(c => c.estado === 'En Desarrollo').length,
        pendiente: cdus.filter(c => c.estado === 'Pendiente de Certificacion').length,
        certificado: cdus.filter(c => c.estado === 'Certificado OK').length,
        produccion: cdus.filter(c => c.estado === 'En Produccion').length,
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Sin fecha';
        try {
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        } catch { return dateStr; }
    };

    const handleProduccionClick = (e) => {
        e.stopPropagation();
        setVersionEnProduccion(isProduccion ? null : version.id);
    };

    const handleInfoClick = (e) => {
        e.stopPropagation();
        setShowReport(true); // Abrir modal
    };

    return (
        <>
            <div
                className={clsx("version-card", isProduccion && "version-en-produccion")}
                onClick={() => onClick(version.id)}
            >
                {/* HEADER */}
                <div className="version-card-header">
                    {/* P4-04.2: control de teclado específico; el div.version-card
                        conserva onClick de ratón y no añade tab stop. */}
                    <button
                        type="button"
                        className="version-card-number"
                        aria-label={`Abrir detalle de la versión ${version.numero || '?'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(version.id);
                        }}
                    >
                        V{version.numero || '?'}
                        {isProduccion && <span className="badge-produccion">EN PRODUCCIÓN</span>}
                    </button>
                    <div className="version-card-cdus-count">
                        {cdus.length} CDU{cdus.length !== 1 ? 's' : ''}
                    </div>

                    <button
                        className="btn-marcar-produccion"
                        title={isProduccion ? "Desmarcar de producción" : "Marcar como en producción"}
                        aria-label={isProduccion
                            ? `Desmarcar la versión ${version.numero} de producción`
                            : `Marcar la versión ${version.numero} como en producción`}
                        onClick={handleProduccionClick}
                    >
                        {isProduccion ? <Icons.Check /> : <Icons.Produccion />}
                    </button>

                    {/* CORRECCIÓN: Botón restaurado */}
                    <button
                        className="btn-version-info"
                        title="Ver reporte de despliegue"
                        aria-label={`Ver reporte de la versión ${version.numero}`}
                        onClick={handleInfoClick}
                    >
                        <Icons.Info />
                    </button>
                </div>

                {/* BODY */}
                <div className="version-card-body">
                    <div className="version-card-detail">
                        <Icons.Plus className="icon" />
                        <span>Creada: <strong>{formatDate(version.fechaCreacion)} {version.horaCreacion || ''}</strong></span>
                    </div>
                    <div className="version-card-detail">
                        <Icons.Upload className="icon" />
                        <span>Fuente: <strong>{version.fuente || 'N/A'}</strong></span>
                    </div>

                    <hr className="card-separator" />

                    <div className="version-card-stats">
                        <div className="version-card-stat">
                            <div className="version-card-stat-icon stat-desarrollo">{stats.desarrollo}</div>
                            <div className="version-card-stat-label">Desarrollo</div>
                        </div>
                        <div className="version-card-stat">
                            <div className="version-card-stat-icon stat-pendiente">{stats.pendiente}</div>
                            <div className="version-card-stat-label">Pendiente</div>
                        </div>
                        <div className="version-card-stat">
                            <div className="version-card-stat-icon stat-certificado">{stats.certificado}</div>
                            <div className="version-card-stat-label">Certif.</div>
                        </div>
                        <div className="version-card-stat">
                            <div className="version-card-stat-icon stat-produccion">{stats.produccion}</div>
                            <div className="version-card-stat-label">Prod.</div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="version-card-footer">
                    <div className="version-card-date">
                        <Icons.Download className="icon" />
                        Despliegue: {formatDate(version.fechaDespliegue)}
                    </div>
                    <div className="version-card-time">
                        {version.horaDespliegue || '--:--'} hs
                    </div>
                </div>
            </div>

            {/* Modal de Reporte */}
            <DeploymentReportModal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                version={version}
                isProduccion={isProduccion}
            />
        </>
    );
}