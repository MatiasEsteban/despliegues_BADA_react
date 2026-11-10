import React, { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { calculateVersionStats } from '../../store/statsCalculator';

// Clases estables por categoría. Se declaran aquí (nunca se derivan del texto
// visible) para que el color viva en `modal-progress.css` con tokens de paleta.
const STATUS_CLASSES = {
    'En Desarrollo': { pie: 'pie-segment--desarrollo', legend: 'legend-color--desarrollo', heading: 'status-heading--desarrollo' },
    'Pendiente de Certificacion': { pie: 'pie-segment--pendiente', legend: 'legend-color--pendiente', heading: 'status-heading--pendiente' },
    'Certificado OK': { pie: 'pie-segment--certificado', legend: 'legend-color--certificado', heading: 'status-heading--certificado' },
    'En Produccion': { pie: 'pie-segment--produccion', legend: 'legend-color--produccion', heading: 'status-heading--produccion' }
};

const DIFFICULTY_CLASSES = {
    'Baja': { pie: 'pie-segment--baja', legend: 'legend-color--baja' },
    'Media': { pie: 'pie-segment--media', legend: 'legend-color--media' },
    'Alta': { pie: 'pie-segment--alta', legend: 'legend-color--alta' }
};

const BADA_CLASSES = {
    'V1': { pie: 'pie-segment--v1', legend: 'legend-color--v1', heading: 'status-heading--v1' },
    'V2': { pie: 'pie-segment--v2', legend: 'legend-color--v2', heading: 'status-heading--v2' }
};

// Tarta por segmentos. Un círculo con `r = 25` y `stroke-width = 50` pinta un
// disco de radio 50; `pathLength="100"` normaliza `stroke-dasharray` a porcentajes
// y conserva los mismos ángulos que el antiguo `conic-gradient`.
function PieChart({ data, classes }) {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        return <svg className="pie-chart" viewBox="0 0 100 100" aria-hidden="true" focusable="false" />;
    }

    let offset = 0;
    const segments = Object.entries(data)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => {
            const percent = (value / total) * 100;
            const segment = { key, percent, offset, className: classes[key]?.pie ?? '' };
            offset += percent;
            return segment;
        });

    return (
        <svg className="pie-chart" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <g transform="rotate(-90 50 50)">
                {segments.map(({ key, percent, offset, className }) => (
                    <circle
                        key={key}
                        className={`pie-segment ${className}`}
                        cx="50"
                        cy="50"
                        r="25"
                        pathLength="100"
                        strokeDasharray={`${percent} ${100 - percent}`}
                        strokeDashoffset={-offset}
                    />
                ))}
            </g>
        </svg>
    );
}

