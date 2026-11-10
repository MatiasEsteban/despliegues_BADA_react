# Plan de implementación — SPEC-001

| Campo | Valor |
|---|---|
| Spec origen | [`specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Estado global | `EN EJECUCIÓN` — F0 parcial (capturas baseline pendientes); F1 casi cerrada (P1-06/P1-09 pendientes) |
| Fecha de creación | 2026-11-08 |
| Fecha de última actualización | 2026-11-10 |
| Responsable | Pendiente de asignación |
| Rama de trabajo | `feat/spec-001-design-hardening` (creada en `despliegues-bada-react/`) |
| Tablero detallado | [`specs/tasks.md`](specs/tasks.md) |

> **Auditoría 2026-11-10:** se verificó el estado real de las tareas cerradas. El detalle, las correcciones y la división en subtareas revisables están en [`specs/tasks.md`](specs/tasks.md). Las tareas `P1-08` y `P1-05` se confirman funcionalmente, con matices documentados. Se añaden `P1-09` (variables indefinidas) y `P3-06` (tablas), que eran requisitos de gate sin tarea asociada.

---

## 1. Cómo usar este plan

1. Las fases se ejecutan **en orden**. Una fase no empieza hasta que la anterior cierre su gate.
2. Cada tarea tiene ID único, dependencias, esfuerzo (`S` ≤ 2 h, `M` ≤ 1 día, `L` > 1 día) y estado.
3. El estado solo avanza con evidencia registrada: comando ejecutado, archivo, captura o test.
4. **La paleta está congelada.** Cualquier tarea que requiera un color nuevo se rechaza y se reescribe con un valor ya existente.
5. Ninguna tarea de código arranca sin que la spec esté marcada como `Aprobada`.
6. Las tareas que dependan de una captura no se cierran sin ella; se marcan `◐` con el bloqueo explícito.

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

**Total: 51 tareas.**

---

## 3. Fase F0 — Baseline y gobernanza

**Objetivo:** dejar el terreno preparado y medible antes de tocar código.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P0-01 | Crear `SPEC_TEMPLATE.md` en la raíz (resuelve la deriva de gobernanza detectada) | — | S | ✅ | [`SPEC_TEMPLATE.md`](SPEC_TEMPLATE.md) |
| P0-02 | Aprobar formalmente SPEC-001 y resolver las decisiones del Anexo C | — | S | ✅ | Spec en estado `Aprobada`; 5 decisiones resueltas en el Anexo C |
| P0-03 | Crear rama `feat/spec-001-design-hardening` | P0-02 | S | ✅ | Rama creada en `despliegues-bada-react/` (el repo git es el subdirectorio de la app) |
| P0-04 | Capturar línea base visual: capturas de Changelog, Lista, Detalle y modales en claro/oscuro a 320/768/1440 px | P0-03 | M | ◐ | Protocolo y matriz en [`docs/audits/baseline-2026-11-08/README.md`](docs/audits/baseline-2026-11-08/README.md). Capturas pendientes de ejecución manual |
| P0-05 | Ejecutar auditoría base y guardar el informe en `docs/audits/2026-11-08-baseline.md` (contadores de inline styles, hex, CSS huérfano, aria) | P0-03 | S | ✅ | [`docs/audits/2026-11-08-baseline.md`](docs/audits/2026-11-08-baseline.md) |

### Gate G0 — Entrada a implementación

- [x] SPEC-001 en estado `Aprobada`.
- [x] Decisiones del Anexo C respondidas por escrito.
- [x] `SPEC_TEMPLATE.md` existe.
- [ ] Capturas baseline almacenadas. **Pendiente:** requiere ejecución manual del protocolo (36 capturas).
- [x] Informe baseline con los contadores reproducibles.

> **G0 parcial.** F1 puede iniciar con P1-01 (inventario de hex, trabajo de análisis) porque no depende de las capturas. Cualquier cambio visual (`P1-05` en adelante) queda bloqueado hasta completar `P0-04`.

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
| P1-06 | Importar `layouts/detail-header.css` desde `main.css` (el import de `modal-history.css` y la limpieza de huérfanos ya quedaron cubiertos por P1-07) | P1-05 | S | ☐ | Alcance reducido tras auditoría: solo falta `detail-header.css`; bloqueado por `P0-04` porque activa reglas nunca cargadas en `DetailView` |
| P1-07 | Eliminar archivos muertos (`index.css`, `App.css`, `modal-alerts.css`, `activity-log.css`, `login.css`, `modal-historial.css`) y selectores sin consumidor | P1-05 | M | ✅ | 6 archivos eliminados; 0 consumidores verificados por clase; import de `modal-history.css` movido a `main.css`; selectores `.modal.deployment-report` y `.modal-deployment-info .modal-box` ausentes; build corroborado por `dist/` (2026-11-10) |
| P1-08 | Dividir `changelog.css` en los seis archivos propuestos preservando el orden de cascada | P1-05 | L | ✅ | 209 bloques de regla: 208 en 6 archivos + `.header-view-toggle` migrado a `view-toggle.css`; 24 hex con round-trip exacto; 0 selectores duplicados; 2 bloques reordenados sin conflicto (ver auditoría en `tasks.md`); build corroborado por `dist/` |
| P1-09 | Sustituir las variables indefinidas de `modal-history.css` (`--bg-card`, `--primary-color`, `--text-tertiary`) y el fallback `--tab-color` por tokens existentes | P1-05 | S | ☐ | Requisito de G1 sin tarea asociada hasta la auditoría 2026-11-10 |
| P1-10 | Auditar selectores CSS sin clase consumidora en JSX y eliminar los muertos (R-DS-04), documentando falsos positivos | P1-07 | M | ☐ | Requisito de R-DS-04 sin tarea de verificación completa hasta la auditoría 2026-11-10 |

> `P1-08` puede ejecutarse en paralelo con `P1-06`/`P1-07` si no se tocan los mismos archivos. Se recomienda dividir primero y sanear después.

> **P1-06 pendiente de `P0-04`.** Importar `detail-header.css` activa reglas que nunca se cargaron y altera el render de `DetailView`. Es el único CSS no alcanzable: 27 archivos = `main.css` + 25 imports + `detail-header.css`.

### Gate G1 — Cierre de fase

- [x] 0 hex fuera de `variables.css`.
- [ ] 0 variables CSS indefinidas (`--radius-md` incluida). **Pendiente:** `--radius-md` resuelta; quedan `--bg-card`, `--primary-color`, `--text-tertiary` y el fallback `--tab-color` → `P1-09`.
- [ ] 0 hojas CSS sin importar. **Pendiente:** `detail-header.css` en `P1-06`.
- [ ] 0 selectores apuntando a clases inexistentes en JSX. **Pendiente:** `P1-10`.
- [x] Ningún componente importa CSS directamente.
- [ ] Diff visual contra baseline: sin cambios perceptibles. **Bloqueado por `P0-04`.**
- [x] `changelog.css` ya no existe como archivo único de 1.526 líneas.

---

## 5. Fase F2 — Erradicación de estilos inline

**Objetivo:** eliminar los 79 `style={{...}}` sin alterar el resultado visual.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P2-01 | Inventariar los 79 inline styles por archivo y clasificarlos (estático, dinámico, variable CSS) | G1 | S | ☐ | |
| P2-02 | Migrar estilos estáticos a clases CSS (`ui/`: Button, Input, Select, Modal, Toast, LoadingOverlay) y fijar `Button.type="button"` por defecto (R-CODE-02) | P2-01 | M | ☐ | |
| P2-03 | Migrar estilos estáticos de vistas y layout (`Changelog*`, `Version*`, `Detail*`, `Header`, `WorkspaceSwitcher`, `Dashboard`, `Login`) | P2-01 | L | ☐ | Cubre los 22 archivos con inline styles; el desglose por archivo está en `tasks.md` |
| P2-04 | Migrar estilos estáticos de modales (9 archivos) | P2-01 | L | ☐ | |
| P2-05 | Reemplazar geometría dinámica por `<progress>`/SVG con atributos (`BadaGraph`, `ProgressModal`, barras de estadísticas) | P2-03, P2-04 | L | ☐ | |
| P2-06 | Verificar y documentar el único caso permitido de manipulación DOM directa (fallback de portapapeles) | P2-04 | S | ☐ | |

### Gate G2 — Cierre de fase

- [ ] `grep -R "style={{" src/components` devuelve 0.
- [ ] `grep -R "\.style\." src/components` solo devuelve el fallback documentado.
- [ ] Gráficos y barras conservan proporciones y colores.
- [ ] Diff visual contra baseline: sin cambios perceptibles.

---

## 6. Fase F3 — Responsive

**Objetivo:** comportamiento correcto entre 320 px y 1440 px, incluido táctil.

| ID | Tarea | Dep. | Esf. | Estado | Evidencia |
|---|---|---|---|---|---|
| P3-01 | Auditar overflow horizontal en las cinco vistas a 320/375/480 px | G2 | S | ☐ | |
| P3-02 | Añadir breakpoints 900/768/600 a los CSS divididos de changelog y a `workspace-switcher.css` | P3-01 | L | ☐ | |
| P3-03 | Adaptar `modal-full-summary.css` y modales a 320 px sin recorte de acciones | P3-01 | M | ☐ | |
| P3-04 | Corregir `DetailHeader` para que los metadatos envuelvan sin romper el layout | P3-01 | S | ☐ | |
| P3-05 | Implementar objetivos táctiles (44 px en puntero grueso) y visibilidad de acciones sin hover | P3-02 | M | ☐ | |
| P3-06 | Tablas de datos: scroll horizontal contenido, indicio visual y ocultación consistente de columnas secundarias en móvil (R-RESP-03) | P3-01 | M | ☐ | Requisito de gate sin tarea asociada hasta la auditoría 2026-11-10 |

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
| P4-01 | Corregir el orden de hooks en `Modal.jsx` (mover `useEffect` antes del `return` condicional) | G3 | S | ☐ | |
| P4-02 | Implementar `useFocusTrap` (foco inicial, trampa, restauración, Escape, scroll lock) | P4-01 | M | ☐ | |
| P4-03 | Aplicar semántica de diálogo a `Modal` (`role`, `aria-modal`, `aria-labelledby`, botón de cierre etiquetado) | P4-02 | M | ☐ | |
| P4-04 | Convertir interacciones `div`/`tr` en controles accesibles (ChangelogCard, VersionCard, VersionRow, ExportModal, ProgressModal) | G3 | L | ☐ | |
| P4-05 | Añadir nombres accesibles a todos los botones de icono y ocultar iconos decorativos | P4-04 | M | ☐ | |
| P4-06 | Asociar labels e ids en formularios; `aria-describedby` en errores; `required` donde corresponda | P4-04 | M | ☐ | |
| P4-07 | Regla global `:focus-visible` y eliminación de `outline: none` sin reemplazo | P4-04 | S | ☐ | |
| P4-08 | Corregir pares de contraste AA reutilizando tonos existentes (`#047857`, `#388114`, `#c53030`, `#2c5282`) | P1-03 | M | ☐ | |
| P4-09 | Añadir `aria-live`/`role="status"` a toasts y anuncios de cambio de vista/carga | P4-04 | S | ☐ | |

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
| P6-01 | Instalar y configurar Vitest + React Testing Library + user-event + jest-axe | G5 | M | ☐ | |
| P6-02 | Instalar y configurar ESLint (`eslint-plugin-react-hooks`) y Stylelint | G5 | M | ☐ | |
| P6-03 | Crear `scripts/check-design-rules.mjs` (prohíbe `style={{}}`, hex fuera de `variables.css`, variables indefinidas) | G5 | M | ☐ | |
| P6-04 | Implementar los 16 casos de test de la spec (T-01…T-16) | P6-01 | L | ☐ | |
| P6-05 | Crear `npm run verify` (lint + stylelint + tests + design rules) y documentarlo en `README.md` | P6-02, P6-03, P6-04 | S | ☐ | |
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
