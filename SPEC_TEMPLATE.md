# Plantilla de especificación técnica — `despliegues_BADA_react`

> Copiar este archivo a `specs/SPEC-[ID]-[nombre-feature].md` y completar todas las secciones.
> Ninguna sección puede quedar vacía: si no aplica, escribir `No aplica` y justificar.
> El estado inicial es siempre `Borrador`. Ninguna implementación puede comenzar sin el estado `Aprobada`.

---

## 0. Metadatos

| Campo | Valor |
|---|---|
| ID | `SPEC-[NNN]` |
| Título | |
| Estado | `Borrador` \| `En revisión` \| `Aprobada` \| `Implementada` \| `Cerrada` \| `Cancelada` |
| Fecha de creación | |
| Fecha de aprobación | |
| Autor | |
| Revisor | |
| Plan de implementación | [`../plan.md`](../plan.md) |
| Specs relacionadas | |

---

## 1. Resumen ejecutivo

Máximo cinco líneas. Qué problema resuelve, por qué ahora y qué cambia para el usuario o el sistema.

---

## 2. Contexto y evidencia

- Situación actual.
- Evidencia medible (métricas, capturas, trazas, referencias de código con archivo y línea).
- Alternativa de "no hacer nada" y su costo.

---

## 3. Objetivos y no objetivos

### Objetivos
- `O-01.` …
- `O-02.` …

### No objetivos
- `N-01.` …
- `N-02.` …

---

## 4. Restricciones

| ID | Restricción |
|---|---|
| C-01 | |
| C-02 | |

Incluir obligatoriamente: aislamiento por `workspaceId`, reglas de Firestore, sanitización, presupuesto de rendimiento y límites de alcance.

---

## 5. Requerimientos

Un bloque por requerimiento, con ID estable y criterios de aceptación verificables.

### R-[ÁREA]-01 — Título

**Descripción:**

**Criterios de aceptación:**
- [ ] …
- [ ] …

> Áreas sugeridas: `DS` (design system), `A11Y`, `RESP`, `UI`, `DATA`, `SEC`, `PERF`, `CODE`, `DOC`, `TEST`.

---

## 6. Contrato de datos e interfaces

### 6.1 Esquema de entrada

| Campo | Tipo | Obligatorio | Validación | Origen |
|---|---|---|---|---|

### 6.2 Esquema de salida / persistencia

| Colección / nodo | Campos | Índices | Particionado por `workspaceId` |
|---|---|---|---|

### 6.3 Componentes y props

| Componente | Props nuevas | Props modificadas | Compatibilidad |
|---|---|---|---|

### 6.4 Variables y tokens

Solo si la spec toca estilos o design system. Declarar el contrato de nombres.

---

## 7. Mapeo de archivos e impacto

### 7.1 Crear

| Archivo | Propósito |
|---|---|

### 7.2 Modificar

| Área | Archivos | Motivo |
|---|---|---|

### 7.3 Eliminar

| Archivo | Motivo | Sustituto |
|---|---|---|

---

## 8. Seguridad y resiliencia

- Aislamiento de datos por `workspaceId`.
- Reglas de Firestore afectadas (lectura/escritura) y su justificación.
- Validación en `src/utils/validator.js`.
- Riesgos de XSS, inyección o datos corruptos.
- Manejo de errores y estados de fallo.
- Confirmación explícita de que **no** se relajan reglas de seguridad.

---

## 9. Plan de testing

### 9.1 Herramientas

### 9.2 Casos obligatorios

| ID | Caso | Tipo | Prioridad |
|---|---|---|---|
| T-01 | | Unitario / Integración / E2E / Manual | |

### 9.3 Datos de prueba y límites

### 9.4 Matriz manual (si aplica)

| Vista | 320 | 375 | 768 | 1024 | 1440 | Claro | Oscuro | Teclado |
|---|---|---|---|---|---|---|---|---|

---

## 10. Criterios de aceptación — Definition of Done

- [ ] Requerimientos implementados y verificados.
- [ ] Tests exigidos por la constitución escritos y pasando.
- [ ] Sin regresiones en flujos existentes.
- [ ] Documentación actualizada (`docs/`, `MEMORY.md`, `plan.md`).
- [ ] Aprobación explícita del responsable.

---

## 11. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| | Alta / Media / Baja | Alto / Medio / Bajo | |

---

## 12. Fuera de alcance y derivaciones

| Hallazgo o necesidad | Spec propuesta | Prioridad |
|---|---|---|

---

## 13. Anexos

### Anexo A — Inventario de hallazgos y trazabilidad

| Hallazgo | Severidad | Requerimiento |
|---|---|---|

### Anexo B — Decisiones pendientes de aprobación

1. …

### Anexo C — Referencias

- Archivos, commits, capturas, enlaces externos.
