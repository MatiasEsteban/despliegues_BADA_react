import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Icons } from '../../ui/Icons';

export default function StepsEditor({ steps = [], onChange }) {
    const [isExpanded, setIsExpanded] = useState(false); // Inicia colapsado

    const total = steps.length;
    const completed = steps.filter(s => s.completado).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    let percentClass = 'percent-zero';
    if (percentage === 100) percentClass = 'percent-success';
    else if (percentage > 0) percentClass = 'percent-progress';

    const handleStepChange = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        onChange(newSteps);
    };

    const handleAddStep = () => {
        const newStep = { titulo: '', dificultad: 'Baja', version: 'V1', completado: false };
        onChange([...steps, newStep]);
        setIsExpanded(true); // Auto-expandir al agregar
    };

    const handleRemoveStep = (index) => {
        const newSteps = steps.filter((_, i) => i !== index);
        onChange(newSteps);
    };

    return (
        <div className="pasos-container">
            <div className="pasos-header">
                <div className="pasos-summary-text">
                    <span className="pasos-count-val">{completed}/{total}</span>
                    <span className={clsx("pasos-percent-val", percentClass)}>{percentage}%</span>
                </div>
                <button
                    className={clsx("btn-toggle-pasos", isExpanded && "active")}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title="Mostrar/Ocultar pasos"
                >
                    <Icons.ChevronDown
                        className="icon-small"
                        style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.3s'
                        }}
                    />
                </button>
            </div>

            {isExpanded && (
                <div className="pasos-content">
                    {steps.length === 0 && <div className="pasos-empty">Sin pasos definidos</div>}

                    {steps.map((step, index) => (
                        <div key={index} className={clsx("paso-item", step.completado && "completed")}>
                            <div className="paso-inputs-row">
                                <div className="paso-check-container">
                                    <input
                                        type="checkbox"
                                        className="paso-check"
                                        checked={step.completado || false}
                                        onChange={(e) => handleStepChange(index, 'completado', e.target.checked)}
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="paso-titulo"
                                    value={step.titulo || ''}
                                    placeholder="Título del paso..."
                                    onChange={(e) => handleStepChange(index, 'titulo', e.target.value)}
                                />
                                <button className="btn-paso btn-remove" onClick={() => handleRemoveStep(index)}>×</button>
                            </div>
                            <div className="paso-meta-row">
                                <select
                                    className={clsx("paso-dificultad", step.dificultad?.toLowerCase() || 'baja')}
                                    value={step.dificultad || 'Baja'}
                                    onChange={(e) => handleStepChange(index, 'dificultad', e.target.value)}
                                >
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                </select>
                                <select
                                    className="paso-version"
                                    value={step.version || 'V1'}
                                    onChange={(e) => handleStepChange(index, 'version', e.target.value)}
                                >
                                    <option value="V1">V1</option>
                                    <option value="V2">V2</option>
                                </select>
                            </div>
                        </div>
                    ))}

                    <button className="btn-paso btn-add" onClick={handleAddStep}>+ Paso</button>
                </div>
            )}
        </div>
    );
}