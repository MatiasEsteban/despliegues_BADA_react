#!/usr/bin/env node
/**
 * audit-selectors.mjs — inventario de clases CSS frente a su consumidor en JS/JSX.
 *
 * Uso: node scripts/audit-selectors.mjs
 * Salida: informe Markdown por stdout + resumen en stderr.
 *
 * Reglas de clasificación:
 *   CONSUMIDA  la clase aparece literal en un contexto de clase (className,
 *              clsx/classNames, classList.*) o en cualquier literal de src (js/jsx).
 *   DINÁMICA   la clase solo puede generarse con un template literal
 *              (`prefijo-${expr}`) o es un estado añadido por JS/render condicional.
 *   MUERTA     ninguna coincidencia en código, index.html ni public/.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STYLES_DIR = path.join(ROOT, 'src', 'styles');
const SRC_DIR = path.join(ROOT, 'src');

const KNOWN_STATES = new Set([
  'active', 'open', 'show', 'modal-show', 'loading', 'selected', 'disabled',
  'hidden', 'error', 'success', 'completed', 'expanded', 'collapsed',
]);

const STATE_PATTERNS = [/^is-/, /^has-/, /^drag-/, /^campo-/, /^filters?-/];

/* ------------------------------------------------------------------ utils */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

function stripCommentsKeepLines(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/* -------------------------------------------------------------------- CSS */

function cssRules(css) {
  const src = stripCommentsKeepLines(css);
  const rules = [];
  const stack = [];
  let buf = '';

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') {
      const rawHead = buf;
      const head = rawHead.trim();
      const parent = stack[stack.length - 1];
      const inheritedIgnore = parent ? parent.ignore : false;
      const keyframesParent = parent && /^@keyframes\b/i.test(parent.head);
      const headStart = i - rawHead.length + (rawHead.length - rawHead.trimStart().length);
      stack.push({
        head,
        headStart,
        ignore: inheritedIgnore || keyframesParent,
        isAtRule: head.startsWith('@'),
      });
      buf = '';
      continue;
    }
    if (ch === '}') {
      const frame = stack.pop();
      if (frame && !frame.isAtRule && !frame.ignore && frame.head) {
        rules.push({ selector: frame.head, index: frame.headStart });
      }
      buf = '';
      continue;
    }
    buf += ch;
  }
  return rules;
}

function splitTopLevel(selector, sep = ',') {
  const parts = [];
  let depth = 0, quote = null, current = '';
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === sep && depth === 0) { parts.push(current); current = ''; continue; }
    current += ch;
  }
  parts.push(current);
  return parts;
}

function classesInSelector(selector) {
  let s = selector.replace(/url\([^)]*\)/gi, ' ');
  s = s.replace(/\[[^\]]*\]/g, ' ');
  s = s.replace(/"[^"]*"|'[^']*'/g, ' ');
  const out = [];
  const re = /\.(-?[_a-zA-Z][\w-]*)/g;
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

/* ------------------------------------------------------------- JS/JSX scan */

function skipString(src, i) {
  const quote = src[i];
  i++;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === quote) return i;
    i++;
  }
  return i;
}

