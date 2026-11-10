#!/usr/bin/env node
/**
 * audit-responsive.mjs — Auditoría estática de responsive (R-RESP-01 / R-RESP-03 / R-A11Y-08).
 *
 * NO mide en navegador: detecta patrones de CSS que causan overflow horizontal
 * o que impiden el reflow a 320/375/480 px. Pensado para P3-01, P3-07 y F6.
 *
 * Uso:
 *   node scripts/audit-responsive.mjs            # tabla Markdown a stdout
 *   node scripts/audit-responsive.mjs --json     # salida JSON (para F6)
 *   node scripts/audit-responsive.mjs --fail-on-alta  # exit 1 si hay severidad alta
 *
 * Heurísticas (ver docs/audits/2026-11-10-responsive.md):
 *   1. width/min-width en px: width >= 320 y min-width >= 200 (max-width se ignora).
 *   2. white-space: nowrap: media si no hay overflow+ellipsis en la misma regla.
 *   3. display:flex con gap y sin flex-wrap: media en toolbar/header/tabs/actions.
 *   4. grid-template-columns con >= 3 pistas fijas (sin minmax/auto-fit): alta con 4+.
 *   5. overflow: hidden en contenedores de texto (nowrap/ellipsis o *-container).
 *   6. Cobertura de @media por archivo (900/768/600/480).
 *   7. width/height numéricos en <svg>/<img>/<canvas> de src/components.
 */
import fs from 'node:fs';
import path from 'node:path';

const CSS_ROOT = 'src/styles';
const JSX_ROOT = 'src/components';
const BP = [900, 768, 600, 480];
const FLEX_PRIORITY = /(toolbar|header|tabs?|actions?|footer|meta|controls?|filters?|pagination|breadcrumb)/i;
const TEXT_CONTAINER = /(container|wrapper|cell|text|title|message|name|label|header|row|item|line|value)/i;

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const failOnAlta = args.has('--fail-on-alta');

/* ------------------------------------------------------------------ utils */

function walk(dir, filter, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, out);
    else if (filter(entry.name)) out.push(full.replace(/\\/g, '/'));
  }
  return out;
}

/** Reemplaza comentarios por espacios conservando los saltos de línea. */
function stripComments(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      i += 2;
      out += '  ';
      continue;
    }
    if (text[i] === '"' || text[i] === "'") {
      const quote = text[i];
      out += text[i++];
      while (i < text.length && text[i] !== quote) {
        out += text[i] === '\n' ? '\n' : text[i];
        if (text[i] === '\\') {
          i++;
          if (i < text.length) out += text[i] === '\n' ? '\n' : text[i];
        }
        i++;
      }
      if (i < text.length) out += text[i++];
      continue;
    }
    out += text[i++];
  }
  return out;
}

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (pos) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/* -------------------------------------------------------------- CSS parser */

/**
 * Devuelve { rules, media }.
 * rule = { selector, line, media, decls: [{ prop, value, line }] }
 * media = [{ query, line }]
 */
function parseCss(raw) {
  const text = stripComments(raw);
  const lineAt = lineIndex(text);
  const rules = [];
  const media = [];
  const mediaStack = [];
  let prelude = '';
  let preludeStart = 0;
  let i = 0;

  const readBlock = (from) => {
    let depth = 1;
    let j = from;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    return { body: text.slice(from, j - 1), end: j };
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === '{') {
      const selector = prelude.trim().replace(/\s+/g, ' ');
      const selectorLine = lineAt(preludeStart);

      if (/^@media\b/i.test(selector)) {
        mediaStack.push(selector);
        media.push({ query: selector.replace(/^@media\s*/i, ''), line: selectorLine });
        prelude = '';
        i++;
        preludeStart = i;
        continue;
      }

      if (selector.startsWith('@')) {
        // @keyframes, @font-face, @supports: se saltan completos.
        const { end } = readBlock(i + 1);
        i = end;
        prelude = '';
        preludeStart = i;
        continue;
      }

      const { body, end } = readBlock(i + 1);
      const bodyLine = lineAt(i + 1);
      const decls = [];
      let cursor = 0;
      for (const rawLine of body.split('\n')) {
        const m = rawLine.match(/^\s*([a-z-]+)\s*:\s*([^;{}]+);/i);
        if (m) decls.push({ prop: m[1].toLowerCase(), value: m[2].trim(), line: bodyLine + cursor });
        cursor++;
      }
      rules.push({ selector, line: selectorLine, media: mediaStack.at(-1) ?? null, decls });
      i = end;
      prelude = '';
      preludeStart = i;
      continue;
    }

    if (ch === '}') {
      if (mediaStack.length) mediaStack.pop();
      prelude = '';
      i++;
      preludeStart = i;
      continue;
    }

    if (ch === ';') {
      prelude = '';
      i++;
      preludeStart = i;
      continue;
    }

    if (!/\s/.test(ch) && prelude.trim() === '') preludeStart = i;
    prelude += ch;
    i++;
  }

  return { rules, media };
}

