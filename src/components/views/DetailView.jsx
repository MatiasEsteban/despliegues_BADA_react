import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDataStore } from '../../store/dataStore';
import { useModal } from '../../context/ModalContext';
import DetailHeader from './detail/DetailHeader';
import CduRow from './detail/CduRow';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';

export default function DetailView() {
    const { selectedVersionId, versions, updateCurrentVersion } = useDataStore();
    const { confirm } = useModal();

    // CORRECCIÓN CRÍTICA: Obtener la versión actualizada directamente del store
    const version = versions.find(v => v.id === selectedVersionId);
    const activeCDUs = version ? (version.cdus || []) : [];

    // --- Lógica de Actualización de CDUs ---
    const handleUpdateCdu = (updatedCdu) => {
        // Mapeamos sobre los CDUs actuales para reemplazar el modificado
        const newCdus = activeCDUs.map(c => c.id === updatedCdu.id ? updatedCdu : c);
        // Guardamos la versión completa actualizada
        updateCurrentVersion({ ...version, cdus: newCdus });
    };

    const handleDeleteCdu = async (cduId) => {
        if (await confirm("¿Eliminar este CDU?", "Confirmar", "error")) {
            const newCdus = activeCDUs.filter(c => c.id !== cduId);
            updateCurrentVersion({ ...version, cdus: newCdus });
        }
    };

    const handleAddCdu = () => {
        const newCdu = {
            id: Date.now(),
            uuid: uuidv4(),
            nombreCDU: '',
            descripcionCDU: '',
            estado: 'En Desarrollo',
            versionMiro: '',
            responsables: [],
            observaciones: [],
            pasos: [],
            historial: []
        };

        const newCdus = [...activeCDUs, newCdu];
        updateCurrentVersion({ ...version, cdus: newCdus });

        setTimeout(() => {
            const table = document.querySelector('.table-wrapper');
            if (table) table.scrollTop = table.scrollHeight;
        }, 100);
    };

    if (!version) return <div>Cargando versión...</div>;

    return (
        <div className="fade-in">
            <DetailHeader />

            {/* TABLA */}
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="tabla-despliegues">
                        <thead>
                            <tr>
                                <th>CDU</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Métrica BADA</th>
                                <th>Versión Miró</th>
                                <th>Pasos</th>
                                <th>Responsables</th>
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-body">
                            {activeCDUs.length === 0 ? (
                                <tr>
                                    <td colspan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        Sin CDUs definidos en esta versión.
                                    </td>
                                </tr>
                            ) : (
                                activeCDUs.map(cdu => (
                                    <CduRow
                                        key={cdu.id || cdu.uuid}
                                        cdu={cdu}
                                        onUpdate={handleUpdateCdu}
                                        onDelete={() => handleDeleteCdu(cdu.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <Button variant="primary" icon={Icons.Plus} onClick={handleAddCdu}>
                        Nuevo CDU
                    </Button>
                </div>
            </div>
        </div>
    );
}