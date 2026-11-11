# Semántica de interacción y nombres accesibles (2026-11-10)

Lote **P4-04 (R-A11Y-02)** y **P4-05 (R-A11Y-03)** de SPEC-001 (F4). Cierra la
semántica de las tarjetas/filas clicables y da nombre a todos los controles de
solo icono del alcance. Base: `d6c1687` (P4-01/P4-02/P4-03).

## 1. Regla de diseño aplicada

> Cero controles interactivos anidados.

Cuando el contenedor clicable (`div.changelog-card-header`, `div.version-card`,
`tr.version-list-row`) contiene botones de acción, **no** se convierte en
`<button>` ni recibe `role="button"`: se extrae un control específico y las
acciones quedan como hermanas. El `onClick` de ratón del contenedor se mantiene
(no rompe la UX existente) y el teclado va por el control nuevo, de modo que
nunca hay dos tab stops para la misma acción.

## 2. Controles nuevos (P4-04)

| Componente | Antes | Control nuevo | Por qué no hay anidamiento |
|---|---|---|---|
| `ChangelogCard` | `div.changelog-card-header` con `onClick`, sin teclado | `button.changelog-card-toggle` que envuelve `span.changelog-card-header-left` + `span.changelog-card-header-center`; `aria-expanded` + `aria-controls` al body (`useId`); `stopPropagation` para no duplicar el toggle | El botón solo contiene metadatos (`span`); `DateQuickEditor`, `.changelog-card-actions` y el chevron son hermanos posteriores del botón |
| `VersionCard` | `div.version-card-number` + `onClick` en `div.version-card` | `button.version-card-number` con `aria-label` «Abrir detalle de la versión X» | El botón está en la cabecera y no envuelve las acciones (`btn-marcar-produccion`, `btn-version-info`), que son hermanas |
| `VersionRow` | `tr.version-list-row` con `onClick` | `button.version-list-open` en la primera celda (`td.version-list-cell-numero`) | El `tr` conserva la semántica de tabla (sin `role` ni `tabIndex`); el botón solo envuelve el número |
| `ExportModal` | `div.export-option-card` con `onClick` y sin teclado | `role="radiogroup"` + `aria-label="Formato de exportación"`; opciones `role="radio"`, `aria-checked` y roving tabindex (`0` solo en la seleccionada) | No se usa `<button>`: el rol ARIA con `tabIndex` es el patrón de radiogroup; las opciones no contienen controles, solo texto e iconos decorativos |
| `ProgressModal` | `div.chart-card--expandable` con `onClick` y `h4.chart-subtitle` | `button.chart-subtitle.chart-toggle` con `aria-expanded` + `aria-controls` (ids `useId`) | El botón es el propio título; el contenedor ya no es clicable ni tiene `cursor: pointer` |

### 2.1 Teclado del radiogroup (`ExportModal`)

- `↓`/`→` y `↑`/`←` mueven la selección con **wrap** en los extremos.
- `Home` / `End` van a la primera / última opción.
- `Enter` y `Espacio` confirman la opción enfocada (`preventDefault`).
- Al mover, se actualiza `exportFormat` y el foco viaja a la opción (`data-format`),
  dejando exactamente un `tabIndex={0}`. El botón de descarga refleja el formato
  activo («Descargar Texto (.txt)» / «Descargar Excel (.xlsx)»).

### 2.2 Corrección colateral (R-CODE-01)

`ProgressModal` tenía el guard `if (!version) return null` **antes** de
`useMemo`/`useState`: abrir el modal sin versión rompía el orden de hooks. Los
hooks (incluidos los dos `useId`) pasan antes de los returns.

## 3. Inventario de nombres accesibles (P4-05.1)

25 botones de solo icono en el alcance. Todos conservan `title` (tooltip de
ratón) y añaden `aria-label` concreto en español.