/* -------------------------------------------------------- pattern detectors */

const px = (value) => {
  const m = value.match(/^(-?\d+(?:\.\d+)?)px\b/i);
  return m ? Number(m[1]) : null;
};

function detectFixedWidths(rule) {
  const out = [];
  const capped = rule.decls.some((d) => d.prop === 'max-width' && /(%|vw|calc\()/.test(d.value));
  for (const decl of rule.decls) {
    const value = decl.value;
    if (/var\(|calc\(|%|vw|vh|ch|em\b|rem\b/.test(value) && !px(value)) continue;
    const n = px(value);
    if (n === null) continue;

    if (decl.prop === 'width' && n >= 320) {
      out.push({
        line: decl.line, selector: rule.selector, pattern: 'anchura fija',
        detail: `width: ${value}${capped ? ' (limitada por max-width)' : ''}`,
        severity: capped ? 'baja' : 'alta',
      });
    }
    if (decl.prop === 'min-width' && n >= 200) {
      out.push({
        line: decl.line, selector: rule.selector, pattern: 'anchura mínima fija',
        detail: `min-width: ${value}`, severity: n >= 320 ? 'alta' : 'media',
      });
    }
  }
  return out;
}

function detectNowrap(rule) {
  const nowrap = rule.decls.find((d) => d.prop === 'white-space' && /nowrap/i.test(d.value));
  if (!nowrap) return [];
  const hasOverflow = rule.decls.some((d) => d.prop === 'overflow' && /hidden/i.test(d.value));
  const hasEllipsis = rule.decls.some((d) => d.prop === 'text-overflow' && /ellipsis/i.test(d.value));
  const mitigated = hasOverflow && hasEllipsis;
  return [{
    line: nowrap.line, selector: rule.selector, pattern: 'white-space: nowrap',
    detail: mitigated ? 'con overflow+ellipsis (recorta, no desborda)' : 'texto variable sin ellipsis',
    severity: mitigated ? 'baja' : 'media',
  }];
}

function detectFlex(rule) {
  const display = rule.decls.find((d) => d.prop === 'display' && /^flex$/i.test(d.value));
  if (!display) return [];
  // Solo la fila puede desbordar horizontalmente; las columnas no.
  const direction = rule.decls.find((d) => d.prop === 'flex-direction');
  if (direction && /column/i.test(direction.value)) return [];
  const gap = rule.decls.find((d) => d.prop === 'gap' && !/^0/.test(d.value));
  if (!gap) return [];
  const wrap = rule.decls.find((d) => d.prop === 'flex-wrap');
  if (wrap && /wrap/i.test(wrap.value) && !/nowrap/i.test(wrap.value)) return [];
  const priority = FLEX_PRIORITY.test(rule.selector);
  const shrinkLocked = rule.decls.some((d) => d.prop === 'flex-shrink' && /^0/.test(d.value));
  return [{
    line: display.line, selector: rule.selector, pattern: 'flex sin flex-wrap',
    detail: `gap: ${gap.value}${shrinkLocked ? ' + hijo flex-shrink:0' : ''}`,
    severity: priority ? 'media' : 'baja',
  }];
}

function countGridTracks(value) {
  const repeat = value.match(/repeat\(\s*(\d+)\s*,([^)]*(?:\([^)]*\)[^)]*)*)\)/i);
  if (/auto-fit|auto-fill/i.test(value)) return { tracks: 0, rigid: false, detail: 'auto-fit/auto-fill' };
  if (repeat) {
    const n = Number(repeat[1]);
    const inner = repeat[2];
    const rigid = !/minmax|auto|%/i.test(inner);
    return { tracks: n, rigid, detail: `repeat(${n}, ${inner.trim()})` };
  }
  const tracks = value.split(/\s+/).filter(Boolean);
  const rigid = !tracks.some((t) => /minmax|auto|%/i.test(t));
  return { tracks: tracks.length, rigid, detail: value };
}

