#!/usr/bin/env node
/**
 * check-contrast.mjs — T-11 / P4-08.6
 *
 * Verifica el contraste WCAG 2.1 de los pares de color críticos del tablero,
 * en tema claro y oscuro, leyendo los valores reales de
 * `src/styles/base/variables.css` (fuente única de verdad).
 *
 * - Resuelve cadenas de `var(...)` hasta el valor final (hex de 3/6/8 dígitos,
 *   `rgb()`/`rgba()` y `color-mix()` simple no soportado → error explícito).
 * - Calcula la luminancia relativa sRGB y el ratio (WCAG 2.1, 1.4.3 y 1.4.11).
 * - La tabla de pares está declarada aquí a propósito: cada par documenta su
 *   umbral y el motivo por el que se vigila.
 *
 * Uso:
 *   node scripts/check-contrast.mjs           # tabla legible, exit 1 si hay FAIL
 *   node scripts/check-contrast.mjs --json    # salida JSON (CI / tooling)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const VARIABLES_FILE = resolve(ROOT, 'src/styles/base/variables.css');

const THEMES = ['light', 'dark'];
const DARK_SELECTOR = '[data-theme="dark"]';

/* ============================================================
   PARSER DE VARIABLES CSS
   ============================================================ */

/** Elimina comentarios `/* ... *\/` conservando saltos de línea. */
function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''));
}

/**
 * Extrae los pares `--token: valor;` de un bloque.
 * @param {string} block contenido entre llaves
 * @returns {Array<[string, string]>}
 */
function parseDeclarations(block) {
    const out = [];
    for (const chunk of block.split(';')) {
        const idx = chunk.indexOf(':');
        if (idx === -1) continue;
        const name = chunk.slice(0, idx).trim();
        const value = chunk.slice(idx + 1).trim();
        if (!name.startsWith('--') || !value) continue;
        out.push([name, value]);
    }
    return out;
}

/** Devuelve los bloques `selector { ... }` de la hoja, sin anidamiento. */
function extractBlocks(css) {
    const blocks = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = re.exec(css)) !== null) {
        blocks.push({ selector: match[1].trim(), body: match[2] });
    }
    return blocks;
}

/**
 * Construye los mapas de tokens por tema.
 * `:root` acumula la paleta, los tokens de tema y la capa semántica;
 * `[data-theme="dark"]` sobrescribe sólo los tokens que redefine.
 */
function loadThemes(file = VARIABLES_FILE) {
    const css = stripComments(readFileSync(file, 'utf8'));
    const maps = { light: new Map(), dark: new Map() };

    for (const { selector, body } of extractBlocks(css)) {
        const declarations = parseDeclarations(body);
        if (!declarations.length) continue;

        const isRoot = selector.split(',').some((part) => part.trim() === ':root');
        const isDark = selector
            .split(',')
            .some((part) => part.trim().replace(/^html\s+/, '') === DARK_SELECTOR);

        if (isRoot) {
            for (const [name, value] of declarations) {
                maps.light.set(name, value);
                maps.dark.set(name, value);
            }
        } else if (isDark) {
            for (const [name, value] of declarations) {
                maps.dark.set(name, value);
            }
        }
    }

    return maps;
}

/* ============================================================
   RESOLUCIÓN DE var(...) Y PARSEO DE COLOR
   ============================================================ */

const VAR_RE = /var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^]*))?\)/;

/** Resuelve un token hasta su valor CSS literal, siguiendo cadenas de `var()`. */
function resolveLiteral(map, name, stack = []) {
    if (stack.includes(name)) {
        throw new Error(`Ciclo de var() detectado: ${[...stack, name].join(' → ')}`);
    }
    if (!map.has(name)) {
        throw new Error(`Token inexistente en variables.css: ${name}`);
    }

    let value = map.get(name).trim();
    let guard = 0;

    while (value.includes('var(')) {
        const match = value.match(VAR_RE);
        if (!match) {
            throw new Error(`var() mal formado en ${name}: ${value}`);
        }
        const [, ref, fallback] = match;
        let replacement;
        if (map.has(ref)) {
            replacement = resolveLiteral(map, ref, [...stack, name]);
        } else if (fallback !== undefined) {
            replacement = fallback.trim();
        } else {
            throw new Error(`Token ${name} referencia ${ref}, que no existe`);
        }
        value = value.replace(match[0], replacement);
        if (++guard > 20) {
            throw new Error(`Cadena de var() demasiado larga en ${name}`);
        }
    }

    return value;
}

/** Resuelve un token a un color RGBA listo para calcular contraste. */
function resolveToken(map, name) {
    return parseColor(resolveLiteral(map, name), name);
}