function matchBrace(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') { i = skipString(src, i); continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const DYN_PREFIXES = new Map(); // prefix -> Set("file:line")
const PROP_VALUES = new Set(); // valores de variant/type: posibles sufijos dinámicos

function addDynamicPrefix(prefix, location) {
  if (!prefix || !prefix.endsWith('-')) return;
  if (!DYN_PREFIXES.has(prefix)) DYN_PREFIXES.set(prefix, new Set());
  DYN_PREFIXES.get(prefix).add(location);
}

function addTokens(raw, location, tokens) {
  for (const token of raw.split(/\s+/)) {
    const clean = token.trim();
    if (!clean) continue;
    if (!/^-?[_a-zA-Z][\w-]*$/.test(clean)) continue;
    tokens.add(clean);
  }
}

function analyzeExpression(expr, location, tokens) {
  // Template literals primero (para capturar prefijos), luego strings sueltos.
  const templates = [];
  const withoutTemplates = expr.replace(/`(?:\\.|[^`\\])*`/g, (m) => {
    templates.push(m);
    return ' ';
  });

  for (const template of templates) {
    const content = template.slice(1, -1);
    const parts = content.split(/(\$\{[^}]*\})/g);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('${')) continue;
      const next = parts[i + 1];
      const isPrefixChunk = next && next.startsWith('${') && part.length > 0 && !/\s$/.test(part);
      if (isPrefixChunk) {
        const chunks = part.split(/\s+/);
        const last = chunks[chunks.length - 1];
        addDynamicPrefix(last, location);
        addTokens(chunks.slice(0, -1).join(' '), location, tokens);
      } else {
        addTokens(part, location, tokens);
      }
    }
  }

  const stringRe = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m;
  while ((m = stringRe.exec(withoutTemplates))) addTokens(m[2], location, tokens);
}

function scanCode(file, tokens, locations) {
  const text = fs.readFileSync(file, 'utf8');
  const atLine = lineIndex(text);
  const fileName = rel(file);
  const loc = (idx) => `${fileName}:${atLine(idx)}`;

  // className="..." | className='...' | className={...}
  const classNameRe = /\bclassName\s*=\s*/g;
  let m;
  while ((m = classNameRe.exec(text))) {
    let i = classNameRe.lastIndex;
    while (i < text.length && /\s/.test(text[i])) i++;
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      const end = skipString(text, i);
      const raw = text.slice(i + 1, end);
      const location = loc(i);
      addTokens(raw, location, tokens);
      for (const t of raw.split(/\s+/).filter(Boolean)) {
        if (!locations.has(t)) locations.set(t, []);
        locations.get(t).push(location);
      }
      classNameRe.lastIndex = end + 1;
    } else if (ch === '{') {
      const end = matchBrace(text, i);
      if (end < 0) continue;
      const expr = text.slice(i + 1, end);
      const location = loc(i);
      analyzeExpression(expr, location, tokens);
      // localizar cada token literal dentro del bloque
      for (const tm of expr.matchAll(/(['"])((?:\\.|(?!\1)[^\\])*)\1|`((?:\\.|[^`\\])*)`/g)) {
        const raw = tm[2] ?? tm[3] ?? '';
        const exprLoc = loc(i + 1 + tm.index);
        for (const t of raw.split(/\s+/)) {
          if (!t || !/^-?[_a-zA-Z][\w-]*$/.test(t)) continue;
          if (!locations.has(t)) locations.set(t, []);
          locations.get(t).push(exprLoc);
        }
      }
      classNameRe.lastIndex = end + 1;
    }
  }

  // classList.add('x', ...)
  const classListRe = /\.classList\.(?:add|remove|toggle|contains)\s*\(([^)]*)\)/g;
  while ((m = classListRe.exec(text))) {
    const location = loc(m.index);
    analyzeExpression(m[1], location, tokens);
    for (const sm of m[1].matchAll(/(['"])((?:\\.|(?!\1)[^\\])*)\1/g)) {
      for (const t of sm[2].split(/\s+/).filter(Boolean)) {
        if (!locations.has(t)) locations.set(t, []);
        locations.get(t).push(location);
      }
    }
  }

  // clsx(...) / classNames(...) fuera de className (p. ej. variables)
  const clsxRe = /\b(?:clsx|classNames)\s*\(/g;
  while ((m = clsxRe.exec(text))) {
    const open = text.indexOf('(', m.index);
    let depth = 0, end = -1;
    for (let i = open; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"' || ch === "'" || ch === '`') { i = skipString(text, i); continue; }
      if (ch === '(') depth++;
      else if (ch === ')') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) continue;
    analyzeExpression(text.slice(open + 1, end), loc(open), tokens);
    clsxRe.lastIndex = end + 1;
  }

  // element.className = 'x'
  const assignRe = /\.className\s*=\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
  while ((m = assignRe.exec(text))) {
    const location = loc(m.index);
    addTokens(m[2], location, tokens);
    for (const t of m[2].split(/\s+/).filter(Boolean)) {
      if (!locations.has(t)) locations.set(t, []);
      locations.get(t).push(location);
    }
  }

  // Valores de variant/type: candidatos a sufijo de `btn-${variant}`, `modal-${type}`, etc.
  // Incluye asignaciones (=, :), defaults de parámetro y comparaciones (===, !==).
  const propRe = /\b(?:variant|type)\s*(?:===|!==|==|!=|=|:)\s*['"]([\w-]+)['"]/g;
  while ((m = propRe.exec(text))) PROP_VALUES.add(m[1]);

  return text;
}

/* ------------------------------------------------------------------- main */

const cssFiles = walk(STYLES_DIR).filter((f) => f.endsWith('.css')).sort();
const codeFiles = walk(SRC_DIR).filter(
  (f) => /\.(jsx?|js)$/.test(f) && !f.startsWith(STYLES_DIR)
).sort();

const cssClasses = new Map(); // name -> [{file,line,selector}]
for (const file of cssFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const atLine = lineIndex(text);
  for (const rule of cssRules(text)) {
    const line = atLine(rule.index);
    for (const part of splitTopLevel(rule.selector)) {
      for (const name of classesInSelector(part)) {
        if (!cssClasses.has(name)) cssClasses.set(name, []);
        cssClasses.get(name).push({ file: rel(file), line, selector: part.trim() });
      }
    }
  }
}

const usedTokens = new Set();
const tokenLocations = new Map();
const codeTexts = new Map();

for (const file of codeFiles) {
  const text = scanCode(file, usedTokens, tokenLocations);
  codeTexts.set(rel(file), stripJsComments(text));
}

function stripJsComments(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = skipString(text, i);
      out += text.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += text.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      let end = text.indexOf('\n', i);
      if (end < 0) end = text.length;
      out += ' '.repeat(end - i);
      i = end;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

// HTML y public/ como posibles fuentes de clases.
const htmlTexts = [];
const indexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(indexPath)) htmlTexts.push({ file: 'index.html', text: fs.readFileSync(indexPath, 'utf8') });
const publicDir = path.join(ROOT, 'public');
if (fs.existsSync(publicDir)) {
  for (const file of walk(publicDir)) {
    if (!/\.(html|svg)$/i.test(file)) continue;
    htmlTexts.push({ file: rel(file), text: fs.readFileSync(file, 'utf8') });
  }
}

function findTokenInCode(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${escaped}([^A-Za-z0-9_-]|$)`);
  for (const [file, text] of codeTexts) {
    const m = re.exec(text);
    if (m) {
      const atLine = lineIndex(text);
      return `${file}:${atLine(m.index)}`;
    }
  }
  for (const { file, text } of htmlTexts) {
    if (text.includes(token)) return file;
  }
  return null;
}

const consumed = [];
const dynamic = [];
const dead = [];
const prefixes = [...DYN_PREFIXES.keys()].sort((a, b) => b.length - a.length);

function destinationFor(file) {
  if (file.startsWith('src/styles/base/') || file.startsWith('src/styles/layouts/')) return 'P1-10.2 base/layouts';
  if (file.startsWith('src/styles/components/modals/') || file.startsWith('src/styles/components/changelog/')) return 'P1-10.4 modales/changelog';
  return 'P1-10.3 components';
}

for (const [name, occurrences] of [...cssClasses].sort(([a], [b]) => a.localeCompare(b))) {
  if (usedTokens.has(name)) {
    consumed.push({ name, occurrences, token: tokenLocations.get(name)?.[0] ?? null });
    continue;
  }
  const prefix = prefixes.find((p) => name.startsWith(p));
  if (prefix) {
    const suffix = name.slice(prefix.length);
    const canBeGenerated = prefix.endsWith('--') || PROP_VALUES.has(suffix);
    if (canBeGenerated) {
      dynamic.push({
        name,
        occurrences,
        reason: `template literal \`${prefix}\${expr}\``,
        evidence: [...DYN_PREFIXES.get(prefix)][0],
        suffix,
      });
      continue;
    }
  }
  const indirect = findTokenInCode(name);
  if (indirect) {
    consumed.push({ name, occurrences, token: indirect, indirect: true });
    continue;
  }
  const looksState = KNOWN_STATES.has(name) || STATE_PATTERNS.some((re) => re.test(name));
  if (looksState) {
    dynamic.push({ name, occurrences, reason: 'estado añadido dinámicamente', evidence: 'sin literal en src' });
    continue;
  }
  dead.push({ name, occurrences, destination: destinationFor(occurrences[0].file) });
}

// Clases usadas en JSX que no tienen regla CSS.
const orphanTokens = [...usedTokens]
  .filter((t) => !cssClasses.has(t))
  .sort();

// Severidad de clases huérfanas: por defecto cosmética; se marca lo que
// oculta una funcionalidad declarada en el JSX.
const ORPHAN_SEVERITY = new Map([
  ['campo-cdu', 'posible bug'],
  ['campo-version-miro', 'posible bug'],
  ['fade-in', 'posible bug'],
  ['legend-color', 'posible bug'],
  ['modal-evolution', 'posible bug'],
]);
const severityFor = (token) => ORPHAN_SEVERITY.get(token) ?? 'cosmética';

/* ------------------------------------------------------------------ output */

const md = [];
md.push('### Resumen');
md.push('');
md.push('| Métrica | Valor |');
md.push('|---|---|');
md.push(`| Archivos CSS analizados | ${cssFiles.length} |`);
md.push(`| Archivos JS/JSX analizados | ${codeFiles.length} |`);
md.push(`| Clases CSS únicas | ${cssClasses.size} |`);
md.push(`| Clases CSS consumidas | ${consumed.length} |`);
md.push(`| Clases CSS dinámicas | ${dynamic.length} |`);
md.push(`| Clases CSS muertas | ${dead.length} |`);
md.push(`| Clases en JSX sin regla CSS | ${orphanTokens.length} |`);
md.push('');
md.push('### Prefijos dinámicos detectados');
md.push('');
md.push('| Prefijo | Evidencia JSX |');
md.push('|---|---|');
for (const prefix of prefixes) md.push(`| \`${prefix}\` | ${[...DYN_PREFIXES.get(prefix)].join(', ')} |`);
md.push('');
md.push(`### Clases muertas (${dead.length})`);
md.push('');
md.push('| Clase | Selector | Archivo:línea | Destino |');
md.push('|---|---|---|---|');
const destinationOrder = ['P1-10.2 base/layouts', 'P1-10.3 components', 'P1-10.4 modales/changelog'];
for (const destination of destinationOrder) {
  for (const item of dead.filter((d) => d.destination === destination)) {
    const occ = item.occurrences[0];
    const extra = item.occurrences.length > 1 ? ` (+${item.occurrences.length - 1} reglas)` : '';
    md.push(`| \`${item.name}\` | \`${occ.selector}\` | ${occ.file}:${occ.line}${extra} | ${destination} |`);
  }
}
md.push('');
md.push('### Clases dinámicas');
md.push('');
md.push('| Clase | Motivo | Evidencia |');
md.push('|---|---|---|');
for (const item of dynamic) md.push(`| \`${item.name}\` | ${item.reason} | ${item.evidence} |`);
md.push('');
md.push('### Clases usadas en JSX sin regla CSS');
md.push('');
md.push('| Clase | Evidencia | Severidad |');
md.push('|---|---|---|');
for (const token of orphanTokens) {
  md.push(`| \`${token}\` | ${tokenLocations.get(token)?.[0] ?? '—'} | ${severityFor(token)} |`);
}

process.stdout.write(md.join('\n') + '\n');

process.stderr.write(
  `CSS clases: ${cssClasses.size} | consumidas: ${consumed.length} | dinámicas: ${dynamic.length} | muertas: ${dead.length} | JSX sin regla: ${orphanTokens.length}\n`
);
