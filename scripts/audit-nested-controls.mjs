#!/usr/bin/env node
/**
 * audit-nested-controls.mjs — R-A11Y-02 / P4-04.6.
 *
 * Comprueba en `src/components/**\/*.jsx`:
 *   1. `<button>` dentro de `<button>`.
 *   2. `role="button"` con descendientes `<button>`.
 *   3. `onClick` en `div`/`tr` que además declaren `tabIndex` sin un rol
 *      interactivo explícito (un `role="radio"` con roving tabindex es el
 *      control ARIA que exige P4-04.4; un div sin rol sería un control falso).
 *
 * Los tags se extraen con un escáner que respeta comillas y llaves, por lo que
 * `onClick={() => ...}` (con `>`) no corta el tag antes de tiempo.
 *
 * Uso: node scripts/audit-nested-controls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(COMPONENTS_DIR)
  .filter((file) => file.endsWith('.jsx'))
  .sort();

const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** Devuelve los tags de apertura `<tagName ...>` respetando strings y `{}`. */
function openingTags(text, tagName) {
  const tags = [];
  const re = new RegExp(`<${tagName}(?=[\\s/>])`, 'g');
  let match;
  while ((match = re.exec(text))) {
    let i = match.index + 1 + tagName.length;
    let braceDepth = 0;
    let quote = null;
    for (; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (ch === '\\') i += 1;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
        continue;
      }
      if (ch === '{') {
        braceDepth += 1;
        continue;
      }
      if (ch === '}') {
        braceDepth -= 1;
        continue;
      }
      if (ch === '>' && braceDepth === 0) break;
    }
    if (i < text.length) tags.push({ start: match.index, end: i + 1, raw: text.slice(match.index, i + 1) });
  }
  return tags;
}

function violationsInFile(text) {
  const atLine = lineIndex(text);
  const found = [];

  // 1. Botones anidados.
  let depth = 0;
  for (const token of text.matchAll(/<button\b|<\/button\s*>/g)) {
    if (token[0].startsWith('</')) {
      depth = Math.max(0, depth - 1);
    } else {
      if (depth > 0) {
        found.push({ line: atLine(token.index), rule: 'botón dentro de botón' });
      }
      depth += 1;
    }
  }

  // 2. role="button" con descendientes <button>.
  for (const match of text.matchAll(/role\s*=\s*["']button["']/g)) {
    const before = text.lastIndexOf('<', match.index);
    if (before < 0) continue;
    const tagMatch = /^<([A-Za-z][\w:-]*)/.exec(text.slice(before));
    if (!tagMatch) continue;
    const tagName = tagMatch[1];
    const opening = openingTags(text, tagName).find((tag) => tag.start === before);
    if (!opening) continue;

    const tokenRe = new RegExp(`<${tagName}(?=[\\s/>])|</${tagName}\\s*>`, 'g');
    tokenRe.lastIndex = opening.end;
    let localDepth = 1;
    let contentEnd = text.length;
    let token;
    while ((token = tokenRe.exec(text))) {
      if (token[0].startsWith('</')) {
        localDepth -= 1;
        if (localDepth === 0) {
          contentEnd = token.index;
          break;
        }
      } else {
        localDepth += 1;
      }
    }

    if (/<button\b/.test(text.slice(opening.end, contentEnd))) {
      found.push({ line: atLine(match.index), rule: 'role="button" con <button> dentro' });
    }
  }

  // 3. onClick + tabIndex en div/tr sin rol interactivo explícito.
  const INTERACTIVE_ROLES = new Set([
    'button', 'link', 'radio', 'checkbox', 'switch', 'option', 'tab', 'menuitem',
  ]);
  for (const tagName of ['div', 'tr']) {
    for (const tag of openingTags(text, tagName)) {
      if (!/\bonClick\s*=/.test(tag.raw) || !/\btabIndex\s*=/.test(tag.raw)) continue;
      const roleMatch = /\brole\s*=\s*["']([^"']+)["']/.exec(tag.raw);
      const role = roleMatch ? roleMatch[1].trim() : null;
      if (role && INTERACTIVE_ROLES.has(role)) continue;
      found.push({ line: atLine(tag.start), rule: `<${tagName} onClick + tabIndex sin rol interactivo>` });
    }
  }

  return found;
}

const violations = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const violation of violationsInFile(text)) {
    violations.push({ file: rel(file), ...violation });
  }
}

for (const violation of violations) {
  console.log(`${violation.file}:${violation.line} — ${violation.rule}`);
}

console.log(
  `Controles anidados: ${violations.length} | archivos: ${files.length} | reglas: botón/botón, role=button, div|tr onClick+tabIndex`,
);

process.exit(violations.length === 0 ? 0 : 1);
