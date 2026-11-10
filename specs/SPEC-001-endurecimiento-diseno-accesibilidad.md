# SPEC-001 — Endurecimiento del sistema de diseño, accesibilidad y consistencia visual

| Campo | Valor |
|---|---|
| Estado | **Aprobada** — 2026-11-08 |
| Fecha | 2026-11-08 |
| Proyecto | `despliegues_BADA_react` |
| Alcance | Sistema de diseño, CSS, accesibilidad y consistencia visual |
| Plan de implementación | [`../plan.md`](../plan.md) |
| Specs relacionadas | Ninguna (SPEC-002/003 propuestas en el anexo C) |
| Autor | Auditoría técnica asistida |

> **Nota de gobernanza:** `AGENTS.md` y `.agents/commands/feature.md` referencian `SPEC_TEMPLATE.md` y `CONSTITUTION.md` en la raíz, pero no existen. La constitución vigente está en [`../docs/constitution.md`](../docs/constitution.md). Esta spec adopta la estructura de `.agents/commands/feature.md` y deja la creación de la plantilla como tarea `P0-01` del plan.

---

## 1. Resumen ejecutivo

La aplicación tiene una dirección visual coherente y reconocible: paleta neutra, estados semánticos, tarjetas y una arquitectura CSS por capas. Sin embargo, **no cumple formalmente los estándares planteados** en la constitución ni el quality floor de la skill `frontend-design`.

La brecha no es estética sino de **sistematización, accesibilidad y mantenibilidad**. Esta spec define cómo cerrar esa brecha **sin cambiar la paleta de colores** y **sin rediseñar la interfaz**.

**Veredicto de partida:** cumplimiento parcial estimado en 55–65 %.

---

## 2. Contexto y evidencia

Auditoría realizada el 2026-11-08 sobre el commit `6b8e447` (`feat: agregar Resumen Global de versiones en Changelog`).

| Métrica | Valor actual | Estándar |
|---|---:|---|
| Usos de `style={{...}}` en JSX | 79 en 22 archivos | 0 |
| Ocurrencias de colores hex en CSS | 209 | Solo en `variables.css` |
| Colores hex únicos | 85 | Paleta tokenizada |
| Variables CSS usadas y no definidas | 1 (`--radius-md`) | 0 |
| Hojas CSS nunca importadas | 4 | 0 |
| Media queries en CSS nuevo | 0 en `changelog.css` (1.526 líneas), `workspace-switcher.css` y `modal-full-summary.css` | Cobertura responsive |
| `aria-label` / `role` / `aria-live` en JSX | 0 / 0 / 0 | Cobertura de interacción |
| Tests propios | 0 | Cobertura exigida por constitución |
| ESLint instalado | No | Obligatorio |
| Tamaños de fuente únicos | 28 | Escala tipográfica |
| Radios de borde únicos | 14 | Escala de radios |

### Hallazgos críticos asociados

1. **`Modal.jsx` viola las Reglas de Hooks:** `if (!isOpen) return null` aparece antes de `useEffect`. El cambio de cerrado a abierto altera el orden de hooks y puede romper la apertura de todos los modales.
2. **`Icons.Info` tiene `fill="#ffffff"` fijo:** se pierde sobre fondos claros y en el botón de información de `ChangelogCard`.
3. **Contraste insuficiente:** `#49aa19` sobre `#ECFDF5` = 2,83:1; `#1ee43f` sobre blanco = 1,72:1; blanco sobre `#EAB308` = 1,92:1; blanco sobre `#10B981` = 2,54:1.
4. **Interacciones no accesibles:** tarjetas, filas y opciones de exportación usan `div`/`tr` con `onClick`, sin rol, foco ni teclado.
5. **Acciones ocultas tras hover:** `.changelog-card-actions { opacity: 0 }` solo se revela con `:hover`; en táctil quedan inaccesibles y con teclado quedan enfocables pero invisibles.
6. **Fechas inconsistentes en UI:** `VersionRow` muestra ISO (`AAAA-MM-DD`) mientras el resto usa `DD/MM/AAAA`. La lógica de fechas locales se trata en SPEC-002, fuera de alcance.

---

## 3. Objetivos y no objetivos

### Objetivos

