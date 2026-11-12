#!/usr/bin/env node
/**
 * A-08.2 - Harness de capturas de la linea base visual (SPEC-001).
 *
 * Flujo:
 *   1. `vite build --mode capture` (carga `.env.capture` y el modo fixtures).
 *   2. `vite preview` en 127.0.0.1:4173 con `--strictPort`.
 *   3. Chromium headless (Playwright) recorre la matriz aprobada de 24 capturas.
 *   4. Escribe los PNG en `docs/audits/baseline-2026-11-08/captures/` y
 *      regenera `MANIFEST.md` con commit, fecha, SO, Node, Playwright, tema y
 *      estado de datos.
 *
 * El server y el navegador se cierran siempre en `finally`. No se borran PNG
 * existentes: son evidencia. Sin datos reales: si aparece Firestore, el script
 * falla (el modo fixtures no esta activo).
 *
 * Uso:
 *   `npm run capture`                         # linea base (24 capturas)
 *   `npm run capture -- --out <dir>`          # mismo flujo, otra salida
 *   `npm run capture -- --only detalle`       # solo las vistas indicadas
 */

import { execFileSync, spawn } from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = resolve(SCRIPT_DIR, '..');
export const OUTPUT_DIR = join(
    ROOT_DIR,
    'docs',
    'audits',
    'baseline-2026-11-08',
    'captures',
);
export const MANIFEST_PATH = join(
    ROOT_DIR,
    'docs',
    'audits',
    'baseline-2026-11-08',
    'MANIFEST.md',
);
export const PREVIEW_PORT = 4173;
export const VIEWPORT_HEIGHT = 900;