| # | Componente | Control | `aria-label` |
|---|---|---|---|
| 1 | `layout/Header` | vista changelog | Vista changelog |
| 2 | `layout/Header` | vista lista | Vista lista |
| 3 | `layout/Header` | tema | Cambiar a tema claro / oscuro |
| 4 | `layout/WorkspaceSwitcher` | borrar workspace | Eliminar workspace {nombre} |
| 5 | `layout/WorkspaceSwitcher` | cancelar alta | Cancelar creación de workspace |
| 6 | `views/ChangelogView` | limpiar búsqueda | Limpiar búsqueda |
| 7 | `views/ChangelogCard` | editar changelog | Editar changelog de la versión {n} |
| 8 | `views/ChangelogCard` | info despliegue | Copiar info de despliegue de la versión {n} |
| 9 | `views/ChangelogCard` | producción | Marcar/Desmarcar la versión {n} (como en producción / de producción) |
| 10 | `views/ChangelogCard` | duplicar | Duplicar la versión {n} |
| 11 | `views/ChangelogCard` | eliminar | Eliminar la versión {n} |
| 12 | `views/VersionCard` | producción | Marcar/Desmarcar la versión {n} (como en producción / de producción) |
| 13 | `views/VersionCard` | reporte | Ver reporte de la versión {n} |
| 14 | `views/VersionList` | vista cuadrícula | Vista cuadrícula |
| 15 | `views/VersionList` | vista lista | Vista lista |
| 16 | `views/VersionList` | paginación anterior | Página anterior |
| 17 | `views/VersionList` | paginación siguiente | Página siguiente |
| 18 | `views/VersionRow` | reporte | Ver reporte de la versión {n} |
| 19 | `views/VersionRow` | producción | Marcar/Desmarcar la versión {n} (como en producción / de producción) |
| 20 | `views/VersionRow` | duplicar | Duplicar la versión {n} |
| 21 | `views/VersionRow` | eliminar | Eliminar la versión {n} |
| 22 | `modals/ChangelogEntriesModal` | eliminar cambio | Eliminar este cambio |
| 23 | `modals/CommentsModal` | añadir (`+`) | Agregar elemento en {categoría} |
| 24 | `modals/CommentsModal` | quitar (`×`) | Eliminar elemento de {categoría} |
| 25 | `ui/Toast` | cerrar (`×`) | Cerrar notificación |

`ui/Modal` («Cerrar») ya quedó resuelto en P4-03.3 y no se toca.

No se duplica nombre donde hay texto visible: `ws-trigger` (nombre del
workspace), `ws-item`, `ws-new-confirm` («Crear»), tabs de
`ChangelogEntriesModal` y los `Button` con children conservan su texto como
nombre accesible.

### 3.1 Política de iconos (P4-05.5)

`Icons.jsx` pasa a `RAW_ICONS` + `withIconA11y`: todo icono recibe
`aria-hidden="true"` y `focusable="false"` **por defecto** y solo se anuncia si
el consumidor pasa `aria-label`, `aria-labelledby` o `role="img"`. Los props del
consumidor se aplican al final, por lo que pueden sobrescribir los valores por
defecto. `Icons.Info` conserva su `fill="white"` (deuda de P5-01.1).

Riesgo asumido: cualquier consumidor que dependiera de un `<title>` interno del
SVG para anunciarse pasa a ser decorativo; el nombre debe venir del control que
lo contiene (`button[aria-label]`), que es el patrón correcto.

## 4. Verificación

```text
node scripts/audit-nested-controls.mjs
Controles anidados: 0 | archivos: 40 | reglas: botón/botón, role=button, div|tr onClick+tabIndex
```

El script es la evidencia de P4-04.6 y se validó con un fixture temporal
(`<button><button>` + `<div onClick tabIndex>`): reportó las 2 violaciones y
salió con código 1. La regla 3 exime `div`/`tr` con `onClick` + `tabIndex` **y**
un rol interactivo explícito (`radio`, `button`, `tab`, …): es exactamente el
patrón que P4-04.4 exige y no debe confundirse con un div clicable sin rol.

Tests (`npm test`, 28/28):

| Caso | Archivo | Cubre |
|---|---|---|
| T-07 | `views/__tests__/ChangelogCard.test.jsx` | `aria-expanded`/`aria-controls`, Enter/Espacio, click sin doble toggle, acciones hermanas |
| T-08 | `views/__tests__/VersionCard.test.jsx`, `views/__tests__/VersionRow.test.jsx` | apertura con Enter, contenedor sin `role`/`tabIndex`, 0 botones anidados, nombres |
| T-09 | `modals/__tests__/ExportModal.test.jsx` | radiogroup, roving tabindex, flechas/Home/End/Enter/Espacio, click |
| P4-04.5 | `modals/__tests__/ProgressModal.test.jsx` | toggle botón, `aria-expanded`, regiones, 0 anidados |
| T-10 | `ui/__tests__/Icons.test.jsx` | decorativo por defecto, `role="img"` + `aria-label`, `fill` de `Info`, cierre de `Toast` |

## 5. Pendiente y deuda

- **P4-04.7** (prueba de teclado en navegador real) queda `◐`: sin P0-04 no hay
  navegador ni baseline. La evidencia actual es jsdom (`user-event`).
- **P4-07** añadirá la regla global `:focus-visible`. Los resets de los botones
  nuevos no tocan `outline`, así que el foco nativo del navegador sigue visible.
- Fuera del alcance de P4-05 (quedan sin nombre propio): `views/detail/CduRow.jsx`
  (`btn-historial`, `btn-eliminar`) y `views/detail/StepsEditor.jsx`
  (`btn-toggle-pasos`). No estaban incluidos en P4-05.1–4; requieren tarea
  propia si se quiere cubrir `views/detail/*`.