- O-01. Tokenizar el sistema visual usando **exclusivamente valores ya existentes**.
- O-02. Eliminar los estilos inline y las hojas CSS huérfanas o duplicadas.
- O-03. Garantizar navegación por teclado, foco visible y semántica accesible en flujos críticos.
- O-04. Garantizar respuesta correcta entre 320 px y 1440 px.
- O-05. Cumplir contraste WCAG 2.1 AA en textos y controles.
- O-06. Respetar `prefers-reduced-motion`.
- O-07. Dejar enforcement automatizado para evitar regresiones.
- O-08. Actualizar la documentación y la memoria operativa.

### No objetivos

- N-01. Cambiar la paleta base, los colores de estado ni la identidad visual.
- N-02. Rediseñar layouts, flujos o funcionalidades.
- N-03. Modificar el modelo de datos, Firebase, autenticación o reglas de Firestore.
- N-04. Corregir la lógica de fechas locales ni la zona horaria (SPEC-002).
- N-05. Incorporar una librería de componentes UI.
- N-06. Implementar nuevas features de negocio.

---

## 4. Restricciones

| ID | Restricción |
|---|---|
| C-01 | **Paleta congelada.** No se introducen colores nuevos. Solo se permiten valores hex ya presentes en `src/styles/` y en `variables.css`. |
| C-02 | Los ajustes de contraste deben reutilizar tonos existentes: `#047857`, `#388114`, `#c53030`, `#2c5282`, `--text-primary`, entre otros ya presentes. |
| C-03 | No se altera la estructura de datos ni el contrato de Firebase. |
| C-04 | Todo cambio requiere spec aprobada y plan actualizado (SDD). |
| C-05 | La UI debe funcionar en tema claro y oscuro. |
| C-06 | Soporte mínimo: 320 px de ancho, sin scroll horizontal salvo tablas de datos. |
| C-07 | Se conserva el copy en español y la terminología del dominio (CDU, BADA, Miró, workspace). |
| C-08 | No se incorporan dependencias de UI; solo herramientas de test, lint y verificación. |

---

## 5. Requerimientos

### 5.1 Sistema de diseño y CSS

#### R-DS-01 — Tokens semánticos de color
**Descripción:** Centralizar la paleta actual en `variables.css` con dos capas: `--palette-*` (valores crudos existentes) y tokens semánticos (`--color-*`, `--surface-*`, `--text-*`, `--border-*`, `--state-*`).

**Criterios de aceptación:**
- [ ] Todo color usado por componentes referencia un token.
- [ ] No existe ningún hex fuera de `variables.css`.
- [ ] Los valores de los tokens son idénticos a los colores ya presentes; no se agregan hues nuevos.
- [ ] Tema claro y oscuro conservan equivalencia visual.

#### R-DS-02 — Tokens de tipografía, espaciado, radios, sombras y z-index
**Descripción:** Definir escalas únicas y reemplazar valores mágicos.

**Escala propuesta (valores existentes):**

| Token | Valor | Uso |
|---|---|---|
| `--font-size-xs` | `0.75rem` | Badges, metadatos |
| `--font-size-sm` | `0.8rem` | Texto auxiliar |
| `--font-size-base` | `0.875rem` | Cuerpo estándar |
| `--font-size-md` | `0.95rem` | Cuerpo destacado |
| `--font-size-lg` | `1.25rem` | Títulos de modal |
| `--font-size-xl` | `1.5rem` | Título de versión |
| `--font-size-2xl` | `2rem` | Título de detalle |