const VITE_BIN = join(ROOT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;
const FIXTURE_WORKSPACE_NAME = 'Workspace de captura';
const CAPTURE_DATE = new Date();
const CAPTURE_DATE_LABEL = CAPTURE_DATE.toISOString().slice(0, 10);

/**
 * Vistas de la matriz aprobada. La lista es un contrato: el test
 * `src/test/__tests__/capture-matrix.test.js` la valida.
 */
export const CAPTURE_VIEWS = Object.freeze([
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

const capture = (width, view, theme, state) =>
    Object.freeze({ width, view, theme, state });

/**
 * Matriz aprobada (24 capturas):
 * - Changelog: 320/1440 x claro/oscuro (4).
 * - Lista/Grid: 320/1440 x claro/oscuro (4).
 * - Detalle CDU: 320/1440 x claro/oscuro (4).
 * - Modales exportacion/progreso/entradas: 320/1440 claro (6).
 * - Resumen global y comentarios: 320 claro (2).
 * - Workspace switcher abierto: 320/1440 claro (2).
 * - Mix 768: changelog y detalle claro (2).
 */
export const CAPTURE_MATRIX = Object.freeze([
    // Changelog
    capture(320, 'changelog', 'light', 'default'),
    capture(320, 'changelog', 'dark', 'default'),
    capture(1440, 'changelog', 'light', 'default'),
    capture(1440, 'changelog', 'dark', 'default'),

    // Lista/Grid (se captura el modo grid de VersionList)
    capture(320, 'lista', 'light', 'grid'),
    capture(320, 'lista', 'dark', 'grid'),
    capture(1440, 'lista', 'light', 'grid'),
    capture(1440, 'lista', 'dark', 'grid'),

    // Detalle CDU (cabecera, pasos, responsables, grafico BADA)
    capture(320, 'detalle', 'light', 'default'),
    capture(320, 'detalle', 'dark', 'default'),
    capture(1440, 'detalle', 'light', 'default'),
    capture(1440, 'detalle', 'dark', 'default'),

    // Modales en tema claro
    capture(320, 'modal-exportacion', 'light', 'default'),
    capture(1440, 'modal-exportacion', 'light', 'default'),
    capture(320, 'modal-progreso', 'light', 'default'),
    capture(1440, 'modal-progreso', 'light', 'default'),
    capture(320, 'modal-entradas', 'light', 'default'),
    capture(1440, 'modal-entradas', 'light', 'default'),

    // Resumen global y el hueco de "comentarios"
    capture(320, 'modal-resumen', 'light', 'default'),
    capture(320, 'modal-info', 'light', 'default'),

    // Workspace switcher abierto
    capture(320, 'workspace', 'light', 'abierto'),
    capture(1440, 'workspace', 'light', 'abierto'),

    // Mix 768: solo donde cambia el layout
    capture(768, 'changelog', 'light', 'default'),
    capture(768, 'detalle', 'light', 'default'),
]);

export function buildScreenshotName({ width, view, theme, state }) {
    return `${width}-${view}-${theme}-${state}.png`;
}

function readOptionValue(argv, index, flag) {
    const value = argv[index];
    if (!value || value.startsWith('--')) {
        throw new Error(`Falta el valor de ${flag}.`);
    }
    return value;
}

/**
 * Resuelve la salida del harness (P1-06.2).
 *
 * - Sin argumentos: mismos PNG y mismo `MANIFEST.md` que la linea base.
 * - `--out <dir>`: redirige PNG y manifiesto a `<dir>` (relativo al repo). La
 *   linea base del 2026-11-08 no se toca.
 * - `--only <vistas>`: limita la matriz a una lista separada por comas. Se usa
 *   para generar evidencia de una sola vista sin repetir las 24 capturas.
 */
export function resolveCaptureOptions(argv = process.argv.slice(2)) {
    let outDir = OUTPUT_DIR;
    let views = null;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--out') {
            outDir = resolve(ROOT_DIR, readOptionValue(argv, ++i, '--out'));
            continue;
        }

        if (arg.startsWith('--out=')) {
            outDir = resolve(ROOT_DIR, readOptionValue([arg.slice('--out='.length)], 0, '--out'));
            continue;
        }

        if (arg === '--only') {
            views = readOptionValue(argv, ++i, '--only')
                .split(',')
                .map((view) => view.trim())
                .filter(Boolean);
            continue;
        }

        if (arg.startsWith('--only=')) {
            views = arg
                .slice('--only='.length)
                .split(',')
                .map((view) => view.trim())
                .filter(Boolean);
            continue;
        }

        throw new Error(`Argumento desconocido: ${arg}`);
    }

    if (views) {
        const unknown = views.filter((view) => !CAPTURE_VIEWS.includes(view));
        if (unknown.length > 0) {
            throw new Error(
                `Vista desconocida en --only: ${unknown.join(', ')}. Validas: ${CAPTURE_VIEWS.join(', ')}.`,
            );
        }
    }

    const selectedViews = views ? new Set(views) : null;

    return {
        outDir: resolve(outDir),
        manifestPath: resolve(
            outDir === OUTPUT_DIR ? MANIFEST_PATH : join(outDir, 'MANIFEST.md'),
        ),
        matrix: selectedViews
            ? CAPTURE_MATRIX.filter((capture) => selectedViews.has(capture.view))
            : CAPTURE_MATRIX,
    };
}

// Animaciones y transiciones a cero: las capturas no deben depender del frame
// en el que se toma la foto. `reducedMotion` cubre las reglas CSS que lo
// respetan; este refuerzo cubre las que aun no lo hacen (P5-05 pendiente).
const STABLE_CSS = `
*, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
}
`;

function log(message) {
    console.log(`[capture] ${message}`);
}

function formatDuration(ms) {
    return `${(ms / 1000).toFixed(1)} s`;
}

function readPlaywrightVersion() {
    const pkgPath = join(ROOT_DIR, 'node_modules', 'playwright', 'package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
}

function readGitCommit() {
    try {
        return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
            cwd: ROOT_DIR,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch {
        return 'desconocido';
    }
}

function runCommand(command, args, label) {
    return new Promise((resolvePromise, reject) => {
        const child = spawn(command, args, {
            cwd: ROOT_DIR,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: process.env,
        });
        let output = '';

        const collect = (chunk) => {
            const text = chunk.toString();
            output += text;
            if (output.length > 20000) output = output.slice(-20000);
        };

        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        child.on('error', (error) => {
            reject(new Error(`${label}: no se pudo iniciar (${error.message})`));
        });
        child.on('close', (code) => {
            if (code === 0) {
                resolvePromise(output);
            } else {
                reject(new Error(`${label} fallo con codigo ${code}\n${output}`));
            }
        });
    });
}

function startPreview() {
    const child = spawn(
        process.execPath,
        [
            VITE_BIN,
            'preview',
            '--host',
            '127.0.0.1',
            '--port',
            String(PREVIEW_PORT),
            '--strictPort',
        ],
        {
            cwd: ROOT_DIR,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: process.env,
        },
    );

    let output = '';
    const collect = (chunk) => {
        output += chunk.toString();
        if (output.length > 20000) output = output.slice(-20000);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.previewLog = () => output;

    return child;
}

async function stopProcess(child) {
    if (!child || child.exitCode !== null) return;

    await new Promise((resolvePromise) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            resolvePromise();
        };

        child.once('exit', finish);

        try {
            child.kill();
        } catch {
            finish();
            return;
        }

        // Windows: si el proceso no responde, matar el arbol.
        setTimeout(() => {
            if (settled) return;
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
                    stdio: 'ignore',
                });
            } else {
                try { child.kill('SIGKILL'); } catch { /* noop */ }
            }
            setTimeout(finish, 1000);
        }, 3000);
    });
}

