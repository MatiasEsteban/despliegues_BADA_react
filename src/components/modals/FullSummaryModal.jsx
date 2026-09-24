import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { normalizeComments } from '../../store/dataStore';

const CATEGORIAS = [
    { key: 'mejoras',         label: 'MEJORAS Y BUGFIX' },
    { key: 'salidas',         label: 'A PRODUCCION' },
    { key: 'cambiosCaliente', label: 'CAMBIOS EN CALIENTE' },
    { key: 'observaciones',   label: 'OBSERVACIONES' },
];

const SEP  = '='.repeat(48);
const SEP2 = '-'.repeat(48);

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; }
    catch { return dateStr; }
};

function buildVersionBlock(version, isProduccion) {
    const lines = [];
    const comments = normalizeComments(version.comentarios);

    lines.push(SEP);
    lines.push(`BADA V${version.numero}${version.titulo ? ' - ' + version.titulo : ''}${isProduccion ? ' [EN PRODUCCION]' : ''}`);
    lines.push(SEP);

    const fechaDeploy = formatDate(version.fechaDespliegue);
    if (fechaDeploy) {
        lines.push(`Despliegue: ${fechaDeploy}${version.horaDespliegue ? ' ' + version.horaDespliegue + 'hs' : ''}`);
    }
    const fechaCreacion = formatDate(version.fechaCreacion);
    if (fechaCreacion) {
        lines.push(`Creacion:   ${fechaCreacion}${version.horaCreacion ? ' ' + version.horaCreacion + 'hs' : ''}`);
    }
    if (version.fuente) lines.push(`Fuente:     ${version.fuente}`);

    lines.push('');

    let hasEntries = false;
    CATEGORIAS.forEach(({ key, label }) => {
        const items = comments[key]?.filter(e => e.texto?.trim()) || [];
        if (items.length === 0) return;
        hasEntries = true;
        lines.push(label);
        items.forEach(item => {
            const cduStr = item.cdu?.trim()
                ? `[${item.cdu.trim()}] `
                : (item.cduNombre?.trim() ? `[${item.cduNombre.trim()}] ` : '');
            const autorStr = item.autor?.trim() ? ` [${item.autor.trim()}]` : '';
            lines.push(`* ${cduStr}${item.texto}${autorStr}`);
        });
        lines.push('');
    });

    const cambiosCDU = comments.cambiosCDU?.filter(e => e.texto?.trim()) || [];
    if (cambiosCDU.length > 0) {
        hasEntries = true;
        lines.push('CAMBIOS POR CDU');
        cambiosCDU.forEach(item => {
            const cduPart = item.cduNombre?.trim() ? `[${item.cduNombre.trim()}] ` : '';
            lines.push(`* ${cduPart}${item.texto}`);
        });
        lines.push('');
    }

    if (!hasEntries) {
        lines.push('  (Version sin cambios registrados)');
        lines.push('');
    }

    return lines.join('\n');
}

export default function FullSummaryModal({ isOpen, onClose, versions, produccionId }) {
    const [copied, setCopied] = useState(false);

    const fullText = useMemo(() => {
        if (!versions || versions.length === 0) return 'No hay versiones para mostrar.';

        const now = new Date();
        const fecha = now.toLocaleDateString('es-AR');
        const hora  = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        const header = [
            'RESUMEN DE DESPLIEGUES - BADA',
            `Generado: ${fecha} ${hora}hs`,
            `Versiones incluidas: ${versions.length}`,
            SEP2,
            '',
        ].join('\n');

        const blocks = versions.map(v => buildVersionBlock(v, v.id === produccionId));
        return header + blocks.join('\n');
    }, [versions, produccionId]);

    const handleCopy = async () => {
        let success = false;

        if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(fullText);
                success = true;
            } catch (err) {
                console.warn('navigator.clipboard bloqueado, usando fallback:', err);
            }
        }

        if (!success) {
            try {
                const ta = document.createElement('textarea');
                ta.value = fullText;
                ta.setAttribute('readonly', '');
                Object.assign(ta.style, {
                    position: 'fixed', top: '0', left: '0',
                    width: '2em', height: '2em', padding: '0',
                    border: 'none', outline: 'none', boxShadow: 'none',
                    background: 'transparent', opacity: '0', zIndex: '-1',
                });
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                ta.setSelectionRange(0, fullText.length);
                success = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch (err) {
                console.error('execCommand fallo:', err);
            }
        }

        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } else {
            alert('No se pudo copiar automaticamente. Selecciona el texto manualmente.');
        }
    };

    const versionCount = versions?.length ?? 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Resumen Global - ${versionCount} version${versionCount !== 1 ? 'es' : ''}`}
            type="info"
            showIcon={false}
            className="modal-full-summary"
            actions={
                <>
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                    <Button variant="primary" onClick={handleCopy}>
                        {copied ? 'Copiado' : 'Copiar todo'}
                    </Button>
                </>
            }
        >
            <div className="full-summary-layout">
                {versionCount === 0 ? (
                    <div className="full-summary-empty">
                        No hay versiones que mostrar con los filtros actuales.
                    </div>
                ) : (
                    <>
                        <div className="full-summary-meta">
                            <span className="full-summary-meta-item">
                                <strong>{versionCount}</strong> version{versionCount !== 1 ? 'es' : ''} incluida{versionCount !== 1 ? 's' : ''}
                            </span>
                            <span className="full-summary-meta-sep">·</span>
                            <span className="full-summary-meta-item">
                                Orden: mas reciente primera
                            </span>
                        </div>
                        <pre className="full-summary-text">{fullText}</pre>
                    </>
                )}
            </div>
        </Modal>
    );
}