function RenderLegend({ data, classes }) {
    return (
        <div className="chart-legend">
            {Object.entries(data).map(([key, value]) => {
                if (value === 0) return null;
                return (
                    <div key={key} className="legend-item">
                        <span className={`legend-color ${classes[key]?.legend ?? ''}`}></span>
                        <span className="legend-label">{key}: {value}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function ProgressModal({ isOpen, onClose, version }) {
    if (!version) return null;

    const stats = useMemo(() => calculateVersionStats(version), [version]);
    const [expandedChart, setExpandedChart] = useState(null);

    if (!stats) return null;

    const { finalProgress, validCdus, statusCounts, difficultyCounts, badaVersionCounts } = stats;

    let progressClass = 'progress-low';
    if (finalProgress >= 100) progressClass = 'progress-complete';
    else if (finalProgress >= 50) progressClass = 'progress-mid';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Progreso V${version.numero}`}
            type="info"
            showIcon={false}
            className={`modal-progress ${expandedChart ? 'modal-expanded' : ''}`}
            actions={<Button onClick={onClose}>Cerrar</Button>}
        >
            <div className="modal-progress-content">

                {/* 1. PROGRESO GLOBAL */}
                <div className="chart-section">
                    <h3 className="chart-title">Progreso Global</h3>
                    <div className={`progress-big-text ${progressClass}`}>
                        {finalProgress}%
                    </div>
                    <div className="progress-bar-container">
                        <progress
                            className={`progress-bar ${progressClass}`}
                            value={finalProgress}
                            max={100}
                            aria-label="Progreso global"
                        />
                    </div>
                    <p className="progress-note">
                        Basado en {validCdus} CDUs activos.
                    </p>
                </div>

                {/* GRID DE GRAFICOS */}
                <div className="charts-grid">

                    {/* 2. ESTADOS CDUS */}
                    <div
                        className={`chart-card chart-card--expandable ${expandedChart === 'status' ? 'expanded' : ''}`}
                        onClick={() => setExpandedChart(expandedChart === 'status' ? null : 'status')}
                    >
                        <h4 className="chart-subtitle">Estados CDUs {expandedChart === 'status' && '(Click para contraer)'}</h4>

                        <div className={`chart-content-wrapper ${expandedChart === 'status' ? 'expanded' : ''}`}>
                            {/* Gráfico */}
                            <div className="pie-chart-container pie-chart-container--fixed">
                                <PieChart data={statusCounts} classes={STATUS_CLASSES} />
                                <RenderLegend data={statusCounts} classes={STATUS_CLASSES} />
                            </div>

                            {/* Detalles (Solo visible si está expandido) */}
                            {expandedChart === 'status' && (
                                <div className="chart-details">
                                    {Object.entries(stats.cdusByStatus).map(([status, titles]) => {
                                        if (titles.length === 0) return null;
                                        return (
                                            <div key={status} className="status-column">
                                                <h5 className={`status-heading ${STATUS_CLASSES[status]?.heading ?? ''}`}>
                                                    {status} ({titles.length})
                                                </h5>
                                                <ul className="status-list">
                                                    {titles.map((title, idx) => (
                                                        <li key={idx}>
                                                            • {title}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. DIFICULTAD */}
                    <div className="chart-card">
                        <h4 className="chart-subtitle">Dificultad (Pasos)</h4>
                        <div className="pie-chart-container">
                            <PieChart data={difficultyCounts} classes={DIFFICULTY_CLASSES} />
                            <RenderLegend data={difficultyCounts} classes={DIFFICULTY_CLASSES} />
                        </div>
                    </div>

                    {/* 4. VERSION BADA */}
                    <div
                        className={`chart-card chart-card--expandable ${expandedChart === 'bada' ? 'expanded' : ''}`}
                        onClick={() => setExpandedChart(expandedChart === 'bada' ? null : 'bada')}
                    >
                        <h4 className="chart-subtitle">Versión Bada (Pasos) {expandedChart === 'bada' && '(Click para contraer)'}</h4>

                        <div className={`chart-content-wrapper ${expandedChart === 'bada' ? 'expanded' : ''}`}>
                            <div className="pie-chart-container pie-chart-container--fixed">
                                <PieChart data={badaVersionCounts} classes={BADA_CLASSES} />
                                <RenderLegend data={badaVersionCounts} classes={BADA_CLASSES} />
                            </div>

                            {/* Detalles BADA */}
                            {expandedChart === 'bada' && (
                                <div className="chart-details">
                                    {/* Calcular CDUs por versión dominante on-the-fly */}
                                    {(() => {
                                        const cdusByBada = { 'V1': [], 'V2': [] };
                                        version.cdus.forEach(cdu => {
                                            if (!cdu.pasos || cdu.pasos.length === 0) return;
                                            const counts = { 'V1': 0, 'V2': 0 };
                                            cdu.pasos.forEach(p => {
                                                const v = p.version || 'V1';
                                                counts[v] = (counts[v] || 0) + 1;
                                            });
                                            const dom = counts['V2'] > counts['V1'] ? 'V2' : 'V1'; // Simple majority
                                            // OJO: La logica de grafico era por PASOS global, aqui agrupamos CDUs por dominante. 
                                            // Es una visualizacion distinta pero util.
                                            if (cdusByBada[dom]) cdusByBada[dom].push(cdu.nombreCDU);
                                        });

                                        return Object.entries(cdusByBada).map(([ver, titles]) => {
                                            if (titles.length === 0) return null;
                                            return (
                                                <div key={ver} className="status-column">
                                                    <h5 className={`status-heading ${BADA_CLASSES[ver]?.heading ?? ''}`}>
                                                        Dominante {ver} ({titles.length})
                                                    </h5>
                                                    <ul className="status-list">
                                                        {titles.map((title, idx) => (
                                                            <li key={idx}>
                                                                • {title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </Modal>
    );
}