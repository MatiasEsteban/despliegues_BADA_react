import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Icons } from '../ui/Icons';
import { useDataStore } from '../../store/dataStore';
import { useModal } from '../../context/ModalContext';
// CAMBIO: Importamos el modal de reporte
import DeploymentReportModal from '../modals/DeploymentReportModal';

export default function VersionRow({ version, isProduccion, onClick }) {
    const { setVersionEnProduccion, duplicateVersion, deleteVersion } = useDataStore();
    const { confirm } = useModal();

    // CAMBIO: Estado local para el modal de reporte
    const [showReport, setShowReport] = useState(false);

    const cdus = Array.isArray(version.cdus) ? version.cdus : [];

    const stats = {
        desarrollo: cdus.filter(c => c.estado === 'En Desarrollo').length,
        pendiente: cdus.filter(c => c.estado === 'Pendiente de Certificacion').length,
        certificado: cdus.filter(c => c.estado === 'Certificado OK').length,
        produccion: cdus.filter(c => c.estado === 'En Produccion').length,
    };

    const handleAction = (e, action) => {
        e.stopPropagation();
        action();
    };

    const handleDelete = async () => {
        if (await confirm(`¿Estás seguro de eliminar la Versión ${version.numero}?`, 'Eliminar', 'error')) {
            deleteVersion(version.id);
        }
    };

    return (
        <>
            <tr
                className={clsx("version-list-row", isProduccion && "version-en-produccion")}
                onClick={() => onClick(version.id)}
            >
                <td className="version-list-cell-numero">
                    {/* P4-04.3: apertura accesible sin convertir el tr en control
                        (se conserva la semántica de tabla y el click de ratón). */}
                    <button
                        type="button"
                        className="version-list-open"
                        aria-label={`Abrir detalle de la versión ${version.numero}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(version.id);
                        }}
                    >
                        V{version.numero}
                    </button>
                    {isProduccion && <span className="badge-produccion">PROD</span>}
                </td>

                <td className="version-list-cell-cdus">
                    {stats.desarrollo > 0 && <div className="cdu-stat-dot stat-desarrollo">{stats.desarrollo}</div>}
                    {stats.pendiente > 0 && <div className="cdu-stat-dot stat-pendiente">{stats.pendiente}</div>}
                    {stats.certificado > 0 && <div className="cdu-stat-dot stat-certificado">{stats.certificado}</div>}
                    {stats.produccion > 0 && <div className="cdu-stat-dot stat-produccion">{stats.produccion}</div>}
                    {cdus.length === 0 && <span className="no-cdus-indicator">-</span>}
                </td>

                <td className="version-list-cell-fuente">{version.fuente || 'N/A'}</td>

                <td className="version-list-cell-fecha-creacion">
                    {version.fechaCreacion} <span className="version-time">{version.horaCreacion}</span>
                </td>

                <td className="version-list-cell-fecha-despliegue">
                    {version.fechaDespliegue} <span className="version-time">{version.horaDespliegue}</span>
                </td>

                <td className="version-list-cell-info">
                    {/* CAMBIO: Ahora abre el modal */}
                    <button
                        className="btn-action-list btn-version-info"
                        onClick={(e) => handleAction(e, () => setShowReport(true))}
                        title="Ver reporte de despliegue"
                        aria-label={`Ver reporte de la versión ${version.numero}`}
                    >
                        <Icons.Info />
                    </button>
                </td>

                <td className="version-list-cell-prod">
                    <button
                        className="btn-action-list btn-marcar-produccion"
                        title={isProduccion ? "Desmarcar Prod" : "Marcar Prod"}
                        aria-label={isProduccion
                            ? `Desmarcar la versión ${version.numero} de producción`
                            : `Marcar la versión ${version.numero} como en producción`}
                        onClick={(e) => handleAction(e, () => setVersionEnProduccion(isProduccion ? null : version.id))}
                    >
                        <Icons.Produccion />
                    </button>

                    <button
                        className="btn-action-list btn-duplicar-version"
                        title="Duplicar"
                        aria-label={`Duplicar la versión ${version.numero}`}
                        onClick={(e) => handleAction(e, () => duplicateVersion(version.id))}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>

                    <button
                        className="btn-action-list btn-eliminar-version"
                        title="Eliminar"
                        aria-label={`Eliminar la versión ${version.numero}`}
                        onClick={(e) => handleAction(e, handleDelete)}
                    >
                        <Icons.Trash />
                    </button>
                </td>
            </tr>

            {/* CAMBIO: Renderizado del modal de reporte */}
            <DeploymentReportModal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                version={version}
                isProduccion={isProduccion}
            />
        </>
    );
}