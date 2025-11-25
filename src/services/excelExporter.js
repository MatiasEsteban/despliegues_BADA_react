import * as XLSX from 'xlsx';

export class ExcelExporter {
    static exportar(versiones, versionEnProduccionId) {
        try {
            const datosExcel = [];
            const versionesArray = Array.isArray(versiones) ? versiones : [];

            versionesArray.forEach(version => {
                // Convertimos a string para comparación segura
                const esProduccion = String(version.id) === String(versionEnProduccionId) ? 'SÍ' : 'NO';
                const comentarios = version.comentarios || {};

                const versionData = {
                    'Fecha Creación': version.fechaCreacion,
                    'Hora Creación': version.horaCreacion,
                    'Fuente': version.fuente,
                    'Fecha Despliegue': version.fechaDespliegue,
                    'Hora': version.horaDespliegue,
                    'Versión': version.numero,
                    'En Producción': esProduccion,
                    'Mejoras/Bugfixes': (comentarios.mejoras || []).join(' || '),
                    'Salidas a Producción': (comentarios.salidas || []).join(' || '),
                    'Cambios en Caliente': (comentarios.cambiosCaliente || []).join(' || '),
                    'Observaciones Versión': (comentarios.observaciones || []).join(' || '),
                };

                const cdus = version.cdus || [];

                if (cdus.length === 0) {
                    datosExcel.push({ ...versionData, 'Nombre CDU': '(Sin CDUs)' });
                } else {
                    cdus.forEach(cdu => {
                        const respStr = (cdu.responsables || []).map(r => `${r.nombre} (${r.rol})`).join(' || ');
                        const obsStr = (cdu.observaciones || []).map(o => typeof o === 'string' ? o : o.texto).join(' || ');

                        datosExcel.push({
                            ...versionData,
                            'UUID': cdu.uuid,
                            'Nombre CDU': cdu.nombreCDU,
                            'Descripción CDU': cdu.descripcionCDU,
                            'Estado': cdu.estado,
                            'Versión BADA': cdu.versionBADA,
                            'Version de Miró': cdu.versionMiro,
                            'Responsables': respStr,
                            'Observaciones CDU': obsStr,
                        });
                    });
                }
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datosExcel);

            // Ajuste de anchos de columna básicos
            ws['!cols'] = [
                { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, // Fechas/Horas
                { wch: 10 }, { wch: 10 }, // Versión/Prod
                { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, // Comentarios
                { wch: 25 }, { wch: 40 }, // CDU Nombre/Desc
                { wch: 20 }, // Estado
                { wch: 10 }, { wch: 10 }, // Versiones BADA/Miro
                { wch: 30 }, { wch: 40 } // Resp/Obs
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Detalle Despliegues');

            const fecha = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Despliegues_BADA_${fecha}.xlsx`);
            return true;
        } catch (error) {
            console.error("Error exportando Excel:", error);
            throw error;
        }
    }
}