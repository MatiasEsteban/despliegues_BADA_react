import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Icons } from '../ui/Icons';
import { useDataStore } from '../../store/dataStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useModal } from '../../context/ModalContext';
import DeploymentInfoModal from '../modals/DeploymentInfoModal';
import ChangelogEntriesModal from '../modals/ChangelogEntriesModal';
import DateQuickEditor from './DateQuickEditor';
import { normalizeComments } from '../../store/dataStore';

const CATEGORIAS = [
    { key: 'mejoras', label: 'Mejoras y Bugfix', colorClass: 'cat-mejoras' },
    { key: 'salidas', label: 'A Producción', colorClass: 'cat-produccion' },
    { key: 'cambiosCaliente', label: 'Cambios en Caliente', colorClass: 'cat-caliente' },
    { key: 'observaciones', label: 'Observaciones', colorClass: 'cat-observaciones' },
    { key: 'cambiosCDU', label: 'Cambios por CDU', colorClass: 'cat-cdu', isCDU: true },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; }
    catch { return dateStr; }
};

export default function ChangelogCard({ version, isProduccion }) {
    const { setVersionEnProduccion, selectVersion, duplicateVersion, deleteVersion, updateCurrentVersion } = useDataStore();
    const { getActiveWorkspace } = useWorkspaceStore();
    const { confirm } = useModal();
    const workspaceType = getActiveWorkspace()?.type || 'full';
    const isFullWorkspace = workspaceType === 'full';

    // Producción → expandido por defecto; el resto → colapsado
    const [expanded, setExpanded] = useState(isProduccion);
    const [showInfo, setShowInfo] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    const cdus = Array.isArray(version.cdus) ? version.cdus : [];
    const comments = normalizeComments(version.comentarios);

    const totalEntries = CATEGORIAS.reduce(
        (sum, c) => sum + (comments[c.key]?.filter(e => e.texto?.trim()).length || 0), 0
    );

    const stats = {
        desarrollo: cdus.filter(c => c.estado === 'En Desarrollo').length,
        pendiente: cdus.filter(c => c.estado === 'Pendiente de Certificacion').length,
        certificado: cdus.filter(c => c.estado === 'Certificado OK').length,
        produccion: cdus.filter(c => c.estado === 'En Produccion').length,
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (await confirm(`¿Eliminar la Versión ${version.numero}?`, 'Eliminar', 'error')) {
            deleteVersion(version.id);
        }
    };

    const handleSaveChangelog = (newComments) => {
        updateCurrentVersion({ ...version, comentarios: newComments });
    };

    const handleSaveCreacionDate = ({ date, time }) => {
        updateCurrentVersion({
            ...version,
            fechaCreacion: date,
            horaCreacion: time,
        });
    };

    const handleSaveDespliegueDate = ({ date, time }) => {
        updateCurrentVersion({
            ...version,
            fechaDespliegue: date,
            horaDespliegue: time,
        });
    };

    return (
        <>
            <div className={clsx('changelog-card', isProduccion && 'changelog-card--produccion', expanded && 'changelog-card--expanded')}>
                {/* TIMELINE DOT */}
                <div className={clsx('changelog-dot', isProduccion && 'changelog-dot--produccion')} />

                {/* ── CARD HEADER ── */}
                <div className="changelog-card-header" onClick={() => setExpanded(v => !v)}>
                    {/* Left: versión + badges */}
                    <div className="changelog-card-header-left">
                        <span className="changelog-version-number">V{version.numero}</span>
                        {isProduccion && (
                            <span className="changelog-badge changelog-badge--prod">EN PRODUCCIÓN</span>
                        )}
                        {totalEntries > 0 && (
                            <span className="changelog-badge changelog-badge--entries">
                                {totalEntries} {totalEntries !== 1 ? 'entradas' : 'entrada'}
                            </span>
                        )}
                    </div>

                    {/* Center: título opcional */}
                    <div className="changelog-card-header-center">
                        {version.titulo && (
                            <span className="changelog-version-title">{version.titulo}</span>
                        )}
                    </div>

                    {/* Right: fecha + acciones + chevron */}
                    <div className="changelog-card-header-right">
                        <div className="changelog-dates-group">
                            <DateQuickEditor
                                label="Creación"
                                icon="📅"
                                dateValue={version.fechaCreacion}
                                timeValue={version.horaCreacion}
                                onSave={handleSaveCreacionDate}
                                versionNumber={version.numero}
                            />
                            <DateQuickEditor
                                label="Despliegue"
                                icon="🚀"
                                dateValue={version.fechaDespliegue}
                                timeValue={version.horaDespliegue}
                                onSave={handleSaveDespliegueDate}
                                versionNumber={version.numero}
                            />
                        </div>

                        {/* Acciones — visibles al hover */}
                        <div className="changelog-card-actions" onClick={e => e.stopPropagation()}>
                            <button
                                className="btn-cl-action btn-cl-changelog"
                                title="Editar changelog"
                                onClick={() => setShowChangelog(true)}
                            >
                                <Icons.Edit style={{ width: '14px', height: '14px' }} />
                            </button>
                            <button
                                className="btn-cl-action btn-cl-info"
                                title="Info despliegue (copiar)"
                                onClick={() => setShowInfo(true)}
                            >
                                <Icons.Info />
                            </button>
                            <button
                                className="btn-cl-action btn-cl-prod"
                                title={isProduccion ? 'Desmarcar producción' : 'Marcar como producción'}
                                onClick={() => setVersionEnProduccion(isProduccion ? null : version.id)}
                            >
                                {isProduccion
                                    ? <Icons.Check style={{ width: '14px', height: '14px' }} />
                                    : <Icons.Produccion style={{ width: '14px', height: '14px' }} />
                                }
                            </button>
                            <button
                                className="btn-cl-action btn-cl-duplicate"
                                title="Duplicar versión"
                                onClick={() => duplicateVersion(version.id)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                            </button>
                            <button
                                className="btn-cl-action btn-cl-delete"
                                title="Eliminar versión"
                                onClick={handleDelete}
                            >
                                <Icons.Trash style={{ width: '14px', height: '14px' }} />
                            </button>
                        </div>

                        <div className="changelog-chevron">
                            <Icons.ChevronDown style={{
                                width: '16px', height: '16px',
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.25s ease',
                            }} />
                        </div>
                    </div>
                </div>

                {/* ── CARD BODY (colapsable) ── */}
                <div className={clsx('changelog-card-body', !expanded && 'changelog-card-body--collapsed')}>

                    {totalEntries === 0 ? (
                        /* Estado vacío — un solo botón centrado, claro */
                        <div className="changelog-empty-entries">
                            <span className="changelog-empty-entries-text">Sin entradas en el changelog</span>
                            <button
                                className="btn-changelog-add-inline"
                                onClick={(e) => { e.stopPropagation(); setShowChangelog(true); }}
                            >
                                <Icons.Plus style={{ width: '13px', height: '13px' }} />
                                Agregar entradas
                            </button>
                        </div>
                    ) : (
                        <div className="changelog-categories">
                            {CATEGORIAS.map(cat => {
                                const items = comments[cat.key]?.filter(e => e.texto?.trim()) || [];
                                if (items.length === 0) return null;

                                return (
                                    <div key={cat.key} className={clsx('changelog-category', cat.colorClass)}>
                                        <div className="changelog-category-header">
                                            <span>{cat.label}</span>
                                            <span className="changelog-category-count">{items.length}</span>
                                        </div>
                                        <ul className="changelog-entry-list">
                                            {items.map(item => (
                                                <li key={item.id} className={clsx('changelog-entry-item', cat.isCDU && 'changelog-entry-item--cdu')}>
                                                    {cat.isCDU ? (
                                                        // Render especial para cambios por CDU
                                                        <span className="changelog-entry-content">
                                                            {item.cduNombre?.trim() && (
                                                                <strong className="changelog-cdu-label">{item.cduNombre}:</strong>
                                                            )}
                                                            <span>{item.texto}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="changelog-entry-content">
                                                            <span className="changelog-entry-bullet">•</span>
                                                            {item.cdu?.trim() && (
                                                                <span className="changelog-cdu-tag" title={`CDU: ${item.cdu}`}>
                                                                    {item.cdu}
                                                                </span>
                                                            )}
                                                            <span>{item.texto}</span>
                                                            {item.autor?.trim() && (
                                                                <span className="changelog-entry-autor-badge">{item.autor}</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── FOOTER ── */}
                    <div className="changelog-card-footer">
                        {isFullWorkspace && cdus.length > 0 && (
                            <div className="changelog-cdu-stats">
                                <span className="changelog-cdu-total">{cdus.length} CDU{cdus.length !== 1 ? 's' : ''}</span>
                                {stats.desarrollo > 0 && <span className="cdu-stat-dot stat-desarrollo">{stats.desarrollo}</span>}
                                {stats.pendiente > 0 && <span className="cdu-stat-dot stat-pendiente">{stats.pendiente}</span>}
                                {stats.certificado > 0 && <span className="cdu-stat-dot stat-certificado">{stats.certificado}</span>}
                                {stats.produccion > 0 && <span className="cdu-stat-dot stat-produccion">{stats.produccion}</span>}
                            </div>
                        )}
                        <div className="changelog-footer-actions">
                            <span className="changelog-fuente">
                                Fuente: <strong>{version.fuente || 'N/A'}</strong>
                            </span>
                            {isFullWorkspace && (
                                <button className="btn-cl-detail" onClick={() => selectVersion(version.id)}>
                                    Ver CDUs →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALES */}
            <DeploymentInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                version={version}
                isProduccion={isProduccion}
            />
            <ChangelogEntriesModal
                isOpen={showChangelog}
                onClose={() => setShowChangelog(false)}
                version={version}
                onSave={handleSaveChangelog}
            />
        </>
    );
}
