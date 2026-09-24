// Helper para formatear fechas
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const [y, m, d] = dateStr.split('-');
        if (!y || !m || !d) return dateStr;
        return `${d}/${m}/${y}`;
    } catch {
        return dateStr;
    }
};

const CATEGORIAS = [
    { key: 'mejoras', label: 'MEJORAS Y BUGFIX' },
    { key: 'salidas', label: 'A PRODUCCIÓN' },
    { key: 'cambiosCaliente', label: 'CAMBIOS EN CALIENTE' },
    { key: 'observaciones', label: 'OBSERVACIONES' },
];

export class TextExporter {
    static exportar(versiones, versionEnProduccionId) {
        try {
            const versionesArray = Array.isArray(versiones) ? versiones : [];
            const sorted = [...versionesArray].sort(
                (a, b) => (parseFloat(b.numero) || 0) - (parseFloat(a.numero) || 0)
            );

            const now = new Date();
            const fechaStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const horaStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const prodVersion = sorted.find(v => String(v.id) === String(versionEnProduccionId));

            const lines = [];
            const sepDouble = '='.repeat(80);
            const sepSingle = '─'.repeat(80);

            lines.push(sepDouble);
            lines.push('                    BADA — REPORTE GENERAL DE DESPLIEGUES');
            lines.push(sepDouble);
            lines.push(`Fecha de exportación:   ${fechaStr} ${horaStr}hs`);
            lines.push(`Total de versiones:     ${sorted.length}`);
            lines.push(`Versión en producción:  ${prodVersion ? `V${prodVersion.numero}${prodVersion.titulo ? ' — ' + prodVersion.titulo : ''}` : 'Ninguna'}`);
            lines.push(sepDouble);
            lines.push('');

            sorted.forEach(version => {
                const isProd = String(version.id) === String(versionEnProduccionId);
                const cdus = Array.isArray(version.cdus) ? version.cdus : [];
                const c = version.comentarios || {};

                lines.push(sepSingle);
                lines.push(`VERSIÓN ${version.numero}${version.titulo ? ' — ' + version.titulo : ''} ${isProd ? '★★★ [EN PRODUCCIÓN] ★★★' : ''}`);
                lines.push(sepSingle);
                lines.push(`Fecha Creación:    ${formatDate(version.fechaCreacion)}${version.horaCreacion ? ' ' + version.horaCreacion + 'hs' : ''}`);
                lines.push(`Fecha Despliegue:  ${formatDate(version.fechaDespliegue)}${version.horaDespliegue ? ' ' + version.horaDespliegue + 'hs' : ''}`);
                lines.push(`Fuente:            ${version.fuente || '—'}`);

                if (cdus.length > 0) {
                    const stats = {
                        prod: cdus.filter(item => item.estado === 'En Produccion').length,
                        cert: cdus.filter(item => item.estado === 'Certificado OK').length,
                        pend: cdus.filter(item => item.estado === 'Pendiente de Certificacion').length,
                        des: cdus.filter(item => item.estado === 'En Desarrollo').length,
                    };
                    lines.push(`CDUs:              Total: ${cdus.length} (Prod: ${stats.prod}, Certif: ${stats.cert}, Pend: ${stats.pend}, Des: ${stats.des})`);
                }
                lines.push('');

                // Entradas por categoría
                CATEGORIAS.forEach(({ key, label }) => {
                    const items = (c[key] || []).filter(e => {
                        const txt = typeof e === 'string' ? e : e?.texto;
                        return txt && txt.trim();
                    });

                    if (items.length > 0) {
                        lines.push(`[${label}]`);
                        items.forEach(item => {
                            const cduStr = item.cdu?.trim()
                                ? `[CDU: ${item.cdu.trim()}] `
                                : (item.cduNombre?.trim() ? `[CDU: ${item.cduNombre.trim()}] ` : '');
                            const texto = typeof item === 'string' ? item : item.texto;
                            const autorStr = item.autor?.trim() ? ` [${item.autor.trim()}]` : '';
                            lines.push(`  • ${cduStr}${texto}${autorStr}`);
                        });
                        lines.push('');
                    }
                });

                // Cambios por CDU específicos si existieran
                const cambiosCDU = (c.cambiosCDU || []).filter(e => e.texto?.trim());
                if (cambiosCDU.length > 0) {
                    lines.push('[CAMBIOS POR CDU]');
                    cambiosCDU.forEach(item => {
                        const cduName = item.cduNombre?.trim() || item.cdu?.trim() || '';
                        const cduPrefix = cduName ? `[${cduName}] ` : '';
                        lines.push(`  • ${cduPrefix}${item.texto}${item.autor?.trim() ? ` [${item.autor}]` : ''}`);
                    });
                    lines.push('');
                }

                // Detalle de CDUs de la versión si existen
                if (cdus.length > 0) {
                    lines.push('[LISTADO DE CDUS]');
                    cdus.forEach((cdu, idx) => {
                        lines.push(`  ${idx + 1}. [${cdu.estado || 'Sin estado'}] ${cdu.nombreCDU || 'Sin nombre'}`);
                        if (cdu.descripcionCDU?.trim()) {
                            lines.push(`     Descripción: ${cdu.descripcionCDU.trim()}`);
                        }
                        if (Array.isArray(cdu.responsables) && cdu.responsables.length > 0) {
                            const resp = cdu.responsables.map(r => `${r.nombre} (${r.rol})`).join(', ');
                            lines.push(`     Responsables: ${resp}`);
                        }
                        if (Array.isArray(cdu.observaciones) && cdu.observaciones.length > 0) {
                            const obs = cdu.observaciones
                                .map(o => typeof o === 'string' ? o : o.texto)
                                .filter(Boolean)
                                .join(' | ');
                            if (obs) lines.push(`     Observaciones: ${obs}`);
                        }
                    });
                    lines.push('');
                }

                lines.push('');
            });

            const content = lines.join('\n');
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateISO = now.toISOString().split('T')[0];
            a.href = url;
            a.download = `BADA_Changelog_${dateISO}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error("Error exportando Texto:", error);
            throw error;
        }
    }
}