| Token | Valor |
|---|---|
| `--space-1` … `--space-8` | `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `3rem`, `4rem` |
| `--radius-xs` / `sm` / `md` / `lg` / `pill` / `full` | `4px`, `6px`, `8px`, `12px`, `9999px`, `50%` |
| `--shadow-sm` / `md` / `lg` | Sombras actuales basadas en `var(--shadow)` |
| `--z-dropdown` / `floating` / `modal` / `toast` | `200`, `999`, `1000`, `10000` |
| `--focus-ring` | `var(--accent-hover)` |
| `--focus-ring-width` | `2px` |

**Criterios de aceptación:**
- [ ] `--radius-md` queda definido.
- [ ] No quedan valores de radio fuera de la escala; los intermedios se mapean al más cercano.
- [ ] No quedan tamaños de fuente fuera de la escala; los intermedios se mapean al más cercano.
- [ ] La escala se documenta en `docs/design-system.md`.

#### R-DS-03 — Eliminación total de estilos inline
**Descripción:** Reemplazar los 79 `style={{...}}` por clases CSS o por geometría semántica.

**Regla para valores dinámicos:**
- Barras de progreso: usar `<progress>` nativo o SVG con atributos `value`/`width`.
- Gráficos de torta y segmentos BADA: usar SVG o `<progress>`.
- Colores por categoría: clases existentes (`cat-mejoras`, `cat-produccion`, etc.).
- No se permite `style` ni siquiera para inyectar variables CSS.

**Criterios de aceptación:**
- [ ] `grep -R "style={{" src/components` devuelve 0.
- [ ] No hay `element.style` en componentes React salvo el fallback de copiado a portapapeles, que debe quedar aislado y documentado.
- [ ] Los gráficos mantienen el comportamiento y la lectura visual actual.

#### R-DS-04 — Integridad de las capas CSS
**Descripción:** Un único punto de entrada y eliminación de código muerto.

**Acciones:**
- Importar `layouts/detail-header.css` desde `main.css`.
- Mover el import de `modal-history.css` desde `CduHistoryModal.jsx` a `main.css`.
- Eliminar `index.css` y `App.css` (restos de Vite).
- Eliminar `modal-alerts.css`, `layouts/activity-log.css` y `layouts/login.css` si no tienen consumidores.
- Eliminar `modal-historial.css` y conservar una sola implementación de historial.
- Eliminar selectores muertos: `.modal.deployment-report`, `.modal-deployment-info .modal-box`, entre otros.

**Criterios de aceptación:**
- [ ] `main.css` importa todas las hojas activas.
- [ ] Ningún componente importa CSS directamente.
- [ ] No existen hojas sin consumidores.
- [ ] No existen selectores que apunten a clases inexistentes en JSX.

#### R-DS-05 — División de `changelog.css`
**Descripción:** `changelog.css` tiene 1.526 líneas y mezcla vista, tarjetas, modal de entradas, editor de fechas, exportación y deployment info. Dividir por responsabilidad.

**Archivos propuestos:**
- `styles/components/changelog/timeline.css`
- `styles/components/changelog/card.css`
- `styles/components/changelog/modal-entries.css`
- `styles/components/changelog/date-editor.css`
- `styles/components/modals/export-modal.css`
- `styles/components/modals/deployment-info.css`

**Criterios de aceptación:**
- [ ] Cada archivo corresponde a un componente o vista identificable.
- [ ] No hay reglas duplicadas entre archivos.
- [ ] El orden de imports preserva la cascada actual.

### 5.2 Accesibilidad

#### R-A11Y-01 — Modal accesible
**Descripción:** Todo modal debe comportarse como diálogo modal real.

**Criterios de aceptación:**
- [ ] `role="dialog"` y `aria-modal="true"`.
- [ ] `aria-labelledby` apunta al título.
- [ ] Foco inicial dentro del modal.
- [ ] Foco atrapado mientras está abierto.
- [ ] `Escape` cierra.
- [ ] Al cerrar, el foco vuelve al elemento que lo abrió.
- [ ] Scroll del `body` bloqueado mientras está abierto.
- [ ] Botón de cierre con nombre accesible (`aria-label="Cerrar"`).

#### R-A11Y-02 — Semántica de interacción
**Descripción:** Ninguna interacción puede depender de `div`/`tr` con `onClick`.

**Casos obligatorios:**
- Header de `ChangelogCard` (expandir/colapsar).
- Tarjeta `VersionCard` (abrir detalle).
- Fila `VersionRow` (abrir detalle).
- Opciones de `ExportModal` (seleccionar formato).
- Toggle de gráficos en `ProgressModal`.

**Criterios de aceptación:**
- [ ] Cada interacción usa `<button>`, `<a>` o rol ARIA equivalente con `tabIndex`.
- [ ] Responde a `Enter` y `Espacio` cuando corresponde.
- [ ] `aria-expanded` en elementos colapsables.
- [ ] No hay controles interactivos anidados.
- [ ] Las acciones de `ChangelogCard` son visibles o accesibles sin hover.

#### R-A11Y-03 — Nombres accesibles
**Descripción:** Todo botón que solo muestra un icono debe tener nombre accesible.

**Criterios de aceptación:**
- [ ] `aria-label` en `modal-close-btn`, `toast-close`, `btn-cl-*`, `btn-action-list`, `ws-item-delete`, `changelog-search-clear`, paginación y toggles.
- [ ] `title` puede permanecer como ayuda, pero no es el único nombre.
- [ ] Los iconos decorativos usan `aria-hidden="true"`.

#### R-A11Y-04 — Formularios etiquetados
**Criterios de aceptación:**
- [ ] Todo `input`, `select` y `textarea` tiene `id` y `label htmlFor`.
- [ ] `DateQuickEditor` asocia sus dos campos.
- [ ] Los campos obligatorios exponen `required` o `aria-required`.
- [ ] Los errores se asocian con `aria-describedby`.
- [ ] Los mensajes de error no dependen solo del color.

#### R-A11Y-05 — Foco visible
**Criterios de aceptación:**
- [ ] Regla global `:focus-visible` con `outline` de 2 px y offset.
- [ ] No se usa `outline: none` sin reemplazo visible.
- [ ] El foco se ve en tema claro y oscuro sobre fondos claros y oscuros.

#### R-A11Y-06 — Contraste AA
**Criterios de aceptación:**
- [ ] Texto normal: ≥ 4,5:1.
- [ ] Texto grande: ≥ 3:1.
- [ ] Bordes de controles e iconos funcionales: ≥ 3:1.
- [ ] Pares corregidos sin introducir colores nuevos:
  - Producción sobre fondo claro: `#047857` o `#388114`.
  - Badge de producción sobre blanco: `#388114`.
  - Puntos de estado: fondo oscurecido existente o número en `--text-primary`.
  - Errores: `#c53030` en lugar de `#f56565`/`#ef4444` para texto.
  - Violeta `#8b5cf6`: solo acento/borde, no texto pequeño.
