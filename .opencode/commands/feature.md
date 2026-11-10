# Command: /feature

## Propósito
Este comando establece el protocolo paso a paso para diseñar, validar e implementar una nueva funcionalidad (feature) en `despliegues_BADA_react` bajo la metodología SDD (Spec-Driven Development).

---

## ⛔ Regla Inquebrantable: Modo PLAN Obligatorio
Antes de tocar, crear o editar cualquier archivo de código (`.jsx`, `.js`, `.css`, etc.), el agente **DEBE ingresar en Modo PLAN**.
Queda estrictamente prohibido generar código de producción o refactorización sin que el usuario haya aprobado explícitamente el plan y la especificación técnica correspondiente.

---

## Flujo de Ejecución

### Paso 1: Recolección y Contexto
1. Leer el requerimiento de la feature presentado por el usuario.
2. Consultar `MEMORY.md` para evaluar el estado arquitectónico actual.
3. Consultar `CONSTITUTION.md` para identificar restricciones no negociables (seguridad, particionado por `workspaceId`, modularización y testing).
4. Identificar dependencias con componentes existentes:
   - UI base: `src/components/ui/`
   - Vistas: `src/components/views/`
   - Modales: `src/components/modals/`
   - Estado: `src/store/`
   - Servicios: `src/services/`
   - Estilos: `src/styles/`

---

### Paso 2: Creación de la Especificación (Borrador de Spec)
Generar el borrador formal de la feature en el directorio `specs/` con nomenclatura `SPEC-[ID]-[nombre-feature].md` siguiendo la estructura de `SPEC_TEMPLATE.md`:
1. **Contexto y Alcance:** Definición del problema y límites funcionales.
2. **Contrato de Datos:** Esquemas de entrada, validaciones en `src/utils/validator.js` y persistencia en Firebase/Firestore o Data Connect.
3. **Mapeo de Componentes y Archivos:** Lista exhaustiva de archivos a crear, modificar o eliminar.
4. **Seguridad y Resiliencia:** Verificación de aislamiento de datos y reglas de Firestore.
5. **Plan de Testing:** Casos de prueba unitarios, límites (edge cases) y pruebas de UI/integración.

---

### Paso 3: Checkpoint y Consulta al Usuario (Pausa Obligatoria)
El agente debe detenerse aquí y presentar al usuario:
- Un resumen declarativo del enfoque técnico planteado.
- La especificación técnica completa (`specs/SPEC-[ID]-[nombre-feature].md`).
- Preguntas o dudas abiertas de arquitectura si existieran alternativas de diseño.

> **Pregunta de Control Obligatoria:**  
> *"He completado la fase de especificación y análisis de impacto en modo PLAN. ¿Apruebas esta especificación y la arquitectura propuesta para proceder con la implementación del código?"*

---

### Paso 4: Implementación (Solo tras aprobación explícita)
1. Escribir o modificar los archivos **completos** (sin omisiones, sin código truncado ni comentarios del tipo `// resto del código`).
2. Mantener la consistencia con el sistema de estilos por capas en `src/styles/`.
3. Implementar las validaciones defensivas requeridas.
4. Desarrollar/actualizar la suite de pruebas asociada según lo establecido en el plan.

---

### Paso 5: Verificación y Cierre
1. Confirmar el cumplimiento de la `Definition of Done (DoD)` de `CONSTITUTION.md`.
2. Actualizar `MEMORY.md` registrando la feature, fecha y cambios de arquitectura (manteniendo el archivo estrictamente por debajo de las 75 líneas).
3. Entregar una explicación concisa y declarativa de los cambios realizados.