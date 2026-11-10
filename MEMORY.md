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
[2026-11-08] - Configuración de Gobernanza SDD:

Creación de directivas de agente en AGENTS.md.

Definición de principios de arquitectura, seguridad y testing en CONSTITUTION.md.

Inicialización de la memoria operativa y mapa de componentes en MEMORY.md.

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

G0 parcial: faltan 36 capturas visuales manuales; bloquean cambios visuales desde P1-05.

Corrección del baseline: 4 variables CSS indefinidas reales (+1 con fallback) y 6 hojas no alcanzables desde main.css; detail-header.css no se importa.

[2026-11-09/10] - F1 (P1-01 a P1-08): 74 tokens --palette-*, 35 semánticos y 35 de escala documentados en docs/design-system.md; 144 hex tokenizados con round-trip verificado; 6 hojas muertas eliminadas; changelog.css (1.526 líneas) dividido en 6 archivos sin selectores duplicados; modal-history.css movida a main.css. Pendiente P1-06 (detail-header.css) por capturas. Único delta visual: --radius-md en CduHistoryModal. Auditoría 2026-11-10: plan.md movido a la raíz; tablero granular en specs/tasks.md; nuevas P1-09 (variables indefinidas), P1-10 (selectores muertos) y P3-06 (tablas).

[2026-11-10] - P1-09/P1-10 cerradas: 0 variables indefinidas; 55 clases y 84 reglas muertas eliminadas (14/25 en base-layouts-components, 41/59 en modales-changelog). `modal-changes-summary.css` retirada con su import. Auditoría: 466→424 clases, muertas 42→1 (solo `deployment-report`, excluida por descendiente vivo `.modal-actions`), 21 dinámicas intactas, 29 imports y 0 rotos. Discrepancia P1-07.3 corregida: los selectores existían desde el primer commit; «ausentes» se refería a consumidores.

5. Próximos Pasos Inmediatos
A-05/A-06 pendientes: restaurar node_modules y build, y fijar la lista exacta de capturas baseline. P1-06 solo requiere importar detail-header.css tras las capturas.
[2026-11-10] P2-05/P2-06: 0 inline styles y 0 hex en src/components; paleta 76 tokens (sky-400/pink-500 exactos desde BadaGraph). ProgressModal usa <progress> y 3 tartas SVG; BadaGraph, SVG; badge de DetailHeader en layouts/header.css porque detail-header.css no se importa. P2-05.6, P2-03.11, P2-04.6 y P1-06.2 esperan baseline P0-04; P2-06.2 (helper de portapapeles) queda como propuesta.
Derivar SPEC-002 (fechas locales), SPEC-003 (auth y firestore.rules), SPEC-004 (testing/CI) y SPEC-005 (sanitización de importación).