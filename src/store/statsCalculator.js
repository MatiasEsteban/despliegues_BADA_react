/**
 * src/store/statsCalculator.js
 * * Documentación:
 * Contiene la lógica pura para calcular métricas y estadísticas clave 
 * a partir de los datos de versiones. Esta lógica es separada para 
 * mantener el DataStore conciso y las funciones de cálculo puras.
 */

/**
 * Calcula estadísticas clave a partir de la lista de versiones.
 * @param {Array<Object>} versions - La lista completa de versiones.
 * @returns {Object} Un objeto con las estadísticas calculadas.
 */
export function generateStats(versions) {
    const stats = {
        totalVersions: versions.length,
        statusCounts: {}, // Conteo por estado
        totalCDUs: 0,
        // Puedes agregar más estadísticas de tu StatsCalculator original aquí
    };

    versions.forEach(version => {
        // Conteo por estado
        const status = version.estado || 'Desconocido';
        stats.statusCounts[status] = (stats.statusCounts[status] || 0) + 1;

        // Conteo de CDUs (asumiendo que hay un campo en la versión)
        if (version.cdusCount) {
            stats.totalCDUs += version.cdusCount;
        }
    });

    return stats;
}

/**
 * Calcula estadísticas detalladas para una versión específica.
 * @param {Object} version - El objeto de la versión.
 * @returns {Object} Estadísticas detalladas (progreso, estados, dificultad, versiones bada).
 */
export function calculateVersionStats(version) {
    if (!version || !version.cdus) return null;

    const stats = {
        totalProgress: 0,
        validCdus: 0,
        statusCounts: {
            'En Desarrollo': 0,
            'Pendiente de Certificacion': 0,
            'Certificado OK': 0,
            'En Produccion': 0
        },
        cdusByStatus: {
            'En Desarrollo': [],
            'Pendiente de Certificacion': [],
            'Certificado OK': [],
            'En Produccion': []
        },
        difficultyCounts: {
            'Baja': 0,
            'Media': 0,
            'Alta': 0
        },
        badaVersionCounts: {
            'V1': 0,
            'V2': 0
        }
    };

    version.cdus.forEach(cdu => {
        // 1. Progreso Global
        if (cdu.pasos && cdu.pasos.length > 0) {
            const completed = cdu.pasos.filter(p => p.completado).length;
            const percent = (completed / cdu.pasos.length) * 100;
            stats.totalProgress += percent;
            stats.validCdus++;

            // 2. Dificultad y Versión Bada (basado en pasos)
            cdu.pasos.forEach(paso => {
                // Dificultad
                const diff = paso.dificultad || 'Baja';
                if (stats.difficultyCounts[diff] !== undefined) {
                    stats.difficultyCounts[diff]++;
                } else {
                    // Fallback para valores no esperados, o normalizar
                    stats.difficultyCounts['Baja']++;
                }

                // Versión Bada
                const ver = paso.version || 'V1';
                if (stats.badaVersionCounts[ver] !== undefined) {
                    stats.badaVersionCounts[ver]++;
                } else {
                    stats.badaVersionCounts['V1']++;
                }
            });
        }

        // 3. Estado del CDU
        const status = cdu.estado || 'En Desarrollo';
        if (stats.statusCounts[status] !== undefined) {
            stats.statusCounts[status]++;
            if (stats.cdusByStatus[status]) {
                stats.cdusByStatus[status].push(cdu.nombreCDU);
            }
        } else {
            stats.statusCounts['En Desarrollo']++;
            if (stats.cdusByStatus['En Desarrollo']) {
                stats.cdusByStatus['En Desarrollo'].push(cdu.nombreCDU);
            }
        }
    });

    stats.finalProgress = stats.validCdus > 0 ? Math.round(stats.totalProgress / stats.validCdus) : 0;

    return stats;
}