- [ ] Script de verificación de contraste incluido en `npm run verify`.

#### R-A11Y-07 — Anuncios dinámicos
**Criterios de aceptación:**
- [ ] Contenedor de toasts con `aria-live="polite"` y `role="status"`.
- [ ] Toasts de error con `role="alert"`.
- [ ] El cambio de vista y la carga de datos tienen estado anunciable cuando corresponde.

#### R-A11Y-08 — Zoom y reflow
**Criterios de aceptación:**
- [ ] La app es usable al 200 % de zoom sin pérdida de contenido.
- [ ] No hay scroll horizontal a 320 px salvo tablas con contenedor propio.
- [ ] Los modales no superan el viewport ni recortan acciones.

### 5.3 Responsive

#### R-RESP-01 — Breakpoints
**Descripción:** Usar los breakpoints existentes (`900px`, `768px`, `600px`) y agregar `480px` solo si es imprescindible.

**Criterios de aceptación:**
- [ ] `changelog.css` dividido tiene reglas en 900/768/600.
- [ ] `workspace-switcher.css` tiene reglas para dropdown en móvil.
- [ ] `modal-full-summary.css` y modales nuevos se adaptan a 320 px.
- [ ] `DetailHeader` envuelve metadatos sin romper el layout.

#### R-RESP-02 — Objetivos táctiles
**Criterios de aceptación:**
- [ ] En puntero grueso, controles interactivos ≥ 44 × 44 px.
- [ ] En puntero fino, mínimo 24 × 24 px con separación suficiente.
- [ ] Acciones de tarjeta y fila no quedan ocultas tras hover en táctil.

#### R-RESP-03 — Tablas de datos
**Criterios de aceptación:**
- [ ] Las tablas conservan scroll horizontal contenido.
- [ ] Hay indicio visual de desplazamiento.
- [ ] En móvil se ocultan columnas secundarias de forma consistente.
- [ ] La tabla de CDUs no rompe el layout de la página.

### 5.4 Consistencia visual

#### R-UI-01 — Iconografía
**Criterios de aceptación:**
- [ ] `Icons.Info` usa `fill="currentColor"`.
- [ ] Los iconos funcionales provienen de `Icons.jsx`.
- [ ] Los emojis solo se permiten en copy decorativo o contenido del usuario, no como único icono de acción.
- [ ] Reemplazar emojis funcionales de `ChangelogView`, `DateQuickEditor` y `DeploymentReportModal` por iconos SVG o texto.

#### R-UI-02 — Fechas visibles
**Criterios de aceptación:**
- [ ] Toda fecha visible usa `DD/MM/AAAA`.
- [ ] No se muestran fechas ISO crudas en la UI.
- [ ] La corrección de lógica de fechas locales queda para SPEC-002.

