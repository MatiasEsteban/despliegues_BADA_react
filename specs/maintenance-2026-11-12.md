# Cola de aplicación — documentación fuera de `specs/` (2026-11-12)

El agente planificador solo tiene permiso de escritura en `specs/`. `specs/tasks.md` ya está actualizado. Los cambios de abajo deben aplicarse **tal cual** en `plan.md`, `MEMORY.md` y `docs/design-system.md`; todos usan la misma fecha (2026-11-12) y los mismos IDs.

---

## 1. `plan.md`

### 1.1 Cabecera

Reemplazar:

```markdown
| Estado global | `EN EJECUCIÓN` — F0 parcial (capturas baseline pendientes); F1 casi cerrada (P1-06/P1-09 pendientes) |
| Fecha de creación | 2026-11-08 |
| Fecha de última actualización | 2026-11-10 |
```

por:

```markdown
| Estado global | `EN EJECUCIÓN` — F0 pendiente de capturas (línea base de estado actual vía Playwright); F1 cerrada salvo P1-06.2/6.3; F2 cerrada en código con verificación visual pendiente; F3 aplicada con verificación pendiente; F4 cerrada en código salvo P4-08 (en rojo) y verificación manual; F5 parcial adelantada; F6 con P6-01 cerrada y P6-02/03/05 adelantadas |
| Fecha de creación | 2026-11-08 |
| Fecha de última actualización | 2026-11-12 |
```

Añadir tras la nota de auditoría del 2026-11-10:

```markdown
> **Auditoría 2026-11-12 (con @reviewer):** se verificó el estado real contra el código y `git`. F0 sigue abierta por capturas; F1 solo debe P1-06.2/6.3; F2 y F3 están cerradas en código; F4 está cerrada en código salvo P4-08, que está en rojo (`check-contrast.mjs`: 39/54 PASS, 15 FAIL); F6 tiene P6-01 cerrada. Detalle y orden vigente en [`specs/tasks.md`](specs/tasks.md) §13.
```

### 1.2 §1 — excepción de secuencia y decisiones

Añadir al final de la lista de reglas:

```markdown
> **Excepción de secuencia (aprobada 2026-11-12).** Se autoriza ejecutar **P6-02, P6-03 y P6-05** y el **F5 parcial** (P5-01, P5-02, P5-03 y P5-05) antes de que F1–F4 cierren sus gates. **P5-04 no se adelanta**: exige la línea base y acumula 487 literales de escala + 147 `font-size`.
```

Añadir antes de «### Leyenda de estado»:

```markdown
### 1.1 Decisiones aprobadas el 2026-11-12

1. **Evidencia visual con Playwright headless.** Nueva devDependency `playwright` (permitida por C-08) y `scripts/capture-baseline.mjs` sobre `vite preview`. No hay Chrome DevTools MCP. Las capturas son del **estado actual (2026-11-12)**, no un baseline retroactivo: G0 se cierra con «línea base de estado actual» y sirve para verificar F4.08, F5 y P5-04, no para atribuir cambios retroactivos a F1–F3.
2. **Matriz mínima de 24–30 capturas**: 320 y 1440 px × claro/oscuro en Changelog, Lista/Grid, Detalle CDU, modales y workspace switcher; 768 px solo donde cambie el layout. Sustituye las 36 del README y la matriz de ~98.
3. **Contraste:** `check-contrast.mjs` es el gate de P4-08 (exit 0 en los 12 pares con consumidores; los 3 latentes son aviso). Si un par no alcanza AA se remapea superficie, tamaño o peso; **prohibido introducir color nuevo** (C-01/C-02).
4. **Adelantos autorizados:** P6-02/03/05 (lint, `check-design-rules`, `verify`) y F5 parcial (P5-01, P5-02, P5-03, P5-05). P5-04 no se adelanta.
5. **Sincronización documental** de `plan.md`, `specs/tasks.md`, `MEMORY.md` y `docs/design-system.md` el 2026-11-12.
```

### 1.3 §2 — total

Reemplazar `**Total: 51 tareas.**` por `**Total: 51 tareas** (+ A-01…A-08: regularización y harness de captura).`

### 1.4 §3 — F0

Reemplazar la fila `P0-04` por:

```markdown
| P0-04 | Capturar línea base visual (estado actual, no retroactiva): Changelog, Lista, Detalle y modales en claro/oscuro a 320/1440 px (768 solo si cambia el layout) | P0-03 | M | ◐ | Matriz aprobada de 24–30 capturas; harness Playwright en A-08. 0 PNG y sin `MANIFEST.md` a 2026-11-12 |
```

