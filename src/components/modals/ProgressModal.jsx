import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export default function ProgressModal({ isOpen, onClose, version }) {
    if (!version) return null;

    const cdus = version.cdus || [];
    let totalProgress = 0;
    let validCdus = 0;

    cdus.forEach(cdu => {
        if (cdu.pasos && cdu.pasos.length > 0) {
            const completed = cdu.pasos.filter(p => p.completado).length;
            const percent = (completed / cdu.pasos.length) * 100;
            totalProgress += percent;
            validCdus++;
        }
    });

    const finalProgress = validCdus > 0 ? Math.round(totalProgress / validCdus) : 0;

    let progressClass = 'progress-low';
    if (finalProgress >= 100) progressClass = 'progress-complete';
    else if (finalProgress >= 50) progressClass = 'progress-mid';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Progreso V${version.numero}`}
            type="info"
            showIcon={false} // <--- CAMBIO: Ocultar icono de info
            actions={<Button onClick={onClose}>Cerrar</Button>}
        >
            <div className="modal-progress-content">
                <div className={`progress-big-text ${progressClass}`}>
                    {finalProgress}%
                </div>
                <div className="progress-label">Promedio Global</div>

                <div className="progress-bar-container">
                    <div
                        className={`progress-bar-fill ${progressClass}`}
                        style={{ width: `${finalProgress}%` }}
                    ></div>
                </div>

                <p className="progress-note">
                    Cálculo basado en el avance de pasos de {validCdus} CDUs activos.
                    (Los CDUs sin pasos definidos no afectan el promedio).
                </p>
            </div>
        </Modal>
    );
}