#### R-UI-03 — Tipografía y copy
**Criterios de aceptación:**
- [ ] Una sola familia tipográfica (stack del sistema permitido y documentado).
- [ ] Escala tipográfica aplicada.
- [ ] Etiquetas en sentence case; mayúsculas solo en badges cortos y encabezados de tabla justificados.
- [ ] Acciones con verbos concretos y consistentes (“Guardar”, “Copiar”, “Eliminar”).
- [ ] Estados vacíos y errores explican qué pasó y qué hacer.

#### R-UI-04 — Movimiento
**Criterios de aceptación:**
- [ ] `@media (prefers-reduced-motion: reduce)` desactiva animaciones no esenciales.
- [ ] Se elimina `animation: pulse ... infinite` de elementos permanentes.
- [ ] Las transiciones de hover/expansión se mantienen, pero no son la única señal de estado.

### 5.5 Código y documentación

#### R-CODE-01 — Orden de hooks en `Modal`
**Descripción:** Corregir `Modal.jsx` antes de cualquier trabajo de accesibilidad modal.

**Criterios de aceptación:**
- [ ] `useEffect` se ejecuta siempre, antes de cualquier `return` condicional.
- [ ] El modal abre y cierra sin errores de hooks.
- [ ] Test de regresión que abre/cierra dos veces.

#### R-CODE-02 — API de `Button`
**Criterios de aceptación:**
- [ ] `type` por defecto es `"button"`.
- [ ] Los formularios que necesitan submit pasan `type="submit"` explícitamente.
- [ ] No hay submits accidentales.

#### R-DOC-01 — Documentación del sistema
**Criterios de aceptación:**
- [ ] `docs/design-system.md` documenta tokens, escalas, reglas de color, foco, iconografía y motion.
- [ ] `MEMORY.md` registra la spec y el estado del plan.
- [ ] `plan.md` queda actualizado con el estado real.

#### R-TEST-01 — Infraestructura de verificación
**Criterios de aceptación:**
- [ ] Vitest + React Testing Library + jest-axe configurados.
- [ ] ESLint y Stylelint instalados y ejecutables.
- [ ] Script `npm run verify` ejecuta lint, estilos, tests y chequeos de tokens.
- [ ] Los chequeos fallan ante un `style={{}}` nuevo o un hex fuera de `variables.css`.

---

## 6. Contrato de interfaces

### 6.1 Tokens CSS

Contrato de nombres; los valores se completan en Fase 1 con la paleta existente.

```css
:root {
  /* Paleta cruda existente */
  --palette-blue-600: #1668dc;
  --palette-blue-700: #2c5282;
  --palette-red-500: #f56565;
  --palette-red-600: #ef4444;
  --palette-red-700: #c53030;
  --palette-green-500: #10B981;
  --palette-green-700: #047857;
  --palette-green-800: #388114;
  --palette-green-prod: #49aa19;
  --palette-orange-500: #F97316;
  --palette-yellow-500: #EAB308;
  --palette-violet-500: #8b5cf6;
  --palette-sky-500: #3B82F6;

  /* Tokens semánticos */
  --color-action-primary: var(--palette-blue-600);
  --color-action-primary-hover: var(--palette-blue-700);
  --color-feedback-danger: var(--palette-red-500);
  --color-feedback-danger-text: var(--palette-red-700);
  --color-feedback-success: var(--palette-green-500);
  --color-feedback-success-text: var(--palette-green-700);
  --color-accent-violet: var(--palette-violet-500);
  --color-focus-ring: var(--accent-hover);
}
```

### 6.2 Componentes

| Componente | Cambio de contrato | Compatibilidad |
|---|---|---|
| `Modal` | Sin cambio de props; agrega semántica y foco interno | Compatible |
| `Button` | `type` por defecto `"button"` | Requiere `type="submit"` explícito en Login |
| `Input` / `Select` | Sin cambio de props; estilos por clase, no inline | Compatible |
| `Toast` | Agrega `role`/`aria-live` internos | Compatible |
| `ChangelogCard` | Header pasa a control accesible con `aria-expanded` | Sin cambio de props |
| `VersionCard` / `VersionRow` | Área de apertura pasa a control accesible | Sin cambio de props |
| `ExportModal` | Opciones pasan a `radiogroup`/`radio` | Sin cambio de props |

### 6.3 Datos

