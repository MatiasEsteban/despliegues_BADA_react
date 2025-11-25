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