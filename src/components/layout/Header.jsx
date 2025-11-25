import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../store/dataStore';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { ExcelImporter } from '../../services/excelImporter';
import { ExcelExporter } from '../../services/excelExporter';

export default function Header({ onLogout }) {
    const { currentUser } = useAuth();
    const {
        viewMode,
        deselectVersion,
        versions,
        filteredVersions,
        setFilter,
        isSaving,
        importData, // Importar la nueva acción
        getVersionEnProduccionId
    } = useDataStore();

    const { showToast } = useToast();
    const { confirm } = useModal();
    const fileInputRef = useRef(null);

    const [showFilters, setShowFilters] = useState(false);
    const [localFilter, setLocalFilter] = useState('');
    const [theme, setTheme] = useState('light');

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

    // --- LÓGICA DE EXCEL ---
    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 1. Procesar archivo
            const { versiones: importedVersions, versionEnProduccionId } = await ExcelImporter.importExcel(file);

            // 2. Confirmar reemplazo
            if (await confirm(`Se encontraron ${importedVersions.length} versiones.\n¿Desea reemplazar TODOS los datos actuales?`, "Importar Excel", "warning")) {

                // 3. Actualizar Store y Firebase
                await importData(importedVersions, versionEnProduccionId);
                showToast("Datos importados exitosamente", "success");
            }
        } catch (error) {
            console.error(error);
            showToast(error.message || "Error al importar el archivo", "error");
        } finally {
            e.target.value = ''; // Limpiar input para permitir re-selección
        }
    };

    const handleExportClick = async () => {
        if (versions.length === 0) {
            showToast("No hay datos para exportar", "warning");
            return;
        }
        try {
            const prodId = getVersionEnProduccionId();
            await ExcelExporter.exportar(versions, prodId);
            showToast("Excel generado correctamente", "success");
        } catch (error) {
            showToast("Error al generar Excel", "error");
        }
    };
    // -----------------------

    const title = viewMode === 'list' ? 'Control de Despliegues' : 'Detalle de Versión';

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
                    <div className="header-info">
                        <svg className="icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <path d="M50,10 C30,10 20,30 20,50 C20,70 30,90 50,90 C70,90 80,70 80,50 C80,30 70,10 50,10 Z M50,15 C65,15 75,35 75,50 C75,65 65,85 50,85 C35,85 25,65 25,50 C25,35 35,15 50,15 Z M50,20 C40,20 30,40 30,50 C30,60 40,80 50,80 C60,80 70,60 70,50 C70,40 60,20 50,20 Z M50,25 C55,25 65,45 65,50 C65,55 55,75 50,75 C45,75 35,55 35,50 C35,45 45,25 50,25 Z M50,30 C45,30 40,40 40,50 C40,60 45,70 50,70 C55,70 60,60 60,50 C60,40 55,30 50,30 Z M50,38 C53,38 57,47 57,50 C57,53 53,62 50,62 C47,62 43,53 43,50 C43,47 47,38 50,38 Z" fill="url(#swirlGradient)" filter="url(#glow)" transform="rotate(-20 50 50)" />
                        </svg>
                        <div>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {title}
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
                            <p>Total Versiones: {versions.length} | Usuario: {currentUser?.email}</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="theme-toggle" title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`} onClick={toggleTheme}>
                            {theme === 'dark' ? <Icons.Sun className="icon" /> : <Icons.Moon className="icon" />}
                        </button>

                        <Button variant="info" icon={Icons.Upload} onClick={handleImportClick}>
                            Cargar Excel
                        </Button>

                        <Button variant="success" icon={Icons.Download} onClick={handleExportClick}>
                            Descargar Excel
                        </Button>

                        {viewMode === 'detail' ? (
                            <Button variant="secondary" onClick={deselectVersion}>
                                Volver a Lista
                            </Button>
                        ) : (
                            <Button variant="danger" onClick={onLogout}>
                                Cerrar Sesión
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {viewMode === 'list' && (
                <>
                    <div className="search-toggle-container">
                        <button
                            className={clsx("btn btn-search-toggle", showFilters && "active")}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Icons.Search className="icon" />
                            Búsqueda Avanzada
                            <Icons.ChevronDown className="icon icon-chevron" />
                        </button>
                    </div>

                    <section className={clsx("filters-section", !showFilters && "filters-collapsed")}>
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
        </>
    );
}