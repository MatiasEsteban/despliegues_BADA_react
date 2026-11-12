# Plan de implementación — SPEC-001

| Campo | Valor |
|---|---|
| Spec origen | [`specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Estado global | `EN EJECUCIÓN` — F0 cerrada (G0, línea base de estado actual vía Playwright); F1 cerrada salvo P1-06.4; F2 cerrada en código con verificación visual pendiente; F3 aplicada con verificación pendiente; F4 cerrada en código salvo P4-08 (en rojo) y verificación manual; F5 parcial adelantada; F6 con P6-01 cerrada y P6-02/03/05 adelantadas |
| Fecha de creación | 2026-11-08 |
| Fecha de última actualización | 2026-11-12 |
| Responsable | Pendiente de asignación |
| Rama de trabajo | `feat/spec-001-design-hardening` (creada en `despliegues-bada-react/`) |
| Tablero detallado | [`specs/tasks.md`](specs/tasks.md) |

> **Auditoría 2026-11-10:** se verificó el estado real de las tareas cerradas. El detalle, las correcciones y la división en subtareas revisables están en [`specs/tasks.md`](specs/tasks.md). Las tareas `P1-08` y `P1-05` se confirman funcionalmente, con matices documentados. Se añaden `P1-09` (variables indefinidas) y `P3-06` (tablas), que eran requisitos de gate sin tarea asociada.

> **Auditoría 2026-11-12 (con @reviewer):** se verificó el estado real contra el código y `git`. F0 sigue abierta por capturas; F1 solo debe P1-06.2/6.3; F2 y F3 están cerradas en código; F4 está cerrada en código salvo P4-08, que está en rojo (`check-contrast.mjs`: 39/54 PASS, 15 FAIL); F6 tiene P6-01 cerrada. Detalle y orden vigente en [`specs/tasks.md`](specs/tasks.md) §13.

---

## 1. Cómo usar este plan

1. Las fases se ejecutan **en orden**. Una fase no empieza hasta que la anterior cierre su gate.
2. Cada tarea tiene ID único, dependencias, esfuerzo (`S` ≤ 2 h, `M` ≤ 1 día, `L` > 1 día) y estado.
3. El estado solo avanza con evidencia registrada: comando ejecutado, archivo, captura o test.
4. **La paleta está congelada.** Cualquier tarea que requiera un color nuevo se rechaza y se reescribe con un valor ya existente.
5. Ninguna tarea de código arranca sin que la spec esté marcada como `Aprobada`.
6. Las tareas que dependan de una captura no se cierran sin ella; se marcan `◐` con el bloqueo explícito.

> **Excepción de secuencia (aprobada 2026-11-12).** Se autoriza ejecutar **P6-02, P6-03 y P6-05** y el **F5 parcial** (P5-01, P5-02, P5-03 y P5-05) antes de que F1–F4 cierren sus gates. **P5-04 no se adelanta**: exige la línea base y acumula 487 literales de escala + 147 `font-size`.

### 1.1 Decisiones aprobadas el 2026-11-12

1. **Evidencia visual con Playwright headless.** Nueva devDependency `playwright` (permitida por C-08) y `scripts/capture-baseline.mjs` sobre `vite preview`. No hay Chrome DevTools MCP. Las capturas son del **estado actual (2026-11-12)**, no un baseline retroactivo: G0 se cierra con «línea base de estado actual» y sirve para verificar F4.08, F5 y P5-04, no para atribuir cambios retroactivos a F1–F3.
2. **Matriz mínima de 24–30 capturas**: 320 y 1440 px × claro/oscuro en Changelog, Lista/Grid, Detalle CDU, modales y workspace switcher; 768 px solo donde cambie el layout. Sustituye las 36 del README y la matriz de ~98.
3. **Contraste:** `check-contrast.mjs` es el gate de P4-08 (exit 0 en los 12 pares con consumidores; los 3 latentes son aviso). Si un par no alcanza AA se remapea superficie, tamaño o peso; **prohibido introducir color nuevo** (C-01/C-02).
4. **Adelantos autorizados:** P6-02/03/05 (lint, `check-design-rules`, `verify`) y F5 parcial (P5-01, P5-02, P5-03, P5-05). P5-04 no se adelanta.
5. **Sincronización documental** de `plan.md`, `specs/tasks.md`, `MEMORY.md` y `docs/design-system.md` el 2026-11-12.

### Leyenda de estado

| Símbolo | Estado | Significado |
|---|---|---|
| ☐ | `PENDIENTE` | No iniciada |
| ◐ | `EN CURSO` | Iniciada, sin evidencia completa |
| ✅ | `HECHA` | Evidencia registrada y gate superado |
| ⛔ | `BLOQUEADA` | Dependencia externa o decisión pendiente |
| ➖ | `CANCELADA` | Descartada con justificación |

### Leyenda de esfuerzo

| Código | Rango |
|---|---|
| `S` | Hasta 2 horas |
| `M` | Hasta 1 día |
| `L` | Más de 1 día |

---

## 2. Resumen de fases

| Fase | Nombre | Objetivo | Tareas | Gate |
|---|---|---|---:|---|
| F0 | Baseline y gobernanza | Asegurar spec aprobada, plantilla, tooling mínimo y línea base visual | 5 | G0 |
| F1 | Tokens e integridad CSS | Centralizar la paleta existente y sanear la arquitectura CSS | 10 | G1 |
| F2 | Erradicación de estilos inline | Eliminar los 79 `style={{}}` | 6 | G2 |
| F3 | Responsive | Cobertura 320–1440 px y objetivos táctiles | 6 | G3 |
| F4 | Accesibilidad | Semántica, foco, teclado, contraste y anuncios | 9 | G4 |
| F5 | Consistencia visual | Iconografía, fechas visibles, tipografía, motion | 5 | G5 |
| F6 | Testing y enforcement | Automatizar la prevención de regresiones | 6 | G6 |
| F7 | Cierre y documentación | Validación final, DoD y memoria | 4 | G7 |

**Total: 51 tareas** (+ A-01…A-08: regularización y harness de captura).

---

## 3. Fase F0 — Baseline y gobernanza

**Objetivo:** dejar el terreno preparado y medible antes de tocar código.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P0-01 | Crear `SPEC_TEMPLATE.md` en la raíz (resuelve la deriva de gobernanza detectada) | — | S | ✅ | [`SPEC_TEMPLATE.md`](SPEC_TEMPLATE.md) |
| P0-02 | Aprobar formalmente SPEC-001 y resolver las decisiones del Anexo C | — | S | ✅ | Spec en estado `Aprobada`; 5 decisiones resueltas en el Anexo C |
| P0-03 | Crear rama `feat/spec-001-design-hardening` | P0-02 | S | ✅ | Rama creada en `despliegues-bada-react/` (el repo git es el subdirectorio de la app) |
| P0-04 | Capturar línea base visual (estado actual, no retroactiva): Changelog, Lista, Detalle y modales en claro/oscuro a 320/1440 px (768 solo si cambia el layout) | P0-03 | M | ✅ | 24 PNG + [`MANIFEST.md`](docs/audits/baseline-2026-11-08/MANIFEST.md) + [`README.md`](docs/audits/baseline-2026-11-08/README.md); commit `5ece225`, Playwright 1.65.0/Chromium 158.0.8127.18 y fixtures sin Firestore. Matriz sin huecos; línea base del **estado actual (2026-11-12)**, no retroactiva |
| P0-05 | Ejecutar auditoría base y guardar el informe en `docs/audits/2026-11-08-baseline.md` (contadores de inline styles, hex, CSS huérfano, aria) | P0-03 | S | ✅ | [`docs/audits/2026-11-08-baseline.md`](docs/audits/2026-11-08-baseline.md) |
| A-08 | Crear harness Playwright (`scripts/capture-baseline.mjs` + devDependency) y `MANIFEST.md` con commit, fecha, versión, SO, tema y estado de datos | A-06 | M | ✅ | `npm run capture` sobre `vite build --mode capture` + `vite preview`; 24 PNG y `MANIFEST.md` con commit/fecha/SO/versiones/fixtures. Sin argumentos conserva la salida; `--out`/`--only` solo añaden evidencia (P1-06.2) |

### Gate G0 — Entrada a implementación

- [x] SPEC-001 en estado `Aprobada`.
- [x] Decisiones del Anexo C respondidas por escrito.
- [x] `SPEC_TEMPLATE.md` existe.
- [x] Capturas almacenadas. **24 PNG** en [`docs/audits/baseline-2026-11-08/captures/`](docs/audits/baseline-2026-11-08/captures/), matriz sin huecos, con `MANIFEST.md` (commit `5ece225`, 2026-11-12, Windows_NT 10.0.26300, Playwright 1.65.0, Chromium 158.0.8127.18, fixtures sin Firestore).
- [x] Informe baseline con los contadores reproducibles.

> **G0 cerrado el 2026-11-12.** La línea base es la del **estado actual (2026-11-12)** capturada con Playwright; **no** es retroactiva y no atribuye cambios a F1–F3. Sirve para verificar F4.08, F5, P5-04 y P1-06.3. El hueco «comentarios» se cubre con `320-modal-info-light-default.png` (`CommentsModal` no tiene consumidor) y está documentado en el `MANIFEST.md`.

> **Delta visual registrado en P1-04:** al definir `--radius-md: 8px`, `modal-history.css:38` deja de resolver a un valor inválido. El contenedor de `CduHistoryModal` pasa de borde recto a 8 px. Es corrección de defecto, pendiente de verificación contra capturas.

---

## 4. Fase F1 — Tokens e integridad CSS

**Objetivo:** un solo origen de verdad para color y escala, y una arquitectura CSS sin código muerto.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P1-01 | Inventariar los 85 hex únicos y mapearlos a tokens existentes; producir tabla de equivalencias sin introducir valores nuevos | G0 | M | ✅ | [`docs/design-system/color-inventory.md`](docs/design-system/color-inventory.md): 85 únicos, 11 huérfanos descartados, 74 tokens 1:1 con los hex activos |
| P1-02 | Crear capa `--palette-*` en `variables.css` conservando los valores actuales | P1-01 | M | ✅ | 74 tokens, 74 valores únicos, 0 consumidores todavía; `npm run build` pasa |
| P1-03 | Crear tokens semánticos (`--color-*`, `--surface-*`, `--text-*`, `--border-*`, `--state-*`) apuntando a la capa de paleta | P1-02 | M | ✅ | 35 tokens semánticos; 0 consumidores externos; adaptación automática claro/oscuro |
| P1-04 | Definir escalas de tipografía, espaciado, radios, sombras y z-index; definir `--radius-md` y `--focus-ring` | P1-03 | M | ✅ | 35 tokens de escala en [`docs/design-system.md`](docs/design-system.md); z-index cubre los 6 valores en uso |
| P1-05 | Reemplazar hex por tokens en todas las hojas CSS (sin cambiar el valor resuelto) | P1-03 | L | ✅ | 144 reemplazos en 14 archivos; round-trip contra `HEAD` sin diferencias; 0 hex en CSS activo fuera de `variables.css` |
| P1-06 | Importar `layouts/detail-header.css` desde `main.css` (el import de `modal-history.css` y la limpieza de huérfanos ya quedaron cubiertos por P1-07) | P1-05 | S | ✅ | Import tras `header.css` y antes de componentes; 0 duplicados con la cascada viva (`.version-detail-meta` y min-widths retirados). 5 capturas `antes/` idénticas a la línea base y `despues/` con 3 deltas justificados en [`docs/audits/2026-11-12-p1-06.md`](docs/audits/2026-11-12-p1-06.md) |
| P1-07 | Eliminar archivos muertos (`index.css`, `App.css`, `modal-alerts.css`, `activity-log.css`, `login.css`, `modal-historial.css`) y selectores sin consumidor | P1-05 | M | ✅ | 6 archivos eliminados; 0 consumidores verificados por clase; import de `modal-history.css` movido a `main.css`; selectores `.modal.deployment-report` y `.modal-deployment-info .modal-box` ausentes; build corroborado por `dist/` (2026-11-10) |
| P1-08 | Dividir `changelog.css` en los seis archivos propuestos preservando el orden de cascada | P1-05 | L | ✅ | 209 bloques de regla: 208 en 6 archivos + `.header-view-toggle` migrado a `view-toggle.css`; 24 hex con round-trip exacto; 0 selectores duplicados; 2 bloques reordenados sin conflicto (ver auditoría en `tasks.md`); build corroborado por `dist/` |
| P1-09 | Sustituir las variables indefinidas de `modal-history.css` y el fallback `--tab-color` por tokens existentes | P1-05 | S | ✅ | 0 variables usadas sin declarar (`P1-09.1–5`); `--tab-color` resuelto con clases por categoría |
| P1-10 | Auditar selectores CSS sin clase consumidora en JSX y eliminar los muertos (R-DS-04) | P1-07 | M | ✅ | 55 clases / 84 reglas eliminadas; script: 424 clases, 402 consumidas, 21 dinámicas, 1 muerta justificada (`deployment-report`) |

> `P1-08` puede ejecutarse en paralelo con `P1-06`/`P1-07` si no se tocan los mismos archivos. Se recomienda dividir primero y sanear después.

> **P1-06 cerrada el 2026-11-12.** `detail-header.css` es alcanzable desde `main.css` (31 imports, 32 hojas) y su activación se verificó contra la línea base del 2026-11-12; los deltas están descritos y justificados en [`docs/audits/2026-11-12-p1-06.md`](docs/audits/2026-11-12-p1-06.md).

### Gate G1 — Cierre de fase

- [x] 0 hex fuera de `variables.css`.
- [x] 0 variables CSS indefinidas (`--radius-md` incluida). **0 variables indefinidas (P1-09).**
- [x] 0 hojas CSS sin importar. **`detail-header.css` importado en P1-06.2.**
- [x] 0 selectores apuntando a clases inexistentes en JSX. **1 muerta justificada (P1-10).**
- [x] Ningún componente importa CSS directamente.
- [x] Diff visual contra baseline verificado en P1-06.3: `antes/` idéntico byte a byte y 3 deltas justificados tras la activación (etiquetas 0,75 rem, apilado a 320/768 y −1 px a 1440). Sin regresiones funcionales; P1-06.4 formaliza el cierre.
- [x] `changelog.css` ya no existe como archivo único de 1.526 líneas.

---

## 5. Fase F2 — Erradicación de estilos inline

**Objetivo:** eliminar los 79 `style={{...}}` sin alterar el resultado visual.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P2-01 | Inventariar los 79 inline styles por archivo y clasificarlos (estático, dinámico, variable CSS) | G1 | S | ✅ | 78 usos, 22 archivos; `docs/audits/2026-11-10-inline-styles.md` |
| P2-02 | Migrar estilos estáticos a clases CSS (`ui/`: Button, Input, Select, Modal, Toast, LoadingOverlay) y fijar `Button.type="button"` por defecto (R-CODE-02) | P2-01 | M | ✅ | UI base 0 `style`; commits `2bf7104` y `6a9fc14` |
| P2-03 | Migrar estilos estáticos de vistas y layout (`Changelog*`, `Version*`, `Detail*`, `Header`, `WorkspaceSwitcher`, `Dashboard`, `Login`) | P2-01 | L | ✅ (P2-03.11 ⛔ P0-04) | Cubre los 22 archivos con inline styles; commit `1301831` |
| P2-04 | Migrar estilos estáticos de modales (9 archivos) | P2-01 | L | ✅ (P2-04.6 ⛔ P0-04) | Commit `34def04` |
| P2-05 | Reemplazar geometría dinámica por `<progress>`/SVG con atributos (`BadaGraph`, `ProgressModal`, barras de estadísticas) | P2-03, P2-04 | L | ✅ (P2-05.6 ⛔ P0-04) | Commit `5a1fdd0` |
| P2-06 | Verificar y documentar el único caso permitido de manipulación DOM directa (fallback de portapapeles) | P2-04 | S | ✅ | Helper único `src/utils/clipboard.js`; commit `6dd748d` |

### Gate G2 — Cierre de fase

> Código cerrado; el gate no cierra hasta A-08/P0-04 (línea base); A-05 ya está cerrada.

- [x] `grep -R "style={{" src/components` devuelve 0.
- [x] `grep -R "\.style\." src/components` devuelve 0; el fallback documentado vive en `src/utils/clipboard.js`.
- [ ] Gráficos y barras conservan proporciones y colores.
- [ ] Diff visual contra baseline: sin cambios perceptibles.

---

## 6. Fase F3 — Responsive

**Objetivo:** comportamiento correcto entre 320 px y 1440 px, incluido táctil.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P3-01 | Auditar overflow horizontal en las cinco vistas a 320/375/480 px | G2 | S | ✅ | `scripts/audit-responsive.mjs` + `docs/audits/2026-11-10-responsive.md`: 82 hallazgos (6 alta / 35 media / 41 baja) |
| P3-02 | Añadir breakpoints 900/768/600 a changelog, `cards.css`, `layouts/header.css` y `workspace-switcher.css` | P3-01 | L | ✅ | 8 hojas con @media; verificación visual pendiente (P0-04) |
| P3-03 | Adaptar modales a 320 px sin recorte de acciones | P3-01 | M | ✅ | 7 hojas de `modals/` + P3-03.8 (login); verificación visual pendiente |
| P3-04 | Corregir `DetailHeader` para que los metadatos envuelvan sin romper el layout | P3-01 | S | ✅ | Cubierto por P3-02.8 en `layouts/header.css`; verificación visual pendiente |
| P3-05 | Objetivos táctiles 44 px y visibilidad de acciones sin hover | P3-02 | M | ✅ | `pointer: coarse` 44×44, `pointer: fine` 24×24, `hover: none`/`:focus-within`; verificación táctil pendiente |
| P3-06 | Tablas: scroll contenido, indicio visual y columnas secundarias ocultas en móvil (R-RESP-03) | P3-01 | M | ✅ | `overflow-x:auto`, sombras con `background-attachment` y columnas 4/5 ocultas a 600; verificación pendiente |

### Gate G3 — Cierre de fase

- [ ] 0 scroll horizontal a 320 px salvo tablas con contenedor propio.
- [ ] Tablas con indicio visual de desplazamiento y columnas secundarias ocultas en móvil.
- [ ] Usable al 200 % de zoom.
- [ ] Acciones de tarjeta y fila visibles o accesibles en táctil.
- [ ] Matriz de breakpoints revisada y registrada.

---

## 7. Fase F4 — Accesibilidad

**Objetivo:** navegación completa por teclado, semántica correcta y contraste AA.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P4-01 | Corregir el orden de hooks en `Modal.jsx` | G3 | S | ✅ | Hooks antes del return; T-01 |
| P4-02 | Implementar `useFocusTrap` (foco inicial, trampa, restauración, Escape, scroll lock) | P4-01 | M | ✅ | `src/hooks/useFocusTrap.js`; T-02 (P4-02.7 ⛔ P0-04) |
| P4-03 | Semántica de diálogo en `Modal` | P4-02 | M | ✅ | `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre «Cerrar»; T-03 |
| P4-04 | Convertir interacciones `div`/`tr` en controles accesibles | G3 | L | ✅ | 0 controles anidados (`audit-nested-controls.mjs`); T-07/T-08/T-09 |
| P4-05 | Nombres accesibles en botones de icono e iconos decorativos | P4-04 | M | ✅ | 25 botones con `aria-label`; `withIconA11y`; T-10 |
| P4-06 | Labels/ids, `aria-describedby` y `required` | P4-04 | M | ✅ | `useId` en Input/Select/DateQuickEditor y error de Login; T-06 |
| P4-07 | `:focus-visible` global y eliminación de `outline: none` | P4-04 | S | ✅ | 2 px + offset 2 con `--text-primary`; 11/11 eliminados (P4-07.3 ⛔ P0-04) |
| P4-08 | Corregir pares de contraste AA reutilizando tonos existentes | P1-03 | M | ◐ | `check-contrast.mjs` existe y **falla: 39/54 PASS, 15 FAIL** (12 con consumidores, 3 latentes). Script como gate |
| P4-09 | `aria-live`/`role="status"` en toasts y anuncios | P4-04 | S | ✅ | T-04; `Dashboard` y `LoadingOverlay` |

### Gate G4 — Cierre de fase

- [ ] 0 interacciones sobre `div`/`tr` sin semántica.
- [ ] 0 botones de icono sin nombre accesible.
- [ ] Modales con foco atrapado, Escape y restauración verificados manualmente.
- [ ] 0 violaciones axe `serious`/`critical` en vistas principales.
- [ ] Contraste AA verificado en textos y controles.
- [ ] Recorrido completo por teclado en Changelog, Lista y Detalle.

---

## 8. Fase F5 — Consistencia visual

**Objetivo:** unificar iconografía, fechas visibles, tipografía y movimiento.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P5-01 | Corregir `Icons.Info` a `fill="currentColor"` y revisar el resto de `Icons.jsx` | G4 | S | ☐ | |
| P5-02 | Reemplazar emojis funcionales por iconos SVG o texto en `ChangelogView`, `DateQuickEditor` y `DeploymentReportModal` | G4 | M | ☐ | |
| P5-03 | Normalizar toda fecha visible a `DD/MM/AAAA` (sin tocar lógica de fechas locales, SPEC-002) | G4 | S | ☐ | |
| P5-04 | Aplicar las escalas tipográfica, de radios, espaciado, sombras y z-index; revisar copy/etiquetas (sentence case, verbos concretos, estados vacíos explícitos) | P1-04 | M | ☐ | |
| P5-05 | Añadir `prefers-reduced-motion` y eliminar `animation: ... infinite` en elementos permanentes | G4 | S | ☐ | |

> **Adelanto autorizado (2026-11-12):** P5-01, P5-02, P5-03 y P5-05 pueden ejecutarse sin esperar a G4. P5-04 **no** se adelanta: depende de la línea base y acumula 487 + 147 literales.

### Gate G5 — Cierre de fase

- [ ] 0 emojis usados como único icono de acción.
- [ ] 0 fechas ISO visibles.
- [ ] Una sola familia tipográfica y escala aplicada.
- [ ] `prefers-reduced-motion` respetado y verificado.
- [ ] Paleta sin cambios respecto al baseline.

---

## 9. Fase F6 — Testing y enforcement

**Objetivo:** que las reglas se cumplan automáticamente y no dependan de revisión manual.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P6-01 | Instalar y configurar Vitest + RTL + user-event + jest-axe | G5 | M | ✅ | 10 archivos de test; `npm test` 40/40 |
| P6-02 | Instalar y configurar ESLint y Stylelint | A-05 | M | ☐ | **Adelantada (2026-11-12)** |
| P6-03 | Crear `scripts/check-design-rules.mjs` | A-05 | M | ☐ | **Adelantada (2026-11-12)**; el script no existe aún |
| P6-04 | Implementar los 16 casos de test (T-01…T-16) | P6-01 | L | ◐ | 10 casos ✅; faltan T-11…T-16 |
| P6-05 | Crear `npm run verify` y documentarlo | P6-02, P6-03, P6-04 | S | ☐ | **Adelantada (2026-11-12)** |
| P6-06 | Validación manual final: axe DevTools, lector de pantalla, matriz de §9.3 de la spec | P6-04 | M | ☐ | |

### Gate G6 — Cierre de fase

- [ ] `npm run verify` pasa en local.
- [ ] Los chequeos fallan intencionalmente al introducir un `style={{}}` o un hex nuevo (prueba negativa).
- [ ] Los 16 casos de test existen y pasan.
- [ ] Matriz manual completa.

---

## 10. Fase F7 — Cierre y documentación

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P7-01 | Completar `docs/design-system.md` (ya existe desde P1-04) con reglas de color/contraste, foco, iconografía, motion y ejemplos de uso | G6 | M | ◐ | Tokens y escalas ya documentados; faltan las secciones de F5 |
| P7-02 | Revisión final del DoD de la spec, punto por punto | G6 | S | ☐ | |
| P7-03 | Actualizar `MEMORY.md` (≤ 75 líneas) con el cierre de SPEC-001 | P7-02 | S | ☐ | |
| P7-04 | Actualizar este `plan.md` a estado `CERRADO` y registrar lecciones | P7-02 | S | ☐ | |

### Gate G7 — Cierre de SPEC-001

- [ ] Todos los criterios del DoD marcados con evidencia.
- [ ] Aprobación explícita del responsable del proyecto.
- [ ] Backlog derivado registrado (ver §11).

---

## 11. Backlog derivado (fuera de esta spec)

| ID | Tema | Destino | Prioridad |
|---|---|---|---|
| B-01 | Fechas locales y `toISOString()` (`DateQuickEditor`, `dataStore`, importers/exporters) | SPEC-002 | Alta |
| B-02 | `AuthProvider` sin montar, `Login.jsx` sin uso, `firestore.rules` abiertas | SPEC-003 | Crítica |
| B-03 | Cobertura de `statsCalculator`, `validator`, importers/exporters y CI | SPEC-004 | Alta |
| B-04 | Sanitización profunda de Excel/JSON | SPEC-005 | Media |
| B-05 | Alinear `docs/constitution.md` con las referencias de `AGENTS.md` | Gobernanza | Media |

> **Bloqueo global:** B-02 impide declarar el Definition of Done del proyecto aunque SPEC-001 cierre al 100 %.

---

## 12. Registro de avance

| Fecha | Fase | Cambio | Evidencia | Responsable |
|---|---|---|---|---|
| 2026-11-08 | — | Creación de `plan.md` a partir de SPEC-001 | Este documento | Auditoría técnica |
| 2026-11-08 | F0 | SPEC-001 aprobada; Anexo C resuelto; plantilla creada; rama de trabajo creada; baseline medido | `SPEC_TEMPLATE.md`, Anexo C de la spec, `docs/audits/2026-11-08-baseline.md`, rama `feat/spec-001-design-hardening` | Auditoría técnica |
| 2026-11-08 | F0 | `P0-04` abierta: protocolo de captura listo, imágenes pendientes | `docs/audits/baseline-2026-11-08/README.md` | Pendiente |
| 2026-11-09 | F1 | `P1-01` cerrada: inventario de 85 hex, 74 tokens propuestos y deuda de alias documentada | `docs/design-system/color-inventory.md` | Auditoría técnica |
| 2026-11-09 | F1 | `P1-03`/`P1-04` cerradas: 35 tokens semánticos y 35 de escala; único delta visual `--radius-md` | `docs/design-system.md` | Auditoría técnica |
| 2026-11-09 | F1 | `P1-05` cerrada: 144 hex reemplazados por tokens en 14 hojas, round-trip verificado | `git diff` + script de verificación | Auditoría técnica |
| 2026-11-10 | F1 | `P1-07` cerrada: 6 hojas muertas eliminadas y `modal-history.css` movida al punto de entrada | `main.css` + build | Auditoría técnica |
| 2026-11-10 | F1 | `P1-08` cerrada: `changelog.css` dividido en 6 archivos, 209 bloques de regla, 0 duplicados | `src/styles/components/changelog/` + script de verificación | Auditoría técnica |
| 2026-11-10 | — | Auditoría de cierre de F0/F1: se confirman P1-01..P1-05/P1-07 y se matiza P1-08; se detectan P1-09 y P3-06 sin tarea; plan movido a la raíz; tablero granular creado | [`specs/tasks.md`](specs/tasks.md) | Auditoría técnica |
| 2026-11-12 | — | Auditoría de estado con @reviewer: F0 pendiente de capturas; F1 solo P1-06; F2/F3 cerradas en código; F4 en rojo por contraste; A-05/A-07 cerradas | `specs/tasks.md` §2.4 y §15 | Auditoría técnica |
| 2026-11-12 | F0/F5/F6 | Decisiones aprobadas: baseline Playwright del estado actual (24–30), matriz mínima, `check-contrast` como gate, adelantos P6-02/03/05 y F5 parcial | `plan.md` §1.1, `specs/tasks.md` §13 | Usuario + auditoría |
| 2026-11-12 | F0 | **G0 cerrado**: 24 capturas + `MANIFEST.md` con commit `5ece225`, fecha, SO, Playwright 1.65.0/Chromium 158.0.8127.18 y fixtures sin Firestore; matriz sin huecos y línea base del estado actual, no retroactiva | [`MANIFEST.md`](docs/audits/baseline-2026-11-08/MANIFEST.md), [`README.md`](docs/audits/baseline-2026-11-08/README.md), `specs/tasks.md` §4 | Implementación |
| 2026-11-12 | F1 | **P1-06.2/6.3 cerradas**: `detail-header.css` importado tras `header.css`; duplicados retirados; `antes/` idéntico a la línea base y `despues/` con 3 deltas justificados. G1 pendiente solo de P1-06.4 | [`docs/audits/2026-11-12-p1-06.md`](docs/audits/2026-11-12-p1-06.md), `src/styles/main.css` | Implementación |
