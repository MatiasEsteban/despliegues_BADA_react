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
[2026-11-08] - Gobernanza SDD: AGENTS.md (rol y ciclo), docs/constitution.md (arquitectura, seguridad, testing) e inicialización de MEMORY.md.

[2026-11-08] - Auditoría de diseño y accesibilidad (sin cambios de código):

Veredicto: cumplimiento parcial (~55-65%). Dirección visual coherente, estándares formales no cumplidos.

Creado specs/SPEC-001-endurecimiento-diseno-accesibilidad.md (Aprobada el 2026-11-08).

Creado plan.md con fases F0-F7, 48 tareas, gates G0-G7 y backlog derivado.

Paleta congelada: todo ajuste de contraste reutiliza tonos ya existentes (#047857, #388114, #c53030, #2c5282).

Hallazgos críticos: hook condicional en Modal.jsx; Icons.Info con fill blanco fijo; 79 estilos inline; 85 hex únicos; 0 aria-label/role/aria-live; 0 media queries en CSS nuevo; 0 tests y sin ESLint.

Deriva de gobernanza: CONSTITUTION.md no existe en la raíz (vive en docs/constitution.md); SPEC_TEMPLATE.md fue creado el 2026-11-08.

[2026-11-08] - Ejecución F0 de SPEC-001 (aprobada):

Creados SPEC_TEMPLATE.md, docs/audits/2026-11-08-baseline.md y docs/audits/baseline-2026-11-08/README.md.

Rama de trabajo: feat/spec-001-design-hardening (el repo git es despliegues-bada-react/).

G0 parcial: 0 capturas realizadas (P0-04.1–7 ☐); A-06 debe fijar el conteo (la cifra de 36 no cuadra con la matriz). Bloquea el cierre visual (G0/G2), no los cambios de código.

Corrección del baseline: 4 variables CSS indefinidas reales (+1 con fallback) y 6 hojas no alcanzables desde main.css; detail-header.css no se importa.

[2026-11-09/10] - F1 (P1-01 a P1-08): 74 tokens --palette-*, 35 semánticos y 35 de escala documentados en docs/design-system.md; 144 hex tokenizados con round-trip verificado; 6 hojas muertas eliminadas; changelog.css (1.526 líneas) dividido en 6 archivos sin selectores duplicados; modal-history.css movida a main.css. Pendiente P1-06 (detail-header.css) por capturas. Único delta visual: --radius-md en CduHistoryModal. Auditoría 2026-11-10: plan.md movido a la raíz; tablero granular en specs/tasks.md; nuevas P1-09 (variables indefinidas), P1-10 (selectores muertos) y P3-06 (tablas).

[2026-11-10] - P1-09/P1-10 cerradas: 0 variables indefinidas; 55 clases y 84 reglas muertas eliminadas (14/25 en base-layouts-components, 41/59 en modales-changelog). `modal-changes-summary.css` retirada con su import. Auditoría: 466→424 clases, muertas 42→1 (solo `deployment-report`, excluida por descendiente vivo `.modal-actions`), 21 dinámicas intactas, 29 imports y 0 rotos. Discrepancia P1-07.3 corregida: los selectores existían desde el primer commit; «ausentes» se refería a consumidores.
[2026-11-10] - F3 auditoría estática cerrada (P3-01.1–6): `scripts/audit-responsive.mjs` (32 hojas CSS, 760 reglas) y `docs/audits/2026-11-10-responsive.md` con 82 hallazgos (6 alta / 35 media / 41 baja) y 26 hojas de layout sin `@media` (14 en `changelog/*`+`modals/*`). Hallazgo clave: `detail-header.css` no se importa, así que el `flex-wrap` de `.version-detail-meta` es inerte; la regla viva es `layouts/header.css:106`. Nuevas tareas P3-02.7, P3-02.8, P3-03.6, P3-03.7; alcance corregido en P3-04.1/P3-05.2/P3-06.1. P3-02.6, P3-05.3 y P3-07.1 siguen bloqueadas por A-05/P0-04.
[2026-11-10] - P3-02.1–8 aplicadas (solo CSS): `timeline`, `changelog/card`, `modal-entries`, `date-editor`, `workspace-switcher`, `cards`, `layouts/header` y `view-toggle` con @media 900/768/600 (+480 solo en `cards.css`, justificado). Todo al final de cada hoja; 0 cambios de escritorio salvo `repeat(4,1fr)` → `repeat(4,minmax(0,1fr))` (`cards.css`, A-01). Decisiones: `card.css` conserva `overflow:hidden` (la causa era `flex-shrink:0`); `modal-entries` colapsa a una columna con tabs en carril horizontal a 600; el dropdown del switcher queda con `left:0` y ancho `min(240px, 100vw - 2*--space-4)`. Audit 74→73 hallazgos (alta 4→3: `.toast` es falso positivo; las 2 de tabla son P3-06.1); hojas sin `@media` 26→18; selectores muertas 1/dinámicas 21. P3-02.6 sigue ⛔ P0-04.
[2026-11-10] - P3-03.1–7 y P3-04.1 aplicadas (solo CSS, sin JSX): 7 hojas de `modals/` con @media 768/600 (`full-summary` pre-wrap y meta con wrap; `base` cabecera con wrap, cierre 44×44, `max-height: min(90vh,100dvh)` y body en columna, `.modal-message--full` intacta; `progress` charts a 1 col, `.chart-details` con max-height+scroll-y, tartas por viewBox, `.status-column` 100 %; `export-modal` y `deployment-info` con wrap; `comentarios` width 51→100 %; `deployment-report` columna única con `min-width:0`). P3-04.1 (A-05) sin reglas nuevas: cubierto por P3-02.8 en `layouts/header.css`. Audit 809→856 reglas, 73 hallazgos sin altas nuevas (alta 3/media 29/baja 41), hojas sin @media 18→11, selectores muertas 1/dinámicas 21. `npm run build` verde (91.76 kB CSS). M-27 (`.modal-login`) fuera de lote; P3-04.2 sigue ⛔ P0-04.
[2026-11-10] - P3-05.1/2/4 y P3-06.1/2/3 aplicadas (solo CSS, sin JSX) + M-27 trazada como P3-03.8: `pointer: coarse` a 44×44 (`.btn`, `.theme-toggle`, `.btn-historial`, `.btn-responsable`, `.btn-observacion`, `.btn-comentario-cat`, `.btn-marcar-produccion`, `.btn-version-info`, `.modal-close-btn`, `.ws-item(-delete)`, `.btn-cl-action`, `.btn-action-list`, `.btn-toggle-pasos`, `.pagination-btn`, inputs); `hover: none` + `:focus-within` revelan `.changelog-card-actions` y `.ws-item-delete` (M-16); `pointer: fine` fija 24×24 en `.btn-historial`, `.btn-toggle-pasos` y `.paso-check`, con separación ≥ 8 px entre acciones (el checkbox no sube a 44: su envoltorio es `<div>`, deuda JSX). Tablas: `#versions-list-container` de `overflow:hidden` a `overflow-x:auto` (M-20), sombras con `background-attachment` en tabla y lista (sin JS, P3-06.2), columnas 4/5 ocultas a 600 en CDUs y columna 5 en la lista, `.cdu-actions` con wrap. No se reduce `min-width:1600px` (R-RESP-03) y el script de auditoría queda intacto: 3 altas = falsos positivos justificados. Audit 856→895 reglas, 73 hallazgos (3/29/41), hojas sin @media 11→7; build verde (95.59 kB CSS); selectores 1/21. P3-05.3 ⛔ y P3-06.4 ◐ por P0-04.
[2026-11-10] - P6-01.1–4 adelantadas (infraestructura de tests): Vitest 3.2.7 (pin `^3`; la 5.x exige Vite ≥ 6), jsdom 29.1.1, RTL 16.3.3 + dom 10.4.2, user-event 14.6.9, jest-dom 7.0.1 y jest-axe 11.0.0 como devDependencies. `vitest.config.js` (jsdom, globals, setupFiles, `css:false`, restoreMocks) y `src/test/setup.js` (jest-dom/vitest, `toHaveNoViolations`, stubs de matchMedia/ResizeObserver). `Button.test.jsx` con 4 tests: `type="button"` por defecto (R-CODE-02), children/variante, `onClick` y `type="submit"` explícito → cierra P6-04.3. Scripts `test`/`test:watch`; sin coverage ni verify (P6-05). `npm test` 4/4 y build verde; audit-inline 0 y selectores 502/480/21/1/17 sin cambios. Documentado en `docs/audits/2026-11-10-testing-setup.md`. Pendiente: `globals: true` exigirá `globals.vitest` en ESLint (P6-02).
[2026-11-10] - P4-01/P4-02/P4-03 aplicadas en el `Modal` base: hooks (`useId`, `useRef`, `useFocusTrap`) antes del `return`; nuevo `src/hooks/useFocusTrap.js` (foco inicial, ciclo Tab/Shift+Tab, Escape con `onClose` por ref, restauración del disparador y `body.style.overflow`, único `style` y admitido por R-DS-03). ARIA en `.modal`: `role="dialog"`, `aria-modal`, `aria-labelledby` con `useId` (fallback `aria-label="Diálogo"`), cierre con `aria-label="Cerrar"` y `×` en `aria-hidden`. `Modal.test.jsx` cubre T-01/T-02/T-03, scroll, fallback y `jest-axe`; suite total 12/12 (con `Button`). Build verde (122 módulos, 95.59 kB CSS); audit-inline 0 (el hook queda fuera de `src/components`) y selectores 502/480/21/1/17. P4-02.7 ⛔ P0-04. Documentado en `docs/design-system.md` §10.
5. Próximos Pasos Inmediatos
A-05/A-06 ya tienen corrección estática (P3-02.2 / P3-02.8); falta restaurar node_modules/build y las capturas baseline (P0-04) para verificarlas. P3-02/P3-03/P3-04.1/P3-05/P3-06 cerradas en código: queda P3-07 (200 % de zoom y cierre G3) y la verificación visual de P3-02.6, P3-04.2, P3-05.3 y P3-06.4 con baseline P0-04. F4 en curso: P4-01–P4-07 y P4-09 cerradas en código (P4-04.7 ◐ y P4-07.3 ⛔ por falta de navegador); siguen P4-08 (contraste), P4-10/P4-11 y la verificación manual con P0-04. Después P6-02 (lint) y P6-03/P6-05.
[2026-11-10] P2-05/P2-06: 0 inline styles y 0 hex en src/components; paleta 76 tokens (sky-400/pink-500 exactos desde BadaGraph). ProgressModal usa <progress> y 3 tartas SVG; BadaGraph, SVG; badge de DetailHeader en layouts/header.css porque detail-header.css no se importa. P2-06.2 cerrada: helper único src/utils/clipboard.js (copyText, try/finally) y modales sin duplicación. P2-05.6, P2-03.11, P2-04.6 y P1-06.2 esperan baseline P0-04.
[2026-11-10] P4-04/P4-05 cerradas: cero controles anidados (onClick de ratón en div/tr sin role/tabIndex + control específico de teclado). ChangelogCard .changelog-card-toggle (aria-expanded/aria-controls), VersionCard button.version-card-number, VersionRow .version-list-open, ExportModal radiogroup con roving tabindex y flechas/Home/End, ProgressModal .chart-toggle (hooks antes de returns). Icons.jsx decorativo por defecto (RAW_ICONS+withIconA11y). 25 iconos con aria-label; scripts/audit-nested-controls.mjs en 0. 28/28 tests; deuda: views/detail/* sin nombre (CduRow, StepsEditor) y P4-04.7 sin navegador.
[2026-11-10] P4-06/P4-07/P4-09 cerradas: Input/Select con `useId` como fallback (label/id siempre asociados) y `error` → `aria-invalid`/`aria-describedby`; DateQuickEditor con ids; Login describe el error (`role="alert"`, `aria-invalid` en ambos campos) y conserva `required` nativo; 11/11 `outline: none` eliminados y `:focus-visible` 2 px + offset 2 con `--text-primary` (11,4:1 claro / 16,5:1 oscuro; `--accent-color` descartado por 1,84:1 y 1,05:1); `.visually-hidden`, `.toast-container` `role="status"`/`aria-live="polite"`/`aria-atomic="false"`, Toast error `role="alert"`, Dashboard anuncia el cambio de vista sin ruido inicial y LoadingOverlay es `role="status"`. T-04/T-06 (12 tests nuevos, suite 40/40); build verde (96,32 kB CSS); selectores 506/484/21/1. P4-07.3 ⛔ P0-04 (Tab en claro/oscuro y 5 modales).
Derivar SPEC-002 (fechas locales), SPEC-003 (auth y firestore.rules), SPEC-004 (testing/CI) y SPEC-005 (sanitización de importación).