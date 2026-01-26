import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import StepsEditor from '../views/detail/StepsEditor';
import ResponsiblesEditor from '../views/detail/ResponsiblesEditor';

export default function EvolutionModal({ isOpen, onClose, cdu, onConfirm }) {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (isOpen && cdu) {
            // Inicializamos con los datos del CDU pero podríamos resetear estado si fuera necesario
            // Por ahora copiamos todo igual
            setFormData(JSON.parse(JSON.stringify(cdu)));
        }
    }, [isOpen, cdu]);

    if (!isOpen || !formData) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onConfirm(cdu.uuid, formData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Evolucionar CDU"
            type="info"
            className="modal-evolution"
            actions={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Confirmar Nueva Versión</Button>
                </>
            }
        >
            <div className="evolution-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p className="evolution-warning" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Al confirmar, se guardará el estado actual en el historial y se actualizará el CDU con los nuevos datos ingresados aquí.
                </p>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Nombre CDU"
                        value={formData.nombreCDU}
                        onChange={e => handleChange('nombreCDU', e.target.value)}
                    />
                    <Input
                        label="Versión Miró"
                        value={formData.versionMiro}
                        onChange={e => handleChange('versionMiro', e.target.value)}
                    />
                </div>

                <div className="form-row">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción</label>
                    <textarea
                        className="input-field"
                        rows={3}
                        style={{ width: '100%', padding: '0.5rem' }}
                        value={formData.descripcionCDU}
                        onChange={e => handleChange('descripcionCDU', e.target.value)}
                    />
                </div>

                <div className="form-row">
                    <Select
                        label="Nuevo Estado"
                        value={formData.estado}
                        onChange={e => handleChange('estado', e.target.value)}
                    >
                        <option value="En Desarrollo">En Desarrollo</option>
                        <option value="Pendiente de Certificacion">Pendiente de Certificacion</option>
                        <option value="Certificado OK">Certificado OK</option>
                        <option value="En Produccion">En Produccion</option>
                    </Select>
                </div>

                <div className="form-section">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pasos</label>
                    <StepsEditor
                        steps={formData.pasos}
                        onChange={newSteps => handleChange('pasos', newSteps)}
                    />
                </div>

                <div className="form-section">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Responsables</label>
                    <ResponsiblesEditor
                        responsibles={formData.responsables}
                        onChange={newResp => handleChange('responsables', newResp)}
                    />
                </div>
            </div>
        </Modal>
    );
}
