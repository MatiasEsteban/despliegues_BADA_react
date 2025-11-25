import React from 'react';
import { clsx } from 'clsx';
import StepsEditor from './StepsEditor';
import ResponsiblesEditor from './ResponsiblesEditor';
import BadaGraph from './BadaGraph';
import { Icons } from '../../ui/Icons';
import { StatusBadge } from '../../ui/Badge';

export default function CduRow({ cdu, onUpdate, onDelete }) {

    // Helper para actualizar un campo específico del CDU
    const handleChange = (field, value) => {
        onUpdate({ ...cdu, [field]: value });
    };

    // Manejo de Observaciones (es un array de strings o objetos)
    const handleObsChange = (index, val) => {
        const newObs = [...(cdu.observaciones || [])];
        newObs[index] = val;
        handleChange('observaciones', newObs);
    };

    const addObs = () => handleChange('observaciones', [...(cdu.observaciones || []), '']);
    const removeObs = (index) => handleChange('observaciones', (cdu.observaciones || []).filter((_, i) => i !== index));

    return (
        <tr data-cdu-id={cdu.id}>
            {/* 1. NOMBRE */}
            <td>
                <div className="cdu-cell-with-actions">
                    <input
                        type="text"
                        className="campo-cdu"
                        value={cdu.nombreCDU || ''}
                        onChange={(e) => handleChange('nombreCDU', e.target.value)}
                        placeholder="Nombre CDU"
                    />
                    <button className="btn-historial" title="Ver historial" onClick={() => alert('Historial pendiente')}>
                        <Icons.Info className="icon-small" />
                    </button>
                </div>
            </td>

            {/* 2. DESCRIPCIÓN */}
            <td>
                <textarea
                    className="campo-descripcion"
                    value={cdu.descripcionCDU || ''}
                    onChange={(e) => handleChange('descripcionCDU', e.target.value)}
                    placeholder="Descripción del CDU"
                />
            </td>

            {/* 3. ESTADO */}
            <td>
                <div className="estado-select-container">
                    {/* Reutilizamos el Badge visual pero lo hacemos interactivo con el select oculto */}
                    <StatusBadge status={cdu.estado || 'En Desarrollo'} />
                    <select
                        className="campo-estado"
                        value={cdu.estado || 'En Desarrollo'}
                        onChange={(e) => handleChange('estado', e.target.value)}
                    >
                        <option value="En Desarrollo">En Desarrollo</option>
                        <option value="Pendiente de Certificacion">Pendiente de Certificacion</option>
                        <option value="Certificado OK">Certificado OK</option>
                        <option value="En Produccion">En Produccion</option>
                    </select>
                </div>
            </td>

            {/* 4. MÉTRICA BADA */}
            <td>
                <BadaGraph pasos={cdu.pasos || []} />
            </td>

            {/* 5. VERSIÓN MIRÓ */}
            <td>
                <input
                    type="text"
                    className="campo-version-miro"
                    value={cdu.versionMiro || ''}
                    onChange={(e) => handleChange('versionMiro', e.target.value)}
                    maxLength={5}
                    placeholder="V__"
                />
            </td>

            {/* 6. PASOS */}
            <td>
                <StepsEditor
                    steps={cdu.pasos || []}
                    onChange={(newSteps) => handleChange('pasos', newSteps)}
                />
            </td>

            {/* 7. RESPONSABLES */}
            <td>
                <ResponsiblesEditor
                    responsibles={cdu.responsables || []}
                    onChange={(newResp) => handleChange('responsables', newResp)}
                />
            </td>

            {/* 8. OBSERVACIONES */}
            <td>
                <div className="observaciones-container">
                    {(cdu.observaciones || []).length === 0 && <div className="observaciones-empty">Sin observaciones</div>}
                    {(cdu.observaciones || []).map((obs, idx) => (
                        <div key={idx} className="observacion-item">
                            <input
                                type="text"
                                value={typeof obs === 'string' ? obs : obs.texto}
                                onChange={(e) => handleObsChange(idx, e.target.value)}
                                placeholder="Observación..."
                            />
                            <button className="btn-observacion btn-remove" onClick={() => removeObs(idx)}>×</button>
                        </div>
                    ))}
                    <button className="btn-observacion btn-add" onClick={addObs}>+</button>
                </div>
            </td>

            {/* 9. ACCIONES */}
            <td style={{ textAlign: 'center' }}>
                <button className="btn btn-danger btn-eliminar" onClick={onDelete}>
                    <Icons.Trash className="icon" />
                </button>
            </td>
        </tr>
    );
}