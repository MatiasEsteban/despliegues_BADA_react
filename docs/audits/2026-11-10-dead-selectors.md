# Inventario de selectores CSS y consumidores JSX — 2026-11-10

| Campo | Valor |
|---|---|
| Fecha | 2026-11-10 |
| Rama | `feat/spec-001-design-hardening` |
| Commit de referencia | `735c8a6` — `spec-001(A-01/P1-09): plan en la raiz y tablero actualizado` |
| Spec | [`../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Plan | [`../../plan.md`](../../plan.md) — tareas `P1-10.1` y `P1-10.5` |
| Script | `scripts/audit-selectors.mjs` |
| Comando | `node scripts/audit-selectors.mjs` |

> Este informe es el inventario de `P1-10.1` (R-DS-04). **No elimina nada**: la limpieza corresponde a `P1-10.2`, `P1-10.3` y `P1-10.4`. La tabla de muertas está ordenada por destino para que cada una de esas tareas pueda ejecutarse directamente.

---

## 1. Resumen

| Métrica | Valor |
|---|---:|
| Archivos CSS analizados | 32 |
| Archivos JS/JSX analizados | 50 |
| Clases CSS únicas | 481 |
| Clases CSS consumidas | 404 |
| Clases CSS dinámicas | 21 |
| Clases CSS muertas | 56 |
| Clases en JSX sin regla CSS | 31 |

Muertas por destino:

| Destino | Clases |
|---|---:|
| `P1-10.2` base/layouts | 11 |
| `P1-10.3` components | 3 |
| `P1-10.4` modales/changelog | 42 |
| **Total** | **56** |

**Criterio de clasificación** (implementado en el script):

- **CONSUMIDA**: la clase aparece como token exacto en `className`, `clsx(...)`, `classList.*` o `element.className =` de `src/**/*.{js,jsx}`, o en `index.html` / `public/`.
- **DINÁMICA**: la clase solo puede generarse por template literal con un prefijo detectado (`prefijo-${expr}`) o por un estado añadido en JS/render condicional.
- **MUERTA**: sin ninguna coincidencia exacta en código, HTML ni `public/`.

El script recorre `src/styles/**/*.css`, procesa el interior de `@media`/`@supports`, ignora `@keyframes`/`@font-face`, descarta `url(...)`, atributos y pseudo-clases, separa selectores agrupados por coma y elimina comentarios antes de buscar tokens.

---

## 2. Clases muertas (56)

### 2.1 Destino `P1-10.2` — base/layouts (11)

| Clase | Archivo:línea | Reglas | Evidencia de descarte |
|---|---|---:|---|
| `adding` | `src/styles/base/animations.css:74` | 1 | 0 tokens exactos en JS/JSX; solo coincidencias de `padding` |
| `btn-toggle-comment` | `src/styles/layouts/header.css:126` | 2 | 0 tokens; `CommentsModal` usa `btn-secondary` |
| `comentario-display-categoria` | `src/styles/layouts/header.css:103` | 1 | 0 tokens en JS/JSX |
| `comentario-display-header` | `src/styles/layouts/header.css:110` | 2 | 0 tokens en JS/JSX |
| `comentario-display-list` | `src/styles/layouts/header.css:142` | 4 | 0 tokens en JS/JSX |
| `comentario-header-title` | `src/styles/layouts/header.css:119` | 1 | 0 tokens en JS/JSX |
| `filtered-match` | `src/styles/base/animations.css:78` | 1 | 0 tokens exactos; ningún `classList.add` lo aplica |
| `icon-large` | `src/styles/base/reset.css:29` | 1 | 0 tokens en JS/JSX |
| `removing` | `src/styles/base/animations.css:68` | 1 | 0 tokens exactos; ningún `classList.add` lo aplica |
| `version-comments-container` | `src/styles/layouts/header.css:97` | 1 | 0 tokens en JS/JSX |
| `version-comments-display` | `src/styles/layouts/header.css:89` | 1 | 0 tokens en JS/JSX |

### 2.2 Destino `P1-10.3` — components (3)

| Clase | Archivo:línea | Reglas | Evidencia de descarte |
|---|---|---:|---|
| `badge-produccion-inline` | `src/styles/components/cards.css:258` | 2 | 0 tokens; la segunda regla está en `layouts/grid.css:48` |
| `btn-save-changes` | `src/styles/components/buttons.css:232` | 5 | 0 tokens exactos; `btn-save` sí existe y está consumido |
| `changes-count` | `src/styles/components/buttons.css:268` | 2 | 0 tokens; no confundir con `changelog-count-badge` (consumida) |

### 2.3 Destino `P1-10.4` — modales/changelog (42)

| Clase | Archivo:línea | Reglas | Evidencia de descarte |
|---|---|---:|---|
| `cat-icon` | `src/styles/components/modals/modal-comentarios.css:43` | 2 | 0 tokens; segunda regla en `layouts/header.css:173` |
| `change-cdu-name` | `src/styles/components/modals/modal-changes-summary.css:83` | 6 | 0 tokens en JS/JSX |
| `change-creation-note` | `src/styles/components/modals/modal-changes-summary.css:143` | 1 | 0 tokens en JS/JSX |
| `change-details` | `src/styles/components/modals/modal-changes-summary.css:78` | 1 | 0 tokens en JS/JSX |
| `change-estado` | `src/styles/components/modals/modal-changes-summary.css:99` | 4 | 0 tokens en JS/JSX |
| `change-header` | `src/styles/components/modals/modal-changes-summary.css:35` | 1 | 0 tokens en JS/JSX |
| `change-item` | `src/styles/components/modals/modal-changes-summary.css:23` | 2 | 0 tokens en JS/JSX |
| `change-item-creation` | `src/styles/components/modals/modal-changes-summary.css:124` | 4 | 0 tokens en JS/JSX |
| `change-item-produccion` | `src/styles/components/modals/modal-changes-summary.css:149` | 6 | 0 tokens en JS/JSX |
| `change-number` | `src/styles/components/modals/modal-changes-summary.css:43` | 1 | 0 tokens en JS/JSX |
| `change-type-badge` | `src/styles/components/modals/modal-changes-summary.css:59` | 4 | 0 tokens en JS/JSX |
| `change-version` | `src/styles/components/modals/modal-changes-summary.css:53` | 1 | 0 tokens en JS/JSX |
| `changelog-date` | `src/styles/components/changelog/card.css:123` | 1 | 0 tokens exactos; `changelog-dates-group` es otra clase |
| `changelog-time` | `src/styles/components/changelog/card.css:132` | 1 | 0 tokens exactos; `changelog-timeline` es otra clase |
| `changes-summary` | `src/styles/components/modals/modal-changes-summary.css:3` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdu-row` | `src/styles/components/modals/deployment-info.css:214` | 2 | 0 tokens en JS/JSX |
| `dep-info-cdu-row--certificado-ok` | `src/styles/components/modals/deployment-info.css:256` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdu-row--en-desarrollo` | `src/styles/components/modals/deployment-info.css:246` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdu-row--en-produccion` | `src/styles/components/modals/deployment-info.css:261` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdu-row--pendiente-de-certificacion` | `src/styles/components/modals/deployment-info.css:251` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdu-row-estado` | `src/styles/components/modals/deployment-info.css:236` | 5 | 0 tokens en JS/JSX |
| `dep-info-cdu-row-name` | `src/styles/components/modals/deployment-info.css:226` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdus-list` | `src/styles/components/modals/deployment-info.css:208` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdus-section` | `src/styles/components/modals/deployment-info.css:194` | 1 | 0 tokens en JS/JSX |
| `dep-info-cdus-title` | `src/styles/components/modals/deployment-info.css:199` | 1 | 0 tokens en JS/JSX |
| `dep-info-preview` | `src/styles/components/modals/deployment-info.css:275` | 1 | 0 tokens en JS/JSX |
| `dep-info-preview-label` | `src/styles/components/modals/deployment-info.css:280` | 1 | 0 tokens en JS/JSX |
| `dep-info-preview-text` | `src/styles/components/modals/deployment-info.css:289` | 3 | 0 tokens en JS/JSX |
| `deployment-report` | `src/styles/components/modals/modal-deployment-report.css:3` | 2 | 0 tokens exactos; el modal no recibe `className` |
| `deployment-report-header-right` | `src/styles/components/modals/modal-deployment-report.css:91` | 2 | 0 tokens; el JSX usa `deployment-report-header-left` |
| `estado-new` | `src/styles/components/modals/modal-changes-summary.css:111` | 2 | 0 tokens en JS/JSX |
| `estado-old` | `src/styles/components/modals/modal-changes-summary.css:106` | 2 | 0 tokens en JS/JSX |
| `icon-arrow` | `src/styles/components/modals/modal-changes-summary.css:118` | 1 | 0 tokens en JS/JSX |
| `icon-deployment` | `src/styles/components/modals/modal-deployment-report.css:81` | 2 | 0 tokens en JS/JSX |
| `login-group` | `src/styles/components/modals/modal-login.css:14` | 2 | 0 tokens en JS/JSX; `Login.jsx` usa `login-form-group` |
| `modal-box` | `src/styles/components/modals/deployment-info.css:22` | 1 | 0 tokens; el CSS de `modal-base` aplica `.modal` |
| `modal-changes-summary-content` | `src/styles/components/modals/modal-changes-summary.css:17` | 1 | 0 tokens en JS/JSX |
| `modal-changes-summary-info` | `src/styles/components/modals/modal-changes-summary.css:8` | 1 | 0 tokens en JS/JSX |
| `modal-historial-header` | `src/styles/components/modals/modal-base.css:169` | 2 | 0 tokens; `modal-history.css` no lo usa |
| `modal-icon-header` | `src/styles/components/modals/modal-base.css:66` | 1 | 0 tokens en JS/JSX |
| `progress-label` | `src/styles/components/modals/modal-progress.css:30` | 1 | 0 tokens; `ProgressModal` usa `progress-note` |
| `tab-emoji` | `src/styles/components/changelog/modal-entries.css:106` | 1 | 0 tokens en JS/JSX |

> **Coordinación entre destinos**: `cat-icon` tiene una segunda regla en `layouts/header.css:173` y `badge-produccion-inline` en `layouts/grid.css:48`. Al aparecer primero en un archivo de `components/`, la tabla las asigna a `P1-10.3`/`P1-10.4`, pero la eliminación debe cubrir también la regla de `base/layouts` (`P1-10.2`).

---

## 3. Clases dinámicas (21)

Se conservan porque su nombre se construye en tiempo de ejecución. Ninguna debe borrarse en `P1-10.2–4` sin revisar antes el consumidor.

| Clase | Generación | Evidencia |
|---|---|---|
| `btn-back` | `` `btn-${variant}` `` | `src/components/ui/Button.jsx:8`; `variant="back"` en `views/detail/DetailHeader.jsx:35` |
| `btn-info` | `` `btn-${variant}` `` | `Button.jsx:8`; `variant="info"` en `layout/Header.jsx:163` |
| `btn-purple` | `` `btn-${variant}` `` | `Button.jsx:8`; `variant="purple"` en `views/ChangelogView.jsx:131` |
| `btn-secondary` | `` `btn-${variant}` `` | `Button.jsx:8`; usado en varios modales y `Header.jsx:172` |
| `btn-success` | `` `btn-${variant}` `` | `Button.jsx:8`; `variant="success"` en `layout/Header.jsx:167` |
| `changelog-modal-tab--cambiosCaliente` | `` `changelog-modal-tab--${key}` `` | `modals/ChangelogEntriesModal.jsx:111` |
| `changelog-modal-tab--cambiosCDU` | `` `changelog-modal-tab--${key}` `` | `modals/ChangelogEntriesModal.jsx:111` |
| `changelog-modal-tab--mejoras` | `` `changelog-modal-tab--${key}` `` | `modals/ChangelogEntriesModal.jsx:111` |
| `changelog-modal-tab--observaciones` | `` `changelog-modal-tab--${key}` `` | `modals/ChangelogEntriesModal.jsx:111` |
| `changelog-modal-tab--salidas` | `` `changelog-modal-tab--${key}` `` | `modals/ChangelogEntriesModal.jsx:111` |
| `dep-info-cat--cambiosCaliente` | `` `dep-info-cat--${key}` `` | `modals/DeploymentInfoModal.jsx:179` |
| `dep-info-cat--mejoras` | `` `dep-info-cat--${key}` `` | `modals/DeploymentInfoModal.jsx:179` |
| `dep-info-cat--observaciones` | `` `dep-info-cat--${key}` `` | `modals/DeploymentInfoModal.jsx:179` |
| `dep-info-cat--salidas` | `` `dep-info-cat--${key}` `` | `modals/DeploymentInfoModal.jsx:179` |
| `modal-error` | `` `modal-${type}` `` | `ui/Modal.jsx:26`; `type` se compara con `'error'` en `Modal.jsx:21` |
| `modal-success` | `` `modal-${type}` `` | `ui/Modal.jsx:26`; `Modal.jsx:19` |
| `modal-warning` | `` `modal-${type}` `` | `ui/Modal.jsx:26`; `Modal.jsx:20` |
| `toast-error` | `` `toast-${type}` `` | `ui/Toast.jsx:12`; comparación en `Toast.jsx:8` |
| `toast-info` | `` `toast-${type}` `` | `ui/Toast.jsx:12`; valor por defecto `type = 'info'` |
| `toast-success` | `` `toast-${type}` `` | `ui/Toast.jsx:12`; `Toast.jsx:7` |
| `toast-warning` | `` `toast-${type}` `` | `ui/Toast.jsx:12`; `Toast.jsx:9` |

Prefijos detectados por el script:

| Prefijo | Evidencia |
|---|---|
| `changelog-modal-tab--` | `ChangelogEntriesModal.jsx:111` |
| `dep-info-cat--` | `DeploymentInfoModal.jsx:179` |
| `modal-` | `ui/Modal.jsx:26` y `:38` |
| `toast-` | `ui/Toast.jsx:12` |
| `btn-` | `ui/Button.jsx:8` |

Además de los template literales, el script recoge los valores de `variant`/`type` del código para limitar los prefijos abiertos (`btn-`, `modal-`, `toast-`): una clase solo se marca dinámica si su sufijo coincide con un valor real usado en el JSX. Por eso `btn-back` y `btn-purple` constan como dinámicas y no como muertas.

---

## 4. Clases usadas en JSX sin regla CSS (31)

| Clase | Evidencia | Severidad |
|---|---|---|
| `baja` | `views/detail/StepsEditor.jsx:81` | cosmética |
| `btn-cl-duplicate` | `views/ChangelogCard.jsx:155` | cosmética |
| `btn-date-now` | `views/DateQuickEditor.jsx:132` | cosmética |
| `btn-eliminar` | `views/detail/CduRow.jsx:135` | cosmética |
| `campo-cdu` | `views/detail/CduRow.jsx:33` | posible bug |
| `campo-version-miro` | `views/detail/CduRow.jsx:81` | posible bug |
| `changelog-card--expanded` | `views/ChangelogCard.jsx:81` | cosmética |
| `chart-card` | `modals/ProgressModal.jsx:110` | cosmética |
| `chart-content-wrapper` | `modals/ProgressModal.jsx:120` | cosmética |
| `chart-details` | `modals/ProgressModal.jsx:146` | cosmética |
| `chart-legend` | `modals/ProgressModal.jsx:63` | cosmética |
| `chart-section` | `modals/ProgressModal.jsx:89` | cosmética |
| `chart-subtitle` | `modals/ProgressModal.jsx:118` | cosmética |
| `chart-title` | `modals/ProgressModal.jsx:90` | cosmética |
| `charts-grid` | `modals/ProgressModal.jsx:106` | cosmética |
| `dep-info-item-text` | `modals/DeploymentInfoModal.jsx:191` | cosmética |
| `evolution-form` | `modals/EvolutionModal.jsx:45` | cosmética |
| `evolution-warning` | `modals/EvolutionModal.jsx:46` | cosmética |
| `fade-in` | `views/ChangelogView.jsx:69` | posible bug |
| `form-row` | `modals/EvolutionModal.jsx:50` | cosmética |
| `form-section` | `modals/EvolutionModal.jsx:87` | cosmética |
| `icon-tiny` | `modals/CduHistoryModal.jsx:47` | cosmética |
| `input-field` | `modals/EvolutionModal.jsx:66` | cosmética |
| `legend-color` | `modals/ProgressModal.jsx:68` | posible bug |
| `legend-item` | `modals/ProgressModal.jsx:67` | cosmética |
| `legend-label` | `modals/ProgressModal.jsx:69` | cosmética |
| `modal-evolution` | `modals/EvolutionModal.jsx:37` | posible bug |
| `pasos-summary-text` | `views/detail/StepsEditor.jsx:36` | cosmética |
| `pie-chart` | `modals/ProgressModal.jsx:133` | cosmética |
| `pie-chart-container` | `modals/ProgressModal.jsx:127` | cosmética |
| `status-column` | `modals/ProgressModal.jsx:161` | cosmética |

Justificación de los cinco `posible bug`:

- `campo-cdu` / `campo-version-miro`: los inputs de `CduRow` están en la tabla y reciben el estilo genérico `.tabla-despliegues input`, pero las clases no aportan el tamaño/alineación de columna que sugieren.
- `fade-in`: `ChangelogView` declara animación de entrada; no existe regla `.fade-in` (la animación `fadeIn` solo se aplica a `.view-container` y a las filas de tabla).
- `legend-color`: el `<span>` no tiene ancho ni alto; sin regla el swatch de la leyenda queda vacío (0 × 0).
- `modal-evolution`: `Modal` recibe `className` para una variante que no tiene regla; el modal usa el ancho por defecto.

El resto son nombres redundantes: el elemento ya está estilado por otra regla o por estilos inline (caso de `ProgressModal`, que concentra 24 de los 78 inline styles del proyecto).

---

## 5. Falsos positivos descartados

| Caso | Cómo se descartó |
|---|---|
| `adding` vs `padding` | La búsqueda es por token exacto con límites `[^A-Za-z0-9_-]`; `padding` no cuenta |
| `changelog-date` / `changelog-time` | Solo existen `changelog-dates-group` y `changelog-timeline`; el token exacto no aparece |
| `btn-save-changes` vs `btn-save` | `btn-save` está consumido; `btn-save-changes` no aparece como token |
| `deployment-report` | El JSX usa `deployment-report-header-*` y `deployment-report-item`; el token desnudo no aparece |
| `modal-box` | El JSX aplica `modal-deployment-info` al wrapper, nunca `modal-box` |
| `toast-error` / `modal-error` / `toast-success` | Generadas por template literal y por comparaciones `type === 'error'`; clasificadas DINÁMICA. El primer regex solo veía el valor por defecto `'info'` y las marcaba muertas: se corrigió para incluir `===`/`!==` |
| Estados de JS | `toast-show` y `toast-loading` (`utils/notifications.js:40,148`), `campo-invalido` (`utils/validator.js:113`) y `modal-show` (`Modal.jsx:24`, condicional `clsx`) se detectan como CONSUMIDA |
| Clases en `index.html` / `public/` | Se revisaron ambos orígenes; no aportan clases a este inventario |

---

## 6. Riesgos

- **No borrar estados aplicados desde JS**: `.modal-show`, `.toast-show`, `.toast-loading`, `.toast-spinner`, `.campo-invalido` y `.active` dependen de `classList`/`clsx`, aunque su nombre no aparezca literal en un `className`.
- **Hooks de animación transitorios**: `adding`, `removing` y `filtered-match` no tienen consumidor hoy, pero son ganchos de animación de la tabla. Antes de borrarlos, revisar si `dataStore`/`notifications.js` los aplicarán tras una refactorización pendiente.
- **Reglas que nunca se activan**: `.modal.deployment-report` y `.modal-deployment-info .modal-box` están muertas, pero contienen layout del modal. `P1-07.3` ya declaró ausentes esos selectores y las reglas siguen ahí: conviene confirmar si su eliminación cambia el tamaño de esos modales antes de tocar `P1-10.4`.
- **Archivo completo obsoleto**: `modal-changes-summary.css` aporta 17 de las 42 muertas de `P1-10.4`; corresponde a un modal que ya no se monta. La opción más segura es retirar el archivo y su `@import` (`main.css:25`) en bloque, no regla a regla.
- **Duplicados entre destinos**: `cat-icon` (modal + header) y `badge-produccion-inline` (cards + grid) obligan a coordinar `P1-10.2` con `P1-10.3`/`P1-10.4`.
- **Heurística conservadora**: cualquier sufijo que coincida con un valor de `variant`/`type` se considera dinámico. Es deliberado para no borrar clases vivas, pero `P1-10.5` debe revisar manualmente los 21 dinámicos y no exigir su desaparición.
- **Alcance de `P1-10.5`**: la salida esperada es la tabla de **muertas** vacía; las 31 clases JSX sin regla son informativas y se resuelven en `P2`/`DetailHeader`, no en la limpieza de CSS.
- **Verificación visual pendiente**: toda eliminación de `P1-10.2–4` necesita diff visual (bloqueado por `P0-04`).

---

## 7. Reproducción

```bash
node scripts/audit-selectors.mjs
```

Salida por `stderr` (resumen):

```
CSS clases: 481 | consumidas: 404 | dinámicas: 21 | muertas: 56 | JSX sin regla: 31
```

Salida por `stdout`: las tablas de las secciones 1–4 en Markdown. El script no modifica archivos y termina con código 0; es reutilizable por `P1-10.5`.

---

## 8. Ejecución P1-10.2/P1-10.3

Ejecutado el 2026-11-10 sobre los destinos `base/`, `layouts/` y `components/`. Se eliminaron **14 clases muertas** (11 de `P1-10.2`, 3 de `P1-10.3`) repartidas en **25 reglas** y **3 comentarios de sección**. No se tocó `P1-10.4`: sus 42 clases siguen en el árbol.

### 8.1 Acciones por clase

| Clase | Archivo | Acción | Razón |
|---|---|---|---|
| `adding` | `base/animations.css` | Eliminada (1 regla) | 0 consumidores; ningún `classList` la aplica |
| `removing` | `base/animations.css` | Eliminada (1 regla) | 0 consumidores; ningún `classList` la aplica |
| `filtered-match` | `base/animations.css` | Eliminada (1 regla) | 0 consumidores; ningún `classList` la aplica |
| `icon-large` | `base/reset.css` | Eliminada (1 regla) | 0 consumidores; `.icon` y `.icon-small` se conservan |
| `version-comments-display` | `layouts/header.css` | Eliminada (1 regla) | 0 consumidores; bloque de comentarios retirado del JSX |
| `version-comments-container` | `layouts/header.css` | Eliminada (1 regla) | 0 consumidores |
| `comentario-display-categoria` | `layouts/header.css` | Eliminada (1 regla) | 0 consumidores |
| `comentario-display-header` | `layouts/header.css` | Eliminada (2 reglas) | 0 consumidores; incluye `.comentario-display-header .cat-icon` |
| `comentario-header-title` | `layouts/header.css` | Eliminada (1 regla) | 0 consumidores |
| `btn-toggle-comment` | `layouts/header.css` | Eliminada (2 reglas) | 0 consumidores; incluye `:hover` |
| `comentario-display-list` | `layouts/header.css` | Eliminada (4 reglas) | 0 consumidores; incluye `.hidden`, `li` y `li::before` |
| `badge-produccion-inline` | `components/cards.css`, `layouts/grid.css` | Eliminada (2 reglas) | 0 consumidores; `.badge-produccion` se conserva |
| `btn-save-changes` | `components/buttons.css`, `layouts/grid.css` | Eliminada (5 reglas) | 0 consumidores; `btn-save` se conserva |
| `changes-count` | `components/buttons.css`, `layouts/grid.css` | Eliminada (2 reglas) | 0 consumidores |

Notas:

- **`cat-icon`**: la regla `.comentario-display-header .cat-icon` de `layouts/header.css` se eliminó con el bloque de comentarios; la clase sigue siendo muerta por `.cat-icon` en `modals/modal-comentarios.css:43`, que pertenece a `P1-10.4` y no se tocó.
- **`hidden`**: solo existía en dos compuestos (`.btn-save-changes.hidden` y `.comentario-display-list.hidden`). No había regla `.hidden` independiente ni JS/JSX que la aplique; al retirar ambos compuestos desaparece del CSS.
- **Sin selectores agrupados**: ninguna regla mezclaba una clase muerta con una viva, así que no hubo «grupo recortado».
- **Sin excluidas**: ninguna regla se conservó por descendiente vivo. `.comentario-display-list li` y `li::before` dependen de un ancestro muerto; `.comentario-display-header .cat-icon` tiene ambos extremos muertos.
- **Archivos conservados**: ninguno quedó vacío; no se eliminó ningún archivo ni `@import`.

### 8.2 Recuento antes/después

| Métrica | Antes | Después |
|---|---:|---:|
| Clases CSS únicas | 481 | 466 |
| Consumidas | 404 | 403 |
| Dinámicas | 21 | 21 |
| Muertas | 56 | 42 |
| Clases JSX sin regla CSS | 31 | 31 |

La caída de consumidas (404 → 403) no es una regresión: `hidden` figuraba como consumida por un falso positivo del script, que comprueba `public/` con `text.includes(token)` y encontraba `hidden` dentro de `aria-hidden` en `public/vite.svg`. Ningún elemento recibe la clase `hidden`.

Estado por destino tras la limpieza:

| Destino | Muertas |
|---|---:|
| `P1-10.2` base/layouts | 0 |
| `P1-10.3` components | 0 |
| `P1-10.4` modales/changelog | 42 |

### 8.3 Reglas eliminadas por archivo

| Archivo | Reglas | Comentarios de sección |
|---|---:|---|
| `base/animations.css` | 3 | 0 |
| `base/reset.css` | 1 | 0 |
| `layouts/header.css` | 12 | 1 (`COMENTARIOS DE VERSIÓN`) |
| `layouts/grid.css` | 3 | 1 (`Badges`) |
| `components/cards.css` | 1 | 0 |
| `components/buttons.css` | 5 | 1 (`BOTÓN DE GUARDAR CAMBIOS FLOTANTE`) |
| **Total** | **25** | **3** |

**Keyframes huérfanos conservados** (no son clases y la regla de eliminación prohíbe tocarlos): `slideInRow` (solo lo usaba `.adding`), `highlight-match` (solo `.filtered-match`) y `slideInUp` (solo `.btn-save-changes`). Quedan como candidatos a limpieza en una tarea específica de `@keyframes`.

### 8.4 Verificación

```bash
node scripts/audit-selectors.mjs
```

Antes: `CSS clases: 481 | consumidas: 404 | dinámicas: 21 | muertas: 56 | JSX sin regla: 31`
Después: `CSS clases: 466 | consumidas: 403 | dinámicas: 21 | muertas: 42 | JSX sin regla: 31`

- Las 21 dinámicas siguen intactas.
- Comprobación de imports de `main.css`: 30 imports, **0 rotos**.
- Sin cambios en `src/**/*.jsx`, `src/**/*.js`, `index.html` ni `public/`.
- Sin cambios visuales esperados: todas las reglas eliminadas exigían una clase que ningún elemento recibe.

