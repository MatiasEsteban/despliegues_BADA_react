import React, { useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { Icons } from '../ui/Icons';
import '../../styles/components/modals/modal-history.css';

export default function CduHistoryModal({ isOpen, onClose, cdu }) {

    useEffect(() => {
        if (isOpen) {
            console.log("CduHistoryModal OPENED", cdu);
        }
    }, [isOpen, cdu]);

    // Ordenar historial del más reciente al más antiguo
    const history = useMemo(() => {
        if (!cdu || !cdu.historial) return [];
        return [...cdu.historial].sort((a, b) => new Date(b.fechaArchivado) - new Date(a.fechaArchivado));
    }, [cdu]);

    if (!isOpen || !cdu) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Historial de Versiones: ${cdu.nombreCDU}`}
            type="info" // Changed from 'default' to 'info' to ensure styles exist
            className="modal-history"
            actions={
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            }
        >
            <div className="history-container">
                {history.length === 0 ? (
                    <div className="history-empty">
                        <Icons.Info className="icon" />
                        <p>Este CDU aún no tiene historial de versiones anteriores.</p>
                    </div>
                ) : (
                    <div className="history-timeline">
                        {history.map((snapshot, index) => (
                            <div key={index} className="history-item">
                                <div className="history-header">
                                    <div className="history-meta">
                                        <span className="history-date">
                                            <Icons.Calendar className="icon-tiny" />
                                            {new Date(snapshot.fechaArchivado).toLocaleString()}
                                        </span>
                                        <span className="history-reason">
                                            {snapshot.razonCambio || 'Cambio de estado'}
                                        </span>
                                    </div>
                                    <StatusBadge status={snapshot.estado} />
                                </div>
                                <div className="history-content">
                                    <div className="history-field">
                                        <strong>Versión Miró:</strong> {snapshot.versionMiro || '-'}
                                    </div>
                                    <div className="history-field">
                                        <strong>Descripción:</strong> {snapshot.descripcionCDU}
                                    </div>
                                    {snapshot.pasos && snapshot.pasos.length > 0 && (
                                        <div className="history-steps">
                                            <strong>Pasos ({snapshot.pasos.length}):</strong>
                                            <ul>
                                                {snapshot.pasos.map((p, i) => (
                                                    <li key={i}>{p.texto} ({p.porcentaje}%)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
