# Tablero de tareas — SPEC-001

| Campo | Valor |
|---|---|
| Spec | [`SPEC-001-endurecimiento-diseno-accesibilidad.md`](SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Plan | [`../plan.md`](../plan.md) |
| Fecha de auditoría | 2026-11-10 |
| Estado global | F0 parcial · F1 casi cerrada · F2–F7 pendientes |
| Rama | `feat/spec-001-design-hardening` |

Este archivo divide cada tarea del plan en subtareas de **una sola sesión de revisión**. Una subtarea se cierra únicamente con evidencia reproducible. El plan conserva la visión por fases; este tablero es la unidad de ejecución.

---

## 1. Reglas de ejecución

1. **Una subtarea = un cambio acotado.** No se mezclan fases ni archivos no listados.
2. **Evidencia obligatoria.** Para cerrar: comando ejecutado, archivo modificado, captura o test. Sin evidencia, la tarea queda `◐`.
3. **Paleta congelada.** Prohibido introducir hex nuevos. Solo tokens existentes.
4. **Sin baseline no hay cierre visual.** Las tareas marcadas `⛔ P0-04` no se cierran hasta tener capturas.
5. **Checkpoint por lote.** Al final de cada lote: build, greps de control, revisión visual y actualización del estado.
6. **Un commit por lote revisado.** Mensaje: `spec-001(<ID>): <resumen>`.

### Leyenda

| Símbolo | Estado |
|---|---|
| ☐ | Pendiente |
| ◐ | En curso / evidencia incompleta |
| ✅ | Hecha y verificada |
| ⛔ | Bloqueada |
| ➖ | Cancelada |

| Esfuerzo | Rango |
|---|---|
| `XS` | ≤ 30 min |
| `S` | ≤ 2 h |
| `M` | ≤ 1 día |

### Definición de hecho de una subtarea

- [ ] Cambio limitado a los archivos indicados.
- [ ] `npm run build` pasa (o se aporta evidencia de `dist/` si el entorno no está restaurado).
- [ ] Greps de control sin regresiones (`style={{`, hex, variables indefinidas).
- [ ] Revisión visual contra baseline si la tarea cambia píxeles.
- [ ] Evidencia anotada en este archivo y en `plan.md` si cambia el estado de fase.

---

## 2. Auditoría 2026-11-10 — resultado

### 2.1 Tareas cerradas: veredicto

| Tarea | Veredicto | Evidencia verificada | Observación |
|---|---|---|---|
| P0-01 | ✅ | `SPEC_TEMPLATE.md` en raíz, 117 líneas | Correcto |
| P0-02 | ✅ | Spec `Aprobada`; Anexo C con 5 decisiones | Correcto |
| P0-03 | ✅ | Rama `feat/spec-001-design-hardening` activa | Sin commits propios: todo el trabajo está en working tree |
| P0-04 | ◐ | Protocolo en `docs/audits/baseline-2026-11-08/README.md` | Sin imágenes ni `MANIFEST.md`; matriz y total de 36 no cuadran |
| P0-05 | ✅ | Baseline con métricas reproducibles | 79 inline, 209 hex, 85 únicos, 6 hojas no alcanzables, 4+1 variables |
| P1-01 | ✅ | Inventario: 85 únicos, 11 exclusivos de huérfanos, 74 supervivientes | Cifras reproducidas |
| P1-02 | ✅ | 74 tokens `--palette-*`, 74 valores únicos | Sin colores nuevos |
| P1-03 | ✅ | 35 tokens semánticos, 0 consumidores externos | Correcto |
| P1-04 | ✅ | 35 tokens de escala; `--radius-md: 8px` | Correcto |
| P1-05 | ✅ | 144 ocurrencias resueltas, 0 diferencias contra `HEAD`; 0 hex fuera de `variables.css` | Round-trip reproducido |
| P1-06 | ☐ | `main.css` no importa `detail-header.css` | Alcance ya reducido: huérfanos y `modal-history.css` los resolvió P1-07 |
| P1-07 | ✅ | 6 hojas eliminadas; 0 imports; sin selectores muertos citados | Correcto |
| P1-08 | ✅ con matices | 209 bloques: 208 en 6 archivos + `.header-view-toggle` en `view-toggle.css`; 24 hex exactos; 0 duplicados | 2 bloques reordenados (`.changelog-empty`, `.changelog-entry-autor-badge`); no hay conflicto de cascada, pero «round-trip exacto» es impreciso |

### 2.2 Hallazgos de la auditoría

| ID | Hallazgo | Severidad | Acción |
|---|---|---|---|
| A-01 | `plan.md` estaba en `specs/`, pero todos los documentos lo referencian en la raíz | Media | Corregido: movido a `plan.md` |
| A-02 | 6 enlaces de `plan.md` y 4 externos apuntaban a rutas inexistentes | Media | Corregido al mover el plan; `baseline/README.md` ajustado |
| A-03 | G1 exige 0 variables indefinidas, pero no existía tarea para las 4 restantes | Alta | Añadida `P1-09` |
| A-04 | G3 exige tablas con scroll contenido, pero no existía tarea R-RESP-03 | Media | Añadida `P3-06` |
| A-05 | P1-08 movió `.header-view-toggle` fuera de los 6 archivos y reordenó 2 bloques | Baja | Documentado; verificar cascada en P1-08.3 |
| A-06 | Todo F0/F1 está sin commitear; la rama no tiene commits propios | Alta | Lote `C-01` |
| A-07 | `npm run build` no es reproducible: falta `node_modules/vite/bin/vite.js` | Alta | Lote `A-05` (`npm ci`) |
| A-08 | `docs/audits/baseline-2026-11-08/README.md` dice 36 capturas, pero su matriz implica ~98 | Media | Lote `A-06`: fijar lista mínima real |
| A-09 | `plan.md` tenía fecha de actualización 2026-11-08 pese a registros del 2026-11-10 | Baja | Corregido |
| A-10 | `package.json` no tiene ESLint ni Stylelint, aunque `eslint.config.js` ya importa plugins | Media | Es lo esperado en F6; no ejecutar lint todavía |
| A-11 | R-DS-02 exige reemplazar valores mágicos, pero el plan solo aplicaba la escala tipográfica; radios y espaciado no tenían tarea | Media | Añadidas P5-04.7–9; P5-04 ampliada en `plan.md` |
| A-12 | R-DS-04 exige 0 selectores apuntando a clases inexistentes; P1-07 solo cubrió los selectores citados | Media | Añadida P1-10 (auditoría completa de selectores muertos) |

### 2.3 Métricas reproducidas

| Control | Resultado |
|---|---|
| `style={{` en `src` | 79 |
| Hex fuera de `variables.css` | 0 |
| Tokens de paleta | 74 (74 valores únicos) |
| Tokens semánticos | 35 |
| Tokens de escala | 35 |
| Variables indefinidas | 3 reales + `--tab-color` con fallback |
| Hojas no importadas | `detail-header.css` |
| Imports de CSS desde componentes | 0 (solo `main.jsx` → `main.css`) |
| Selectores duplicados en el split de changelog | 0 |

---

## 3. Regularización inmediata (lote C-00)

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio / evidencia |
|---|---|---|---|---|---|---|
| A-01 | Mover `plan.md` a la raíz | `plan.md` | — | XS | ✅ | Enlaces de spec y docs resuelven (2026-11-10: movido; antes seguía en `specs/`) |
| A-02 | Corregir enlaces relativos | `plan.md`, `docs/audits/baseline-2026-11-08/README.md` | A-01 | XS | ✅ | 0 enlaces rotos |
| A-03 | Crear este tablero | `specs/tasks.md` | A-01 | S | ✅ | Este archivo |
| A-04 | Registrar auditoría y tareas nuevas en el plan | `plan.md` | A-03 | XS | ✅ | `P1-09`, `P3-06`, fila de auditoría |
| A-05 | Restaurar dependencias y build | `package-lock.json`, `node_modules/` | — | S | ☐ | `npm ci` y `npm run build` exitosos; anotar salida |
| A-06 | Definir lista exacta de capturas baseline | `docs/audits/baseline-2026-11-08/README.md` | — | S | ☐ | Tabla con capturas mínimas, total coherente y `MANIFEST.md` |
| A-07 | Commit del lote F0/F1 auditado | — | A-05 | S | ☐ | 1–3 commits con mensaje `spec-001(...)`; `git status` limpio |

> `A-05` desbloquea la verificación de todas las tareas que citan build. `A-07` protege el trabajo ya hecho: hoy solo existe en disco.

---

## 4. F0 — Baseline y gobernanza

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio / evidencia |
|---|---|---|---|---|---|---|
| P0-01 | Crear `SPEC_TEMPLATE.md` | `SPEC_TEMPLATE.md` | — | S | ✅ | Existe en raíz |
| P0-02 | Aprobar spec y Anexo C | `specs/SPEC-001...md` | — | S | ✅ | Estado `Aprobada`; 5 decisiones |
| P0-03 | Crear rama de trabajo | — | P0-02 | XS | ✅ | Rama activa |
| P0-04.1 | Preparar entorno y `MANIFEST.md` de capturas | `docs/audits/baseline-2026-11-08/MANIFEST.md` | A-06 | S | ☐ | Commit, navegador, SO, fechas y control de tema |
| P0-04.2 | Capturar Changelog (4 estados × 3 anchos × 2 temas) | `docs/audits/baseline-2026-11-08/` | P0-04.1 | M | ☐ | Nombres `[ancho]-changelog-[tema]-[estado].png` |
| P0-04.3 | Capturar Lista/Grid (3 anchos × 2 temas) | idem | P0-04.1 | S | ☐ | Grid y lista |
| P0-04.4 | Capturar Detalle CDU (cabecera, pasos, responsables, gráfico) | idem | P0-04.1 | M | ☐ | 3 anchos × 2 temas |
| P0-04.5 | Capturar modales (entradas, exportación, progreso, resumen, comentarios) | idem | P0-04.1 | M | ☐ | 3 anchos × 2 temas |
| P0-04.6 | Capturar workspace switcher (cerrado/abierto) | idem | P0-04.1 | S | ☐ | 320/768 × claro/oscuro |
| P0-04.7 | Validar matriz y cerrar G0 | `README.md`, `MANIFEST.md` | P0-04.2–6 | XS | ☐ | Conteo real, checklist G0 completo |
| P0-05 | Auditoría baseline | `docs/audits/2026-11-08-baseline.md` | P0-03 | S | ✅ | Métricas reproducidas |

**Gate G0:** se cierra con P0-04.7. Hasta entonces, todo cambio visual queda bloqueado.

---

## 5. F1 — Tokens e integridad CSS

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio / evidencia |
|---|---|---|---|---|---|---|
| P1-01.1 | Inventariar 85 hex y ocurrencias | `docs/design-system/color-inventory.md` | G0 parcial | M | ✅ | 209 ocurrencias |
| P1-01.2 | Separar 11 hex de huérfanos y 74 supervivientes | idem | P1-01.1 | S | ✅ | 74 + 11 = 85 |
| P1-01.3 | Tabla de equivalencias hex → token | idem | P1-01.1 | S | ✅ | 1:1 sin unificar tonos |
| P1-02.1 | Crear capa `--palette-*` | `src/styles/base/variables.css` | P1-01.3 | M | ✅ | 74 tokens / 74 valores |
| P1-02.2 | Verificar 0 consumidores iniciales | idem | P1-02.1 | XS | ✅ | Sin cambios de render |
| P1-03.1 | Crear 35 tokens semánticos | idem | P1-02.1 | M | ✅ | Referencian paleta o tema |
| P1-03.2 | Verificar 0 consumidores externos | — | P1-03.1 | XS | ✅ | `grep` sin usos fuera de `variables.css` |
| P1-04.1 | Definir escala tipográfica | `variables.css` | P1-03.1 | S | ✅ | 9 tamaños + familia |
| P1-04.2 | Definir espaciado, radios, sombras y z-index | `variables.css` | P1-03.1 | S | ✅ | 8+8+3+6 tokens |
| P1-04.3 | Documentar escalas | `docs/design-system.md` | P1-04.1–2 | S | ✅ | Tablas publicadas |
| P1-05.1 | Reemplazar hex por `var(--palette-*)` en 14 hojas | 14 CSS | P1-03.1 | L | ✅ | 144 ocurrencias |
| P1-05.2 | Round-trip de valores contra `HEAD` | script temporal | P1-05.1 | S | ✅ | 0 diferencias |
| P1-05.3 | Verificar 0 hex fuera de `variables.css` | — | P1-05.1 | XS | ✅ | `grep` global |
| P1-06.1 | Confirmar que no quedan imports huérfanos ni CSS en componentes | `main.css` | P1-07 | XS | ✅ | Cubierto por P1-07 |
| P1-06.2 | Importar `layouts/detail-header.css` en `main.css` | `main.css` | P0-04.7 | XS | ⛔ P0-04 | Activa reglas nunca cargadas |
| P1-06.3 | Verificar `DetailHeader` en claro/oscuro y 320/768/1440 | — | P1-06.2, P0-04.2–4 | S | ⛔ P0-04 | Diff visual contra baseline |
| P1-06.4 | Cerrar la parte CSS de G1 | `plan.md` | P1-06.3, P1-09.5 | XS | ☐ | Checklist G1 completo |
| P1-07.1 | Eliminar 6 hojas muertas | 6 archivos | P1-05.1 | S | ✅ | Archivos fuera del árbol |
| P1-07.2 | Verificar 0 imports y 0 consumidores | — | P1-07.1 | S | ✅ | `grep` sin referencias |
| P1-07.3 | Eliminar selectores sin consumidor citados | CSS de modales | P1-07.1 | XS | ✅ | `.modal.deployment-report`, `.modal-deployment-info .modal-box` ausentes |
| P1-08.1 | Dividir `changelog.css` en 6 archivos | `styles/components/changelog/*`, `modals/export-modal.css`, `modals/deployment-info.css` | P1-05.1 | L | ✅ | 208 bloques |
| P1-08.2 | Verificar 0 selectores duplicados | — | P1-08.1 | XS | ✅ | Script de conteo |
| P1-08.3 | Documentar desvíos del split | `docs/audits/2026-11-10-changelog-split.md` | P1-08.1 | XS | ✅ | `docs/audits/2026-11-10-changelog-split.md`; 4 desvíos documentados; sin conflicto de cascada |
| P1-08.4 | Verificar cascada visual | — | P1-08.3, P0-04.7 | S | ⛔ P0-04 | Sin diferencias perceptibles |
| P1-09.1 | `--bg-card` → token existente | `modal-history.css:36` | P1-05.1 | XS | ✅ | `--surface-raised` (= `--bg-primary`, mismo fondo que `.modal-box`); `var(--bg-card` = 0 en `src/` |
| P1-09.2 | `--primary-color` → token existente | `modal-history.css:51` | P1-05.1 | XS | ✅ | `--text-secondary`: `--accent-hover` daba 2,67:1 en oscuro y `--border-color` 1,2:1 en claro; `--text-secondary` ≥ 11:1 en ambos. `var(--primary-color` = 0 |
| P1-09.3 | `--text-tertiary` → token existente | `modal-history.css:81` | P1-05.1 | XS | ✅ | `--text-secondary`; `var(--text-tertiary` = 0 |
| P1-09.4 | Resolver fallback `--tab-color` | `modal-entries.css`, `ChangelogEntriesModal.jsx` | P1-05.1 | S | ✅ | Clases por categoría `changelog-modal-tab--{key}` en `modal-entries.css`; colores idénticos (`--estado-desarrollo-border`, `--estado-produccion-border`, `--palette-red-500`, `--estado-certificado-border`, `--palette-violet-500`); 0 hex en JSX; `var(--tab-color` = 0 |
| P1-09.5 | Verificar 0 variables indefinidas | script | P1-09.1–4 | XS | ✅ | Barrido de `src/**/*.{css,jsx,js}`: 0 variables usadas sin declarar |
| P1-10.1 | Inventariar selectores CSS y buscar su clase en JSX | `scripts/audit-selectors.mjs`, `docs/audits/2026-11-10-dead-selectors.md` | P1-07.2 | M | ✅ | `docs/audits/2026-11-10-dead-selectors.md`; 56 muertas, 21 dinámicas, 31 clases JSX sin regla. Falsos positivos por construcción dinámica: 5 `changelog-modal-tab--{key}`, 4 `dep-info-cat--{key}`, 4 `toast-*`, 3 `modal-*` y 5 `btn-{variant}`, generados con template literal en `ChangelogEntriesModal.jsx:111`, `DeploymentInfoModal.jsx:179`, `Toast.jsx:12`, `Modal.jsx:26` y `Button.jsx:8`. |
| P1-10.2 | Eliminar muertos en base/layouts | `base/*`, `layouts/*` | P1-10.1 | S | ✅ | 11 clases / 16 reglas eliminadas (`animations.css` 3, `reset.css` 1, `header.css` 12); 0 muertas en base/layouts; 21 dinámicas intactas; 30 imports, 0 rotos |
| P1-10.3 | Eliminar muertos en components | `components/*` | P1-10.1 | M | ✅ | 3 clases / 9 reglas eliminadas (`cards.css` 1, `buttons.css` 5, `grid.css` 3); 0 muertas en components; 0 imports rotos |
| P1-10.4 | Eliminar muertos en modales/changelog | `modals/*`, `changelog/*` | P1-10.1 | M | ☐ | Sin selectores sin uso |
| P1-10.5 | Verificar 0 selectores muertos | script | P1-10.2–4 | S | ☐ | Solo falsos positivos documentados. Ejecutar `node scripts/audit-selectors.mjs`; salida vacía salvo los falsos positivos documentados en el informe. |

**Gate G1:** 0 hex, 0 variables indefinidas, 0 hojas sin importar, 0 CSS en componentes, diff visual sin cambios y `changelog.css` dividido.

---

## 6. F2 — Erradicación de estilos inline

**Objetivo:** 0 `style={{...}}` en `src/components`. Total actual: 78 en 22 archivos (79 al inicio; P1-09.4 consumió 1).

> Desglose real por archivo: 7 (§6.2) + 27 (§6.3) + 36 (§6.4) + 8 (§6.5) = 78. Los encabezados §6.3 y §6.4 estaban desfasados (14 y 37); corregidos el 2026-11-10.

### 6.1 Inventario y estrategia

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio / evidencia |
|---|---|---|---|---|---|---|
| P2-01.1 | Generar inventario de 79 usos (archivo, línea, tipo) | `docs/audits/2026-11-10-inline-styles.md` | G1 | S | ☐ | Tabla completa, 78 filas |
| P2-01.2 | Clasificar: estático / geometría dinámica / color dinámico / variable CSS | idem | P2-01.1 | S | ☐ | 4 categorías cerradas |
| P2-01.3 | Definir clase CSS destino por caso | idem | P2-01.2 | M | ☐ | Ningún caso sin destino |
| P2-01.4 | Aprobar estrategia de valores dinámicos (`<progress>`, SVG, clases) | idem | P2-01.3 | XS | ☐ | Decisión escrita antes de tocar JSX |

### 6.2 UI base (7 usos)

| ID | Tarea | Archivo | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P2-02.1 | Migrar 2 estilos de `Input` | `ui/Input.jsx`, `forms.css` | P2-01.3 | S | ☐ | 0 `style` en el archivo |
| P2-02.2 | Migrar 4 estilos de `LoadingOverlay` | `ui/LoadingOverlay.jsx`, `notifications.css` | P2-01.3 | S | ☐ | 0 `style` |
| P2-02.3 | Migrar 1 estilo de `Modal` | `ui/Modal.jsx`, `modal-base.css` | P2-01.3 | XS | ☐ | 0 `style` |
| P2-02.4 | Fijar `Button.type="button"` por defecto (R-CODE-02) | `ui/Button.jsx` | P2-01.3 | XS | ☐ | `type` por defecto; formularios pasan `submit` explícito |
| P2-02.5 | Verificar `Select`, `Toast` y `Button` sin inline styles | `ui/*.jsx` | P2-02.1–4 | XS | ☐ | `grep` 0 |
| P2-02.6 | Revisión visual de UI base | — | P2-02.1–5 | S | ☐ | Sin diferencias perceptibles |

### 6.3 Vistas, layout y raíz (27 usos)

| ID | Tarea | Archivo | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P2-03.1 | Migrar 6 estilos de `ChangelogCard` | `views/ChangelogCard.jsx`, `changelog/card.css` | P2-01.3 | M | ☐ | 0 `style` |
| P2-03.2 | Migrar 2 estilos de `ChangelogView` | `views/ChangelogView.jsx`, `changelog/timeline.css` | P2-01.3 | S | ☐ | 0 `style` |
| P2-03.3 | Migrar 1 estilo de `DateQuickEditor` | `views/DateQuickEditor.jsx`, `changelog/date-editor.css` | P2-01.3 | XS | ☐ | 0 `style` |
| P2-03.4 | Migrar 1 estilo de `VersionList` | `views/VersionList.jsx`, `list-view.css` | P2-01.3 | S | ☐ | 0 `style` |
| P2-03.5 | Migrar 2 estilos de `VersionRow` | `views/VersionRow.jsx`, `table.css`/`list-view.css` | P2-01.3 | S | ☐ | 0 `style` |
| P2-03.6 | Migrar 1 estilo de `DetailView` | `views/DetailView.jsx`, `detail-header.css`/`container.css` | P2-01.3 | S | ☐ | 0 `style` |
| P2-03.7 | Migrar 6 estilos de `Header` | `layout/Header.jsx`, `header.css` | P2-01.3 | M | ☐ | 0 `style` |
| P2-03.8 | Migrar 5 estilos de `WorkspaceSwitcher` | `layout/WorkspaceSwitcher.jsx`, `workspace-switcher.css` | P2-01.3 | M | ☐ | 0 `style` |
| P2-03.9 | Migrar 1 estilo de `Dashboard` | `Dashboard.jsx`, `cards.css`/`grid.css` | P2-01.3 | XS | ☐ | 0 `style` |
| P2-03.10 | Migrar 2 estilos de `Login` | `Login.jsx`, `modal-login.css` | P2-01.3 | S | ☐ | 0 `style` (aunque Login no esté montado) |
| P2-03.11 | Revisión visual de vistas y layout | — | P2-03.1–10 | M | ☐ | Sin diferencias |

### 6.4 Modales (36 usos)

| ID | Tarea | Archivo | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P2-04.1 | Migrar 3 estilos de `ChangelogEntriesModal` | `modals/ChangelogEntriesModal.jsx`, `changelog/modal-entries.css` | P2-01.3 | S | ☐ | 0 `style` (quedan 3; 1 consumido en P1-09.4) |
| P2-04.2 | Migrar 1 estilo de `CommentsModal` | `modals/CommentsModal.jsx`, `modal-comentarios.css` | P2-01.3 | XS | ☐ | 0 `style` |
| P2-04.3 | Migrar 1 estilo de `DeploymentReportModal` | `modals/DeploymentReportModal.jsx`, `modal-deployment-report.css` | P2-01.3 | XS | ☐ | 0 `style` |
| P2-04.4 | Migrar 7 estilos de `EvolutionModal` | `modals/EvolutionModal.jsx`, `modal-progress.css` | P2-01.3 | M | ☐ | 0 `style` |
| P2-04.5 | Migrar estilos estáticos de `ProgressModal` | `modals/ProgressModal.jsx`, `modal-progress.css` | P2-01.3 | M | ☐ | 0 `style` estático |
| P2-04.6 | Revisión visual de modales | — | P2-04.1–5 | M | ☐ | Sin diferencias |

### 6.5 Geometría dinámica y caso permitido

| ID | Tarea | Archivo | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P2-05.1 | Convertir `BadaGraph` a SVG/`<progress>` | `detail/BadaGraph.jsx`, `table.css` | P2-03.4 | M | ☐ | Proporciones y colores idénticos |
| P2-05.2 | Eliminar geometría inline de `CduRow` | `detail/CduRow.jsx`, `table.css` | P2-03.4 | S | ☐ | 0 `style` |
| P2-05.3 | Eliminar geometría inline de `StepsEditor` | `detail/StepsEditor.jsx`, `table.css` | P2-03.4 | XS | ☐ | 0 `style` |
| P2-05.4 | Eliminar geometría inline de `DetailHeader` | `detail/DetailHeader.jsx`, `detail-header.css` | P2-03.6 | S | ☐ | 0 `style` |
| P2-05.5 | Migrar barras y segmentos de `ProgressModal` | `modals/ProgressModal.jsx`, `modal-progress.css` | P2-04.5 | M | ☐ | `<progress>` o SVG con atributos |
| P2-05.6 | Comparar gráficos y barras contra baseline | — | P2-05.1–5, P0-04.7 | S | ⛔ P0-04 | Lectura visual equivalente |
| P2-06.1 | Localizar usos de `element.style` | `DeploymentInfoModal`, `FullSummaryModal` | P2-04 | XS | ☐ | Solo fallback de portapapeles |
| P2-06.2 | Aislar y documentar el fallback | `src/utils/` + doc | P2-06.1 | S | ☐ | Helper único o comentario justificado |
| P2-06.3 | Verificar `grep` final | — | P2-06.2 | XS | ☐ | `style={{` = 0; `.style.` = solo fallback |

**Gate G2:** 0 inline styles, solo el fallback documentado, gráficos equivalentes y diff visual sin cambios.

---

## 7. F3 — Responsive

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio / evidencia |
|---|---|---|---|---|---|---|
| P3-01.1 | Auditar overflow en Changelog a 320/375/480 | — | G2 | S | ☐ | Informe con capturas o tabla |
| P3-01.2 | Auditar overflow en Lista/Grid | — | G2 | S | ☐ | idem |
| P3-01.3 | Auditar overflow en Detalle CDU | — | G2 | S | ☐ | idem |
| P3-01.4 | Auditar overflow en modales | — | G2 | S | ☐ | idem |
| P3-01.5 | Auditar overflow en Header y workspace switcher | — | G2 | S | ☐ | idem |
| P3-01.6 | Consolidar hallazgos | `docs/audits/2026-11-10-responsive.md` | P3-01.1–5 | XS | ☐ | Lista priorizada por archivo |
| P3-02.1 | Breakpoints en `changelog/timeline.css` | `timeline.css` | P3-01.1 | S | ☐ | 900/768/600 |
| P3-02.2 | Breakpoints en `changelog/card.css` | `card.css` | P3-01.1 | M | ☐ | 900/768/600 |
| P3-02.3 | Breakpoints en `changelog/modal-entries.css` | `modal-entries.css` | P3-01.4 | S | ☐ | 900/768/600 |
| P3-02.4 | Breakpoints en `changelog/date-editor.css` | `date-editor.css` | P3-01.1 | S | ☐ | Al menos 600 |
| P3-02.5 | Dropdown móvil en `workspace-switcher.css` | `workspace-switcher.css` | P3-01.5 | S | ☐ | Sin desbordamiento |
| P3-02.6 | Verificar 0 scroll horizontal a 320 | — | P3-02.1–5 | S | ☐ | Capturas 320 |
| P3-03.1 | Adaptar `modal-full-summary.css` a 320 | `modal-full-summary.css` | P3-01.4 | S | ☐ | Acciones visibles |
| P3-03.2 | Adaptar `modal-base.css` a 320 | `modal-base.css` | P3-01.4 | S | ☐ | Cabecera y cierre utilizables |
| P3-03.3 | Adaptar `modal-progress.css` a 320 | `modal-progress.css` | P3-01.4 | S | ☐ | Gráficos sin recorte |
| P3-03.4 | Adaptar `export-modal.css` a 320 | `export-modal.css` | P3-01.4 | S | ☐ | Opciones legibles |
| P3-03.5 | Adaptar `deployment-info.css` a 320 | `deployment-info.css` | P3-01.4 | S | ☐ | Contenido sin recorte |
| P3-04.1 | Permitir envoltura de metadatos en `DetailHeader` | `detail-header.css` | P3-01.3 | S | ☐ | `flex-wrap` sin romper layout |
| P3-04.2 | Verificar `DetailHeader` a 320/768 | — | P3-04.1 | XS | ☐ | Captura |
| P3-05.1 | Objetivos 44×44 en puntero grueso | `buttons.css`, `forms.css` | P3-02.6 | M | ☐ | `@media (pointer: coarse)` |
| P3-05.2 | Acciones de tarjeta/fila visibles sin hover | `changelog/card.css`, `list-view.css` | P3-05.1 | S | ☐ | Sin `opacity: 0` permanente |
| P3-05.3 | Verificar en emulación táctil | — | P3-05.1–2 | S | ☐ | Captura o grabación |
| P3-05.4 | Mínimo 24×24 en puntero fino | `buttons.css`, `forms.css` | P3-05.1 | S | ☐ | Separación suficiente |
| P3-06.1 | Scroll horizontal contenido en tablas | `table.css` | P3-01.2 | S | ☐ | Contenedor con `overflow-x: auto` |
| P3-06.2 | Indicio visual de desplazamiento | `table.css` | P3-06.1 | XS | ☐ | Sombra o borde visible |
| P3-06.3 | Ocultar columnas secundarias en móvil | `table.css`, `list-view.css` | P3-06.1 | S | ☐ | Criterio consistente |
| P3-06.4 | Verificar tabla de CDUs | — | P3-06.1–3 | XS | ☐ | No rompe layout |
| P3-07.1 | Verificar 200 % de zoom en 5 vistas | — | P3-02–06 | M | ☐ | Matriz registrada |
| P3-07.2 | Cerrar G3 | `plan.md`, este archivo | P3-07.1 | XS | ☐ | Checklist G3 |

**Gate G3:** 0 scroll horizontal a 320 salvo tablas, tablas con indicio, 200 % usable, acciones táctiles visibles y matriz registrada.

---

## 8. F4 — Accesibilidad

### 8.1 Modal y foco

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P4-01.1 | Mover `useEffect` antes del `return` condicional | `ui/Modal.jsx` | G3 | XS | ☐ | Orden de hooks constante |
| P4-01.2 | Verificar apertura/cierre dos veces sin warning | `ui/Modal.jsx` | P4-01.1 | XS | ☐ | Consola limpia |
| P4-01.3 | Añadir test de regresión T-01 | `ui/__tests__/Modal.test.jsx` | P6-01.4 | S | ☐ | Test pasa |
| P4-02.1 | Crear `useFocusTrap` con foco inicial | `src/hooks/useFocusTrap.js` | P4-01.1 | S | ☐ | Hook aislado |
| P4-02.2 | Atrapar Tab/Shift+Tab | `useFocusTrap.js` | P4-02.1 | S | ☐ | Ciclo cerrado |
| P4-02.3 | Cerrar con Escape | `useFocusTrap.js` | P4-02.1 | XS | ☐ | `onClose` invocado |
| P4-02.4 | Restaurar foco al disparador | `useFocusTrap.js` | P4-02.1 | S | ☐ | Foco vuelve al botón |
| P4-02.5 | Bloquear scroll del body | `useFocusTrap.js` | P4-02.1 | XS | ☐ | `overflow` restaurado |
| P4-02.6 | Integrar el hook en `Modal` | `ui/Modal.jsx` | P4-02.2–5 | S | ☐ | Todos los modales cubiertos |
| P4-02.7 | Verificar manualmente 5 modales | — | P4-02.6 | S | ☐ | Tab, Escape y restauración |
| P4-03.1 | Añadir `role="dialog"` y `aria-modal` | `ui/Modal.jsx` | P4-02.6 | XS | ☐ | Atributos presentes |
| P4-03.2 | Asociar `aria-labelledby` al título | `ui/Modal.jsx` | P4-03.1 | S | ☐ | ID único |
| P4-03.3 | Etiquetar botón de cierre | `ui/Modal.jsx` | P4-03.1 | XS | ☐ | `aria-label="Cerrar"` |
| P4-03.4 | Añadir test T-03 | `Modal.test.jsx` | P6-01.4 | S | ☐ | Test pasa |

### 8.2 Semántica de interacción

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P4-04.1 | `ChangelogCard`: header como botón | `views/ChangelogCard.jsx` | P4-03.4 | S | ☐ | `aria-expanded` |
| P4-04.2 | `VersionCard`: apertura como control | `views/VersionCard.jsx` | P4-03.4 | S | ☐ | Enter/Espacio |
| P4-04.3 | `VersionRow`: fila como control | `views/VersionRow.jsx` | P4-03.4 | S | ☐ | Sin `tr onClick` |
| P4-04.4 | `ExportModal`: opciones como radiogroup | `modals/ExportModal.jsx` | P4-03.4 | M | ☐ | Flechas + Enter |
| P4-04.5 | `ProgressModal`: toggle como botón | `modals/ProgressModal.jsx` | P4-03.4 | S | ☐ | `aria-pressed` |
| P4-04.6 | Verificar 0 controles anidados | — | P4-04.1–5 | XS | ☐ | `grep` y revisión |
| P4-04.7 | Prueba de teclado por componente | — | P4-04.1–5 | M | ☐ | Evidencia por caso |

### 8.3 Nombres accesibles y formularios

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P4-05.1 | Inventariar botones de solo icono | — | P4-04 | S | ☐ | Lista completa |
| P4-05.2 | Nombres en Header/WorkspaceSwitcher | `layout/*.jsx` | P4-05.1 | S | ☐ | `aria-label` |
| P4-05.3 | Nombres en Changelog (acciones, búsqueda, paginación) | `views/Changelog*` | P4-05.1 | S | ☐ | `aria-label` |
| P4-05.4 | Nombres en modales y toasts | `modals/*`, `ui/Toast.jsx` | P4-05.1 | S | ☐ | `aria-label` |
| P4-05.5 | Ocultar iconos decorativos | `ui/Icons.jsx` | P4-05.2–4 | S | ☐ | `aria-hidden="true"` |
| P4-06.1 | Asociar label/id en `Input` | `ui/Input.jsx` | P4-04 | S | ☐ | `htmlFor` + `id` |
| P4-06.2 | Asociar label/id en `Select` | `ui/Select.jsx` | P4-04 | S | ☐ | idem |
| P4-06.3 | Asociar los dos campos de `DateQuickEditor` | `views/DateQuickEditor.jsx` | P4-04 | S | ☐ | idem |
| P4-06.4 | Añadir `required`/`aria-required` | formularios | P4-06.1–3 | S | ☐ | Campos obligatorios |
| P4-06.5 | Asociar errores con `aria-describedby` | formularios | P4-06.4 | S | ☐ | Error no solo por color |
| P4-06.6 | Añadir test T-06 | `Input.test.jsx` | P6-01.4 | S | ☐ | Test pasa |

### 8.4 Foco, contraste y anuncios

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P4-07.1 | Regla global `:focus-visible` | `reset.css` o `animations.css` | P4-04 | S | ☐ | 2 px + offset |
| P4-07.2 | Eliminar `outline: none` sin reemplazo | CSS global | P4-07.1 | S | ☐ | 0 casos sin foco visible |
| P4-07.3 | Verificar foco en claro/oscuro | — | P4-07.1–2 | S | ☐ | Captura |
| P4-08.1 | Contraste de producción | `estados.css`, `cards.css` | P1-03.1 | S | ☐ | `#047857`/`#388114` |
| P4-08.2 | Badge de producción sobre blanco | `cards.css` | P4-08.1 | XS | ☐ | `#388114` |
| P4-08.3 | Puntos de estado | `estados.css` | P4-08.1 | S | ☐ | ≥ 3:1 |
| P4-08.4 | Errores de texto | `notifications.css`, `forms.css` | P4-08.1 | S | ☐ | `#c53030` |
| P4-08.5 | Violeta solo acento/borde | CSS | P4-08.1 | XS | ☐ | No texto pequeño |
| P4-08.6 | Script de contraste T-11 | `scripts/check-contrast.mjs` | P6-03.1 | M | ☐ | Pares críticos ≥ AA |
| P4-08.7 | Contraste de `.tab-badge` (blanco sobre fondos de categoría) | `changelog/modal-entries.css` | P4-08.2 | S | ☐ | Pares actuales 2,80–4,23:1; usar `--estado-*-bg`/`--estado-*-color` existentes |
| P4-09.1 | `aria-live="polite"` y `role="status"` en toasts | `ui/Toast.jsx`, `context/ToastContext.jsx` | P4-04 | S | ☐ | Contenedor anunciable |
| P4-09.2 | `role="alert"` en toasts de error | `ui/Toast.jsx` | P4-09.1 | XS | ☐ | Errores anunciados |
| P4-09.3 | Anunciar cambio de vista y carga | `Dashboard.jsx`, contexto | P4-09.1 | S | ☐ | Estado anunciable |
| P4-09.4 | Añadir test T-04 | `Toast.test.jsx` | P6-01.4 | S | ☐ | Test pasa |

### 8.5 Verificación manual

| ID | Tarea | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|
| P4-10.1 | Recorrido por teclado en Changelog | P4-04.7 | S | ☐ | Todos los controles alcanzables |
| P4-10.2 | Recorrido por teclado en Lista/Grid | P4-04.7 | S | ☐ | idem |
| P4-10.3 | Recorrido por teclado en Detalle | P4-04.7 | S | ☐ | idem |
| P4-10.4 | Recorrido por teclado en modales | P4-02.7 | S | ☐ | Foco atrapado y restaurado |
| P4-11.1 | axe en Changelog | P4-10.1 | S | ☐ | 0 serious/critical |
| P4-11.2 | axe en Lista/Grid | P4-10.2 | S | ☐ | 0 serious/critical |
| P4-11.3 | axe en Detalle | P4-10.3 | S | ☐ | 0 serious/critical |
| P4-11.4 | axe en modales | P4-10.4 | S | ☐ | 0 serious/critical |
| P4-11.5 | Cerrar G4 | P4-11.1–4 | XS | ☐ | Checklist G4 |

**Gate G4:** 0 interacciones sin semántica, 0 iconos sin nombre, foco atrapado/restaurado, 0 axe serious/critical, contraste AA y teclado completo.

---

## 9. F5 — Consistencia visual

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P5-01.1 | Corregir `Icons.Info` a `currentColor` | `ui/Icons.jsx` | G4 | XS | ☐ | Visible en fondos claros |
| P5-01.2 | Auditar `fill` fijos en `Icons.jsx` | `ui/Icons.jsx` | P5-01.1 | S | ☐ | 0 colores fijos |
| P5-01.3 | Verificar iconos en claro/oscuro | — | P5-01.2 | S | ☐ | Captura |
| P5-02.1 | Emojis funcionales en `ChangelogView` | `views/ChangelogView.jsx` | G4 | S | ☐ | SVG/texto |
| P5-02.2 | Emojis funcionales en `DateQuickEditor` | `views/DateQuickEditor.jsx` | G4 | S | ☐ | SVG/texto |
| P5-02.3 | Emojis funcionales en `DeploymentReportModal` | `modals/DeploymentReportModal.jsx` | G4 | S | ☐ | SVG/texto |
| P5-02.4 | Verificar 0 emojis como único icono de acción | — | P5-02.1–3 | XS | ☐ | `grep` y revisión |
| P5-03.1 | Inventariar fechas visibles | — | G4 | S | ☐ | Lista por componente |
| P5-03.2 | Normalizar `VersionRow` a `DD/MM/AAAA` | `views/VersionRow.jsx` | P5-03.1 | S | ☐ | Sin ISO visible |
| P5-03.3 | Verificar 0 fechas ISO en UI | — | P5-03.2 | S | ☐ | Captura o test |
| P5-04.1 | Aplicar `--font-family-base` | CSS global | P1-04 | S | ☐ | Una sola familia |
| P5-04.2 | Mapear tamaños en base/layouts | `base/*`, `layouts/*` | P5-04.1 | S | ☐ | Sin valores mágicos |
| P5-04.3 | Mapear tamaños en components | `components/*` | P5-04.1 | M | ☐ | Sin valores mágicos |
| P5-04.4 | Mapear tamaños en modales/changelog | `modals/*`, `changelog/*` | P5-04.1 | M | ☐ | Sin valores mágicos |
| P5-04.5 | Revisar copy: sentence case y verbos | JSX de vistas/modales | P5-04.1 | M | ☐ | Etiquetas consistentes |
| P5-04.6 | Revisar estados vacíos y errores | JSX de vistas | P5-04.5 | S | ☐ | Explican qué pasó y qué hacer |
| P5-04.7 | Mapear `border-radius` a `--radius-*` | `base/*`, `layouts/*`, `components/*` | P1-04.2 | M | ☐ | 0 radios fuera de escala |
| P5-04.8 | Mapear espaciado, sombras y z-index a tokens | `base/*`, `layouts/*`, `components/*` | P1-04.2 | M | ☐ | 0 valores mágicos |
| P5-04.9 | Verificar 0 valores fuera de escala | script | P5-04.7–8 | S | ☐ | Salida vacía |
| P5-05.1 | Añadir `prefers-reduced-motion` | `base/animations.css` | G4 | S | ☐ | Desactiva no esenciales |
| P5-05.2 | Eliminar `animation: ... infinite` permanente | CSS | P5-05.1 | S | ☐ | 0 pulsos permanentes |
| P5-05.3 | Verificar T-13 | — | P5-05.1–2 | S | ☐ | Evidencia manual/CSS |
| P5-06.1 | Revisión visual final de F5 | — | P5-01–05 | M | ☐ | Paleta sin cambios |
| P5-06.2 | Cerrar G5 | `plan.md` | P5-06.1 | XS | ☐ | Checklist G5 |

**Gate G5:** 0 emojis como icono único, 0 fechas ISO, una familia tipográfica, `prefers-reduced-motion` respetado y paleta intacta.

---

## 10. F6 — Testing y enforcement

### 10.1 Infraestructura

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P6-01.1 | Instalar Vitest, RTL, user-event, jest-axe y jsdom | `package.json` | G5 | M | ☐ | `npm ci` reproducible |
| P6-01.2 | Configurar `vitest.config.js` y setup | `vitest.config.js`, `src/test/setup.js` | P6-01.1 | S | ☐ | `npm test` arranca |
| P6-01.3 | Crear smoke test de `Button` | `ui/__tests__/Button.test.jsx` | P6-01.2 | XS | ☐ | 1 test verde |
| P6-01.4 | Añadir script `test` | `package.json` | P6-01.2 | XS | ☐ | Ejecutable |
| P6-02.1 | Instalar ESLint y plugins JS/React | `package.json` | G5 | M | ☐ | Incluye `eslint`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| P6-02.2 | Corregir `eslint.config.js` para JSX | `eslint.config.js` | P6-02.1 | S | ☐ | Lint sobre `.jsx` |
| P6-02.3 | Instalar y configurar Stylelint | `package.json`, `stylelint.config.js` | G5 | M | ☐ | `npm run lint:css` |
| P6-02.4 | Añadir scripts de lint | `package.json` | P6-02.2–3 | XS | ☐ | Ejecutables |
| P6-03.1 | Esqueleto `check-design-rules.mjs` | `scripts/check-design-rules.mjs` | P6-02.1 | S | ☐ | Sale con código 0/1 |
| P6-03.2 | Chequeo de `style={{` | idem | P6-03.1 | XS | ☐ | Detecta violación |
| P6-03.3 | Chequeo de hex fuera de `variables.css` | idem | P6-03.1 | S | ☐ | Detecta violación |
| P6-03.4 | Chequeo de variables indefinidas | idem | P6-03.1 | S | ☐ | Detecta violación |
| P6-03.5 | Prueba negativa de los 3 chequeos | idem | P6-03.2–4 | S | ☐ | Fallan al introducir violación |

### 10.2 Casos T-01…T-16

| ID | Caso | Archivo | Dep. | Esf. | Estado |
|---|---|---|---|---|---|
| P6-04.1 | T-01/T-02/T-03 Modal | `ui/__tests__/Modal.test.jsx` | P6-01.4, P4-03.4 | M | ☐ |
| P6-04.2 | T-04 Toast | `ui/__tests__/Toast.test.jsx` | P6-01.4, P4-09.4 | S | ☐ |
| P6-04.3 | T-05 Button | `ui/__tests__/Button.test.jsx` | P6-01.4 | S | ☐ |
| P6-04.4 | T-06 Input | `ui/__tests__/Input.test.jsx` | P6-01.4, P4-06.6 | S | ☐ |
| P6-04.5 | T-07 ChangelogCard | `views/__tests__/ChangelogCard.test.jsx` | P6-01.4, P4-04.1 | S | ☐ |
| P6-04.6 | T-08 VersionCard/Row | `views/__tests__/VersionCard.test.jsx` | P6-01.4, P4-04.2–3 | S | ☐ |
| P6-04.7 | T-09 ExportModal | `modals/__tests__/ExportModal.test.jsx` | P6-01.4, P4-04.4 | M | ☐ |
| P6-04.8 | T-10 iconos con nombre | `scripts/check-a11y-icons.mjs` o axe | P6-03.1, P4-05.5 | S | ☐ |
| P6-04.9 | T-11 contraste | `scripts/check-contrast.mjs` | P4-08.6 | S | ☐ |
| P6-04.10 | T-12 axe en vistas | tests de vistas | P6-01.4, P4-11 | M | ☐ |
| P6-04.11 | T-13 reduced motion | test CSS/manual | P5-05.3 | XS | ☐ |
| P6-04.12 | T-14 overflow 320 | test/manual | P3-07.1 | S | ☐ |
| P6-04.13 | T-15/T-16 reglas de diseño | `check-design-rules.mjs` | P6-03.5 | XS | ☐ |

### 10.3 Cierre

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P6-05.1 | Componer `npm run verify` | `package.json` | P6-02.4, P6-03.5, P6-04.13 | S | ☐ | lint + stylelint + tests + reglas |
| P6-05.2 | Documentar `verify` | `README.md` | P6-05.1 | XS | ☐ | Uso y requisitos |
| P6-05.3 | Ejecutar `verify` limpio | — | P6-05.1 | S | ☐ | Salida 0 |
| P6-05.4 | Prueba negativa de `verify` | — | P6-05.3 | S | ☐ | Falla con violación |
| P6-06.1 | axe DevTools por vista | — | P6-04.10 | M | ☐ | 0 serious/critical |
| P6-06.2 | Lector de pantalla | — | P4-10 | M | ☐ | Flujos principales |
| P6-06.3 | Matriz manual §9.3 | `specs/SPEC-001...md` | P6-06.1–2 | M | ☐ | 50 celdas revisadas |
| P6-06.4 | Cerrar G6 | `plan.md` | P6-05.4, P6-06.3 | XS | ☐ | Checklist G6 |

**Gate G6:** `npm run verify` pasa, los chequeos fallan intencionalmente, los 16 casos existen y la matriz manual está completa.

---

## 11. F7 — Cierre y documentación

| ID | Tarea | Archivos | Dep. | Esf. | Estado | Criterio |
|---|---|---|---|---|---|---|
| P7-01.1 | Tokens y escalas documentados | `docs/design-system.md` | P1-04 | S | ✅ | Tablas existentes |
| P7-01.2 | Añadir reglas de color y contraste | idem | P4-08 | S | ☐ | Pares corregidos |
| P7-01.3 | Añadir reglas de foco | idem | P4-07 | XS | ☐ | Regla y tokens |
| P7-01.4 | Añadir iconografía | idem | P5-01–02 | S | ☐ | Uso y tamaños |
| P7-01.5 | Añadir motion | idem | P5-05 | XS | ☐ | Reduced motion |
| P7-01.6 | Añadir ejemplos de uso | idem | P7-01.2–5 | S | ☐ | Snippets válidos |
| P7-02.1 | Revisar DoD punto por punto | `specs/SPEC-001...md` | G6 | M | ☐ | 16 ítems con evidencia |
| P7-02.2 | Aprobación del responsable | — | P7-02.1 | XS | ☐ | Registro escrito |
| P7-03.1 | Actualizar `MEMORY.md` | `MEMORY.md` | P7-02.1 | S | ☐ | ≤ 75 líneas |
| P7-04.1 | Cerrar `plan.md` y registrar lecciones | `plan.md` | P7-02.1 | S | ☐ | Estado `CERRADO` |
| P7-05.1 | Commit/tag final | — | P7-04.1 | XS | ☐ | Rama limpia |
| P7-05.2 | Cerrar G7 | `plan.md` | P7-05.1 | XS | ☐ | Checklist G7 |

**Gate G7:** DoD completo con evidencia, aprobación explícita y backlog derivado registrado.

---

## 12. Lotes de revisión y commits

| Lote | Contenido | Criterio de revisión | Estado |
|---|---|---|---|
| C-00 | Regularización A-01…A-07 | Build restaurado, enlaces correctos, baseline definido | ◐ |
| C-01 | F0 + F1 auditado | G0/G1, capturas o bloqueo explícito, commit | ☐ |
| C-02 | F2 por grupos (UI, vistas, modales, gráficos) | 0 `style={{`, diff visual | ☐ |
| C-03 | F3 responsive | 320/768/1440 + táctil | ☐ |
| C-04 | F4 accesibilidad | Teclado, axe, contraste | ☐ |
| C-05 | F5 consistencia | Iconos, fechas, tipografía, motion | ☐ |
| C-06 | F6 enforcement | `npm run verify` + prueba negativa | ☐ |
| C-07 | F7 cierre | DoD, MEMORY, plan cerrado | ☐ |

### Plantilla de commit

```
spec-001(P2-03.1): migrar estilos inline de ChangelogCard

- Reemplaza 6 style={{}} por clases en changelog/card.css.
- Verificado: grep style={{ en el archivo = 0.
- Sin diferencias visuales contra baseline 768/1440.
```

---

## 13. Orden recomendado de las próximas 12 subtareas

> **Nota de secuenciación:** los tests de F4 dependen de `P6-01.4` (infraestructura de test). Para no invertir el orden, conviene adelantar `P6-01` y `P6-02` como lote `C-01.5` antes de cerrar F4. Si se prefiere respetar la secuencia F2→F5, los tests de F4 se escriben al llegar a F6 y F4 no se cierra hasta entonces.

1. `A-05` — restaurar `node_modules` y build.
2. `A-06` — fijar lista exacta de capturas.
3. `A-07` — commit del trabajo F0/F1 ya auditado.
4. `P0-04.1` — `MANIFEST.md` y entorno de captura.
5. `P0-04.4` — capturas de Detalle (desbloquea P1-06).
6. `P1-09.1` — `--bg-card`.
7. `P1-09.2` — `--primary-color`.
8. `P1-09.3` — `--text-tertiary`.
9. `P1-09.4` — `--tab-color`.
10. `P1-09.5` — verificación de variables indefinidas.
11. `P1-06.2` — importar `detail-header.css`.
12. `P1-06.3` — verificar `DetailHeader` con baseline.

> Si no se pueden hacer capturas todavía, el orden alternativo es `P1-09.*` → `P2-01.*` → `P2-02.*` (trabajo sin impacto visual pendiente de baseline).

---

## 14. Trazabilidad requisito → tarea → test

| Requisito | Tareas | Test / evidencia |
|---|---|---|
| R-DS-01 | P1-01, P1-02, P1-03, P1-09 | T-16, grep hex |
| R-DS-02 | P1-04, P5-04.1–9 | Revisión de escalas y script de valores fuera de escala |
| R-DS-03 | P2-01…P2-06 | T-15, grep `style={{` |
| R-DS-04 | P1-06, P1-07, P1-10 | Grep de imports, variables y selectores |
| R-DS-05 | P1-08 | Conteo de reglas y duplicados |
| R-A11Y-01 | P4-01, P4-02, P4-03 | T-01, T-02, T-03 |
| R-A11Y-02 | P4-04 | T-07, T-08, T-09 |
| R-A11Y-03 | P4-05 | T-10 |
| R-A11Y-04 | P4-06 | T-06 |
| R-A11Y-05 | P4-07 | Revisión visual |
| R-A11Y-06 | P4-08 | T-11 |
| R-A11Y-07 | P4-09 | T-04 |
| R-A11Y-08 | P3-07 | T-14, matriz |
| R-RESP-01 | P3-02, P3-03, P3-04 | Matriz de breakpoints |
| R-RESP-02 | P3-05 | Emulación táctil |
| R-RESP-03 | P3-06 | Revisión de tablas |
| R-UI-01 | P5-01, P5-02 | Revisión de iconos |
| R-UI-02 | P5-03 | Revisión de fechas |
| R-UI-03 | P5-04 | Revisión de copy |
| R-UI-04 | P5-05 | T-13 |
| R-CODE-01 | P4-01 | T-01 |
| R-CODE-02 | P2-02.4 | T-05 |
| R-DOC-01 | P7-01, P7-03, P7-04 | Documentos |
| R-TEST-01 | P6-01…P6-05 | `npm run verify` |

---

## 15. Registro de cambios de este tablero

| Fecha | Cambio |
|---|---|
| 2026-11-10 | Creación tras auditoría de F0/F1; se añaden P1-09 y P3-06; se documentan A-01…A-10 |
| 2026-11-10 | Lote P1-09 cerrado (variables indefinidas). Decisión: P1-09.4 se resuelve con clases por categoría, no con --border-color. P1-09.2 usa --text-secondary para cumplir 3:1 en ambos temas. Revisión QA: NR-01 corregido, NR-02 derivado a P4-08.7, NR-03/NR-04 documentales aplicados, NR-05 anotado en P1-10.1. |
| 2026-11-10 | A-01 completado: plan.md movido de `specs/` a la raíz. |
| 2026-11-10 | P1-08.3 y P1-10.1 cerradas: 4 desvíos del split documentados y auditoría de selectores (56 muertas, 21 dinámicas, 31 clases JSX sin regla). §6.3 y §6.4 corregidos a 27 y 36 usos (suma 78). |
| 2026-11-10 | P1-10.2/P1-10.3 cerradas: 14 clases y 25 reglas muertas eliminadas en base/layouts/components. Script 56→42 muertas (quedan solo P1-10.4), 21 dinámicas intactas, 0 imports rotos. |





