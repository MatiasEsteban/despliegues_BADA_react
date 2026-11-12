import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    CAPTURE_MATRIX,
    CAPTURE_VIEWS,
    MANIFEST_PATH,
    OUTPUT_DIR,
    buildScreenshotName,
    resolveCaptureOptions,
} from '../../../scripts/capture-baseline.mjs';

// A-08.2: la matriz es un contrato. Si alguien añade, quita o renombra una
// captura, el cambio debe ser explícito y no romper la convención
// `[ancho]-[vista]-[tema]-[estado].png`.
describe('A-08.2 — matriz de capturas baseline', () => {
    it('contiene exactamente las 24 capturas aprobadas', () => {
        expect(CAPTURE_MATRIX).toHaveLength(24);
    });

    it('usa nombres únicos y la convención [ancho]-[vista]-[tema]-[estado].png', () => {
        const names = CAPTURE_MATRIX.map(buildScreenshotName);
        expect(new Set(names).size).toBe(names.length);

        for (const capture of CAPTURE_MATRIX) {
            expect(buildScreenshotName(capture)).toMatch(
                /^(320|768|1440)-[a-z-]+-(light|dark)-[a-z-]+\.png$/,
            );
        }
    });

    it('cubre los anchos y temas aprobados para cada vista', () => {
        const coverage = CAPTURE_MATRIX.reduce((acc, capture) => {
            const key = `${capture.view}:${capture.width}:${capture.theme}`;
            acc.add(key);
            return acc;
        }, new Set());

        expect([...CAPTURE_VIEWS]).toEqual([
            'changelog',
            'lista',
            'detalle',
            'modal-exportacion',
            'modal-progreso',
            'modal-entradas',
            'modal-resumen',
            'modal-info',
            'workspace',
        ]);

        for (const view of CAPTURE_VIEWS) {
            expect(CAPTURE_MATRIX.some((capture) => capture.view === view)).toBe(true);
            expect([...coverage].some((key) => key.startsWith(`${view}:`))).toBe(true);
        }
    });
});

// P1-06.2: la salida opcional permite generar evidencia en otro directorio sin
// tocar la linea base del 2026-11-08. Sin argumentos, el comportamiento debe ser
// identico al actual.
describe('P1-06.2 — salida opcional del harness', () => {
    it('sin argumentos conserva el destino y la matriz por defecto', () => {
        const options = resolveCaptureOptions([]);

        expect(options.outDir).toBe(resolve(OUTPUT_DIR));
        expect(options.manifestPath).toBe(resolve(MANIFEST_PATH));
        expect(options.matrix).toEqual(CAPTURE_MATRIX);
    });

    it('--out redirige PNG y MANIFEST sin sobrescribir la linea base', () => {
        const outDir = 'docs/audits/2026-11-12-p1-06/antes';
        const options = resolveCaptureOptions(['--out', outDir]);

        expect(options.outDir).toBe(resolve(outDir));
        expect(options.manifestPath).toBe(resolve(outDir, 'MANIFEST.md'));
        expect(options.manifestPath).not.toBe(resolve(MANIFEST_PATH));
        expect(options.matrix).toEqual(CAPTURE_MATRIX);
    });

    it('--only detalle limita la captura a las vistas de detalle de la matriz', () => {
        const options = resolveCaptureOptions(['--only', 'detalle']);

        // 4 capturas requeridas (320/1440 x claro/oscuro) + el 768 claro que ya
        // forma parte de la matriz aprobada y cubre P1-06.3.
        expect(options.matrix).toHaveLength(5);
        expect(options.matrix.every((capture) => capture.view === 'detalle')).toBe(true);
        expect(options.matrix.map(buildScreenshotName)).toEqual([
            '320-detalle-light-default.png',
            '320-detalle-dark-default.png',
            '1440-detalle-light-default.png',
            '1440-detalle-dark-default.png',
            '768-detalle-light-default.png',
        ]);
    });

    it('rechaza una vista desconocida en --only', () => {
        expect(() => resolveCaptureOptions(['--only', 'detalle,inexistente'])).toThrow(
            /Vista desconocida/,
        );
    });
});