function detectGrid(rule) {
  const gtc = rule.decls.find((d) => d.prop === 'grid-template-columns');
  if (!gtc) return [];
  const { tracks, rigid, detail } = countGridTracks(gtc.value);
  if (!rigid || tracks < 3) return [];
  return [{
    line: gtc.line, selector: rule.selector, pattern: 'grid rígido',
    detail: `${tracks} columnas — ${detail}`,
    severity: tracks >= 4 ? 'alta' : 'media',
  }];
}

function detectOverflowHidden(rule) {
  const oh = rule.decls.find((d) => d.prop === 'overflow' && /hidden/i.test(d.value));
  if (!oh) return [];
  const nowrap = rule.decls.some((d) => d.prop === 'white-space' && /nowrap/i.test(d.value));
  const ellipsis = rule.decls.some((d) => d.prop === 'text-overflow' && /ellipsis/i.test(d.value));
  if (!nowrap && !ellipsis && !TEXT_CONTAINER.test(rule.selector)) return [];
  return [{
    line: oh.line, selector: rule.selector, pattern: 'overflow: hidden',
    detail: nowrap || ellipsis ? 'texto con nowrap/ellipsis (recorte silencioso)' : 'contenedor de texto',
    severity: ellipsis ? 'baja' : nowrap ? 'media' : 'baja',
  }];
}

/* ------------------------------------------------------------------- JSX */

const JSX_TAG = /<(svg|img|canvas)\b([\s\S]*?)\/?>/gi;