Añadir tras `P0-05`:

```markdown
| A-08 | Crear harness Playwright (`scripts/capture-baseline.mjs` + devDependency) y `MANIFEST.md` con commit, fecha, versión, SO, tema y estado de datos | A-06 | M | ☐ | Desbloquea P0-04.1–7; capturas del estado actual 2026-11-12 |
```

En G0, reemplazar el ítem de capturas por:

```markdown
- [ ] Capturas almacenadas. **Pendiente:** 24–30 capturas vía Playwright (A-08), del estado actual. G0 se cierra con «línea base de estado actual»: verifica F4.08/F5/P5-04, no atribuye cambios retroactivos a F1–F3.
```

### 1.5 §4 — F1

Reemplazar el estado de `P1-09` y `P1-10` por `✅` y su evidencia por:

```markdown
| P1-09 | Sustituir las variables indefinidas de `modal-history.css` y el fallback `--tab-color` por tokens existentes | P1-05 | S | ✅ | 0 variables usadas sin declarar (`P1-09.1–5`); `--tab-color` resuelto con clases por categoría |
| P1-10 | Auditar selectores CSS sin clase consumidora en JSX y eliminar los muertos (R-DS-04) | P1-07 | M | ✅ | 55 clases / 84 reglas eliminadas; script: 424 clases, 402 consumidas, 21 dinámicas, 1 muerta justificada (`deployment-report`) |
```

En G1: marcar `[x]` las líneas de variables indefinidas y selectores, y anotar «0 variables indefinidas (P1-09)» y «1 muerta justificada (P1-10)».

### 1.6 §5 — F2

En la nota del Gate G2, reemplazar «hasta A-05 (build) y P0-04» por «hasta A-08/P0-04 (línea base); A-05 ya está cerrada».

### 1.7 §6 — F3

Sustituir las seis filas por:

```markdown
| P3-01 | Auditar overflow horizontal en las cinco vistas a 320/375/480 px | G2 | S | ✅ | `scripts/audit-responsive.mjs` + `docs/audits/2026-11-10-responsive.md`: 82 hallazgos (6 alta / 35 media / 41 baja) |
| P3-02 | Añadir breakpoints 900/768/600 a changelog, `cards.css`, `layouts/header.css` y `workspace-switcher.css` | P3-01 | L | ✅ | 8 hojas con @media; verificación visual pendiente (P0-04) |
| P3-03 | Adaptar modales a 320 px sin recorte de acciones | P3-01 | M | ✅ | 7 hojas de `modals/` + P3-03.8 (login); verificación visual pendiente |
| P3-04 | Corregir `DetailHeader` para que los metadatos envuelvan sin romper el layout | P3-01 | S | ✅ | Cubierto por P3-02.8 en `layouts/header.css`; verificación visual pendiente |
| P3-05 | Objetivos táctiles 44 px y visibilidad de acciones sin hover | P3-02 | M | ✅ | `pointer: coarse` 44×44, `pointer: fine` 24×24, `hover: none`/`:focus-within`; verificación táctil pendiente |
| P3-06 | Tablas: scroll contenido, indicio visual y columnas secundarias ocultas en móvil (R-RESP-03) | P3-01 | M | ✅ | `overflow-x:auto`, sombras con `background-attachment` y columnas 4/5 ocultas a 600; verificación pendiente |
```

### 1.8 §7 — F4

Marcar `✅` P4-01…P4-07 y P4-09 con estas evidencias (una línea por fila, resumida):

