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

5. Próximos Pasos Inmediatos
A-05/A-06/A-07: restaurar node_modules y build, fijar capturas baseline y commitear F0/F1 auditado.
Completar P1-09 y P1-10; P1-06 solo requiere importar detail-header.css tras las capturas.
Iniciar F2 siguiendo specs/tasks.md (inventario P2-01 y migración por archivo).

Derivar SPEC-002 (fechas locales), SPEC-003 (auth y firestore.rules), SPEC-004 (testing/CI) y SPEC-005 (sanitización de importación).