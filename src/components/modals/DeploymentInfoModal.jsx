import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { normalizeComments } from '../../store/dataStore';
import { copyText } from '../../utils/clipboard';

// Categorías estándar (sin cambiosCDU que se renderiza aparte)
const CATEGORIAS = [
    { key: 'mejoras', label: 'MEJORAS Y BUGFIX' },
    { key: 'salidas', label: 'A PRODUCCIÓN' },
    { key: 'cambiosCaliente', label: 'CAMBIOS EN CALIENTE' },
    { key: 'observaciones', label: 'OBSERVACIONES' },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; }
    catch { return dateStr; }
};

const ESTADO_LABELS = {
    'En Desarrollo': 'EN DESARROLLO',
    'Pendiente de Certificacion': 'PENDIENTE CERT.',
    'Certificado OK': 'CERTIFICADO OK',
    'En Produccion': 'EN PRODUCCIÓN',
};

export default function DeploymentInfoModal({ isOpen, onClose, version, isProduccion }) {
    const [copied, setCopied] = useState(false);

    if (!version) return null;

    const comments = normalizeComments(version.comentarios);
    const cdus = Array.isArray(version.cdus) ? version.cdus : [];

    // Construye el texto plano para copiar
    const buildCopyText = () => {
        const lines = [];
        const sep = '─'.repeat(48);

        lines.push(`BADA V${version.numero}${version.titulo ? ' — ' + version.titulo : ''}`);
        lines.push(sep);

        if (version.fechaCreacion) {
            lines.push(`Creación:   ${formatDate(version.fechaCreacion)}${version.horaCreacion ? ' ' + version.horaCreacion + 'hs' : ''}`);
        }
        if (version.fechaDespliegue) {
            lines.push(`Despliegue: ${formatDate(version.fechaDespliegue)}${version.horaDespliegue ? ' ' + version.horaDespliegue + 'hs' : ''}`);
        }
        if (version.fuente) lines.push(`Fuente:     ${version.fuente}`);
        if (isProduccion) lines.push('Estado:     EN PRODUCCIÓN ✓');
        lines.push('');

        // Changelog por categoría
        CATEGORIAS.forEach(({ key, label }) => {
            const items = comments[key]?.filter(e => e.texto?.trim()) || [];
            if (items.length === 0) return;
            lines.push(label);
            items.forEach(item => {
                const cduStr = item.cdu?.trim()
                    ? `[${item.cdu.trim()}] `
                    : (item.cduNombre?.trim() ? `[${item.cduNombre.trim()}] ` : '');
                const autorStr = item.autor?.trim() ? ` [${item.autor.trim()}]` : '';
                lines.push(`• ${cduStr}${item.texto}${autorStr}`);
            });
            lines.push('');
        });

        // Cambios por CDU (feature scaffold)
        const cambiosCDU = comments.cambiosCDU?.filter(e => e.texto?.trim()) || [];
        if (cambiosCDU.length > 0) {
            lines.push('CAMBIOS POR CDU');
            cambiosCDU.forEach(item => {
                const cduPart = item.cduNombre?.trim() ? `[${item.cduNombre.trim()}] ` : '';
                lines.push(`• ${cduPart}${item.texto}`);
            });
            lines.push('');
        }

        return lines.join('\n');
    };

    const handleCopy = async () => {
        const success = await copyText(buildCopyText());

        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } else {
            alert('No se pudo copiar automáticamente. Por favor seleccioná el texto manualmente.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Info Despliegue — V${version.numero}`}
            type="info"
            showIcon={false}
            className="modal-deployment-info"
            actions={
                <>
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                    <Button variant="primary" onClick={handleCopy}>
                        {copied ? '✓ Copiado' : 'Copiar texto'}
                    </Button>
                </>
            }
        >
            <div className="dep-info-layout">
                {/* HEADER de versión */}
                <div className="dep-info-header">
                    <div className="dep-info-version">
                        <span className="dep-info-vnumber">V{version.numero}</span>
                        {version.titulo && <span className="dep-info-vtitle">{version.titulo}</span>}
                        {isProduccion && <span className="dep-info-badge-prod">EN PRODUCCIÓN</span>}
                    </div>
                    <div className="dep-info-meta">
                        {version.fechaCreacion && (
                            <span>Creación: <strong>{formatDate(version.fechaCreacion)}{version.horaCreacion ? ' ' + version.horaCreacion + 'hs' : ''}</strong></span>
                        )}
                        {version.fechaDespliegue && (
                            <span>Despliegue: <strong>{formatDate(version.fechaDespliegue)}{version.horaDespliegue ? ' ' + version.horaDespliegue + 'hs' : ''}</strong></span>
                        )}
                        {version.fuente && <span>Fuente: <strong>{version.fuente}</strong></span>}
                    </div>
                </div>

                <div className="dep-info-body">
                    {/* CHANGELOG ENTRIES */}
                    <div className="dep-info-section">
                        {CATEGORIAS.map(({ key, label }) => {
                            const items = comments[key]?.filter(e => e.texto?.trim()) || [];
                            if (items.length === 0) return null;
                            return (
                                <div key={key} className={`dep-info-cat dep-info-cat--${key}`}>
                                    <div className="dep-info-cat-title">{label}</div>
                                    <ul className="dep-info-cat-list">
                                        {items.map(item => (
                                            <li key={item.id} className="dep-info-cat-item">
                                                <span className="dep-info-bullet">•</span>
                                                <span className="dep-info-item-content">
                                                    {item.cdu?.trim() && (
                                                        <span className="dep-info-cdu-badge" title={`CDU: ${item.cdu}`}>
                                                            {item.cdu}
                                                        </span>
                                                    )}
                                                    <span className="dep-info-item-text">{item.texto}</span>
                                                    {item.autor?.trim() && (
                                                        <span className="dep-info-autor">{item.autor}</span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}

                        {/* CAMBIOS POR CDU (scaffold) */}
                        {(comments.cambiosCDU?.filter(e => e.texto?.trim()).length > 0) && (
                            <div className="dep-info-cat dep-info-cat--cambiosCDU">
                                <div className="dep-info-cat-title">CAMBIOS POR CDU</div>
                                <ul className="dep-info-cat-list dep-info-cdu-changes">
                                    {comments.cambiosCDU.filter(e => e.texto?.trim()).map(item => (
                                        <li key={item.id} className="dep-info-cat-item dep-info-cdu-item">
                                            {item.cduNombre?.trim() && (
                                                <span className="dep-info-cdu-name">{item.cduNombre}</span>
                                            )}
                                            <span className="dep-info-cdu-desc">{item.texto}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Mensaje si no hay nada */}
                        {CATEGORIAS.every(({ key }) => !comments[key]?.some(e => e.texto?.trim())) &&
                         !comments.cambiosCDU?.some(e => e.texto?.trim()) && (
                            <div className="dep-info-empty">Sin entradas de changelog registradas.</div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