async function waitForServer(url, child, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(
                `vite preview termino antes de estar listo (codigo ${child.exitCode}).\n${child.previewLog()}`,
            );
        }
        try {
            const response = await fetch(url);
            if (response.ok) return;
        } catch {
            // El server aun no acepta conexiones.
        }
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
    }

    throw new Error(
        `vite preview no respondio en ${timeoutMs} ms.\n${child.previewLog()}`,
    );
}

async function waitForFixture(page) {
    await page.waitForSelector('.ws-trigger-name', {
        state: 'visible',
        timeout: 15000,
    });

    await page.waitForFunction(
        (expectedName) => {
            const name = document
                .querySelector('.ws-trigger-name')
                ?.textContent?.trim();
            const total = document
                .querySelector('.header-title-block p')
                ?.textContent || '';
            const cardCount =
                document.querySelectorAll('.changelog-card').length;
            const loading = document.querySelector('.loading-overlay');

            return (
                name === expectedName &&
                total.includes('4') &&
                cardCount > 0 &&
                !loading
            );
        },
        FIXTURE_WORKSPACE_NAME,
        { timeout: 15000 },
    );

    // Dos frames: React ya pinto y el navegador aplico el layout.
    await page.evaluate(
        () =>
            new Promise((resolvePromise) => {
                requestAnimationFrame(() =>
                    requestAnimationFrame(resolvePromise),
                );
            }),
    );
    await page.evaluate(() => document.fonts?.ready);
}

async function resetScroll(page) {
    // Algunos controles (p. ej. "Ver CDUs" a 320 px) obligan a Playwright a
    // desplazar la pagina para poder hacer click. La captura debe partir
    // siempre de la esquina superior izquierda, igual que una carga limpia.
    await page.evaluate(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (document.scrollingElement) {
            document.scrollingElement.scrollTop = 0;
            document.scrollingElement.scrollLeft = 0;
        }
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
    });
    await page.evaluate(
        () =>
            new Promise((resolvePromise) => {
                requestAnimationFrame(() =>
                    requestAnimationFrame(resolvePromise),
                );
            }),
    );
}

