import React, { useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { ExcelExporter } from '../../services/excelExporter';
import { TextExporter } from '../../services/textExporter';
import { useToast } from '../../context/ToastContext';

const EXPORT_FORMATS = ['excel', 'text'];

export default function ExportModal({ isOpen, onClose, versions, versionEnProduccionId }) {
    const [exportFormat, setExportFormat] = useState('excel'); // 'excel' | 'text'
    const [isExporting, setIsExporting] = useState(false);
    const groupRef = useRef(null);
    const { showToast } = useToast();

    if (!isOpen) return null;

    // P4-04.4: roving tabindex. Solo la opción seleccionada es tab stop; las
    // flechas/Home/End mueven selección y foco, Enter/Espacio confirman.
    const selectFormat = (format) => {
        if (!format) return;
        setExportFormat(format);
        const option = groupRef.current?.querySelector(`[data-format="${format}"]`);
        option?.focus();
    };

    const handleFormatKeyDown = (event) => {
        const currentIndex = EXPORT_FORMATS.indexOf(exportFormat);
        let nextFormat = null;

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                nextFormat = EXPORT_FORMATS[(currentIndex + 1) % EXPORT_FORMATS.length];
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                nextFormat = EXPORT_FORMATS[(currentIndex - 1 + EXPORT_FORMATS.length) % EXPORT_FORMATS.length];
                break;
            case 'Home':
                nextFormat = EXPORT_FORMATS[0];
                break;
            case 'End':
                nextFormat = EXPORT_FORMATS[EXPORT_FORMATS.length - 1];
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                selectFormat(event.target.dataset.format ?? exportFormat);
                return;
            default:
                return;
        }

        event.preventDefault();
        selectFormat(nextFormat);
    };

    const handleExport = async () => {
        if (!versions || versions.length === 0) {
            showToast('No hay datos para exportar', 'warning');
            return;
        }

        setIsExporting(true);
        try {
            if (exportFormat === 'excel') {
                await ExcelExporter.exportar(versions, versionEnProduccionId);
                showToast('Archivo Excel descargado exitosamente', 'success');
            } else {
                await TextExporter.exportar(versions, versionEnProduccionId);
                showToast('Archivo de Texto descargado exitosamente', 'success');
            }
            onClose();
        } catch (err) {
            console.error(err);
            showToast(`Error al exportar archivo: ${err.message || 'Error desconocido'}`, 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exportar Datos"
            type="info"
            showIcon={false}
            className="modal-export-selector"
            actions={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isExporting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        icon={Icons.Download}
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Generando...' : `Descargar ${exportFormat === 'excel' ? 'Excel (.xlsx)' : 'Texto (.txt)'}`}
                    </Button>
                </>
            }
        >
            <div className="export-modal-content">
                <p className="export-modal-description">
                    Seleccioná el formato en el que deseás descargar el reporte de versiones y changelog:
                </p>

                <div
                    className="export-options-grid"
                    role="radiogroup"
                    aria-label="Formato de exportación"
                    ref={groupRef}
                    onKeyDown={handleFormatKeyDown}
                >
                    {/* Opción Excel */}
                    <div
                        role="radio"
                        aria-checked={exportFormat === 'excel'}
                        tabIndex={exportFormat === 'excel' ? 0 : -1}
                        data-format="excel"
                        className={`export-option-card ${exportFormat === 'excel' ? 'export-option-card--selected' : ''}`}
                        onClick={() => selectFormat('excel')}
                    >
                        <div className="export-option-radio">
                            <span className={`radio-circle ${exportFormat === 'excel' ? 'radio-circle--checked' : ''}`} />
                        </div>
                        <div className="export-option-icon export-option-icon--excel">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" aria-hidden="true" focusable="false">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M8 13h8" />
                                <path d="M8 17h8" />
                                <path d="M10 9h1" />
                            </svg>
                        </div>
                        <div className="export-option-info">
                            <h3 className="export-option-title">Planilla Excel (.xlsx)</h3>
                            <p className="export-option-subtitle">
                                Incluye hojas separadas: <strong>Changelog</strong> (resumen organizado por versión) y <strong>CDUs Detalle</strong> (estados, responsables y trazabilidad).
                            </p>
                        </div>
                    </div>

                    {/* Opción Texto */}
                    <div
                        role="radio"
                        aria-checked={exportFormat === 'text'}
                        tabIndex={exportFormat === 'text' ? 0 : -1}
                        data-format="text"
                        className={`export-option-card ${exportFormat === 'text' ? 'export-option-card--selected' : ''}`}
                        onClick={() => selectFormat('text')}
                    >
                        <div className="export-option-radio">
                            <span className={`radio-circle ${exportFormat === 'text' ? 'radio-circle--checked' : ''}`} />
                        </div>
                        <div className="export-option-icon export-option-icon--text">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" aria-hidden="true" focusable="false">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                        </div>
                        <div className="export-option-info">
                            <h3 className="export-option-title">Archivo de Texto (.txt)</h3>
                            <p className="export-option-subtitle">
                                Reporte estructurado y limpio en texto plano, ideal para compartir en notas, correos o chats con las fechas, categorías y CDUs de cada versión.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