No hay cambios en Firestore, Data Connect, `dataStore`, `workspaceStore` ni en los servicios de importación/exportación.

---

## 7. Mapeo de archivos e impacto

### 7.1 Crear

| Archivo | Propósito |
|---|---|
| `docs/design-system.md` | Documentación de tokens, escalas y reglas |
| `src/hooks/useFocusTrap.js` | Foco atrapado y restauración para modales |
| `scripts/check-design-rules.mjs` | Chequeo de inline styles, hex y tokens |
| `vitest.config.js` | Configuración de tests |
| `stylelint.config.js` | Reglas de CSS |
| `src/components/ui/__tests__/Modal.test.jsx` | Regresión de hooks, foco y teclado |
| `src/components/ui/__tests__/Toast.test.jsx` | `aria-live` |
| `src/components/ui/__tests__/Button.test.jsx` | `type` por defecto |
| `src/components/views/__tests__/ChangelogCard.test.jsx` | Teclado y `aria-expanded` |
| `src/components/modals/__tests__/ExportModal.test.jsx` | Radiogroup |
| `src/styles/base/tokens.css` | Tokens separados de `variables.css` (opcional, ver plan) |

### 7.2 Modificar

| Área | Archivos |
|---|---|
| Base | `src/styles/base/variables.css`, `reset.css`, `animations.css`, `main.css` |
| Layouts | `layouts/header.css`, `container.css`, `grid.css`, `detail-header.css` |
| Componentes | `buttons.css`, `forms.css`, `estados.css`, `cards.css`, `table.css`, `filters.css`, `notifications.css`, `list-view.css`, `view-toggle.css`, `workspace-switcher.css`, `changelog.css` (dividido) |
| Modales | `modal-base.css`, `modal-deployment-report.css`, `modal-changes-summary.css`, `modal-comentarios.css`, `modal-historial.css`/`modal-history.css`, `modal-login.css`, `modal-progress.css`, `modal-full-summary.css` |
| UI | `Modal.jsx`, `Button.jsx`, `Input.jsx`, `Select.jsx`, `Toast.jsx`, `LoadingOverlay.jsx`, `Icons.jsx` |
| Layout | `Header.jsx`, `WorkspaceSwitcher.jsx`, `Dashboard.jsx` |
| Vistas | `ChangelogView.jsx`, `ChangelogCard.jsx`, `DateQuickEditor.jsx`, `VersionList.jsx`, `VersionCard.jsx`, `VersionRow.jsx`, `DetailView.jsx`, `DetailHeader.jsx` |
| Detalle | `CduRow.jsx`, `StepsEditor.jsx`, `BadaGraph.jsx`, `ResponsiblesEditor.jsx` |
| Modales JSX | `ChangelogEntriesModal.jsx`, `CommentsModal.jsx`, `DeploymentInfoModal.jsx`, `DeploymentReportModal.jsx`, `EvolutionModal.jsx`, `ExportModal.jsx`, `FullSummaryModal.jsx`, `ProgressModal.jsx`, `CduHistoryModal.jsx` |
| Config | `package.json`, `eslint.config.js` |

### 7.3 Eliminar

| Archivo | Motivo |
|---|---|
| `src/index.css` | Resto de plantilla Vite, no importado |
| `src/App.css` | Resto de plantilla Vite, no importado |
| `src/styles/components/modals/modal-alerts.css` | Duplica reglas de `modal-base.css` |
| `src/styles/layouts/activity-log.css` | Sin consumidores |
| `src/styles/layouts/login.css` | Sin consumidores; auth se trata en SPEC-003 |
| `src/styles/components/modals/modal-historial.css` | Implementación duplicada/no usada |

> `modal-history.css` se conserva, pero su import se mueve a `main.css`.

---

## 8. Seguridad y resiliencia

- No se modifican reglas de Firestore, autenticación ni `workspaceId`.
- La eliminación de estilos inline mejora la compatibilidad con una futura CSP estricta.
- No se introducen `dangerouslySetInnerHTML` ni nuevas superficies de XSS.
- Los fallbacks de copiado a portapapeles (`DeploymentInfoModal`, `FullSummaryModal`) se mantienen, pero su manipulación directa del DOM debe quedar aislada y documentada.
- **Riesgo externo bloqueante:** `AuthProvider` no está montado y `firestore.rules` permite `read, write: if true`. No forma parte de esta spec, pero impide declarar el Definition of Done global del proyecto. Se deriva a SPEC-003.

