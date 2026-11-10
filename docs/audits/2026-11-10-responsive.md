# Auditoría de responsive — 2026-11-10

> **Método: análisis estático de CSS y JSX. Sin capturas y sin medición en navegador**
> (A-05: build no disponible; P0-04: baseline visual no capturado). No se afirma
> haber visto el render: los hallazgos son patrones que causan overflow o impiden el
> reflow, verificados en el código con `scripts/audit-responsive.mjs`.

| Campo | Valor |
|---|---|
| Spec | [`../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Tareas | P3-01.1 … P3-01.6 (`specs/tasks.md` §7) |
| Requisitos | R-RESP-01, R-RESP-03, R-A11Y-08 (reflow/zoom) |
| Fecha | 2026-11-10 |
| Rama | `feat/spec-001-design-hardening` |
| Commit base | `565cc8e` — `spec-001(F2): correcciones de la validacion QA` |
| Herramienta | `node scripts/audit-responsive.mjs` (32 hojas CSS, 760 reglas) |
| Alcance | Solo diagnóstico: **no se modificó CSS ni JSX** |

## 1. Resumen

| Severidad | Hallazgos |
|---|---:|
| `alta` | 6 (4 del script + 2 manuales) |
| `media` | 35 (29 del script + 6 manuales) |
| `baja` | 41 |
| **Total** | **82** (74 automáticos + 8 manuales) |

Hojas de layout sin ninguna `@media`: **26 de 28** (se excluyen `base/*` y `main.css`
por no ser hojas de layout). De ellas, **14** están en `changelog/*` y `modals/*`, que
son justo las tareas de P3-02 y P3-03.

Solo dos hojas de layout tienen breakpoints: `layouts/grid.css` (900/768/600) y
`components/list-view.css` (900/768). No hay ninguna regla de `480px` en el proyecto.

### Hallazgos automáticos por archivo

Esta tabla refleja solo la salida del script (74). Los 8 hallazgos manuales se
distribuyen en el resto de archivos y se cuentan aparte en la última fila.

| Archivo | alta | media | baja | total |
|---|---:|---:|---:|---:|
| `components/changelog/card.css` | 0 | 7 | 5 | 12 |
| `components/changelog/modal-entries.css` | 0 | 4 | 7 | 11 |
| `components/workspace-switcher.css` | 0 | 1 | 8 | 9 |
| `components/list-view.css` | 0 | 3 | 3 | 6 |
| `components/changelog/timeline.css` | 0 | 3 | 1 | 4 |
| `components/cards.css` | 1 | 0 | 2 | 3 |
| `components/modals/modal-deployment-report.css` | 0 | 2 | 1 | 3 |
| `components/modals/modal-full-summary.css` | 0 | 2 | 1 | 3 |
| `components/table.css` | 1 | 1 | 1 | 3 |
| `layouts/header.css` | 0 | 3 | 0 | 3 |
| `components/modals/modal-base.css` | 0 | 1 | 1 | 2 |
| `components/modals/modal-login.css` | 0 | 1 | 1 | 2 |
| `components/modals/modal-progress.css` | 0 | 0 | 2 | 2 |
| `components/notifications.css` | 1 | 0 | 1 | 2 |
| `components/modals/ExportModal.jsx` | 0 | 0 | 2 | 2 |
| `components/modals/deployment-info.css` | 0 | 0 | 1 | 1 |
| `components/modals/export-modal.css` | 0 | 0 | 1 | 1 |
| `components/view-toggle.css` | 0 | 1 | 0 | 1 |
| `layouts/grid.css` | 1 | 0 | 0 | 1 |
| `components/layout/WorkspaceSwitcher.jsx` | 0 | 0 | 1 | 1 |
| `components/views/ChangelogCard.jsx` | 0 | 0 | 1 | 1 |
| `components/views/VersionRow.jsx` | 0 | 0 | 1 | 1 |
| **Manuales (transversales)** | **2** | **6** | **0** | **8** |

Hojas CSS sin hallazgos automáticos (13): `base/animations`, `base/reset`,
`base/variables`, `buttons`, `estados`, `filters`, `forms`,
`changelog/date-editor`, `modals/modal-comentarios`, `modals/modal-evolution`,
`modals/modal-history`, `layouts/container`, `layouts/detail-header`
(`modal-comentarios` sí tiene el hallazgo manual M-28).

### Hallazgos por vista

| Vista | alta | media | baja | total |
|---|---:|---:|---:|---:|
| Changelog | 1 | 16 | 14 | 31 |
| Modales | 0 | 8 | 10 | 18 |
| Lista / Grid | 1 | 4 | 6 | 11 |
| Header y workspace switcher | 0 | 6 | 9 | 15 |
| Detalle CDU (tabla) | 2 | 1 | 1 | 4 |
| Detalle CDU (cabecera) | 1 | 0 | 0 | 1 |
| Transversal (toasts) | 1 | 0 | 1 | 2 |

## 2. Tabla priorizada

Severidad `alta` y `media`. Las filas marcadas **(manual)** no las detecta el script:
se comprobaron leyendo el CSS y los imports de `main.css`. Las `baja` están en el
[anexo A](#anexo-a--hallazgos-de-severidad-baja).

| ID | archivo:línea | Selector | Patrón detectado | Vista | Ancho en riesgo | Tarea destino |
|---|---|---|---|---|---|---|
| A-01 | `components/cards.css:111` | `.version-card-stats` | `grid-template-columns: repeat(4, 1fr)` rígido | Lista/Grid | 320/375/480 | **P3-02.7 (nueva)** |
| A-02 | `components/table.css:23` | `.tabla-despliegues` | `min-width: 1600px` (scroll interno vía `.table-wrapper`) | Detalle (tabla) | 320/375/480 | P3-06.1 |
| A-03 | `layouts/grid.css:14` | `.tabla-despliegues` | `min-width: 1000px` dentro de `@media (max-width:900px)` (scroll interno) | Detalle (tabla) | 320/375/480 | P3-06.1 |
| A-04 | `components/notifications.css:20` | `.toast` | `min-width: 320px` | Transversal | 320 | P3-02.6 (verificar) |
| A-05 | `layouts/header.css:106` **(manual)** | `.version-detail-meta` | `display:flex` sin `flex-wrap`; 5 campos con `min-width` vivos de 120/85/100/120/85 px (`forms.css:52-60`) | Detalle (cabecera) | 320/375/480 | P3-04.1 |
| A-06 | `components/changelog/card.css:73` **(manual)** | `.changelog-card-header` + `-left`/`-right` | fila con 2 grupos `flex-shrink:0` (versión, badges y 5 acciones) sin wrap | Changelog | 320/375 | P3-02.2 (+ P3-05.2) |
| M-01 | `components/changelog/card.css:74` | `.changelog-card-header` | `display:flex` + `gap:12px` sin `flex-wrap` | Changelog | 320/375 | P3-02.2 |
| M-02 | `components/changelog/card.css:88` | `.changelog-card-header-left` | flex + `flex-shrink:0` | Changelog | 320/375 | P3-02.2 |
| M-03 | `components/changelog/card.css:100` | `.changelog-card-header-right` | flex + `flex-shrink:0` (5 acciones) | Changelog | 320/375 | P3-02.2 |
| M-04 | `components/changelog/card.css:151` | `.changelog-badge` | `white-space: nowrap` sin ellipsis | Changelog | 320 | P3-02.2 |
| M-05 | `components/changelog/card.css:168` | `.changelog-card-actions` | flex + `gap:4px` + `opacity:0` hasta hover | Changelog | táctil | P3-02.2 / P3-05.2 |
| M-06 | `components/changelog/card.css:359` | `.changelog-footer-actions` | flex + `gap:12px` sin wrap | Changelog | 320/375 | P3-02.2 |
| M-07 | `components/changelog/card.css:378` | `.btn-cl-detail` | `white-space: nowrap` sin ellipsis | Changelog | 320 | P3-02.2 |
| M-08 | `components/changelog/timeline.css:31` | `.changelog-toolbar-right` | flex + `flex-shrink:0` sin wrap | Changelog | 320/375 | P3-02.1 |
| M-09 | `components/changelog/timeline.css:47` | `.changelog-search-wrap` | `min-width: 200px` | Changelog | 320 | P3-02.1 |
| M-10 | `components/changelog/timeline.css:118` | `.changelog-count-badge` | `white-space: nowrap` sin ellipsis | Changelog | 320 | P3-02.1 |
| M-11 | `components/changelog/modal-entries.css:12` | `.changelog-entry-autor-badge` | `white-space: nowrap` sin ellipsis | Changelog (modal) | 320 | P3-02.3 |
| M-12 | `components/changelog/modal-entries.css:71` | `.changelog-modal-tabs` | `width:220px` + `min-width:200px` + `flex-shrink:0` | Changelog (modal) | 320/375/480 | P3-02.3 |
| M-13 | `components/changelog/modal-entries.css:79` | `.changelog-modal-tab` | flex + `gap:8px` sin wrap | Changelog (modal) | 320 | P3-02.3 |
| M-14 | `components/changelog/modal-entries.css:286` | `.changelog-entry-cdu-wrap` | `min-width: 200px` | Changelog (modal) | 320 | P3-02.3 |
| M-15 | `components/changelog/modal-entries.css:56` **(manual)** | `.changelog-modal-layout` | fila `tabs 220px` + cuerpo dentro de modal `92vw` (294 px a 320) | Changelog (modal) | 320/375 | P3-02.3 / P3-03.6 |
| M-16 | `components/changelog/card.css:167` **(manual)** | `.changelog-card-actions` | acciones con `opacity:0` y `:hover` → invisibles en táctil (R-RESP-02) | Changelog | táctil | P3-05.2 |
| M-17 | `components/list-view.css:33` | `.versions-list-table th` | `white-space: nowrap` sin ellipsis | Lista | 320 | P3-06.3 |
| M-18 | `components/list-view.css:152` | `.version-list-cell-cdus` | `white-space: nowrap` | Lista | 320/375 | P3-06.3 |
| M-19 | `components/list-view.css:154` | `.version-list-cell-cdus` | `overflow: hidden` sobre texto | Lista | 320/375 | P3-06.3 |
| M-20 | `components/list-view.css:7` **(manual)** | `#versions-list-container` | `overflow:hidden` sin wrapper con `overflow-x:auto`; cabeceras `nowrap` y celdas con `min-width` 120/110/110/50 px ⇒ el contenido se recorta en silencio | Lista | 320/375/480 | P3-06.1 |
| M-21 | `components/modals/modal-base.css:47` | `.modal-header` | flex + `gap:1rem` sin wrap | Modales | 320 | P3-03.2 |
| M-22 | `components/modals/modal-deployment-report.css:55` | `.deployment-report-header-center` | flex + `flex-shrink:0` sin wrap | Modales | 320 | **P3-03.7 (nueva)** |
| M-23 | `components/modals/modal-deployment-report.css:90` | `.deployment-report-column` | `min-width: 280px` en fila de 2 columnas | Modales | 320/375/480 | **P3-03.7 (nueva)** |
| M-24 | `components/modals/modal-full-summary.css:22` | `.full-summary-meta` | flex + `flex-shrink:0` sin wrap | Modales | 320 | P3-03.1 |
| M-25 | `components/modals/modal-full-summary.css:31` | `.full-summary-meta-item` | flex + `gap:4px` sin wrap | Modales | 320 | P3-03.1 |
| M-26 | `components/modals/modal-full-summary.css:45` **(manual)** | `.full-summary-text` | `white-space: pre` + `overflow-y:auto` (fuerza `overflow-x:auto`) ⇒ las líneas no refluyen y obligan a scroll horizontal interno | Modales | 320/375/480 | P3-03.1 |
| M-27 | `components/modals/modal-login.css:5` | `.modal-login` | `min-width: 300px` gana al `max-width:90vw` (288 a 320): deja 10 px por lado y roza el borde con scrollbar | Modales | 320 | P3-03.2 |
| M-28 | `components/modals/modal-comentarios.css:6` **(manual)** | `.modal-comentarios-categorized` | `width: 51%` (163 px a 320); `max-width:900px !important` no lo corrige | Modales | 320/375/480 | **P3-03.6 (nueva)** |
| M-29 | `components/table.css:390` | `.cdu-actions` | flex + `gap` sin wrap | Detalle (tabla) | 375/480 | P3-06.3 |
| M-30 | `layouts/header.css:21` | `.header-info` | flex + `gap:1rem` sin wrap | Header | 320 | **P3-02.8 (nueva)** |
| M-31 | `layouts/header.css:40` | `.header-status-badge` | flex + `gap:6px` sin wrap | Header | 320 | **P3-02.8 (nueva)** |
| M-32 | `layouts/header.css:59` | `.header-sync-status` | flex + `gap:6px` sin wrap | Header | 320 | **P3-02.8 (nueva)** |
| M-33 | `components/view-toggle.css:50` | `.header-view-toggle` | flex + `gap:2px` sin wrap | Header | 320 | **P3-02.8 (nueva)** |
| M-34 | `components/workspace-switcher.css:26` | `.ws-trigger` | `white-space: nowrap` + `max-width:220px` | Header | 320 | P3-02.5 |
| M-35 | `components/workspace-switcher.css:61` **(manual)** | `.ws-dropdown` | `position:absolute; width:240px; left:0` sin ninguna regla móvil | Header | 320/375 | P3-02.5 |

**Lectura de la severidad.** Las 6 filas `alta` no son equivalentes: solo **A-05**
desborda la página (el `min-content` de los 5 campos supera el viewport y `body` no
recorta). **A-06** no desplaza la página porque `.changelog-card { overflow:hidden }`,
pero recorta las acciones dentro de la tarjeta y las deja inalcanzables.
**A-02/A-03** quedan contenidas por `.table-wrapper { overflow-x:auto }` (el defecto
es la falta de indicio y las 1600 px de recorrido), **A-04** está anulada por
`grid.css @600` y **A-01** solo comprime las etiquetas de las 4 estadísticas. La
prioridad de ejecución está en el §6.

## 3. Cobertura de breakpoints

Matriz de `@media` por archivo (✔ presente / — ausente). Breakpoints de R-RESP-01 más
480 px. No hay ninguna regla de 480 px en todo el proyecto.

| Archivo | 900 | 768 | 600 | 480 |
|---|:--:|:--:|:--:|:--:|
| `base/animations.css` | — | — | — | — |
| `base/reset.css` | — | — | — | — |
| `base/variables.css` | — | — | — | — |
| `components/buttons.css` | — | — | — | — |
| `components/cards.css` | — | — | — | — |
| `components/changelog/card.css` | — | — | — | — |
| `components/changelog/date-editor.css` | — | — | — | — |
| `components/changelog/modal-entries.css` | — | — | — | — |
| `components/changelog/timeline.css` | — | — | — | — |
| `components/estados.css` | — | — | — | — |
| `components/filters.css` | — | — | — | — |
| `components/forms.css` | — | — | — | — |
| `components/list-view.css` | ✔ | ✔ | — | — |
| `components/modals/deployment-info.css` | — | — | — | — |
| `components/modals/export-modal.css` | — | — | — | — |
| `components/modals/modal-base.css` | — | — | — | — |
| `components/modals/modal-comentarios.css` | — | — | — | — |
| `components/modals/modal-deployment-report.css` | — | — | — | — |
| `components/modals/modal-evolution.css` | — | — | — | — |
| `components/modals/modal-full-summary.css` | — | — | — | — |
| `components/modals/modal-history.css` | — | — | — | — |
| `components/modals/modal-login.css` | — | — | — | — |
| `components/modals/modal-progress.css` | — | — | — | — |
| `components/notifications.css` | — | — | — | — |
| `components/table.css` | — | — | — | — |
| `components/view-toggle.css` | — | — | — | — |
| `components/workspace-switcher.css` | — | — | — | — |
| `layouts/container.css` | — | — | — | — |
| `layouts/detail-header.css` | — | — | — | — |
| `layouts/grid.css` | ✔ | ✔ | ✔ | — |
| `layouts/header.css` | — | — | — | — |
| `main.css` | — | — | — | — |

**Carencia explícita de `@media` en `changelog/*` (4/4 hojas) y `modals/*` (10/10
hojas).** Fuera de `changelog/` y `modals/` tampoco tienen
breakpoints: `buttons`, `cards`, `estados`, `filters`, `forms`, `notifications`,
`table`, `view-toggle`, `workspace-switcher`, `layouts/container`,
`layouts/header`, `layouts/detail-header`.

Las 10 hojas de `modals/*` sin media queries son: `deployment-info`, `export-modal`,
`modal-base`, `modal-comentarios`, `modal-deployment-report`, `modal-evolution`,
`modal-full-summary`, `modal-history`, `modal-login`, `modal-progress`
(`modal-evolution` no tiene hallazgos: solo formulario en columna). Las 4 de
`changelog/*` son `card`, `date-editor`, `modal-entries` y `timeline`.

## 4. Riesgos específicos de la spec, comprobados en código

### 4.1 `DetailHeader` con metadatos sin `flex-wrap` (R-RESP-01) — **confirmado**

- La regla viva es `layouts/header.css:106` `.version-detail-meta`: `display:flex`,
  `gap:.5rem`, `justify-content:center`, **sin `flex-wrap`**.
- `DetailHeader.jsx:44-108` renderiza 5 campos + 2 separadores. Los `min-width` **vivos**
  están en `forms.css:52-60` (120 + 85 + 100 + 120 + 85 = **510 px**); `header.css:115`
  añade `gap:.5rem` por campo ⇒ el ancho intrínseco ronda 550–580 px.
- **`layouts/detail-header.css` no se importa en `main.css`** (verificado: las líneas
  3-41 de `main.css` no lo incluyen). Por tanto su `flex-wrap: wrap`
  (`detail-header.css:35`) **nunca se aplica**; es una corrección inerte. Sus
  `min-width` 110/80/120 tampoco cuentan: los reales son los de `forms.css`.
- Consecuencia: a 320/375/480 la cabecera de detalle desborda horizontalmente y
  arrastra al `.version-detail-header` (que sí tiene `flex-wrap`, pero sus hijos
  internos no encogen).
- **Corrección de alcance propuesta:** P3-04.1 debe editar `layouts/header.css` (o
  importar `detail-header.css` primero, lo que es P1-06.2). Tal como está redactada
  («`detail-header.css`»), la tarea no arregla nada.

### 4.2 `workspace-switcher.css` sin reglas móviles — **confirmado (M-34, M-35)**

- 0 media queries en la hoja. `.ws-trigger` tiene `white-space:nowrap` y
  `max-width:220px` (el nombre recorta con ellipsis, ok).
- `.ws-dropdown` es `position:absolute`, `left:0`, `width:240px`. Cabe a 320 px si el
  switcher está pegado al borde izquierdo, pero no hay ninguna regla que lo garantice
  ni que lo convierta en hoja inferior; queda a expensas del layout del header.
- `.ws-item-delete` (`:181`) usa `opacity:0` + hover ⇒ mismo problema táctil que el
  changelog (P3-05.2, no solo `changelog/card.css`).

### 4.3 Modales a 320 px — **confirmado con matices**

| Hoja | Qué pasa a 320 | Tarea |
|---|---|---|
| `modal-base.css` | `.modal { max-width:90vw }` = 288 px; `overflow:hidden` recorta; `.modal-header` sin wrap | P3-03.2 |
| `modal-login.css` | `min-width:300px` gana al `max-width:90vw` (288 px): el modal mide 300 y deja 10 px por lado | P3-03.2 |
| `modal-full-summary.css` | `width:860px` queda limitado por `max-width:95vw` (ok), pero `.full-summary-text` usa `white-space:pre` y las líneas no refluyen: scroll horizontal interno | P3-03.1 |
| `modal-progress.css` | `.modal-progress.modal-expanded { width:95vw }`; `.modal-progress-content` con `padding:2rem` deja 240 px; `.chart-details { column-width:300px; overflow-x:auto }` ⇒ columna mayor que el contenedor | P3-03.3 |
| `export-modal.css` | `width:90vw; max-width:600px` (ok); `.export-option-card` flex con icono fijo de 28 px | P3-03.4 |
| `deployment-info.css` | `.dep-info-header` sí tiene `flex-wrap`; `.dep-info-cat-item` no | P3-03.5 |
| `modal-deployment-report.css` | `.deployment-report-column { min-width:280px }` en fila; cabecera con `flex-shrink:0` | **P3-03.7 (nueva)** |
| `modal-comentarios.css` | `width:51%` = 163 px a 320 | **P3-03.6 (nueva)** |
| `modal-history.css` | solo columna con scroll vertical; sin hallazgos | — |
| `modal-evolution.css` | `.form-row--split` 2 columnas dentro de modal: 2×~90 px, ajustado pero sin overflow | — |

### 4.4 Tablas de datos (R-RESP-03) — **parcial**

- `table.css:11` `.table-wrapper { overflow-x:auto; overflow-y:auto; max-height:600px }`
  **sí** contiene el scroll. `DetailView.jsx:163` envuelve la tabla con ese wrapper.
  Por eso `min-width:1600px` (A-02) y `min-width:1000px` a ≤900 (A-03) **no generan
  scroll de página**, pero sí obligan a recorrer 1600 px de tabla.
- Falta **indicio visual** de que se puede desplazar (P3-06.2) y el criterio de
  ocultación de columnas secundarias es inexistente en `table.css` (P3-06.3).
- La **lista** (`list-view.css`) no tiene ese wrapper: `VersionList.jsx:99` monta
  `<div id="versions-list-container">` con `overflow:hidden` y la tabla dentro, sin
  contenedor desplazable. A 900/768 se ocultan columnas, pero las cabeceras siguen en
  `white-space:nowrap` y las celdas con `min-width` (120/110/110/50 px) dentro de una
  tabla `table-layout:fixed` al 100 %: el texto sobrante se recorta contra el borde
  del contenedor, sin scroll ni ellipsis visible en todas las celdas (M-20).
- Consecuencia para R-RESP-03: en la tabla de CDUs la ocultación/scroll existe (falta
  el indicio); en la lista **no existe mecanismo**, se recorta. P3-06 debe tratar ambas
  de forma consistente (P3-06.1/P3-06.3).

### 4.5 Acciones visibles solo con hover (R-RESP-02) — **confirmado**

- `.changelog-card-actions { opacity:0 }` + `.changelog-card-header:hover` ⇒ en táctil
  las 5 acciones son inalcanzables; además **siguen ocupando layout** (agravan el
  recorte de A-06/M-01).
- `.ws-item-delete { opacity:0 }` en `workspace-switcher.css:181` (mismo patrón; el
  resto de acciones del switcher son visibles).
- En `list-view.css` **no** hay acciones ocultas: los botones son visibles. La tarea
  P3-05.2 debe cubrir `changelog/card.css` **y** `workspace-switcher.css`.

## 5. Lo que no se puede concluir sin navegador

Declarado como límite, no como resultado:

1. **Scroll horizontal real de la página** a 320/375/480: no medido. La auditoría
   detecta causas, no confirma el síntoma. Requiere P3-02.6.
2. **200 % de zoom y reflow** (R-A11Y-08): imposible sin render. Requiere P3-07.1.
3. **Emulación táctil / puntero grueso** y visibilidad de acciones sin hover:
   requiere P3-05.3.
4. **Recorte efectivo vs. scroll interno** en `modal-progress`, `modal-full-summary`
   y `list-view`: el CSS permite ambas lecturas; solo el render lo decide.
5. **Comportamiento del dropdown** en el header real (posición y desbordamiento
   derecho) y del `position:fixed` del `toast-container`.
6. **Interacción con contenido real**: los anchos dependen de textos variables
   (fuente, nombres de workspace, badges de autor). Los `min-width` medidos son cotas
   inferiores.

**Tareas bloqueadas por A-05/P0-04:** P3-02.6 (verificación a 320), P3-05.3
(emulación táctil), P3-07.1 (200 % de zoom) y, por dependencia, P3-07.2 (cierre de G3).
P0-04.1–7 siguen ☐ en el tablero.

## 6. Plan de ejecución propuesto (derivado de los hallazgos)

Orden por riesgo real, no por orden teórico del plan:

1. **P3-02.2 `changelog/card.css`** (7 media, 1 alta manual A-06): es el bloque más
   roto. El header no envuelve y las acciones no encogen.
2. **P3-02.3 `changelog/modal-entries.css`** (4 media, M-15): tabs fijos de 220 px
   dentro de un modal de 92vw. Incluye `date-editor.css` (P3-02.4) en el mismo paso
   si se toca `.date-modal-fields`.
3. **P3-02.1 `changelog/timeline.css`** (3 media): toolbar/buscador.
4. **P3-04.1** (A-05), pero **sobre `layouts/header.css`**, no sobre
   `detail-header.css` (no importado). Coordinar con P1-06.2.
5. **P3-02.5 + P3-02.8 (nueva)**: `workspace-switcher.css` y `layouts/header.css`
   (`header-info`, badges, `header-view-toggle`).
6. **P3-03.1 / P3-03.2 / P3-03.3 / P3-03.4 / P3-03.5** y las nuevas **P3-03.6**
   (`modal-comentarios.css`) y **P3-03.7** (`modal-deployment-report.css`).
7. **P3-06.1 / P3-06.2 / P3-06.3**: indicio de scroll y ocultación de columnas;
   añadir `#versions-list-container` a P3-06.1 (hoy solo menciona `table.css`).
8. **P3-05.2**: ampliar alcance a `workspace-switcher.css`.
9. **P3-02.7 (nueva)**: breakpoints de `cards.css` (`.version-card-stats`).
10. **P3-02.6 → P3-05.3 → P3-07.1 → P3-07.2** cuando exista build y baseline.

### Tareas nuevas propuestas (no creadas en `plan.md`)

| ID propuesto | Tarea | Archivos | Motivo |
|---|---|---|---|
| P3-02.7 | Breakpoints de la tarjeta de versión | `components/cards.css` | A-01: grid rígido de 4 estadísticas; sin `@media` |
| P3-02.8 | Breakpoints de la cabecera global | `layouts/header.css`, `components/view-toggle.css` | M-30…M-33: 4 filas flex sin wrap; sin `@media` |
| P3-03.6 | Adaptar el modal de comentarios a 320 | `modals/modal-comentarios.css` | M-28 y M-15: `width:51%` |
| P3-03.7 | Adaptar el reporte de despliegue a 320 | `modals/modal-deployment-report.css` | M-22/M-23: columna `min-width:280px` |

Además, dos correcciones de alcance sobre tareas existentes: **P3-04.1** debe apuntar
a `layouts/header.css` (o importar antes `detail-header.css`, P1-06.2) y **P3-06.1**
debe incluir `components/list-view.css` para el contenedor de la lista.

## Anexo A — Hallazgos de severidad baja

Los 41 hallazgos `baja` son patrones ya mitigados o de bajo impacto: `nowrap` con
`text-overflow:ellipsis`, `overflow:hidden` sobre texto que recorta en vez de
desbordar, `width` fija limitada por `max-width`, flex en columnas de contenido y
`width`/`height` numéricos en SVG **con `viewBox`** (escalan). Lista completa:

| # | archivo:línea | Selector | Detalle |
|---|---|---|---|
| B-01 | `components/cards.css:54` | `.version-card-number` | `nowrap` + ellipsis |
| B-02 | `components/cards.css:55` | `.version-card-number` | `overflow:hidden` con ellipsis |
| B-03 | `components/changelog/card.css:118` | `.changelog-version-title` | `nowrap` + ellipsis |
| B-04 | `components/changelog/card.css:119` | `.changelog-version-title` | `overflow:hidden` con ellipsis |
| B-05 | `components/changelog/card.css:261` | `.changelog-entry-item` | flex sin wrap (contenido) |
| B-06 | `components/changelog/card.css:316` | `.btn-changelog-add-inline` | flex sin wrap (botón) |
| B-07 | `components/changelog/card.css:347` | `.changelog-cdu-stats` | flex sin wrap |
| B-08 | `components/changelog/modal-entries.css:108` | `.tab-label` | `nowrap` + ellipsis |
| B-09 | `components/changelog/modal-entries.css:109` | `.tab-label` | `overflow:hidden` con ellipsis |
| B-10 | `components/changelog/modal-entries.css:170` | `.btn-changelog-add` | flex sin wrap |
| B-11 | `components/changelog/modal-entries.css:227` | `.btn-changelog-add-empty` | flex sin wrap |
| B-12 | `components/changelog/modal-entries.css:240` | `.changelog-entry-row` | flex sin wrap |
| B-13 | `components/changelog/modal-entries.css:282` | `.changelog-entry-cdu-wrap` | flex sin wrap |
| B-14 | `components/changelog/modal-entries.css:299` | `.changelog-entry-autor-wrap` | flex sin wrap |
| B-15 | `components/changelog/timeline.css:40` | `.changelog-search-wrap` | flex sin wrap |
| B-16 | `components/list-view.css:7` | `#versions-list-container` | `overflow:hidden` genérico (ver M-20) |
| B-17 | `components/list-view.css:142` | `.version-list-row td` | `overflow:hidden` con ellipsis |
| B-18 | `components/list-view.css:146` | `.version-list-row td` | `nowrap` + ellipsis |
| B-19 | `components/modals/deployment-info.css:129` | `.dep-info-cat-item` | flex sin wrap |
| B-20 | `components/modals/export-modal.css:30` | `.export-option-card` | flex sin wrap |
| B-21 | `components/modals/modal-base.css:84` | `.modal-content-container` | flex sin wrap |
| B-22 | `components/modals/modal-deployment-report.css:77` | `.deployment-report-body` | flex sin wrap |
| B-23 | `components/modals/modal-full-summary.css:6` | `.modal-full-summary` | `width:860px` limitada por `max-width:95vw` |
| B-24 | `components/modals/modal-login.css:46` | `.login-title` | flex sin wrap |
| B-25 | `components/modals/modal-progress.css:35` | `.progress-bar-container` | `overflow:hidden` (barra) |
| B-26 | `components/modals/modal-progress.css:191` | `.pie-chart-container` | flex sin wrap |
| B-27 | `components/notifications.css:15` | `.toast-container` | `width:500px` limitada por `max-width:90vw` |
| B-28 | `components/table.css:8` | `.table-container` | `overflow:hidden` (marco) |
| B-29 | `components/workspace-switcher.css:12` | `.ws-trigger` | flex sin wrap |
| B-30 | `components/workspace-switcher.css:42` | `.ws-trigger-name` | `overflow:hidden` con ellipsis |
| B-31 | `components/workspace-switcher.css:101` | `.ws-item-wrap` | flex sin wrap |
| B-32 | `components/workspace-switcher.css:114` | `.ws-item` | flex sin wrap |
| B-33 | `components/workspace-switcher.css:151` | `.ws-item-name` | `overflow:hidden` con ellipsis |
| B-34 | `components/workspace-switcher.css:153` | `.ws-item-name` | `nowrap` + ellipsis |
| B-35 | `components/workspace-switcher.css:201` | `.ws-new-btn` | flex sin wrap |
| B-36 | `components/workspace-switcher.css:224` | `.ws-new-input-wrap` | flex sin wrap |
| B-37 | `components/layout/WorkspaceSwitcher.jsx:87` | `<svg>` | `width=16 height=16` + `viewBox` |
| B-38 | `components/modals/ExportModal.jsx:79` | `<svg>` | `width=28 height=28` + `viewBox` |
| B-39 | `components/modals/ExportModal.jsx:104` | `<svg>` | `width=28 height=28` + `viewBox` |
| B-40 | `components/views/ChangelogCard.jsx:159` | `<svg>` | `width=14 height=14` + `viewBox` |
| B-41 | `components/views/VersionRow.jsx:90` | `<svg>` | `width=16 height=16` + `viewBox` |

## Anexo B — Falsos positivos verificados

| Hallazgo | Por qué no es un defecto |
|---|---|
| `table.css:23` / `grid.css:14` (`min-width` de tabla) | `DetailView.jsx:163` envuelve con `.table-wrapper { overflow-x:auto }`; el scroll queda contenido. El defecto real es la falta de indicio (P3-06.2). |
| `notifications.css:20` `.toast { min-width:320px }` | `grid.css @600` lo anula: `.toast { min-width:auto; width:100% }`. A 320 no hay riesgo. |
| `modal-full-summary.css:6` `width:860px` | Limitado por `max-width:95vw`; a 320 mide 304 px. El problema es el texto `pre`, no la anchura. |
| SVG con `width`/`height` numéricos | Todos llevan `viewBox` y escalan; `PieChart` y `BadaGraph` usan `viewBox` (`ProgressModal.jsx:33,47`, `BadaGraph.jsx:21`) y no tienen tamaño fijo. |

## Anexo C — Reproductibilidad

```bash
node scripts/audit-responsive.mjs              # tabla Markdown + matriz + JSX
node scripts/audit-responsive.mjs --json       # salida para F6/CI
node scripts/audit-responsive.mjs --fail-on-alta  # exit 1 si hay severidad alta
```

El script no mide el render: parsea CSS (strip de comentarios, pila de `@media`),
recorre `src/styles/**/*.css` y `src/components/**/*.jsx`, y aplica las 7 heurísticas
de P3-01. Limitación conocida: analiza todas las hojas, **incluidas las no importadas**
(`detail-header.css`), de modo que una corrección muerta puede ocultar el riesgo vivo
(caso A-05).