async function assertFixturesOnly(page, externalRequests) {
    if (externalRequests.length > 0) {
        throw new Error(
            `Se detecto una peticion externa de Firebase/Firestore: ${externalRequests[0]}`,
        );
    }

    const workspaceName = (await page
        .locator('.ws-trigger-name')
        .innerText()).trim();
    if (workspaceName !== FIXTURE_WORKSPACE_NAME) {
        throw new Error(
            `El modo fixtures no esta activo (workspace: "${workspaceName}").`,
        );
    }

    const totalVersions = (await page
        .locator('.header-title-block p')
        .innerText()).trim();
    if (!totalVersions.includes('4')) {
        throw new Error(
            `El fixture no hidrato las 4 versiones (${totalVersions}).`,
        );
    }

    if ((await page.locator('.login-error').count()) > 0) {
        throw new Error('La app muestra un error de Firebase en modo captura.');
    }
}

async function openDetailView(page) {
    await page.locator('.btn-cl-detail').first().click();
    await page.waitForSelector('.version-detail-header', { timeout: 15000 });
    await page.waitForFunction(
        () => document.querySelectorAll('#tabla-body tr').length > 0,
        { timeout: 15000 },
    );
}

async function openCardAction(page, actionClass, modalSelector) {
    const card = page.locator('.changelog-card').first();
    await card.locator('.changelog-card-header').hover();
    await card.locator(actionClass).click();
    await page.waitForSelector(modalSelector, { timeout: 15000 });
}

const SCENARIOS = {
    changelog: async () => {
        // Estado por defecto: timeline con la version en produccion expandida.
    },

    lista: async (page) => {
        await page
            .locator('.header-view-toggle button[aria-label="Vista lista"]')
            .click();
        await page.waitForSelector('#versions-list-container', {
            timeout: 15000,
        });
        await page
            .locator('.view-toggle-group button[aria-label="Vista cuadrícula"]')
            .click();
        await page.waitForSelector('.versions-grid', { timeout: 15000 });
        await page.waitForFunction(
            () => document.querySelectorAll('.version-card').length > 0,
            { timeout: 15000 },
        );
    },

    detalle: openDetailView,

    'modal-exportacion': async (page) => {
        await page
            .getByRole('button', { name: 'Exportar', exact: true })
            .click();
        await page.waitForSelector('.modal-export-selector', {
            timeout: 15000,
        });
    },

    'modal-progreso': async (page) => {
        await openDetailView(page);
        await page
            .getByRole('button', { name: 'Progreso', exact: true })
            .click();
        await page.waitForSelector('.modal-progress', { timeout: 15000 });
    },

    'modal-entradas': async (page) => {
        await openCardAction(
            page,
            '.btn-cl-changelog',
            '.modal-changelog-entries',
        );
    },

    'modal-resumen': async (page) => {
        await page.getByRole('button', { name: /Resumen Global/i }).click();
        await page.waitForSelector('.modal-full-summary', { timeout: 15000 });
    },

    'modal-info': async (page) => {
        // Sustituye al hueco "comentarios": `CommentsModal.jsx` no tiene
        // consumidor en la app. `DeploymentInfoModal` si es accesible y
        // muestra el detalle de changelog/comentarios de la version.
        await openCardAction(
            page,
            '.btn-cl-info',
            '.modal-deployment-info',
        );
    },

    workspace: async (page) => {
        await page.locator('.ws-trigger').click();
        await page.waitForSelector('.ws-dropdown', {
            state: 'visible',
            timeout: 15000,
        });
    },
};

