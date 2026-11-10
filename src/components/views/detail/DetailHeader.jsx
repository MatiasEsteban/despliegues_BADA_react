import React, { useState } from 'react';
import { useDataStore } from '../../../store/dataStore';
import { Button } from '../../ui/Button';
import { Icons } from '../../ui/Icons';
import ChangelogEntriesModal from '../../modals/ChangelogEntriesModal';
import ProgressModal from '../../modals/ProgressModal';
import { normalizeComments } from '../../../store/dataStore';

export default function DetailHeader() {
    const { selectedVersionId, versions, deselectVersion, updateCurrentVersion } = useDataStore();

    const version = versions.find(v => v.id === selectedVersionId) || {};

    const [showComments, setShowComments] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    const handleMetaChange = (field, value) => {
        const updatedVersion = { ...version, [field]: value };
        updateCurrentVersion(updatedVersion);
    };

    const handleSaveComments = (newComments) => {
        const updatedVersion = { ...version, comentarios: newComments };
        updateCurrentVersion(updatedVersion);
    };

    // Calcular total de entradas para el badge
    const normalizedComments = normalizeComments(version.comentarios);
    const totalComments = Object.values(normalizedComments).reduce(
        (sum, arr) => sum + (arr?.filter(e => e.texto?.trim()).length || 0), 0
    );

    return (
        <div className="version-detail-header">
            <Button variant="back" onClick={deselectVersion} icon={Icons.ArrowLeft}>
                Volver
            </Button>

            <div className="version-detail-info">
                <h2 id="detail-version-title">
                    Versión {version.numero}
                </h2>

                <div className="version-detail-meta">
                    <div className="version-meta-field">
                        <div className="input-group">
                            <label>Fecha Creación</label>
                            <input
                                type="date"
                                className="version-date-input"
                                value={version.fechaCreacion || ''}
                                onChange={(e) => handleMetaChange('fechaCreacion', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="version-meta-field">
                        <div className="input-group">
                            <label>Hora Creación</label>
                            <input
                                type="time"
                                className="version-time-input"
                                value={version.horaCreacion || ''}
                                onChange={(e) => handleMetaChange('horaCreacion', e.target.value)}
                            />
                        </div>
                    </div>

                    <span className="separator">•</span>

                    <div className="version-meta-field">
                        <div className="input-group">
                            <label>Fuente</label>
                            <input
                                type="text"
                                className="version-source-input"
                                value={version.fuente || ''}
                                onChange={(e) => handleMetaChange('fuente', e.target.value)}
                            />
                        </div>
                    </div>

                    <span className="separator">•</span>

                    <div className="version-meta-field">
                        <div className="input-group">
                            <label>Fecha Despliegue</label>
                            <input
                                type="date"
                                className="version-date-input"
                                value={version.fechaDespliegue || ''}
                                onChange={(e) => handleMetaChange('fechaDespliegue', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="version-meta-field">
                        <div className="input-group">
                            <label>Hora Despliegue</label>
                            <input
                                type="time"
                                className="version-time-input"
                                value={version.horaDespliegue || ''}
                                onChange={(e) => handleMetaChange('horaDespliegue', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="version-header-buttons">
                <Button variant="info" onClick={() => setShowProgress(true)}>Progreso</Button>

                <div className="version-comments-wrapper">
                    <Button variant="secondary" onClick={() => setShowComments(true)}>Changelog</Button>
                    {/* Badge de comentarios */}
                    {totalComments > 0 && (
                        <span className="version-comments-badge">
                            {totalComments}
                        </span>
                    )}
                </div>
            </div>

            {/* MODALES */}
            <ChangelogEntriesModal
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                version={version}
                onSave={handleSaveComments}
            />

            <ProgressModal
                isOpen={showProgress}
                onClose={() => setShowProgress(false)}
                version={version}
            />
        </div>
    );
}