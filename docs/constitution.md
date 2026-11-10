1. Misión y Propósito
Este documento define los principios fundacionales, estándares de diseño, protocolos de seguridad y marcos de validación obligatorios para despliegues_BADA_react. Toda especificación funcional o técnica (Spec) debe alinearse con estos mandatos antes de su aprobación y ejecución.

2. Principios Arquitectónicos y Estilo
Spec-First: Ningún componente, servicio o mutación de estado puede crearse o alterarse sin una especificación previa que defina contexto, requerimientos, interfaz de datos y criterios de aceptación.

Jerarquía Modular y Separación de Responsabilidades:

UI Atómica (src/components/ui/): Componentes presentacionales desacoplados, sin acceso a APIs ni estado global.

Vistas y Dominio (src/components/views/, src/components/views/detail/): Ensamblaje visual de flujos de negocio.

Modales (src/components/modals/): Controlados mediante interfaces limpias y el contexto global (ModalContext).

Estado y Analítica (src/store/): Mutaciones predecibles e inmutables; los cálculos de métricas y analítica residen en módulos puros (statsCalculator.js).

Capa de Servicios (src/services/): Aislamiento de llamadas externas a Firebase, exportadores e importadores.

Estilos por Capas (src/styles/): Mantenimiento de la separación entre variables CSS (base/variables.css), reseteo (base/reset.css), layouts y componentes individuales. Prohibido el uso de estilos inline o selectores globales no documentados.

Inmutabilidad y Determinismo: Las funciones deben ser puras siempre que sea posible. Queda prohibida la mutación directa de props o estado de componentes.

Resiliencia y Tipado Defensivo: Toda entrada externa o archivo cargado (Excel, JSON) debe ser analizado y sanitizado por la capa de validación (src/utils/validator.js) antes de impactar el estado o la base de datos.

3. Protocolos de Seguridad y Protección de Datos
Reglas de Acceso a Nivel de Base de Datos:

Ninguna lógica de seguridad sensible puede delegarse exclusivamente al cliente.

Las operaciones sobre Firestore deben estar respaldadas por reglas estrictas en firestore.rules, garantizando validación de esquemas, pertenencia de workspace y autenticación de usuarios.

Para servicios bajo Data Connect / GraphQL, los esquemas (schema.gql) y consultas (queries.gql, mutations.gql) deben restringir los campos expuestos al mínimo indispensable (principio de menor privilegio).

Gestión de Sesión y Autenticación:

Todo flujo protegido debe verificarse contra AuthContext.

Prohibido el almacenamiento en texto plano de credenciales o tokens en localStorage o sessionStorage.

Control de contexto de ejecución multi-workspace: la información debe quedar estrictamente particionada por workspaceId en queries y mutaciones.

Sanitización de Datos y Cargas Masivas:

Prevenir vulnerabilidades de inyección y XSS sanitizando cadenas de texto en entradas de usuarios y comentarios.

La importación vía excelImporter.js debe verificar tipos de datos, longitud de campos y estructura de columnas antes de despachar mutaciones hacia Firebase.

4. Marco de Testing y Criterios de Aceptación
Toda especificación debe incluir una estrategia de verificación compuesta por los siguientes niveles:

Unit Testing (Pruebas Unitarias):

Cobertura Crítica: 100% de cobertura en módulos analíticos (statsCalculator.js), utilitarios de validación (validator.js) y parsers (excelImporter.js, excelExporter.js).

Las pruebas deben evaluar tanto casos felices como bordes de error (formatos corruptos, valores null/undefined, estructuras anidadas incompletas).

Integration Testing (Pruebas de Integración de Componentes):

Validación de componentes de UI y vistas ante múltiples estados de datos: carga (loading), error (error), vacío (empty) y renderizado exitoso.

Simulación de interacción de usuario (disparo de eventos, aperturas de modales, alertas y toasts) verificando que el flujo de estado responda según la especificación.

Security & Regression Checks (Verificación de Regresiones y Seguridad):

Validación automatizada o emulada de firestore.rules mediante la suite de pruebas de Firebase Emulator.

Confirmación de que las mutaciones no autorizadas sean rechazadas por el motor de reglas.

Criterios de Aceptación Obligatorios (Definition of Done):

La funcionalidad cumple estrictamente con el contrato de la Spec asociada.

Todas las pruebas unitarias e integración asociadas se ejecutan exitosamente.

El código cumple con las directivas de ESLint del proyecto sin advertencias suprimidas sin justificación.

La documentación de cambios o changelog queda actualizada.

5. Protocolo de Enmienda
Cualquier modificación a esta constitución requiere una propuesta de cambio justificada, evaluación de impacto sobre las specs existentes y confirmación técnica explícita.