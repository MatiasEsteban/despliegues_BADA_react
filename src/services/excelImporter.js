import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export class ExcelImporter {
    static async importExcel(file) {
        try {
            const json = await this.readExcelFile(file);
            const processedData = this.processExcelData(json);
            return processedData;
        } catch (error) {
            console.error('Error en ExcelImporter:', error);
            throw error;
        }
    }

    static readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = 'Detalle Despliegues';
                    let wsDetalle = workbook.Sheets[sheetName];

                    // Búsqueda fallback si no encuentra la hoja exacta
                    if (!wsDetalle) {
                        const possibleSheet = Object.keys(workbook.Sheets).find(name => name.toLowerCase().includes('detalle'));
                        if (possibleSheet) {
                            wsDetalle = workbook.Sheets[possibleSheet];
                        } else {
                            throw new Error(`No se encontró la hoja '${sheetName}'.`);
                        }
                    }
                    const json = XLSX.utils.sheet_to_json(wsDetalle, { defval: "" });
                    resolve(json);
                } catch (error) { reject(new Error('No se pudo leer el archivo Excel. Verifique el formato.')); }
            };
            reader.onerror = () => reject(new Error('Error de lectura de archivo.'));
            reader.readAsArrayBuffer(file);
        });
    }

    static processExcelData(json) {
        const versionesMap = new Map();
        let versionEnProduccionId = null;
        let nextTempVersionId = Date.now(); // Usamos timestamp para IDs seguros al importar

        json.forEach((row) => {
            const versionNumero = String(row['Versión'] || '').trim();
            if (!versionNumero) return;

            let version = versionesMap.get(versionNumero);

            if (!version) {
                const tempId = nextTempVersionId++; // ID numérico temporal
                const fechaCreacionParsed = this.parseExcelDate(row['Fecha Creación']);
                const fechaDespliegueParsed = this.parseExcelDate(row['Fecha Despliegue']);
                const today = new Date().toISOString().split('T')[0];

                version = {
                    id: tempId,
                    numero: versionNumero,
                    fechaCreacion: fechaCreacionParsed || today,
                    horaCreacion: this.parseExcelTime(row['Hora Creación']) || '00:00',
                    fuente: String(row['Fuente'] || 'Importada').trim(),
                    fechaDespliegue: fechaDespliegueParsed || today,
                    horaDespliegue: this.parseExcelTime(row['Hora']) || '',
                    comentarios: {
                        mejoras: this.parseExcelStringToArray(row['Mejoras/Bugfixes']),
                        salidas: this.parseExcelStringToArray(row['Salidas a Producción']),
                        cambiosCaliente: this.parseExcelStringToArray(row['Cambios en Caliente']),
                        observaciones: this.parseExcelStringToArray(row['Observaciones Versión'])
                    },
                    cdus: []
                };
                versionesMap.set(versionNumero, version);
            }

            // Detectar producción
            if (String(row['En Producción']).toUpperCase().trim() === 'SÍ') {
                versionEnProduccionId = version.id;
            }

            const nombreCDU = String(row['Nombre CDU'] || '').trim();
            if (nombreCDU && nombreCDU !== '(Sin CDUs)') {
                // Parseo de responsables
                const responsablesTexto = String(row['Responsables'] || '');
                const responsables = responsablesTexto.split('||').map(r => r.trim()).filter(Boolean).map(r => {
                    const match = r.match(/^(.*?)\s*\((.*?)\)$/);
                    return match ? { nombre: match[1].trim(), rol: match[2].trim().toUpperCase() || 'DEV' } : { nombre: r.trim(), rol: 'DEV' };
                }).filter(r => r.nombre);

                version.cdus.push({
                    id: uuidv4(), // UUID único para el CDU importado
                    uuid: row['UUID'] || uuidv4(),
                    nombreCDU: nombreCDU,
                    descripcionCDU: String(row['Descripción CDU'] || '').trim(),
                    estado: this.normalizarEstado(String(row['Estado'] || 'En Desarrollo')),
                    versionBADA: String(row['Versión BADA'] || 'V1').trim(),
                    versionMiro: String(row['Version de Miró'] || '').trim(),
                    responsables: responsables,
                    observaciones: String(row['Observaciones CDU'] || '').split('||').map(o => o.trim()).filter(Boolean),
                    historial: [], // Reiniciamos historial al importar
                    pasos: [] // Excel no tiene pasos detallados
                });
            }
        });

        return {
            versiones: Array.from(versionesMap.values()),
            versionEnProduccionId: versionEnProduccionId
        };
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