/**
 * Parsea un color CSS devolviendo canales 0-255 y alfa 0-1.
 * Acepta #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb()/rgba() y blanco/negro.
 */
function parseColor(raw, token = '¿?') {
    const value = raw.trim().toLowerCase();

    if (value === 'white') return { r: 255, g: 255, b: 255, a: 1 };
    if (value === 'black') return { r: 0, g: 0, b: 0, a: 1 };
    if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    const hex = value.match(/^#([0-9a-f]{3,8})$/);
    if (hex) {
        let digits = hex[1];
        if (digits.length === 3 || digits.length === 4) {
            digits = digits.split('').map((d) => d + d).join('');
        }
        if (digits.length !== 6 && digits.length !== 8) {
            throw new Error(`Hex no soportado en ${token}: ${raw}`);
        }
        const r = parseInt(digits.slice(0, 2), 16);
        const g = parseInt(digits.slice(2, 4), 16);
        const b = parseInt(digits.slice(4, 6), 16);
        const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }

    const fn = value.match(/^rgba?\(([^)]+)\)$/);
    if (fn) {
        const parts = fn[1].split(/[,/]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length < 3) throw new Error(`rgb() incompleto en ${token}: ${raw}`);
        const channel = (p) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
        const a = parts[3] === undefined
            ? 1
            : (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]));
        return { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]), a };
    }

    throw new Error(`Color no soportado en ${token}: ${raw}`);
}

/* ============================================================
   CONTRASTE WCAG 2.1
   ============================================================ */

/** Compone `fg` (con alfa) sobre `bg` opaco. */
function composite(fg, bg) {
    if (fg.a >= 1) return fg;
    const mix = (f, b) => f * fg.a + b * (1 - fg.a);
    return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

/** Luminancia relativa sRGB (WCAG 2.1, definición). */
function relativeLuminance({ r, g, b }) {
    const linear = (channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Ratio de contraste WCAG entre dos colores. */
function contrastRatio(fg, bg) {
    const base = composite(bg, { r: 255, g: 255, b: 255, a: 1 });
    const front = composite(fg, base);
    const l1 = relativeLuminance(front);
    const l2 = relativeLuminance(base);
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
}

/* ============================================================
   TABLA DE PARES VIGILADOS
   ============================================================
   `min` es el umbral WCAG exigido:
   - 4.5 → texto normal (1.4.3 AA)
   - 3.0 → componentes/indicadores no textuales (1.4.11 AA)
   ============================================================ */

const TEXT_REASON = 'Texto normal sobre superficie (WCAG 1.4.3 AA, 4,5:1)';
const BADGE_REASON = 'Texto de badge pequeño (0,65 rem, WCAG 1.4.3 AA, 4,5:1)';
const NON_TEXT_REASON = 'Elemento no textual: borde/punto indicador (WCAG 1.4.11 AA, 3:1)';

const SURFACES = ['--bg-primary', '--bg-secondary', '--surface-raised'];
const TEXT_TOKENS = ['--text-primary', '--text-secondary'];
const STATES = ['--estado-desarrollo', '--estado-pendiente', '--estado-certificado', '--estado-produccion'];

const PAIRS = [
    // --- A. Texto normal sobre superficies ---
    ...TEXT_TOKENS.flatMap((fg) =>
        SURFACES.map((bg) => ({ group: 'texto', fg, bg, min: 4.5, reason: TEXT_REASON }))
    ),

    // --- B. Texto de estado sobre su fondo (badges y .estado-display) ---
    ...STATES.map((state) => ({
        group: 'estado-texto',
        fg: `${state}-color`,
        bg: `${state}-bg`,
        min: 4.5,
        reason: BADGE_REASON,
    })),

    // --- C. Feedback textual ---
    { group: 'feedback', fg: '--color-danger-text', bg: '--bg-primary', min: 4.5, reason: 'Mensaje de error de formulario (WCAG 1.4.3 AA)' },
    { group: 'feedback', fg: '--color-success-text', bg: '--bg-primary', min: 4.5, reason: 'Mensaje de éxito (WCAG 1.4.3 AA)' },
    { group: 'feedback', fg: '--color-success-strong', bg: '--bg-primary', min: 4.5, reason: 'Texto de éxito fuerte (WCAG 1.4.3 AA)' },

    // --- D. Feedback no textual (iconos 3:1) ---
    { group: 'feedback-no-textual', fg: '--color-danger-icon', bg: '--bg-primary', min: 3, reason: 'Icono de error en toast (WCAG 1.4.11 AA)' },

    // --- E. Badge de pestañas del changelog (.tab-badge) ---
    // Implementación actual: --estado-*-bg como fondo y --estado-*-color como texto.
    // Las categorías sin estado propio usan el tono oscuro de su matiz.
    { group: 'tab-badge', fg: '--estado-desarrollo-color', bg: '--estado-desarrollo-bg', min: 4.5, reason: `${BADGE_REASON} (Mejoras)` },
    { group: 'tab-badge', fg: '--estado-produccion-color', bg: '--estado-produccion-bg', min: 4.5, reason: `${BADGE_REASON} (Salidas)` },
    { group: 'tab-badge', fg: '--estado-certificado-color', bg: '--estado-certificado-bg', min: 4.5, reason: `${BADGE_REASON} (Observaciones)` },
    { group: 'tab-badge', fg: '--palette-red-50', bg: '--palette-red-700', min: 4.5, reason: `${BADGE_REASON} (Cambios calientes)` },
    { group: 'tab-badge', fg: '--palette-neutral-1000', bg: '--palette-violet-500', min: 4.5, reason: `${BADGE_REASON} (Cambios CDU)` },

    // --- F. Indicadores no textuales: bordes de estado ---
    ...STATES.flatMap((state) => [
        {
            group: 'estado-no-textual',
            fg: `${state}-border`,
            bg: `${state}-bg`,
            min: 3,
            reason: `${NON_TEXT_REASON} (borde sobre su propio fondo)`,
        },
        {
            group: 'estado-no-textual',
            fg: `${state}-border`,
            bg: '--bg-primary',
            min: 3,
            reason: `${NON_TEXT_REASON} (borde/punto sobre el lienzo)`,
        },
    ]),
];

/* ============================================================
   EJECUCIÓN
   ============================================================ */

function check(file) {
    const maps = loadThemes(file);
    const results = [];

    for (const theme of THEMES) {
        const map = maps[theme];
        for (const pair of PAIRS) {
            const fg = resolveToken(map, pair.fg);
            const bg = resolveToken(map, pair.bg);
            const ratio = contrastRatio(fg, bg);
            results.push({
                theme,
                group: pair.group,
                fg: pair.fg,
                bg: pair.bg,
                min: pair.min,
                ratio: Number(ratio.toFixed(2)),
                pass: ratio >= pair.min,
                reason: pair.reason,
            });
        }
    }

    return results;
}

function formatTable(results) {
    const header = ['PAR (texto/fondo)', 'TEMA', 'GRUPO', 'RATIO', 'UMBRAL', 'RESULTADO'];
    const rows = results.map((r) => [
        `${r.fg} / ${r.bg}`,
        r.theme === 'light' ? 'claro' : 'oscuro',
        r.group,
        `${r.ratio.toFixed(2)}:1`,
        `${r.min}:1`,
        r.pass ? 'PASS' : 'FAIL',
    ]);

    const widths = header.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)));
    const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join(' | ').trimEnd();

    const out = [line(header), widths.map((w) => '-'.repeat(w)).join('-+-'), ...rows.map(line)];
    return out.join('\n');
}