async function captureOne(browser, captureSpec, outputDir) {
    const startedAt = Date.now();
    const context = await browser.newContext({
        viewport: { width: captureSpec.width, height: VIEWPORT_HEIGHT },
        deviceScaleFactor: 1,
        colorScheme: captureSpec.theme,
        reducedMotion: 'reduce',
        locale: 'es-AR',
        timezoneId: 'America/Argentina/Buenos_Aires',
    });

    await context.addInitScript(
        ({ theme, fixedNow }) => {
            try {
                localStorage.setItem('theme', theme);
            } catch {
                // localStorage no disponible: la app usara 'light'.
            }

            // `FullSummaryModal` pinta `new Date()` en el texto generado. Sin
            // reloj fijo, dos ejecuciones de la misma captura difieren por la
            // hora. Se congela solo `Date` (no los timers) para no alterar la
            // carga de React ni el foco de los modales.
            const OriginalDate = Date;
            function FixedDate(...args) {
                if (!new.target) return new OriginalDate(fixedNow).toString();
                return args.length === 0
                    ? new OriginalDate(fixedNow)
                    : new OriginalDate(...args);
            }
            FixedDate.prototype = OriginalDate.prototype;
            FixedDate.now = () => fixedNow;
            FixedDate.parse = OriginalDate.parse;
            FixedDate.UTC = OriginalDate.UTC;
            window.Date = FixedDate;
        },
        {
            theme: captureSpec.theme,
            fixedNow: Date.parse('2026-11-12T13:00:00.000Z'),
        },
    );

    const page = await context.newPage();
    const externalRequests = [];
    const consoleErrors = [];

    page.on('request', (request) => {
        const url = request.url();
        if (
            /firestore\.googleapis\.com|firebaseio\.com|firebaseinstallations\.googleapis\.com/i.test(
                url,
            )
        ) {
            externalRequests.push(url);
        }
    });

    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
    });

    try {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
        await page.addStyleTag({ content: STABLE_CSS });
        await waitForFixture(page);
        await assertFixturesOnly(page, externalRequests);

        const scenario = SCENARIOS[captureSpec.view];
        if (!scenario) {
            throw new Error(`Escenario desconocido: ${captureSpec.view}`);
        }
        await scenario(page);
        await resetScroll(page);
        await assertFixturesOnly(page, externalRequests);

        const file = buildScreenshotName(captureSpec);
        const path = join(outputDir, file);
        await page.screenshot({
            path,
            fullPage: false,
            animations: 'disabled',
            caret: 'hide',
        });

        if (consoleErrors.length > 0) {
            throw new Error(
                `Errores de consola en ${file}: ${consoleErrors.join(' | ')}`,
            );
        }

        const { size } = statSync(path);
        const durationMs = Date.now() - startedAt;
        log(
            `${file} (${captureSpec.width}px, ${captureSpec.theme}) - ${(
                size / 1024
            ).toFixed(1)} KB - ${formatDuration(durationMs)}`,
        );

        return {
            ...captureSpec,
            file,
            path,
            bytes: size,
            durationMs,
        };
    } finally {
        await context.close();
    }
}

function detailHeaderNote() {
    const mainCss = readFileSync(join(ROOT_DIR, 'src', 'styles', 'main.css'), 'utf8');
    return mainCss.includes('layouts/detail-header.css')
        ? '`layouts/detail-header.css` está importado en `main.css` (P1-06.2): las capturas reflejan ese CSS efectivo.'
        : '`layouts/detail-header.css` aún no se importa en `main.css` (P1-06.2 pendiente). Las capturas reflejan el estado **actual**, no el esperado tras esa tarea.';
}

