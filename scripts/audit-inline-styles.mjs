#!/usr/bin/env node
/**
 * audit-inline-styles.mjs — Inventario reproducible de estilos inline (R-DS-03 / F2).
 *
 * Recorre src/components y localiza cada `style={{ ... }}` (JSX) o `style={{...}}`.
 * No modifica archivos. Salida:
 *   - stderr: resumen (usos, archivos) y conteo por tipo heurístico.
 *   - stdout: tabla Markdown con # | archivo:línea | fragmento | tipo sugerido.
 *
 * Uso: node scripts/audit-inline-styles.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src/components';
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const MAX_SNIPPET = 80;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/** Extrae el objeto `{...}` de `style={{` respetando strings y template literals. */
function extractStyleBlock(text, start) {
  // start apunta al primer `{` de `{{`.
  let i = start;
  let depth = 0;
  let state = 'normal'; // normal | single | double | template
  const templateExprDepths = [];

  for (; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (state === 'single') {
      if (ch === '\\') i++;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (ch === '\\') i++;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (ch === '\\') i++;
      else if (ch === '`') state = 'normal';
      else if (ch === '$' && next === '{') {
        templateExprDepths.push(1);
        i++;
        state = 'template-expr';
      }
      continue;
    }
    if (state === 'template-expr') {
      if (ch === '{') templateExprDepths[templateExprDepths.length - 1]++;
      else if (ch === '}') {
        templateExprDepths[templateExprDepths.length - 1]--;
        if (templateExprDepths[templateExprDepths.length - 1] === 0) {
          templateExprDepths.pop();
          state = 'template';
        }
      } else if (ch === "'") state = 'single';
      else if (ch === '"') state = 'double';
      else if (ch === '`') state = 'template';
      continue;
    }

    // estado normal
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

function normalize(snippet) {
  return snippet.replace(/\s+/g, ' ').trim();
}

function truncate(snippet) {
  return snippet.length <= MAX_SNIPPET ? snippet : `${snippet.slice(0, MAX_SNIPPET - 1)}…`;
}

function classify(snippet) {
  // VAR-CSS: declara custom properties (`--x: ...`), no solo las consume.
  if (/(?:^|[,{\s])['"]?--[\w-]+['"]?\s*:/.test(snippet)) return 'VAR-CSS';
  // COLOR: paleta elegida en runtime (`colors[key]`, `statusColors[status]`…).
  // Los colores fijos (hex, var(--token), rgba) son ESTÁTICO: van a una clase.
  if (/Colors\[|colors\[/.test(snippet)) return 'COLOR';
  // GEOMETRÍA: medidas/proporciones calculadas en runtime o layout condicional.
  if (/\$\{/.test(snippet)) return 'GEOMETRÍA';
  if (/expandedChart\s*===|showIcon\s*\?/.test(snippet)) return 'GEOMETRÍA';
  if (/Gradient/.test(snippet)) return 'GEOMETRÍA';
  return 'ESTÁTICO';
}

const files = walk(ROOT).sort((a, b) => a.localeCompare(b));
const rows = [];
const perFile = new Map();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let from = 0;
  for (;;) {
    const idx = text.indexOf('style={{', from);
    if (idx === -1) break;
    const block = extractStyleBlock(text, idx + 'style='.length);
    const normalized = normalize(block);
    const snippet = truncate(normalized);
    const line = text.slice(0, idx).split('\n').length;
    const rel = file.replace(/\\/g, '/');
    const type = classify(normalized);
    rows.push({ file: rel, line, snippet, type });
    perFile.set(rel, (perFile.get(rel) || 0) + 1);
    from = idx + 'style={{'.length;
  }
}

const byType = rows.reduce((acc, row) => {
  acc[row.type] = (acc[row.type] || 0) + 1;
  return acc;
}, {});

console.log('| # | Archivo:línea | Fragmento de estilo | Tipo sugerido |');
console.log('|---:|---|---|---|');
const codeCell = (value) =>
  value.includes('`')
    ? `<code>${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`
    : `\`${value.replace(/\|/g, '\\|')}\``;

rows.forEach((row, i) => {
  console.log(`| ${i + 1} | \`${row.file}:${row.line}\` | ${codeCell(row.snippet)} | ${row.type} |`);
});

console.log('\n| Archivo | Usos |');
console.log('|---|---:|');
for (const [file, count] of [...perFile.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  console.log(`| \`${file}\` | ${count} |`);
}

console.error(
  `Inline styles: ${rows.length} usos en ${perFile.size} archivos | ` +
  `ESTÁTICO: ${byType.ESTÁTICO || 0} | GEOMETRÍA: ${byType['GEOMETRÍA'] || 0} | ` +
  `COLOR: ${byType.COLOR || 0} | VAR-CSS: ${byType['VAR-CSS'] || 0}`
);
