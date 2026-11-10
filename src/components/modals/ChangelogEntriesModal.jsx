import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { normalizeComments } from '../../store/dataStore';

const CATEGORIAS = [
    { key: 'mejoras', label: 'Mejoras y Bugfix', isCDU: false },
    { key: 'salidas', label: 'A Producción', isCDU: false },
    { key: 'cambiosCaliente', label: 'Cambios en Caliente', isCDU: false },
    { key: 'observaciones', label: 'Observaciones', isCDU: false },
    { key: 'cambiosCDU', label: 'Cambios por CDU', isCDU: true },
];

const newEntry = (isCDU = false) => ({
    id: uuidv4(),
    texto: '',
    autor: '',
    cdu: '',
    ...(isCDU ? { cduNombre: '' } : {}),
});

export default function ChangelogEntriesModal({ isOpen, onClose, version, onSave }) {
    const [localComments, setLocalComments] = useState({
        mejoras: [], salidas: [], cambiosCaliente: [], observaciones: [], cambiosCDU: []
    });
    const [activeTab, setActiveTab] = useState('mejoras');

    useEffect(() => {
        if (isOpen) {
            setLocalComments(normalizeComments(version?.comentarios));
        }
    }, [version, isOpen]);

    const currentCat = CATEGORIAS.find(c => c.key === activeTab);
    const items = localComments[activeTab] || [];
    const datalistId = `cdus-list-${version?.id || 'default'}`;

    const handleAdd = () => {
        const entry = newEntry(currentCat?.isCDU);
        setLocalComments(prev => ({ ...prev, [activeTab]: [...prev[activeTab], entry] }));
    };

    const handleChange = (id, field, value) => {
        setLocalComments(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleRemove = (id) => {
        setLocalComments(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].filter(item => item.id !== id)
        }));
    };

    const handleSave = () => {
        const clean = {};
        CATEGORIAS.forEach(({ key }) => {
            clean[key] = (localComments[key] || [])
                .filter(e => e.texto?.trim())
                .map(e => ({
                    id: e.id,
                    texto: e.texto.trim(),
                    autor: e.autor?.trim() || '',
                    cdu: (e.cdu || e.cduNombre || '').trim(),
                    ...(e.cduNombre ? { cduNombre: (e.cdu || e.cduNombre || '').trim() } : {}),
                }));
        });
        onSave(clean);
        onClose();
    };

    const countFor = (key) => localComments[key]?.filter(e => e.texto?.trim()).length || 0;
    const totalCount = CATEGORIAS.reduce((sum, c) => sum + countFor(c.key), 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Changelog — V${version?.numero || ''}`}
            type="info"
            showIcon={false}
            className="modal-changelog-entries"
            actions={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar</Button>
                </>
            }
        >
            {/* Datalist con opciones de CDUs existentes de la versión */}
            <datalist id={datalistId}>
                {(version?.cdus || []).map((c, i) => (
                    c.nombreCDU?.trim() ? <option key={c.id || c.uuid || i} value={c.nombreCDU} /> : null
                ))}
            </datalist>

            <div className="changelog-modal-layout">
                {/* TABS */}
                <div className="changelog-modal-tabs">
                    {CATEGORIAS.map(cat => {
                        const count = countFor(cat.key);
                        return (
                            <button
                                key={cat.key}
                                className={`changelog-modal-tab changelog-modal-tab--${cat.key} ${activeTab === cat.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(cat.key)}
                            >
                                <span className="tab-label">{cat.label}</span>
                                {count > 0 && <span className="tab-badge">{count}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* BODY */}
                <div className="changelog-modal-body">
                    {/* Header de sección con UN SOLO botón agregar */}
                    <div className="changelog-modal-cat-header">
                        <span className="changelog-modal-cat-title">{currentCat?.label}</span>
                        <button className="btn-changelog-add" onClick={handleAdd}>
                            <Icons.Plus style={{ width: '13px', height: '13px' }} />
                            Agregar Cambio
                        </button>
                    </div>

                    {/* Lista de entradas */}
                    <div className="changelog-modal-entries">
                        {items.length === 0 ? (
                            <div className="changelog-modal-empty">
                                <span>Sin entradas en esta categoría</span>
                                <button className="btn-changelog-add-empty" onClick={handleAdd}>
                                    <Icons.Plus style={{ width: '13px', height: '13px' }} />
                                    Agregar la primera entrada
                                </button>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div key={item.id} className="changelog-entry-row">
                                    <span className="changelog-entry-idx">#{idx + 1}</span>
                                    <div className="changelog-entry-fields">
                                        <div className="changelog-entry-top-row">
                                            <div className="changelog-entry-cdu-wrap">
                                                <span className="changelog-field-prefix">CDU:</span>
                                                <input
                                                    list={datalistId}
                                                    className="changelog-entry-cdu"
                                                    type="text"
                                                    value={item.cdu || item.cduNombre || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        handleChange(item.id, 'cdu', val);
                                                        if (currentCat?.isCDU) handleChange(item.id, 'cduNombre', val);
                                                    }}
                                                    placeholder="Asignar o escribir CDU..."
                                                />
                                            </div>
                                            <div className="changelog-entry-autor-wrap">
                                                <span className="changelog-field-prefix">Autor:</span>
                                                <input
                                                    className="changelog-entry-autor"
                                                    type="text"
                                                    value={item.autor || ''}
                                                    onChange={e => handleChange(item.id, 'autor', e.target.value)}
                                                    placeholder="Autor (opcional)"
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            className="changelog-entry-textarea"
                                            value={item.texto}
                                            onChange={e => handleChange(item.id, 'texto', e.target.value)}
                                            placeholder="Descripción detallada del cambio..."
                                            rows={2}
                                        />
                                    </div>
                                    <button
                                        className="btn-changelog-remove"
                                        onClick={() => handleRemove(item.id)}
                                        title="Eliminar este cambio"
                                    >
                                        <Icons.X style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {totalCount > 0 && (
                        <div className="changelog-modal-footer-stats">
                            {totalCount} entrada{totalCount !== 1 ? 's' : ''} en total registrada{totalCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