function detectJsxSizes(file, raw) {
  const out = [];
  const lineAt = lineIndex(raw);
  for (const match of raw.matchAll(JSX_TAG)) {
    const [, tag, attrs] = match;
    const width = attrs.match(/\bwidth\s*=\s*["']?(\d+)(?![\w.])/i);
    const height = attrs.match(/\bheight\s*=\s*["']?(\d+)(?![\w.])/i);
    if (!width && !height) continue;
    const w = width ? Number(width[1]) : null;
    const h = height ? Number(height[1]) : null;
    const viewBox = /\bviewBox\s*=/.test(attrs);
    const big = Math.max(w ?? 0, h ?? 0) >= 320;
    out.push({
      line: lineAt(match.index), selector: `<${tag}>`, pattern: 'tamaño fijo en JSX',
      detail: `width=${w ?? '—'} height=${h ?? '—'}${viewBox ? ' + viewBox' : ' sin viewBox'}`,
      severity: big ? 'alta' : 'baja',
      file,
      jsx: true,
    });
  }
  return out;
}

/* ------------------------------------------------------------------- main */

const cssFiles = walk(CSS_ROOT, (n) => n.endsWith('.css'));
const findingsByFile = new Map();
const mediaByFile = new Map();
const breakpointsByFile = new Map();
let totalRules = 0;

for (const file of cssFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { rules, media } = parseCss(raw);
  totalRules += rules.length;
  mediaByFile.set(file, media);

  const bps = new Set();
  for (const m of media) {
    for (const bp of BP) {
      if (new RegExp(`(?:max|min)-width\\s*:\\s*${bp}px`).test(m.query)) bps.add(bp);
    }
  }
  breakpointsByFile.set(file, bps);

  const findings = [];
  for (const rule of rules) {
    findings.push(
      ...detectFixedWidths(rule),
      ...detectNowrap(rule),
      ...detectFlex(rule),
      ...detectGrid(rule),
      ...detectOverflowHidden(rule),
    );
  }
  if (findings.length) findingsByFile.set(file, findings);
}

for (const file of walk(JSX_ROOT, (n) => /\.(jsx|js)$/.test(n))) {
  const findings = detectJsxSizes(file, fs.readFileSync(file, 'utf8'));
  if (findings.length) findingsByFile.set(file, findings);
}

const allFindings = [...findingsByFile.values()].flat();
const count = (sev) => allFindings.filter((f) => f.severity === sev).length;
const noMedia = cssFiles.filter((f) => (mediaByFile.get(f) ?? []).length === 0);
// `base/*` y `main.css` no son hojas de layout: se excluyen del recuento de carencias.
const noMediaLayout = noMedia.filter((f) => !/\/base\/|main\.css$/.test(f));
const noMediaChangelogModals = noMediaLayout.filter((f) => /\/(changelog|modals)\//.test(f));

/* ----------------------------------------------------------------- output */

if (asJson) {
  const payload = {
    generatedAt: new Date().toISOString(),
    cssFiles: cssFiles.length,
    rules: totalRules,
    findings: Object.fromEntries(
      [...findingsByFile.entries()].map(([file, list]) => [file, list]),
    ),
    mediaQueries: Object.fromEntries([...mediaByFile.entries()]),
    breakpoints: Object.fromEntries(
      [...breakpointsByFile.entries()].map(([file, set]) => [file, [...set].sort((a, b) => b - a)]),
    ),
    filesWithoutMediaQueries: noMedia,
    filesWithoutMediaQueriesLayout: noMediaLayout,
    changelogModalsWithoutMediaQueries: noMediaChangelogModals,
    summary: { alta: count('alta'), media: count('media'), baja: count('baja'), total: allFindings.length },
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  const lines = [];
  lines.push('# Auditoría responsive estática (R-RESP-01 / R-RESP-03 / R-A11Y-08)');
  lines.push('');
  lines.push(`- Archivos CSS: **${cssFiles.length}** · reglas: **${totalRules}**`);
  lines.push(`- Hallazgos: **${allFindings.length}** (alta ${count('alta')} · media ${count('media')} · baja ${count('baja')})`);
  lines.push(`- Archivos sin @media de layout: **${noMediaLayout.length}** (\`changelog/*\` y \`modals/*\`: ${noMediaChangelogModals.length})`);
  lines.push('');
  lines.push('| Archivo | Línea | Selector | Patrón | Detalle | Severidad |');
  lines.push('|---|---:|---|---|---|---|');

  for (const [file, list] of [...findingsByFile.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const f of list.sort((a, b) => a.line - b.line)) {
      lines.push(`| \`${file}\` | ${f.line} | \`${f.selector}\` | ${f.pattern} | ${f.detail} | ${f.severity} |`);
    }
  }

  lines.push('');
  lines.push('## Cobertura de breakpoints');
  lines.push('');
  lines.push('| Archivo | 900 | 768 | 600 | 480 | Otras @media |');
  lines.push('|---|:--:|:--:|:--:|:--:|---|---|');
  for (const file of cssFiles) {
    const bps = breakpointsByFile.get(file);
    const others = (mediaByFile.get(file) ?? [])
      .filter((m) => !BP.some((bp) => new RegExp(`(?:max|min)-width\\s*:\\s*${bp}px`).test(m.query)))
      .map((m) => m.query.replace(/@media\s*/i, ''));
    lines.push(
      `| \`${file}\` | ${[900, 768, 600, 480].map((bp) => (bps.has(bp) ? '✔' : '—')).join(' | ')} | ${others.join('; ') || '—'} |`,
    );
  }

  lines.push('');
  lines.push('## Archivos sin @media');
  lines.push('');
  lines.push('Sin media queries (hojas de layout):');
  lines.push('');
  lines.push(noMediaLayout.map((f) => `- \`${f}\``).join('\n') || '- (ninguno)');
  lines.push('');
  lines.push('Sin media queries (excluidas por no ser de layout: `base/*`, `main.css`):');
  lines.push('');
  lines.push(
    cssFiles
      .filter((f) => noMedia.includes(f) && !noMediaLayout.includes(f))
      .map((f) => `- \`${f}\``)
      .join('\n') || '- (ninguno)',
  );

  lines.push('');
  lines.push('## Tamaños fijos en JSX');
  lines.push('');
  const jsxFindings = [...findingsByFile.entries()].filter(([file]) => file.startsWith(JSX_ROOT));
  if (jsxFindings.length === 0) lines.push('- Sin `width`/`height` numéricos en `<svg>`, `<img>` o `<canvas>`.');
  for (const [file, list] of jsxFindings) {
    for (const f of list) lines.push(`- \`${file}:${f.line}\` — \`${f.selector}\` ${f.detail} (${f.severity})`);
  }

  process.stdout.write(`${lines.join('\n')}\n`);
}

if (failOnAlta && count('alta') > 0) process.exitCode = 1;
