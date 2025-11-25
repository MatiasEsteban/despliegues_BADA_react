import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import { useDataStore } from '../../store/dataStore';
import { useModal } from '../../context/ModalContext';
import DetailHeader from './detail/DetailHeader';
import CduRow from './detail/CduRow';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export default function DetailView() {
    const { selectedVersionId, versions, updateCurrentVersion } = useDataStore();
    const { confirm } = useModal();

    // Estados para filtros
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // NUEVO: Estado para colapsar/expandir el buscador
    const [showFilters, setShowFilters] = useState(false);

    // Obtener la versión actualizada directamente del store
    const version = versions.find(v => v.id === selectedVersionId);
    const activeCDUs = version ? (version.cdus || []) : [];

    // --- Lógica de Filtrado ---
    const filteredCDUs = useMemo(() => {
        return activeCDUs.filter(cdu => {
            if (searchText) {
                const text = searchText.toLowerCase();
                const matchName = (cdu.nombreCDU || '').toLowerCase().includes(text);
                const matchDesc = (cdu.descripcionCDU || '').toLowerCase().includes(text);
                if (!matchName && !matchDesc) return false;
            }
            if (filterStatus && cdu.estado !== filterStatus) {
                return false;
            }
            return true;
        });
    }, [activeCDUs, searchText, filterStatus]);

    // --- Lógica de CRUD ---
    const handleUpdateCdu = (updatedCdu) => {
        const newCdus = activeCDUs.map(c => c.id === updatedCdu.id ? updatedCdu : c);
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

            {/* --- SECCIÓN DE BÚSQUEDA Y FILTROS (DESPLEGABLE) --- */}
            <div className="detail-filters-section">
                {/* Botón Toggle */}
                <div className="detail-filters-toggle">
                    <button
                        className={clsx("btn-detail-search-toggle", showFilters && "active")}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Icons.Search className="icon" />
                        Búsqueda avanzada
                        <Icons.ChevronDown className="icon icon-chevron" />
                    </button>
                </div>

                {/* Contenido Colapsable */}
                <div className={clsx("detail-filters-content", !showFilters && "detail-filters-collapsed")}>
                    <div className="detail-filters-grid">
                        <div className="filter-group">
                            <Input
                                label="Buscar en CDUs"
                                placeholder="Nombre, descripción..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                icon={Icons.Search}
                            />
                        </div>
                        <div className="filter-group">
                            <Select
                                label="Estado"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="En Desarrollo">En Desarrollo</option>
                                <option value="Pendiente de Certificacion">Pendiente de Certificación</option>
                                <option value="Certificado OK">Certificado OK</option>
                                <option value="En Produccion">En Producción</option>
                            </Select>
                        </div>
                    </div>

                    <div className="detail-filters-actions">
                        <Button variant="secondary" className="btn-clear-filters" onClick={() => { setSearchText(''); setFilterStatus(''); }}>
                            Limpiar
                        </Button>
                        <div className="detail-filters-stats">
                            Mostrando: <strong>{filteredCDUs.length}</strong> de <strong>{activeCDUs.length}</strong> CDUs
                        </div>
                    </div>
                </div>
            </div>

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
                            {filteredCDUs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        {activeCDUs.length === 0
                                            ? "Esta versión no tiene CDUs asociados."
                                            : "Ningún CDU coincide con los filtros aplicados."}
                                    </td>
                                </tr>
                            ) : (
                                filteredCDUs.map(cdu => (
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