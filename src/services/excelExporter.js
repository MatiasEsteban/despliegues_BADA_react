import * as XLSX from 'xlsx';

// Normaliza una entrada de comentario al texto legible
const entryText = (entry) => {
    if (!entry) return '';
    if (typeof entry === 'string') return entry;
    const cdu = entry.cdu?.trim() ? `[CDU: ${entry.cdu.trim()}] ` : (entry.cduNombre?.trim() ? `[CDU: ${entry.cduNombre.trim()}] ` : '');
    const texto = entry.texto || '';
    const autor = entry.autor ? ` [${entry.autor}]` : '';
    return cdu + texto + autor;
};

const entriesToString = (arr) =>
    (arr || []).map(entryText).filter(Boolean).join(' || ');

export class ExcelExporter {
    static exportar(versiones, versionEnProduccionId) {
        try {
            const versionesArray = Array.isArray(versiones) ? versiones : [];

            // === HOJA 1: CHANGELOG (resumen por versión) ===
            const changelogRows = versionesArray
                .sort((a, b) => (parseFloat(b.numero) || 0) - (parseFloat(a.numero) || 0))
                .map(version => {
                    const esProduccion = String(version.id) === String(versionEnProduccionId) ? 'SÍ' : 'NO';
                    const c = version.comentarios || {};
                    return {
                        'Versión': `V${version.numero}`,
                        'Título': version.titulo || '',
                        'En Producción': esProduccion,
                        'Fecha Despliegue': version.fechaDespliegue || '',
                        'Hora Despliegue': version.horaDespliegue || '',
                        'Fecha Creación': version.fechaCreacion || '',
                        'Fuente': version.fuente || '',
                        'Total CDUs': (version.cdus || []).length,
                        'CDUs en Prod': (version.cdus || []).filter(c => c.estado === 'En Produccion').length,
                        'CDUs Certif.': (version.cdus || []).filter(c => c.estado === 'Certificado OK').length,
                        'CDUs Pendiente': (version.cdus || []).filter(c => c.estado === 'Pendiente de Certificacion').length,
                        'CDUs Desarrollo': (version.cdus || []).filter(c => c.estado === 'En Desarrollo').length,
                        'Mejoras/Bugfixes': entriesToString(c.mejoras),
                        'Salidas a Producción': entriesToString(c.salidas),
                        'Cambios en Caliente': entriesToString(c.cambiosCaliente),
                        'Observaciones': entriesToString(c.observaciones),
                    };
                });

            // === HOJA 2: CDUs DETALLE ===
            const detailRows = [];
            versionesArray.forEach(version => {
                const esProduccion = String(version.id) === String(versionEnProduccionId) ? 'SÍ' : 'NO';
                const cdus = version.cdus || [];
                if (cdus.length === 0) {
                    detailRows.push({
                        'Versión': `V${version.numero}`,
                        'En Producción': esProduccion,
                        'Fecha Despliegue': version.fechaDespliegue || '',
                        'Nombre CDU': '(Sin CDUs)',
                    });
                } else {
                    cdus.forEach(cdu => {
                        const respStr = (cdu.responsables || []).map(r => `${r.nombre} (${r.rol})`).join(' || ');
                        const obsStr = (cdu.observaciones || []).map(o => typeof o === 'string' ? o : o.texto).join(' || ');
                        detailRows.push({
                            'Versión': `V${version.numero}`,
                            'En Producción': esProduccion,
                            'Fecha Despliegue': version.fechaDespliegue || '',
                            'Hora Despliegue': version.horaDespliegue || '',
                            'Fecha Creación': version.fechaCreacion || '',
                            'Fuente': version.fuente || '',
                            'UUID CDU': cdu.uuid || '',
                            'Nombre CDU': cdu.nombreCDU || '',
                            'Descripción CDU': cdu.descripcionCDU || '',
                            'Estado': cdu.estado || '',
                            'Versión BADA': cdu.versionBADA || '',
                            'Versión Miró': cdu.versionMiro || '',
                            'Responsables': respStr,
                            'Observaciones CDU': obsStr,
                        });
                    });
                }
            });

            const wb = XLSX.utils.book_new();

            // Hoja Changelog
            const wsChangelog = XLSX.utils.json_to_sheet(changelogRows);
            wsChangelog['!cols'] = [
                { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 },
                { wch: 15 }, { wch: 12 },
                { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
                { wch: 40 }, { wch: 35 }, { wch: 35 }, { wch: 35 },
            ];
            XLSX.utils.book_append_sheet(wb, wsChangelog, 'Changelog');

            // Hoja CDUs Detalle
            const wsDetail = XLSX.utils.json_to_sheet(detailRows);
            wsDetail['!cols'] = [
                { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 12 },
                { wch: 36 }, { wch: 28 }, { wch: 40 }, { wch: 22 },
                { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 40 },
            ];
            XLSX.utils.book_append_sheet(wb, wsDetail, 'CDUs Detalle');

            const fecha = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `BADA_Changelog_${fecha}.xlsx`);
            return true;
        } catch (error) {
            console.error("Error exportando Excel:", error);
            throw error;
        }
    }
}