```markdown
| P4-01 | Corregir el orden de hooks en `Modal.jsx` | G3 | S | ✅ | Hooks antes del return; T-01 |
| P4-02 | Implementar `useFocusTrap` (foco inicial, trampa, restauración, Escape, scroll lock) | P4-01 | M | ✅ | `src/hooks/useFocusTrap.js`; T-02 (P4-02.7 ⛔ P0-04) |
| P4-03 | Semántica de diálogo en `Modal` | P4-02 | M | ✅ | `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre «Cerrar»; T-03 |
| P4-04 | Convertir interacciones `div`/`tr` en controles accesibles | G3 | L | ✅ | 0 controles anidados (`audit-nested-controls.mjs`); T-07/T-08/T-09 |
| P4-05 | Nombres accesibles en botones de icono e iconos decorativos | P4-04 | M | ✅ | 25 botones con `aria-label`; `withIconA11y`; T-10 |
| P4-06 | Labels/ids, `aria-describedby` y `required` | P4-04 | M | ✅ | `useId` en Input/Select/DateQuickEditor y error de Login; T-06 |
| P4-07 | `:focus-visible` global y eliminación de `outline: none` | P4-04 | S | ✅ | 2 px + offset 2 con `--text-primary`; 11/11 eliminados (P4-07.3 ⛔ P0-04) |
| P4-08 | Corregir pares de contraste AA reutilizando tonos existentes | P1-03 | M | ◐ | `check-contrast.mjs` existe y **falla: 39/54 PASS, 15 FAIL** (12 con consumidores, 3 latentes). Script como gate |
| P4-09 | `aria-live`/`role="status"` en toasts y anuncios | P4-04 | S | ✅ | T-04; `Dashboard` y `LoadingOverlay` |
```

### 1.9 §8 — F5

Añadir bajo la tabla:

```markdown
> **Adelanto autorizado (2026-11-12):** P5-01, P5-02, P5-03 y P5-05 pueden ejecutarse sin esperar a G4. P5-04 **no** se adelanta: depende de la línea base y acumula 487 + 147 literales.
```

### 1.10 §9 — F6

Reemplazar las filas `P6-01`…`P6-05` por:

```markdown
| P6-01 | Instalar y configurar Vitest + RTL + user-event + jest-axe | G5 | M | ✅ | 10 archivos de test; `npm test` 40/40 |
| P6-02 | Instalar y configurar ESLint y Stylelint | A-05 | M | ☐ | **Adelantada (2026-11-12)** |
| P6-03 | Crear `scripts/check-design-rules.mjs` | A-05 | M | ☐ | **Adelantada (2026-11-12)**; el script no existe aún |
| P6-04 | Implementar los 16 casos de test (T-01…T-16) | P6-01 | L | ◐ | 10 casos ✅; faltan T-11…T-16 |
| P6-05 | Crear `npm run verify` y documentarlo | P6-02, P6-03, P6-04 | S | ☐ | **Adelantada (2026-11-12)** |
```

### 1.11 §12 — registro

Añadir:

```markdown
| 2026-11-12 | — | Auditoría de estado con @reviewer: F0 pendiente de capturas; F1 solo P1-06; F2/F3 cerradas en código; F4 en rojo por contraste; A-05/A-07 cerradas | `specs/tasks.md` §2.4 y §15 | Auditoría técnica |
| 2026-11-12 | F0/F5/F6 | Decisiones aprobadas: baseline Playwright del estado actual (24–30), matriz mínima, `check-contrast` como gate, adelantos P6-02/03/05 y F5 parcial | `plan.md` §1.1, `specs/tasks.md` §13 | Usuario + auditoría |
```

---

## 2. `MEMORY.md` — reemplazo completo (50 líneas, límite 75)

```markdown
1. Contexto y Estado del Proyecto
Proyecto: despliegues_BADA_react (Dashboard de despliegues, changelog y seguimiento).

Stack: React 18+, Vite, Firebase (Auth, Firestore, Data Connect/GraphQL), CSS modular por capas.

Paradigma: Spec-Driven Development (SDD) con arquitectura desacoplada y tipado defensivo.

2. Mapa Arquitectónico Activo
src/components/ui/: Componentes atómicos presentacionales puros (Badge, Button, Modal, Input, Select, Toast).

src/components/views/: Vistas de dominio compuestas (Dashboard, ChangelogView, DetailView, VersionList).

src/components/views/detail/: Componentes especializados de detalle (BadaGraph, CduRow, ResponsiblesEditor, StepsEditor).

src/components/modals/: Modales de negocio orquestados vía ModalContext.

src/context/: Gestión de sesión (AuthContext), notificaciones (ToastContext) y modales (ModalContext).

src/store/: Estado centralizado (dataStore, workspaceStore) y métricas puras (statsCalculator).

src/services/: Integración externa (firebaseConfig, firebaseData, excelImporter, excelExporter, textExporter).

src/styles/: Arquitectura CSS organizada en base/, layouts/ y components/.

src/utils/: Funciones puras utilitarias (validator, debouncer, notifications).

3. Decisiones Técnicas Clave
Inmutabilidad: Mutaciones de estado estrictamente predecibles; cálculos analíticos fuera de la vista.

