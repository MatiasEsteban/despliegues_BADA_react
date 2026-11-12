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

[2026-11-12] G0 cerrado y P1-06.2/6.3: 24 PNG + MANIFEST (commit 5ece225, Playwright 1.65.0/Chromium 158, fixtures sin Firestore) en docs/audits/baseline-2026-11-08/. detail-header.css importado tras header.css (duplicados retirados); `antes/` idéntico byte a byte y `despues/` con 3 deltas justificados (docs/audits/2026-11-12-p1-06.md). npm test 51/51; build 96,56 kB CSS.

5. Próximos Pasos Inmediatos
Orden: P1-06.4 (cerrar checklist G1) → P4-08.1–8.7 (check-contrast en 0 sobre los 12 pares con consumidores; los 3 latentes son aviso) → P5-01/02/03/05 → P6-02/03/05 → P4-10/P4-11 (teclado, axe) → P3-02.6/P3-04.2/P3-05.3/P3-06.4 → P5-04 (487+147 literales, ya con línea base) → P6-04/P6-06 → F7.

Derivar SPEC-002 (fechas locales), SPEC-003 (auth y firestore.rules), SPEC-004 (testing/CI) y SPEC-005 (sanitización de importación).