---

## 9. Plan de testing

### 9.1 Herramientas

- Vitest.
- React Testing Library.
- `@testing-library/user-event`.
- `jest-axe`.
- ESLint + `eslint-plugin-react-hooks`.
- Stylelint.
- Script propio `check-design-rules.mjs`.
- Verificación manual con axe DevTools y lector de pantalla.

### 9.2 Casos obligatorios

| ID | Caso | Tipo |
|---|---|---|
| T-01 | `Modal` abre/cierra dos veces sin error de hooks | Unitario |
| T-02 | `Modal` atrapa foco, cierra con Escape y restaura foco | Integración |
| T-03 | `Modal` expone `role="dialog"` y `aria-labelledby` | Integración |
| T-04 | `Toast` expone `role="status"`/`aria-live` | Unitario |
| T-05 | `Button` usa `type="button"` por defecto | Unitario |
| T-06 | `Input` asocia label e id | Unitario |
| T-07 | `ChangelogCard` expande con Enter y expone `aria-expanded` | Integración |
| T-08 | `VersionCard`/`VersionRow` abren detalle con teclado | Integración |
| T-09 | `ExportModal` navega opciones con flechas y selecciona con Enter | Integración |
| T-10 | Icon buttons tienen nombre accesible | axe |
| T-11 | Contraste de pares críticos ≥ AA | Script |
| T-12 | Sin violaciones axe serious/critical en vistas principales | axe |
| T-13 | `prefers-reduced-motion` desactiva animaciones | Manual/CSS |
| T-14 | Sin overflow horizontal a 320 px en vistas principales | Manual/E2E |
| T-15 | Sin `style={{}}` nuevos | Script |
| T-16 | Sin hex fuera de `variables.css` | Script |

### 9.3 Matriz manual

| Vista | 320 | 375 | 768 | 1024 | 1440 | Claro | Oscuro | Teclado | Reduced motion |
|---|---|---|---|---|---|---|---|---|---|
| Changelog | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Lista/Grid | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Detalle CDU | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Modales | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Workspace switcher | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 10. Criterios de aceptación — Definition of Done

- [ ] 0 `style={{...}}` en `src/components`.
- [ ] 0 hex fuera de `variables.css`.
- [ ] 0 variables CSS indefinidas.
- [ ] 0 hojas CSS sin importar.
- [ ] 0 interacciones sobre `div`/`tr` sin semántica.
- [ ] 0 botones de icono sin nombre accesible.
- [ ] 0 violaciones axe `serious` o `critical` en vistas principales.
- [ ] Contraste AA en todos los pares de texto y controles.
- [ ] Navegación completa por teclado en Changelog, Lista y Detalle.
- [ ] Modales con foco atrapado y restaurado.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Sin overflow horizontal a 320 px salvo tablas.
- [ ] Paleta visual sin cambios: los valores de color existentes se conservan.
- [ ] `npm run verify` pasa.
- [ ] `docs/design-system.md` y `MEMORY.md` actualizados.
- [ ] Aprobación explícita del responsable del proyecto.

---

## 11. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| La tokenización altere visualmente algún componente | Media | Medio | Capturas baseline y diff por fase; revisión antes de cada gate |
| El contraste AA obligue a“cambiar” la paleta | Media | Alto | Reutilizar tonos existentes (`#047857`, `#388114`, `#c53030`); prohibido agregar hues |
| La migración de 79 inline styles introduzca regresiones | Alta | Medio | Fase 2 por grupos de componentes; tests y revisión visual |
| Convertir gráficos a SVG cambie su lectura | Media | Medio | Mantener proporciones y colores; comparación lado a lado |
| El refactor de `changelog.css` rompa la cascada | Media | Alto | Dividir sin cambiar reglas; importar en el mismo orden |
| No exista infraestructura de tests | Alta | Alto | Fase 6 temprana; instalar tooling antes de cerrar F4 |
| Auth/reglas sigan abiertos | Alta | Crítico | SPEC-003 separada; no bloquea esta spec visual, sí el DoD global |

---

## 12. Fuera de alcance y derivaciones