function buildManifest({ commit, browserVersion, playwrightVersion, results, durationMs }) {
    const rows = results
        .map(
            (item) =>
                `| \`${item.file}\` | ${item.view} | ${item.width} | ${item.theme} | ${item.state} | ${(item.bytes / 1024).toFixed(1)} KB |`,
        )
        .join('\n');

    return `# MANIFEST — Línea base visual (${CAPTURE_DATE_LABEL})

> **Nota:** línea base del estado actual (2026-11-12); no es un baseline retroactivo, no atribuye cambios a F1–F3.

| Campo | Valor |
|---|---|
| Commit (HEAD al capturar) | \`${commit}\` |
| Fecha de captura | ${CAPTURE_DATE.toISOString()} |
| Sistema operativo | ${os.type()} ${os.release()} (${os.platform()} ${os.arch()}) |
| Node | ${process.version} |
| Playwright | ${playwrightVersion} |
| Chromium | ${browserVersion} (Chrome for Testing, headless) |
| Build | \`vite build --mode capture\` + \`vite preview --port ${PREVIEW_PORT} --strictPort\` |
| Datos | \`VITE_APP_FIXTURES=1\`; fixtures deterministas de \`src/test/fixtures/appState.js\`; sin Firestore |
| Tema | \`localStorage.theme\` (lo lee \`Header.jsx\`) + \`data-theme\` en \`<html>\` |
| Reloj | \`2026-11-12T13:00:00.000Z\` fijado en el navegador para que \`FullSummaryModal\` sea reproducible |
| Viewport | Ancho de la matriz x ${VIEWPORT_HEIGHT} px; \`deviceScaleFactor: 1\`; \`reducedMotion: reduce\` |
| Script | \`npm run capture\` (\`scripts/capture-baseline.mjs\`) |
| Duración total | ${formatDuration(durationMs)} |
| Capturas | ${results.length} |

## Capturas

| Archivo | Vista | Ancho | Tema | Estado | Tamaño |
|---|---:|---:|---|---|---:|
${rows}

## Notas de alcance

- **Lista/Grid** se captura en el modo **grid** de \`VersionList\`; la tabla lista comparte los mismos breakpoints.
- El hueco **comentarios** se cubre con \`320-modal-info-light-default.png\`: \`CommentsModal.jsx\` no tiene consumidor en la UI actual. Se usa \`DeploymentInfoModal\` (Info Despliegue), accesible y con el contenido de changelog/comentarios. No se deja hueco.
- ${detailHeaderNote()}
- Las capturas se toman con viewport de ${VIEWPORT_HEIGHT} px de alto (no \`fullPage\`) para que las capas fijas de los modales se rendericen sin artefactos. La altura no forma parte de la matriz aprobada.
- Los PNG son evidencia: el script los sobrescribe en cada ejecución, pero no los borra.
`;
}

export async function main(argv = process.argv.slice(2)) {
    const startedAt = Date.now();
    const options = resolveCaptureOptions(argv);

    if (!existsSync(VITE_BIN)) {
        throw new Error(
            `No se encontro Vite en ${VITE_BIN}. Ejecuta "npm ci" antes de capturar.`,
        );
    }

    log('Compilando en modo capture...');
    await runCommand(
        process.execPath,
        [VITE_BIN, 'build', '--mode', 'capture'],
        'vite build --mode capture',
    );

    mkdirSync(options.outDir, { recursive: true });

    const { chromium } = await import('playwright');
    const playwrightVersion = readPlaywrightVersion();
    const commit = readGitCommit();

    let preview = null;
    let browser = null;

    try {
        log(`Levantando vite preview en ${BASE_URL}...`);
        preview = startPreview();
        await waitForServer(BASE_URL, preview);

        browser = await chromium.launch();
        const browserVersion = browser.version();
        log(
            `Chromium ${browserVersion} / Playwright ${playwrightVersion}. ${options.matrix.length} capturas.`,
        );

        const results = [];
        for (const captureSpec of options.matrix) {
            results.push(await captureOne(browser, captureSpec, options.outDir));
        }

        const durationMs = Date.now() - startedAt;
        writeFileSync(
            options.manifestPath,
            buildManifest({
                commit,
                browserVersion,
                playwrightVersion,
                results,
                durationMs,
            }),
            'utf8',
        );

        log(`Manifest: ${options.manifestPath}`);
        log(
            `Listo: ${results.length} capturas en ${options.outDir} (${formatDuration(
                durationMs,
            )}).`,
        );
    } finally {
        if (browser) await browser.close();
        if (preview) await stopProcess(preview);
    }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
    main().catch((error) => {
        console.error(`[capture] ERROR: ${error.message}`);
        if (error.stack) console.error(error.stack);
        process.exitCode = 1;
    });
}
