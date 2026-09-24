import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import ChangelogCard from './ChangelogCard';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import FullSummaryModal from '../modals/FullSummaryModal';

export default function ChangelogView() {
    const {
        filteredVersions,
        getVersionEnProduccionId,
        addNewEmptyVersion,
        duplicateVersion,
        versions,
        filterText,
        setFilter,
    } = useDataStore();

    const [searchText, setSearchText] = useState(filterText || '');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showFullSummary, setShowFullSummary] = useState(false);

    const produccionId = getVersionEnProduccionId();

    // Ordenar descendente por número de versión
    const sortedVersions = useMemo(() => {
        return [...filteredVersions].sort((a, b) => {
            const numA = parseFloat(a.numero) || 0;
            const numB = parseFloat(b.numero) || 0;
            return numB - numA;
        });
    }, [filteredVersions]);

    // Filtrar por status (produccion / no produccion)
    const displayVersions = useMemo(() => {
        let result = sortedVersions;
        if (filterStatus === 'produccion') {
            result = result.filter(v => v.id === produccionId);
        } else if (filterStatus === 'archivada') {
            result = result.filter(v => v.id !== produccionId);
        }
        // Filtrar por categoría: versiones que tengan al menos 1 entrada en esa categoría
        if (filterCategory) {
            result = result.filter(v => {
                const items = v.comentarios?.[filterCategory];
                return Array.isArray(items) && items.some(e => {
                    const txt = typeof e === 'string' ? e : e?.texto;
                    return txt && txt.trim();
                });
            });
        }
        return result;
    }, [sortedVersions, filterStatus, filterCategory, produccionId]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchText(val);
        setFilter(val);
    };

    const handleDuplicateLatest = () => {
        if (versions.length === 0) return;
        const latest = [...versions].sort((a, b) => (parseFloat(b.numero) || 0) - (parseFloat(a.numero) || 0))[0];
        if (latest) duplicateVersion(latest.id);
    };

    return (
        <div className="changelog-view fade-in">
            {/* TOOLBAR */}
            <div className="changelog-toolbar">
                <div className="changelog-toolbar-left">
                    <div className="changelog-search-wrap">
                        <Icons.Search style={{ width: '15px', height: '15px', opacity: 0.5, flexShrink: 0 }} />
                        <input
                            className="changelog-search-input"
                            type="text"
                            placeholder="Buscar versión..."
                            value={searchText}
                            onChange={handleSearchChange}
                        />
                        {searchText && (
                            <button
                                className="changelog-search-clear"
                                onClick={() => { setSearchText(''); setFilter(''); }}
                                title="Limpiar"
                            >
                                <Icons.X style={{ width: '13px', height: '13px' }} />
                            </button>
                        )}
                    </div>

                    <select
                        className="changelog-filter-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="produccion">En Producción</option>
                        <option value="archivada">Archivadas</option>
                    </select>

                    <select
                        className="changelog-filter-select"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        <option value="mejoras">🛠️ Mejoras y Bugfix</option>
                        <option value="salidas">⚡ A Producción</option>
                        <option value="cambiosCaliente">🔥 Cambios en Caliente</option>
                        <option value="observaciones">📋 Observaciones</option>
                    </select>

                    <span className="changelog-count-badge">
                        {displayVersions.length} / {versions.length} versiones
                    </span>
                </div>

                <div className="changelog-toolbar-right">
                    <Button
                        variant="secondary"
                        onClick={() => setShowFullSummary(true)}
                        title="Ver y copiar resumen de todas las versiones visibles"
                    >
                        📋 Resumen Global
                    </Button>
                    <Button variant="secondary" icon={Icons.Plus} onClick={addNewEmptyVersion}>
                        Nueva Versión
                    </Button>
                    <Button variant="purple" onClick={handleDuplicateLatest}>
                        Duplicar Última
                    </Button>
                </div>
            </div>

            {/* TIMELINE */}
            {displayVersions.length === 0 ? (
                <div className="changelog-empty">
                    <div className="changelog-empty-icon">📋</div>
                    <div className="changelog-empty-text">No hay versiones que coincidan con los filtros.</div>
                </div>
            ) : (
                <div className="changelog-timeline">
                    <div className="changelog-timeline-line" />
                    <div className="changelog-timeline-cards">
                        {displayVersions.map(v => (
                            <ChangelogCard
                                key={v.id}
                                version={v}
                                isProduccion={v.id === produccionId}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL — RESUMEN GLOBAL */}
            <FullSummaryModal
                isOpen={showFullSummary}
                onClose={() => setShowFullSummary(false)}
                versions={displayVersions}
                produccionId={produccionId}
            />
        </div>
    );
}
