import React from 'react';
import { Icons } from '../../ui/Icons';

export default function ResponsiblesEditor({ responsibles = [], onChange }) {
    const handleAdd = () => {
        onChange([...responsibles, { nombre: '', rol: 'DEV' }]);
    };

    const handleRemove = (index) => {
        onChange(responsibles.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newResp = [...responsibles];
        newResp[index] = { ...newResp[index], [field]: value };
        onChange(newResp);
    };

    const getRoleIcon = (rol) => {
        switch (rol) {
            case 'AF': return <Icons.RoleAF className="rol-icon" />;
            case 'AN': return <Icons.RoleAN className="rol-icon" />;
            case 'QA': return <Icons.RoleQA className="rol-icon" />;
            case 'UX': return <Icons.RoleUX className="rol-icon" />;
            case 'DEV':
            default: return <Icons.RoleDev className="rol-icon" />;
        }
    };

    return (
        <div className="responsables-container">
            {responsibles.length === 0 && <div className="responsables-empty">Sin responsables</div>}

            {responsibles.map((resp, index) => (
                <div key={index} className="responsable-item">
                    <div className="rol-select-container">
                        <div className="rol-display">
                            {getRoleIcon(resp.rol)}
                            <span>{resp.rol}</span>
                        </div>
                        <select
                            className="responsable-rol-select"
                            value={resp.rol}
                            onChange={(e) => handleChange(index, 'rol', e.target.value)}
                        >
                            <option value="DEV">DEV</option>
                            <option value="AF">AF</option>
                            <option value="UX">UX</option>
                            <option value="AN">AN</option>
                            <option value="QA">QA</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        value={resp.nombre}
                        placeholder="Nombre..."
                        onChange={(e) => handleChange(index, 'nombre', e.target.value)}
                    />
                    <button className="btn-responsable btn-remove" onClick={() => handleRemove(index)}>×</button>
                </div>
            ))}

            <button className="btn-responsable btn-add" onClick={handleAdd}>+</button>
        </div>
    );
}