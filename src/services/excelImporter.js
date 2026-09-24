import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export class ExcelImporter {
    static async importExcel(file) {
        try {
            const workbook = await this.readWorkbook(file);
            const processedData = this.processWorkbook(workbook);
            return processedData;
        } catch (error) {
            console.error('Error en ExcelImporter:', error);
            throw error;
        }
    }

    /**
     * Lee el workbook completo del archivo Excel.
     */
    static readWorkbook(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    resolve(workbook);
                } catch (error) { reject(new Error('No se pudo leer el archivo Excel. Verifique el formato.')); }
            };
            reader.onerror = () => reject(new Error('Error de lectura de archivo.'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Procesa el workbook completo: lee Changelog (comentarios/meta) y CDUs Detalle (CDUs).
     * Combina ambos datasets para generar el estado completo.
     */
    static processWorkbook(workbook) {
        const sheetNames = Object.keys(workbook.Sheets);

        // --- 1) Leer hoja de Changelog (comentarios y metadata de versión) ---
        const changelogSheet = this.findSheet(workbook, ['Changelog']);
        const changelogRows  = changelogSheet
            ? XLSX.utils.sheet_to_json(changelogSheet, { defval: '' })
            : [];

        // --- 2) Leer hoja de CDUs Detalle ---
        const detalleSheet = this.findSheet(workbook, ['Detalle Despliegues', 'CDUs Detalle']);
        const detalleRows  = detalleSheet
            ? XLSX.utils.sheet_to_json(detalleSheet, { defval: '' })
            : [];

        // Si no hay ninguna de las dos hojas, error
        if (changelogRows.length === 0 && detalleRows.length === 0) {
            const available = sheetNames.join(', ');
            throw new Error(`No se encontraron hojas válidas. Hojas disponibles: ${available}`);
        }

        // --- 3) Construir versiones desde Changelog (comentarios + meta) ---
        const versionesMap = new Map();
        let versionEnProduccionId = null;
        let nextTempVersionId = Date.now();

        for (const row of changelogRows) {
            const versionNumero = this.cleanVersionNumber(row['Versión'] || '');
            if (!versionNumero) continue;

            const tempId = nextTempVersionId++;
            const fechaCreacionParsed = this.parseExcelDate(row['Fecha Creación']);
            const fechaDespliegueParsed = this.parseExcelDate(row['Fecha Despliegue']);
            const today = new Date().toISOString().split('T')[0];

            const version = {
                id: tempId,
                numero: versionNumero,
                titulo: String(row['Título'] || row['Titulo'] || '').trim(),
                fechaCreacion: fechaCreacionParsed || '',
                horaCreacion: this.parseExcelTime(row['Hora Creación']) || '',
                fuente: String(row['Fuente'] || 'Importada').trim(),
                fechaDespliegue: fechaDespliegueParsed || '',
                horaDespliegue: this.parseExcelTime(row['Hora Despliegue'] || row['Hora']) || '',
                comentarios: {
                    mejoras:         this.parseExcelStringToArray(row['Mejoras/Bugfixes']),
                    salidas:         this.parseExcelStringToArray(row['Salidas a Producción']),
                    cambiosCaliente: this.parseExcelStringToArray(row['Cambios en Caliente']),
                    observaciones:   this.parseExcelStringToArray(row['Observaciones'] || row['Observaciones Versión']),
                },
                cdus: [],
            };

            if (String(row['En Producción']).toUpperCase().trim() === 'SÍ') {
                versionEnProduccionId = version.id;
            }

            versionesMap.set(versionNumero, version);
        }

        // --- 4) Agregar CDUs desde hoja de detalle ---
        for (const row of detalleRows) {
            const versionNumero = this.cleanVersionNumber(row['Versión'] || '');
            if (!versionNumero) continue;

            // Si la versión no existe aún (no había hoja Changelog), crearla
            if (!versionesMap.has(versionNumero)) {
                const tempId = nextTempVersionId++;
                const fechaCreacionParsed = this.parseExcelDate(row['Fecha Creación']);
                const fechaDespliegueParsed = this.parseExcelDate(row['Fecha Despliegue']);
                const today = new Date().toISOString().split('T')[0];

                const version = {
                    id: tempId,
                    numero: versionNumero,
                    titulo: '',
                    fechaCreacion: fechaCreacionParsed || '',
                    horaCreacion: this.parseExcelTime(row['Hora Creación']) || '',
                    fuente: String(row['Fuente'] || 'Importada').trim(),
                    fechaDespliegue: fechaDespliegueParsed || '',
                    horaDespliegue: this.parseExcelTime(row['Hora Despliegue'] || row['Hora']) || '',
                    comentarios: {
                        mejoras:         this.parseExcelStringToArray(row['Mejoras/Bugfixes']),
                        salidas:         this.parseExcelStringToArray(row['Salidas a Producción']),
                        cambiosCaliente: this.parseExcelStringToArray(row['Cambios en Caliente']),
                        observaciones:   this.parseExcelStringToArray(row['Observaciones'] || row['Observaciones Versión']),
                    },
                    cdus: [],
                };

                if (String(row['En Producción']).toUpperCase().trim() === 'SÍ') {
                    versionEnProduccionId = version.id;
                }

                versionesMap.set(versionNumero, version);
            }

            // Detectar producción también desde la hoja de detalle
            if (!versionEnProduccionId && String(row['En Producción']).toUpperCase().trim() === 'SÍ') {
                const v = versionesMap.get(versionNumero);
                if (v) versionEnProduccionId = v.id;
            }

            // Agregar CDU si no es placeholder
            const nombreCDU = String(row['Nombre CDU'] || '').trim();
            if (nombreCDU && nombreCDU !== '(Sin CDUs)') {
                const version = versionesMap.get(versionNumero);

                // Parseo de responsables
                const responsablesTexto = String(row['Responsables'] || '');
                const responsables = responsablesTexto.split('||').map(r => r.trim()).filter(Boolean).map(r => {
                    const match = r.match(/^(.*?)\s*\((.*?)\)$/);
                    return match ? { nombre: match[1].trim(), rol: match[2].trim().toUpperCase() || 'DEV' } : { nombre: r.trim(), rol: 'DEV' };
                }).filter(r => r.nombre);

                version.cdus.push({
                    id: uuidv4(),
                    uuid: row['UUID CDU'] || row['UUID'] || uuidv4(),
                    nombreCDU: nombreCDU,
                    descripcionCDU: String(row['Descripción CDU'] || '').trim(),
                    estado: this.normalizarEstado(String(row['Estado'] || 'En Desarrollo')),
                    versionBADA: String(row['Versión BADA'] || 'V1').trim(),
                    versionMiro: String(row['Versión Miró'] || row['Version de Miró'] || '').trim(),
                    responsables: responsables,
                    observaciones: String(row['Observaciones CDU'] || '').split('||').map(o => o.trim()).filter(Boolean),
                    historial: [],
                    pasos: [],
                });
            }
        }

        return {
            versiones: Array.from(versionesMap.values()),
            versionEnProduccionId: versionEnProduccionId,
        };
    }

    /**
     * Busca una hoja del workbook por nombre exacto o parcial (fallback).
     */
    static findSheet(workbook, names) {
        // Primero buscar por nombre exacto
        for (const name of names) {
            if (workbook.Sheets[name]) return workbook.Sheets[name];
        }
        // Fallback: buscar por coincidencia parcial (case-insensitive)
        for (const name of names) {
            const lower = name.toLowerCase();
            const found = Object.keys(workbook.Sheets).find(s => s.toLowerCase().includes(lower));
            if (found) return workbook.Sheets[found];
        }
        return null;
    }

    /**
     * Limpia el número de versión (quita "V" prefix si existe).
     */
    static cleanVersionNumber(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return '';
        // Quitar prefix "V" o "v" si lo tiene
        return trimmed.replace(/^[Vv]/, '');
    }

    static normalizarEstado(estado) {
        const estadoLower = String(estado || '').toLowerCase().trim();
        if (estadoLower.includes('produccion')) return 'En Produccion';
        if (estadoLower.includes('certificado')) return 'Certificado OK';
        if (estadoLower.includes('pendiente')) return 'Pendiente de Certificacion';
        return 'En Desarrollo';
    }

    static parseExcelStringToArray(str) {
        if (!str) return [];
        return String(str).split('||').map(s => s.trim()).filter(s => s !== '');
    }

    static parseExcelDate(val) {
        if (!val) return null;
        if (typeof val === 'string' && val.includes('-')) return val;
        if (typeof val === 'number') {
            const dateInfo = XLSX.SSF.parse_date_code(val);
            if (dateInfo) return `${dateInfo.y}-${String(dateInfo.m).padStart(2, '0')}-${String(dateInfo.d).padStart(2, '0')}`;
        }
        return null;
    }

    static parseExcelTime(val) {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'number') {
            const totalSeconds = Math.round(val * 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
        return null;
    }
}