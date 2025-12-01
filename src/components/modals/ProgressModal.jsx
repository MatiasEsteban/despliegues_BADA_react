import React, { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { calculateVersionStats } from '../../store/statsCalculator';

export default function ProgressModal({ isOpen, onClose, version }) {
    if (!version) return null;

    const stats = useMemo(() => calculateVersionStats(version), [version]);

    if (!stats) return null;

    const { finalProgress, validCdus, statusCounts, difficultyCounts, badaVersionCounts } = stats;

    let progressClass = 'progress-low';
    if (finalProgress >= 100) progressClass = 'progress-complete';
    else if (finalProgress >= 50) progressClass = 'progress-mid';

    // Helper para generar conic-gradient
    const getConicGradient = (data, colors) => {
        let currentAngle = 0;
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        if (total === 0) return 'gray 0% 100%';

        const segments = Object.entries(data).map(([key, value]) => {
            if (value === 0) return null;
            const percentage = (value / total) * 100;
            const start = currentAngle;
            const end = currentAngle + percentage;
            currentAngle = end;
            return `${colors[key] || 'gray'} ${start}% ${end}%`;
        }).filter(Boolean);

        return `conic-gradient(${segments.join(', ')})`;
    };

    // Colores
    const statusColors = {
        'En Desarrollo': '#3b82f6', // blue-500
        'Pendiente de Certificacion': '#f59e0b', // amber-500
        'Certificado OK': '#10b981', // emerald-500
        'En Produccion': '#8b5cf6' // violet-500
    };

    const difficultyColors = {
        'Baja': '#22c55e', // green-500
        'Media': '#eab308', // yellow-500
        'Alta': '#ef4444' // red-500
    };

    const badaColors = {
        'V1': '#0ea5e9', // sky-500
        'V2': '#ec4899' // pink-500
    };

    const statusGradient = getConicGradient(statusCounts, statusColors);
    const difficultyGradient = getConicGradient(difficultyCounts, difficultyColors);
    const badaGradient = getConicGradient(badaVersionCounts, badaColors);

    // Render Legend Helper
    const RenderLegend = ({ data, colors }) => (
        <div className="chart-legend">
            {Object.entries(data).map(([key, value]) => {
                if (value === 0) return null;
                return (
                    <div key={key} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: colors[key] }}></span>
                        <span className="legend-label">{key}: {value}</span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Progreso V${version.numero}`}
            type="info"
            showIcon={false}
            actions={<Button onClick={onClose}>Cerrar</Button>}
        >
            <div className="modal-progress-content" style={{ display: 'grid', gap: '2rem' }}>

                {/* 1. PROGRESO GLOBAL */}
                <div className="chart-section">
                    <h3 className="chart-title">Progreso Global</h3>
                    <div className={`progress-big-text ${progressClass}`}>
                        {finalProgress}%
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className={`progress-bar-fill ${progressClass}`}
                            style={{ width: `${finalProgress}%` }}
                        ></div>
                    </div>
                    <p className="progress-note">
                        Basado en {validCdus} CDUs activos.
                    </p>
                </div>

                {/* GRID DE GRAFICOS */}
                <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                    {/* 2. ESTADOS CDUS */}
                    <div className="chart-card">
                        <h4 className="chart-subtitle">Estados CDUs</h4>
                        <div className="pie-chart-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="pie-chart" style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: statusGradient,
                                flexShrink: 0
                            }}></div>
                            <RenderLegend data={statusCounts} colors={statusColors} />
                        </div>
                    </div>

                    {/* 3. DIFICULTAD */}
                    <div className="chart-card">
                        <h4 className="chart-subtitle">Dificultad (Pasos)</h4>
                        <div className="pie-chart-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="pie-chart" style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: difficultyGradient,
                                flexShrink: 0
                            }}></div>
                            <RenderLegend data={difficultyCounts} colors={difficultyColors} />
                        </div>
                    </div>

                    {/* 4. VERSION BADA */}
                    <div className="chart-card">
                        <h4 className="chart-subtitle">Versión Bada (Pasos)</h4>
                        <div className="pie-chart-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="pie-chart" style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: badaGradient,
                                flexShrink: 0
                            }}></div>
                            <RenderLegend data={badaVersionCounts} colors={badaColors} />
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .chart-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary); }
                .chart-subtitle { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary); }
                .chart-card { background: var(--bg-secondary); padding: 1rem; borderRadius: 8px; }
                .legend-item { display: flex; alignItems: center; gap: 0.5rem; font-size: 0.8rem; margin-bottom: 0.25rem; }
                .legend-color { width: 10px; height: 10px; border-radius: 2px; }
                .legend-label { color: var(--text-primary); }
            `}</style>
        </Modal>
    );
}