function main() {
    const asJson = process.argv.includes('--json');
    let results;
    try {
        results = check();
    } catch (error) {
        if (asJson) {
            console.log(JSON.stringify({ ok: false, error: error.message }, null, 2));
        } else {
            console.error(`✖ check-contrast: ${error.message}`);
        }
        process.exit(2);
    }

    const failures = results.filter((r) => !r.pass);

    if (asJson) {
        console.log(JSON.stringify({
            ok: failures.length === 0,
            checked: results.length,
            failures: failures.length,
            pairs: results,
        }, null, 2));
    } else {
        console.log(formatTable(results));
        console.log('');
        for (const theme of THEMES) {
            const ofTheme = results.filter((r) => r.theme === theme);
            const bad = ofTheme.filter((r) => !r.pass);
            const label = theme === 'light' ? 'claro' : 'oscuro';
            console.log(`Resumen ${label}: ${ofTheme.length - bad.length}/${ofTheme.length} PASS`);
        }
        const groups = [...new Set(results.map((r) => r.group))];
        console.log(`Grupos vigilados: ${groups.join(', ')}`);
        console.log(`Total: ${results.length - failures.length}/${results.length} PASS, ${failures.length} FAIL`);

        if (failures.length) {
            console.log('');
            console.log('Incumplimientos:');
            for (const f of failures) {
                console.log(
                    `  ✖ [${f.theme === 'light' ? 'claro' : 'oscuro'}] ${f.fg} / ${f.bg}: ${f.ratio.toFixed(2)}:1 < ${f.min}:1 — ${f.reason}`
                );
            }
        }
    }

    process.exit(failures.length === 0 ? 0 : 1);
}

main();
