import React, { useState, useEffect } from 'react';
import { Icons } from '../ui/Icons';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const [y, m, d] = dateStr.split('-');
        if (!y || !m || !d) return dateStr;
        return `${d}/${m}/${y}`;
    } catch {
        return dateStr;
    }
};

export default function DateQuickEditor({
    label,
    icon,
    dateValue = '',
    timeValue = '',
    onSave,
    versionNumber = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState(dateValue || '');
    const [tempTime, setTempTime] = useState(timeValue || '');

    // Sincronizar cuando cambian las props externas
    useEffect(() => {
        setTempDate(dateValue || '');
        setTempTime(timeValue || '');
    }, [dateValue, timeValue]);

    const handleOpen = (e) => {
        e.stopPropagation();
        setTempDate(dateValue || '');
        setTempTime(timeValue || '');
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSave = () => {
        onSave({ date: tempDate, time: tempTime });
        setIsOpen(false);
    };

    const handleSetNow = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeNow = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        setTempDate(today);
        setTempTime(timeNow);
    };

    const handleClear = () => {
        setTempDate('');
        setTempTime('');
    };

    const hasValue = Boolean(dateValue);
    const titleText = `${icon} Fecha de ${label}${versionNumber ? ` — Versión ${versionNumber}` : ''}`;

    return (
        <div className="date-quick-editor-wrap" onClick={e => e.stopPropagation()}>
            <button
                type="button"
                className={`date-quick-chip ${hasValue ? 'date-quick-chip--active' : 'date-quick-chip--empty'}`}
                onClick={handleOpen}
                title={`Modificar fecha de ${label.toLowerCase()}`}
            >
                <span className="date-quick-icon">{icon}</span>
                <span className="date-quick-label">{label}:</span>
                <span className="date-quick-value">
                    {formatDate(dateValue)}
                    {timeValue && <span className="date-quick-time"> {timeValue}hs</span>}
                </span>
                <Icons.Edit className="date-quick-edit-icon icon-xs" />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={titleText}
                type="info"
                showIcon={false}
                className="modal-date-editor"
                actions={
                    <>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Guardar
                        </Button>
                    </>
                }
            >
                <div className="date-modal-content">
                    <p className="date-modal-hint">
                        Modificá la fecha y hora de {label.toLowerCase()}:
                    </p>

                    <div className="date-modal-fields">
                        <div className="date-modal-field">
                            <label className="date-modal-label">Fecha</label>
                            <input
                                type="date"
                                className="date-modal-input"
                                value={tempDate}
                                onChange={(e) => setTempDate(e.target.value)}
                            />
                        </div>

                        <div className="date-modal-field">
                            <label className="date-modal-label">Hora</label>
                            <input
                                type="time"
                                className="date-modal-input"
                                value={tempTime}
                                onChange={(e) => setTempTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="date-modal-shortcuts">
                        <button
                            type="button"
                            className="btn-date-shortcut btn-date-now"
                            onClick={handleSetNow}
                        >
                            🕒 Asignar Hoy y Ahora
                        </button>
                        <button
                            type="button"
                            className="btn-date-shortcut btn-date-clear"
                            onClick={handleClear}
                        >
                            🗑️ Limpiar valores
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