Seguridad: Particionado multi-workspace por workspaceId y validación de reglas de acceso vía firestore.rules.

Carga de Datos: Sanitización y validación estricta de esquemas antes de persistir mutaciones o procesar Excel.

4. Registro de Cambios Recientes
[2026-11-08] Gobernanza SDD: AGENTS.md, docs/constitution.md y MEMORY.md. Auditoría inicial (~55-65 % de cumplimiento) → specs/SPEC-001 (Aprobada), plan.md con fases F0-F7, 51 tareas y gates G0-G7. Paleta congelada (#047857, #388114, #c53030, #2c5282). Deriva: CONSTITUTION.md vive en docs/.

[2026-11-08/10] F0/F1: F0 parcial (protocolo baseline, 0 capturas). 76 tokens --palette-*, 35 semánticos, 35 de escala; 144 hex tokenizados con round-trip; 6 hojas muertas y 55 clases/84 reglas muertas eliminadas; changelog.css (1.526 líneas) dividido en 6; modal-history.css importada. Pendiente P1-06.2/6.3 (detail-header.css). Informes en docs/audits/2026-11-10-*.md.

[2026-11-10] F2: 0 style={{ y 0 hex en src; 0 controles anidados. Helper único src/utils/clipboard.js. ProgressModal con <progress> y 3 tartas SVG; badge de DetailHeader en layouts/header.css.

[2026-11-10] F3: 73 hallazgos (3 alta/29 media/41 baja), hojas sin @media 11; breakpoints 900/768/600 (+480) en changelog, modales, header, cards y tablas; 44×44 en pointer coarse, hover:none, scroll contenido en tablas. Verificación visual pendiente.

[2026-11-10] F4: useFocusTrap + role=dialog/aria-modal/aria-labelledby; 25 iconos con nombre; labels/ids y aria-describedby; :focus-visible 2 px con --text-primary; aria-live en toasts, carga y cambio de vista. 40/40 tests. Pendiente P4-08 y verificación manual.

[2026-11-12] Auditoría @reviewer + decisiones: P4-08 en rojo (check-contrast 39/54 PASS, 15 FAIL: 12 pares con consumidores y 3 latentes). A-05/A-07 cerradas (node_modules operativo; commits b68406b…5ece225). G0 se cierra con capturas Playwright del estado actual (24-30), no retroactivas. Adelantos autorizados: P6-02/03/05 y F5 parcial (P5-01/02/03/05); P5-04 no. Detalle en specs/tasks.md §13.

5. Próximos Pasos Inmediatos
Orden: A-08 harness Playwright (scripts/capture-baseline.mjs + devDependency + MANIFEST) → P0-04.1–7 → G0 (línea base de estado actual) → P1-06.2/6.3 → P4-08.1–8.7 (check-contrast en 0 sobre los 12 pares con consumidores; los 3 latentes son aviso) → P5-01/02/03/05 → P6-02/03/05 → P4-10/P4-11 (teclado, axe) → P3-02.6/P3-04.2/P3-05.3/P3-06.4 → P5-04 (487+147 literales, solo tras baseline) → P6-04/P6-06 → F7.

Derivar SPEC-002 (fechas locales), SPEC-003 (auth y firestore.rules), SPEC-004 (testing/CI) y SPEC-005 (sanitización de importación).
```

---

## 3. `docs/design-system.md` §8

Reemplazar la tabla completa de §8 por:

```markdown
| Deuda | Resolución |
|---|---|
| 11 grupos de colores casi idénticos | Spec posterior con diff visual aprobado |
| `--state-*` como alias temporal | `P1-05` migra consumidores |
| 30 tamaños de fuente en uso frente a 9 de la escala | `P5-04.2–4` mapea intermedios con verificación visual |
| 14 radios en uso frente a 8 de la escala | `P5-04.7` mapea intermedios con verificación visual |
| 31 variantes de `box-shadow` | `P5-04.8`; requiere revisión caso a caso |
| `detail-header.css` sin importar | `P1-06.2`, bloqueado por `P0-04` |
```

Cambios: se elimina la fila de «3 variables indefinidas» (cerrada en P1-09, 0 variables usadas sin declarar) y las filas de escalas dejan de atribuirse a `P1-05` y pasan a `P5-04`, en coherencia con §9. Actualizar también la cabecera `Última actualización` a 2026-11-12.
