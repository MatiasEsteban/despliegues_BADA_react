import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import VersionCard from './VersionCard';
import VersionRow from './VersionRow';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

export default function VersionList() {
    const { filteredVersions, selectVersion, getVersionEnProduccionId, addNewEmptyVersion, duplicateVersion, versions } = useDataStore();

    // Estado local de UI
    const [displayMode, setDisplayMode] = useState('grid'); // 'grid' | 'list'
    const [visibleCount, setVisibleCount] = useState(10); // Para "Cargar Más" en Grid
    const [currentPage, setCurrentPage] = useState(1); // Para paginación en Lista
    const itemsPerPage = 10;

    const produccionId = getVersionEnProduccionId();

    // Ordenar versiones (por número descendente, imitando renderer.js)
    const sortedVersions = useMemo(() => {
        return [...filteredVersions].sort((a, b) => {
            // Intento robusto de ordenar numéricamente strings como "1.2" o "10"
            const numA = parseFloat(a.numero) || 0;
            const numB = parseFloat(b.numero) || 0;
            return numB - numA;
        });
    }, [filteredVersions]);

    // --- LÓGICA DE GRID (Load More) ---
    const gridVersions = sortedVersions.slice(0, visibleCount);
    const handleLoadMore = () => setVisibleCount(prev => prev + 10);

    // --- LÓGICA DE LISTA (Paginación) ---
    const totalPages = Math.ceil(sortedVersions.length / itemsPerPage);
    const listVersions = sortedVersions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDuplicateLatest = () => {
        if (versions.length === 0) return;
        const latest = [...versions].sort((a, b) => (parseFloat(b.numero) || 0) - (parseFloat(a.numero) || 0))[0];
        if (latest) duplicateVersion(latest.id);
    };

    return (
        <div className="fade-in">
            {/* ACTIONS BAR */}
            <div className="cards-actions">
                <div className="view-toggle-group">
                    <button
                        className={`btn-view-toggle ${displayMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setDisplayMode('grid')}
                        title="Vista Cuadrícula"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    </button>
                    <button
                        className={`btn-view-toggle ${displayMode === 'list' ? 'active' : ''}`}
                        onClick={() => setDisplayMode('list')}
                        title="Vista Lista"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                </div>

                <Button variant="secondary" icon={Icons.Plus} onClick={addNewEmptyVersion}>
                    Nueva Versión Limpia
                </Button>
                <Button variant="purple" onClick={handleDuplicateLatest}>
                    Duplicar Última Versión
                </Button>
            </div>

            {/* CONTENIDO */}
            {sortedVersions.length === 0 ? (
                <div className="no-versions-message">No hay versiones disponibles que coincidan con los filtros.</div>
            ) : (
                <>
                    {displayMode === 'grid' ? (
                        <>
                            <div className="versions-grid">
                                {gridVersions.map(v => (
                                    <VersionCard
                                        key={v.id}
                                        version={v}
                                        isProduccion={v.id === produccionId}
                                        onClick={selectVersion}
                                    />
                                ))}
                            </div>
                            {visibleCount < sortedVersions.length && (
                                <div className="load-more-container">
                                    <Button variant="secondary" onClick={handleLoadMore} className="btn-load-more">
                                        <Icons.ChevronDown className="icon" />
                                        Cargar {sortedVersions.length - visibleCount} más
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div id="versions-list-container">
                            <table className="versions-list-table">
                                <thead>
                                    <tr>
                                        <th>Versión</th>
                                        <th>CDUs</th>
                                        <th>Fuente</th>
                                        <th>Creada</th>
                                        <th>Despliegue</th>
                                        <th>Info</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listVersions.map(v => (
                                        <VersionRow
                                            key={v.id}
                                            version={v}
                                            isProduccion={v.id === produccionId}
                                            onClick={selectVersion}
                                        />
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación Simple */}
                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>«</button>
                                    <span style={{ margin: '0 10px' }}>Página {currentPage} de {totalPages}</span>
                                    <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>»</button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}