| Hallazgo | Spec propuesta |
|---|---|
| `toISOString()` para fechas locales en `DateQuickEditor`, `dataStore`, importers/exporters | SPEC-002 — Fechas locales |
| `AuthProvider` no montado, `Login.jsx` sin uso, reglas Firestore públicas | SPEC-003 — Autenticación y reglas |
| Cobertura 100 % de `statsCalculator`, `validator`, importers/exporters y CI | SPEC-004 — Testing y CI |
| Sanitización profunda de Excel/JSON | SPEC-005 — Resiliencia de importación |

---

## 13. Anexo A — Inventario de hallazgos y trazabilidad

| Hallazgo | Severidad | Requerimiento |
|---|---|---|
| 79 estilos inline | Alta | R-DS-03 |
| 85 colores hex únicos | Alta | R-DS-01 |
| `--radius-md` indefinido | Media | R-DS-02 |
| 4 hojas CSS huérfanas | Media | R-DS-04 |
| `changelog.css` de 1.526 líneas | Media | R-DS-05 |
| 0 media queries en CSS nuevo | Alta | R-RESP-01 |
| 0 `aria-label`/`role`/`aria-live` | Crítica | R-A11Y-01..07 |
| `Modal` con hook condicional | Crítica | R-CODE-01 |
| `Icons.Info` con `fill` blanco | Alta | R-UI-01 |
| Contraste 1,72:1–3,70:1 | Alta | R-A11Y-06 |
| Acciones solo por hover | Alta | R-A11Y-02 / R-RESP-02 |
| Emojis funcionales mezclados con SVG | Media | R-UI-01 |
| Fechas ISO en `VersionRow` | Media | R-UI-02 |
| 28 tamaños de fuente / 14 radios | Media | R-DS-02 |
| Sin `prefers-reduced-motion` | Media | R-UI-04 |
| Sin tests ni ESLint | Alta | R-TEST-01 |

---

## 14. Anexo B — Checklist de fechas locales (skill `local-dates`)

Aplicado durante la auditoría; la corrección se deriva a SPEC-002.

- [x] ¿Algún `toISOString()`? **Sí:** `DateQuickEditor.jsx:53`, `dataStore.js:152`, `excelImporter.js:71/108`, `excelExporter.js:104`, `textExporter.js:132`.
- [x] ¿Algún `new Date("AAAA-MM-DD")`? **No detectado** en la UI.
- [x] ¿Algún cálculo con `86400000`? **No detectado.**
- [x] ¿Qué pasa con una sesión a las 00:30? En UTC−3 el ISO coincide; el riesgo real está entre las 21:00 y las 23:59, donde `toISOString()` devuelve el día siguiente.
- [x] ¿Qué pasa en el cambio de hora? No se detectaron sumas por milisegundos; el riesgo está en la fecha “hoy”.
- [ ] ¿Se ignoran fechas futuras donde corresponde? **Pendiente de definir en SPEC-002.**

---

## 15. Anexo C — Decisiones de aprobación (resueltas 2026-11-08)

| # | Decisión | Resultado |
|---|---|---|
| 1 | División de `changelog.css` en seis archivos | **Aceptada** |
| 2 | Normalización de escala tipográfica y de radios | **Aceptada**, sin introducir valores nuevos: los intermedios se mapean al más cercano de la escala |
| 3 | Eliminación de `login.css` y `activity-log.css` | **Aceptada**; se archivan en el historial de git, no se conservan en el árbol |
| 4 | Migración de gráficos dinámicos a `<progress>`/SVG | **Aceptada**, conservando proporciones y colores actuales |
| 5 | Incorporación de Vitest, Testing Library, jest-axe, ESLint y Stylelint | **Aceptada** como `devDependencies` |

### Correcciones al inventario tras el baseline

El relevamiento de `P0-05` ajustó dos cifras de esta spec:

- **Variables CSS indefinidas: 4 reales** (`--bg-card`, `--radius-md`, `--primary-color`, `--text-tertiary`) **más `--tab-color` con fallback**. Todas en `modal-history.css` salvo la última. La cifra original de 1 era una subestimación.
- **Hojas no alcanzables desde `main.css`: 6** (`App.css`, `index.css`, `modal-alerts.css`, `activity-log.css`, `login.css`, `detail-header.css`), más `modal-history.css` importada desde un componente. `detail-header.css` es un defecto funcional: `DetailHeader.jsx` usa clases que nunca se cargan por la vía oficial.

Evidencia completa en [`../docs/audits/2026-11-08-baseline.md`](../docs/audits/2026-11-08-baseline.md).
