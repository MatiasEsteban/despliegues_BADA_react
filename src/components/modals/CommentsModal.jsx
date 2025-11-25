import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export default function CommentsModal({ isOpen, onClose, version, onSave }) {
    const [localComments, setLocalComments] = useState({
        mejoras: [], salidas: [], cambiosCaliente: [], observaciones: []
    });

    useEffect(() => {
        if (version?.comentarios) {
            setLocalComments(JSON.parse(JSON.stringify(version.comentarios)));
        } else {
            setLocalComments({ mejoras: [], salidas: [], cambiosCaliente: [], observaciones: [] });
        }
    }, [version, isOpen]);

    const handleChange = (category, index, value) => {
        const newItems = [...localComments[category]];
        newItems[index] = value;
        setLocalComments({ ...localComments, [category]: newItems });
    };

    const handleAdd = (category) => {
        setLocalComments({ ...localComments, [category]: [...localComments[category], ''] });
    };

    const handleRemove = (category, index) => {
        setLocalComments({
            ...localComments,
            [category]: localComments[category].filter((_, i) => i !== index)
        });
    };

    const handleSave = () => {
        const cleanComments = {
            mejoras: localComments.mejoras.filter(s => s && s.trim()),
            salidas: localComments.salidas.filter(s => s && s.trim()),
            cambiosCaliente: localComments.cambiosCaliente.filter(s => s && s.trim()),
            observaciones: localComments.observaciones.filter(s => s && s.trim()),
        };
        onSave(cleanComments);
        onClose();
    };

    const renderSection = (key, title) => (
        <div className="comentario-categoria" key={key}>
            <div className="comentario-categoria-header">
                <span className="comentario-categoria-titulo">{title}</span>
                <button className="btn-comentario-cat btn-add" onClick={() => handleAdd(key)}>+</button>
            </div>
            <div className="comentario-categoria-items">
                {localComments[key].length === 0 && <div className="comentario-empty">Sin elementos</div>}
                {localComments[key].map((item, idx) => (
                    <div key={idx} className="comentario-cat-item">
                        <textarea
                            className="comentario-textarea"
                            value={item}
                            onChange={(e) => handleChange(key, idx, e.target.value)}
                            rows={2}
                            placeholder="Escribe aquí..."
                        />
                        <button className="btn-comentario-cat btn-remove" onClick={() => handleRemove(key, idx)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Comentarios V${version?.numero || ''}`}
            type="info"
            showIcon={false}
            className="modal-comentarios-categorized" // <--- CAMBIO: Clase para ancho extendido
            actions={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar Cambios</Button>
                </>
            }
        >
            <div className="modal-comentarios-categorized-content" style={{ padding: 0 }}>
                {renderSection('mejoras', 'Mejoras y Bugfixes')}
                {renderSection('salidas', 'Salidas a Producción')}
                {renderSection('cambiosCaliente', 'Cambios en Caliente')}
                {renderSection('observaciones', 'Observaciones')}
            </div>
        </Modal>
    );
}