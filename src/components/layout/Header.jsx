import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useDataStore } from '../../store/dataStore';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { ExcelImporter } from '../../services/excelImporter';
import { ExcelExporter } from '../../services/excelExporter';
import ExportModal from '../modals/ExportModal';
import WorkspaceSwitcher from './WorkspaceSwitcher';

export default function Header({ workspaceType = 'full' }) {
    const {
        viewMode,
        deselectVersion,
        setViewMode,
        versions,
        filteredVersions,
        setFilter,
        isSaving,
        importData,
        getVersionEnProduccionId,
    } = useDataStore();

    const { showToast } = useToast();
    const { confirm } = useModal();
    const fileInputRef = useRef(null);

    const [showFilters, setShowFilters] = useState(false);
    const [localFilter, setLocalFilter] = useState('');
    const [theme, setTheme] = useState('light');
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setLocalFilter(val);
        setFilter(val);
    };

    // --- LÓGICA DE EXCEL / EXPORTACIÓN ---
    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { versiones: importedVersions, versionEnProduccionId } = await ExcelImporter.importExcel(file);
            if (await confirm(`Se encontraron ${importedVersions.length} versiones.\n¿Desea reemplazar TODOS los datos actuales?`, 'Importar Excel', 'warning')) {
                await importData(importedVersions, versionEnProduccionId);
                showToast('Datos importados exitosamente', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Error al importar el archivo', 'error');
        } finally {
            e.target.value = '';
        }
    };

    const handleExportClick = () => {
        if (versions.length === 0) {
            showToast('No hay datos para exportar', 'warning');
            return;
        }
        setShowExportModal(true);
    };
    // -----------------------

    return (
        <>
            {/* Input File Oculto */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleFileChange}
            />

            <header className="header">
                <div className="header-content">
                    {/* IZQUIERDA: Workspace Switcher + título */}
                    <div className="header-info">
                        <WorkspaceSwitcher />
                        <div className="header-title-block">
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                Changelog
                                {isSaving ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <Icons.Sync className="icon-small toast-spinner" style={{ width: '12px', height: '12px' }} />
                                        Guardando...
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                                        <Icons.CloudCheck className="icon-small" style={{ width: '16px', height: '16px' }} />
                                        Sincronizado
                                    </span>
                                )}
                            </h1>
                            <p>Total versiones: {versions.length}</p>
                        </div>
                    </div>

                    {/* DERECHA: acciones */}
                    <div className="header-actions">
                        <div className="header-view-toggle">
                            {viewMode !== 'detail' && (
                                <>
                                    <button
                                        className={`btn-view-toggle ${viewMode === 'changelog' ? 'active' : ''}`}
                                        onClick={() => setViewMode('changelog')}
                                        title="Vista Changelog"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
                                            <line x1="3" y1="6" x2="21" y2="6"/>
                                            <line x1="3" y1="12" x2="15" y2="12"/>
                                            <line x1="3" y1="18" x2="18" y2="18"/>
                                            <circle cx="21" cy="12" r="1" fill="currentColor"/>
                                            <circle cx="21" cy="18" r="1" fill="currentColor"/>
                                        </svg>
                                    </button>
                                    {/* Vista de lista/grid solo para workspaces 'full' */}
                                    {workspaceType === 'full' && (
                                        <button
                                            className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                                            onClick={() => setViewMode('list')}
                                            title="Vista Lista/Grid"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
                                                <rect x="3" y="3" width="7" height="7"/>
                                                <rect x="14" y="3" width="7" height="7"/>
                                                <rect x="14" y="14" width="7" height="7"/>
                                                <rect x="3" y="14" width="7" height="7"/>
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <button className="theme-toggle" title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`} onClick={toggleTheme}>
                            {theme === 'dark' ? <Icons.Sun className="icon" /> : <Icons.Moon className="icon" />}
                        </button>

                        <Button variant="info" icon={Icons.Upload} onClick={handleImportClick}>
                            Cargar Excel
                        </Button>

                        <Button variant="success" icon={Icons.Download} onClick={handleExportClick}>
                            Exportar
                        </Button>

                        {viewMode === 'detail' && (
                            <Button variant="secondary" onClick={deselectVersion}>
                                Volver
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Barra de búsqueda avanzada — solo para vista lista en workspaces full */}
            {viewMode === 'list' && workspaceType === 'full' && (
                <>
                    <div className="search-toggle-container">
                        <button
                            className={clsx('btn btn-search-toggle', showFilters && 'active')}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Icons.Search className="icon" />
                            Búsqueda Avanzada
                            <Icons.ChevronDown className="icon icon-chevron" />
                        </button>
                    </div>

                    <section className={clsx('filters-section', !showFilters && 'filters-collapsed')}>
                        <div className="filters-header">
                            <div className="filters-title">
                                <Icons.Search className="icon" />
                                Filtros y Búsqueda
                            </div>
                            <button className="btn btn-clear-filters" onClick={() => { setLocalFilter(''); setFilter(''); }}>
                                Limpiar Filtros
                            </button>
                        </div>
                        <div className="filters-grid">
                            <div className="filter-group">
                                <Input
                                    label="Búsqueda General"
                                    placeholder="Buscar en versión, CDU..."
                                    value={localFilter}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="filter-group">
                                <Select label="Estado">
                                    <option value="">Todos los estados</option>
                                    <option value="En Desarrollo">En Desarrollo</option>
                                    <option value="Pendiente de Certificacion">Pendiente de Certificacion</option>
                                    <option value="Certificado OK">Certificado OK</option>
                                    <option value="En Produccion">En Produccion</option>
                                </Select>
                            </div>
                        </div>
                        <div className="filters-stats">
                            <div className="filter-stat">
                                <span>Mostrando: <span className="filter-stat-value">{filteredVersions.length}</span> de <span className="filter-stat-value">{versions.length}</span> Versiones</span>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                versions={versions}
                versionEnProduccionId={getVersionEnProduccionId()}
            />
        </>
    );
}