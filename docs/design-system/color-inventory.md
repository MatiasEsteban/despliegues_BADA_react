# Inventario de color y equivalencias a tokens

| Campo | Valor |
|---|---|
| Tarea | `P1-01` del [`plan.md`](../../plan.md) |
| Spec | [`SPEC-001`](../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) — `R-DS-01` |
| Fecha | 2026-11-09 |
| Rama | `feat/spec-001-design-hardening` |
| Base medida | `src/styles/**/*.css` del commit `6b8e447` |
| Estado | Análisis cerrado. No se modificó ningún archivo CSS. |

---

## 1. Regla de tokenización

- **C-01: la paleta está congelada.** Cada token de la capa `--palette-*` recibe exactamente el valor hex que ya existe.
- No se unifican tonos parecidos. Dos hex distintos producen dos tokens distintos aunque su diferencia sea imperceptible.
- La capa semántica (`--color-*`, `--surface-*`, `--text-*`) solo **referencia** la capa de paleta.
- Los valores de los 11 hex de archivos huérfanos desaparecen con esos archivos; no se tokenizan.
- Cualquier intento de consolidar alias requiere una spec posterior y un diff visual aprobado. **No forma parte de F1.**

---

## 2. Resumen

| Métrica | Valor |
|---|---:|
| Ocurrencias de hex en CSS | 209 |
| Valores únicos | 85 |
| Únicos en archivos huérfanos (se eliminan) | 11 |
| Únicos que sobreviven | 74 |
| Ocurrencias en archivos huérfanos | 21 |
| Ocurrencias que sobreviven | 188 |
| Familias identificadas | 6 (azul, rojo, verde, naranja/amarillo, violeta, neutro) |

### Distribución de ocurrencias por archivo

| Archivo | Hex |
|---|---:|
| `base/variables.css` | 44 |
| `components/buttons.css` | 25 |
| `components/changelog.css` | 24 |
| `components/list-view.css` | 17 |
| `components/table.css` | 16 |
| `components/modals/modal-changes-summary.css` | 14 |
| `components/cards.css` | 11 |
| `components/notifications.css` | 10 |
| `index.css` (huérfano) | 9 |
| `components/modals/modal-progress.css` | 9 |
| `components/modals/modal-alerts.css` (huérfano) | 8 |
| `components/modals/modal-base.css` | 8 |
| `App.css` (huérfano) | 3 |
| `components/forms.css` | 3 |
| `components/modals/modal-login.css` | 3 |
| `components/filters.css` | 2 |
| `components/workspace-switcher.css` | 1 |
| `components/modals/modal-deployment-report.css` | 1 |
| `layouts/login.css` (huérfano) | 1 |

### Hex de archivos huérfanos — no se tokenizan

| Hex | Archivo | Nota |
|---|---|---|
| `#646cff` | `index.css` | Resto de plantilla Vite |
| `#646cffaa` | `App.css` | Resto de plantilla Vite |
| `#61dafbaa` | `App.css` | Resto de plantilla Vite |
| `#888` | `App.css` | Resto de plantilla Vite |
| `#242424` | `index.css` | Resto de plantilla Vite |
| `#535bf2` | `index.css` | Resto de plantilla Vite |
| `#1a1a1a` | `index.css` | Resto de plantilla Vite |
| `#213547` | `index.css` | Resto de plantilla Vite |
| `#ffffff` | `index.css` | Resto de plantilla Vite |
| `#747bff` | `index.css` | Resto de plantilla Vite |
| `#f9f9f9` | `index.css` | Resto de plantilla Vite |

> `modal-alerts.css` y `layouts/login.css` se eliminan, pero sus hex ya existen en archivos activos, por lo que no reducen el conteo de únicos.

---

## 3. Contraste de referencia

Ratios calculados con la fórmula WCAG 2.1 sobre los valores hex. **No sustituyen la validación de `P4-08`**: el contraste real depende del fondo sobre el que se pinta cada valor.

Umbrales: texto normal 4,5:1 · texto grande 3:1 · componentes gráficos 3:1.

---

## 4. Familia azul — 17 valores

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#1668dc` | 14 | `--palette-blue-600` | — | Acción primaria, botones, filtros | 5,19 | 4,05 |
| `#3277d6` | 4 | `--palette-blue-620` | — | Hover/gradiente de acción primaria | 4,43 | 4,75 |
| `#2563eb` | 2 | `--palette-blue-650` | — | Texto y bordes de tabla | 5,17 | 4,06 |
| `#0056cf` | 2 | `--palette-blue-700` | — | Enlaces y acentos de lista | 6,50 | 3,23 |
| `#0056cf8f` | 1 | `--palette-blue-700-alpha` | — | Fondo translúcido de selección | 6,50 | 3,23 |
| `#3b82f6` | 17 | `--palette-blue-500` | `--estado-certificado-border` | Borde de estado certificado, gráficos | 3,68 | 5,71 |
| `#2c5282` | 1 | `--palette-blue-800` | — | Texto de botón sobre fondo claro | 7,97 | 2,64 |
| `#1e40af` | 4 | `--palette-blue-900` | `--estado-certificado-color` (claro) | Texto de estado certificado | 8,72 | 2,41 |
| `#60a5fa` | 1 | `--palette-blue-400` | — | Acento de resumen de cambios | 2,54 | 8,26 |
| `#93c5fd` | 1 | `--palette-blue-300` | — | Borde suave de resumen | 1,80 | 11,65 |
| `#bfdbfe` | 1 | `--palette-blue-200` | — | Borde claro de resumen | 1,42 | 14,78 |
| `#dbeafe` | 2 | `--palette-blue-100` | `--estado-certificado-color` (oscuro) | Fondo de estado certificado | 1,22 | 17,21 |
| `#eff6ff` | 1 | `--palette-blue-50` | `--estado-certificado-bg` (claro) | Fondo de estado certificado | 1,09 | 19,30 |
| `#e0f2fe` | 1 | `--palette-sky-100` | — | Fondo informativo | 1,15 | 18,30 |
| `#4299e1` | 2 | `--palette-sky-500` | — | Acento informativo de modal | 3,05 | 6,88 |
| `#ebf8ff` | 1 | `--palette-sky-50` | — | Fondo informativo de modal | 1,08 | 19,40 |
| `#1e3a8a` | 1 | `--palette-blue-950` | `--estado-certificado-bg` (oscuro) | Fondo de estado certificado en oscuro | 10,36 | 2,03 |

**Observación:** `#3277d6` sobre blanco da 4,43:1, por debajo de 4,5. Si se usa como texto, falla AA. Debe verificarse su uso real en `P4-08`.

---

## 5. Familia roja — 7 valores

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#f56565` | 18 | `--palette-red-400` | — | Bordes, iconos y texto de peligro | 3,03 | 6,93 |
| `#ef4444` | 16 | `--palette-red-500` | — | Acentos de error, badges | 3,76 | 5,58 |
| `#e53e3e` | 1 | `--palette-red-550` | — | Error de login | 4,13 | 5,09 |
| `#c53030` | 1 | `--palette-red-700` | — | Texto de error en formularios | 5,47 | 3,84 |
| `#feb2b2` | 1 | `--palette-red-300` | — | Borde de error de login | 1,72 | 12,23 |
| `#ffe6e6` | 2 | `--palette-red-100` | — | Fondo de alerta | 1,19 | 17,71 |
| `#fff5f5` | 1 | `--palette-red-50` | — | Fondo de error de login | 1,07 | 19,63 |

**Observación:** `#f56565` y `#ef4444` no alcanzan 4,5:1 como texto. El único rojo apto para texto pequeño es `#c53030`. `P4-08` debe reasignar los usos de texto a `--palette-red-700` sin cambiar la identidad de bordes e iconos.

---

## 6. Familia verde — 17 valores

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#10b981` | 12 | `--palette-green-500` | — | Éxito, producción, gráficos | 2,54 | 8,28 |
| `#059669` | 1 | `--palette-green-600` | — | Acento de tabla | 3,77 | 5,57 |
| `#047857` | 3 | `--palette-green-700` | — | Texto de éxito en resumen | 5,48 | 3,83 |
| `#388114` | 1 | `--palette-green-750` | — | Badge de producción sobre blanco | 4,86 | 4,32 |
| `#49aa19` | 6 | `--palette-prod-500` | `--estado-produccion-color` / `-border` | Producción | 2,98 | 7,05 |
| `#059624` | 1 | `--palette-prod-600` | — | Acento de producción | 3,89 | 5,39 |
| `#22c55e` | 1 | `--palette-green-500-alt` | — | Indicador de reporte | 2,28 | 9,22 |
| `#38a169` | 1 | `--palette-green-600-alt` | — | Gradiente de botón | 3,25 | 6,47 |
| `#2f855a` | 1 | `--palette-green-700-alt` | — | Gradiente de botón | 4,54 | 4,62 |
| `#48bb78` | 2 | `--palette-green-400` | — | Alerta de éxito | 2,43 | 8,65 |
| `#86efac` | 1 | `--palette-green-300` | — | Borde de tabla | 1,40 | 14,96 |
| `#6ee7b7` | 1 | `--palette-emerald-300` | — | Borde de resumen | 1,52 | 13,78 |
| `#d1fae5` | 3 | `--palette-emerald-100` | `--estado-produccion-color` (oscuro) | Fondo claro de producción | 1,13 | 18,52 |
| `#f0fdf4` | 1 | `--palette-green-50` | — | Fondo de tabla | 1,05 | 20,06 |
| `#e6ffed` | 2 | `--palette-green-50-alt` | — | Fondo de alerta de éxito | 1,06 | 19,89 |
| `#ecfdf5` | 1 | `--palette-green-25` | `--estado-produccion-bg` (claro) | Fondo de estado producción | 1,05 | 19,94 |
| `#196617` | 1 | `--palette-green-950` | `--estado-produccion-bg` (oscuro) | Fondo de producción en oscuro | 7,11 | 2,95 |

**Observación:** `#49aa19` sobre `#ECFDF5` da 2,83:1 y sobre blanco 2,98:1. No es apto para texto pequeño. `P4-08` debe usar `#047857` o `#388114` para texto y conservar `#49aa19` solo en bordes, puntos y gráficos.

---

## 7. Familia naranja / amarilla — 13 valores

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#f97316` | 10 | `--palette-orange-500` | `--estado-desarrollo-border` | Borde de estado en desarrollo | 2,80 | 7,49 |
| `#c05621` | 1 | `--palette-orange-700` | `--estado-desarrollo-color` (claro) | Texto de estado en desarrollo | 4,57 | 4,59 |
| `#ed8936` | 2 | `--palette-orange-400` | — | Alerta de advertencia | 2,55 | 8,23 |
| `#fff4e6` | 1 | `--palette-orange-50` | `--estado-desarrollo-bg` (claro) | Fondo de estado en desarrollo | 1,09 | 19,33 |
| `#f59e0b` | 2 | `--palette-amber-500` | — | Acento de notificación | 2,15 | 9,78 |
| `#eab308` | 5 | `--palette-yellow-500` | `--estado-pendiente-border` | Borde de estado pendiente | 1,92 | 10,95 |
| `#854d0e` | 1 | `--palette-yellow-800` | `--estado-pendiente-color` (claro) | Texto de estado pendiente | 6,85 | 3,07 |
| `#713f12` | 1 | `--palette-yellow-900` | `--estado-pendiente-bg` (oscuro) | Fondo de pendiente en oscuro | 8,67 | 2,42 |
| `#fef08a` | 1 | `--palette-yellow-200` | `--estado-pendiente-color` (oscuro) | Texto de pendiente en oscuro | 1,16 | 18,05 |
| `#fefce8` | 1 | `--palette-yellow-25` | `--estado-pendiente-bg` (claro) | Fondo de pendiente | 1,03 | 20,30 |
| `#fff8e1` | 2 | `--palette-yellow-50-alt` | — | Fondo de alerta de advertencia | 1,06 | 19,77 |
| `#7c2d12` | 1 | `--palette-orange-900` | `--estado-desarrollo-bg` (oscuro) | Fondo de desarrollo en oscuro | 9,37 | 2,24 |
| `#fed7aa` | 1 | `--palette-orange-200` | `--estado-desarrollo-color` (oscuro) | Texto de desarrollo en oscuro | 1,35 | 15,51 |

**Observación:** `#f59e0b` y `#eab308` no son aptos para texto ni como fondo de texto blanco. `#eab308` con blanco encima da 1,92:1.

---

## 8. Familia violeta — 1 valor

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#8b5cf6` | 10 | `--palette-violet-500` | — | Acento de mejoras, gráficos | 4,23 | 4,96 |

**Observación:** 4,23:1 sobre blanco. Sirve como borde o acento gráfico; falla para texto normal. No debe usarse como color de texto pequeño.

---

## 9. Familia neutra — 19 valores

| Hex | Ocurrencias | Token de paleta | Variable actual | Rol observado | vs blanco | vs negro |
|---|---:|---|---|---|---:|---:|
| `#fdfdfd` | 1 | `--palette-neutral-25` | `--bg-primary` (claro) | Fondo principal | 1,02 | 20,65 |
| `#f7fafc` | 1 | `--palette-neutral-50` | `--bg-secondary` (claro) | Fondo secundario | 1,05 | 20,03 |
| `#e2e2e2` | 1 | `--palette-neutral-200` | `--bg-gradient-start` (claro) | Gradiente de fondo | 1,30 | 16,21 |
| `#d8d8d8` | 1 | `--palette-neutral-250` | `--bg-gradient-end` (claro) | Gradiente de fondo | 1,43 | 14,73 |
| `#e2e8f0` | 2 | `--palette-neutral-200-alt` | `--border-color` (claro) / `--text-primary` (oscuro) | Borde claro / texto oscuro | 1,23 | 17,03 |
| `#cbd5e0` | 1 | `--palette-neutral-300` | `--input-border` (claro) | Borde de input | 1,49 | 14,13 |
| `#b6beca` | 1 | `--palette-neutral-350` | `--accent-color` (claro) | Borde de acento | 1,87 | 11,21 |
| `#696969` | 1 | `--palette-neutral-500` | `--accent-hover` (claro) | Acento y foco | 5,49 | 3,83 |
| `#4a5568` | 1 | `--palette-neutral-600` | — | Texto secundario de tarjeta | 7,53 | 2,79 |
| `#38393a` | 1 | `--palette-neutral-800` | `--text-primary` (claro) | Texto principal | 11,57 | 1,81 |
| `#38393b` | 1 | `--palette-neutral-800-alt` | `--text-secondary` (claro) | Texto secundario | 11,56 | 1,82 |
| `#1d1d1d` | 1 | `--palette-neutral-900` | `--bg-gradient-start` (oscuro) | Gradiente oscuro | 16,86 | 1,25 |
| `#0f0f0f` | 1 | `--palette-neutral-950` | `--bg-secondary` (oscuro) | Fondo secundario oscuro | 19,17 | 1,10 |
| `#050505` | 2 | `--palette-neutral-1000` | `--bg-primary` / `--bg-gradient-end` (oscuro) | Fondo principal oscuro | 20,38 | 1,03 |
| `#0c0c0c` | 1 | `--palette-neutral-975` | `--accent-color` (oscuro) | Acento oscuro | 19,56 | 1,07 |
| `#65676b` | 1 | `--palette-neutral-550` | `--border-color` (oscuro) | Borde oscuro | 5,67 | 3,71 |
| `#5c5c5c` | 1 | `--palette-neutral-500-alt` | `--input-border` (oscuro) | Borde de input oscuro | 6,69 | 3,14 |
| `#4d545f` | 1 | `--palette-neutral-600-alt` | `--accent-hover` (oscuro) | Acento y foco oscuro | 7,64 | 2,75 |
| `#e8edf3` | 1 | `--palette-neutral-100` | `--text-secondary` (oscuro) | Texto secundario oscuro | 1,18 | 17,84 |

**Observación:** `#38393a` y `#38393b` son indistinguibles (diferencia de 1 unidad en azul) y cumplen roles de texto primario y secundario. Se conservan como tokens separados por la regla de no unificación; su consolidación es deuda para una spec posterior.

### 9.1 Adiciones aprobadas en P2-05 — 2 valores procedentes de JSX

| Hex | Origen | Token de paleta | Rol observado | vs blanco | vs negro |
|---|---|---|---:|---:|
| `#0ea5e9` | `BadaGraph.jsx`, `ProgressModal.jsx` | `--palette-sky-400` | V1 del gráfico Bada | 2,77 | 7,58 |
| `#ec4899` | `BadaGraph.jsx`, `ProgressModal.jsx` | `--palette-pink-500` | V2 del gráfico Bada | 3,53 | 5,95 |

> Excepción aprobada 2026-11-10: valores ya presentes en `BadaGraph.jsx`; no son hues nuevos. No figuran en el inventario de CSS porque vivían en `style={{}}`; se tokenizan con el valor exacto para eliminar el hex del JSX.

---

## 10. Contrato propuesto de capa de paleta

```css
:root {
  /* Azul */
  --palette-blue-50: #EFF6FF;
  --palette-blue-100: #DBEAFE;
  --palette-blue-200: #BFDBFE;
  --palette-blue-300: #93C5FD;
  --palette-blue-400: #60A5FA;
  --palette-blue-500: #3B82F6;
  --palette-blue-600: #1668DC;
  --palette-blue-620: #3277D6;
  --palette-blue-650: #2563EB;
  --palette-blue-700: #0056CF;
  --palette-blue-700-alpha: #0056CF8F;
  --palette-blue-800: #2C5282;
  --palette-blue-900: #1E40AF;
  --palette-blue-950: #1E3A8A;

  /* Cielo */
  --palette-sky-50: #EBF8FF;
  --palette-sky-100: #E0F2FE;
  /* Excepción aprobada 2026-11-10: valores ya presentes en BadaGraph.jsx; no son hues nuevos. */
  --palette-sky-400: #0EA5E9;
  --palette-sky-500: #4299E1;

  /* Rosa */
  /* Excepción aprobada 2026-11-10: valores ya presentes en BadaGraph.jsx; no son hues nuevos. */
  --palette-pink-500: #EC4899;

  /* Rojo */
  --palette-red-50: #FFF5F5;
  --palette-red-100: #FFE6E6;
  --palette-red-300: #FEB2B2;
  --palette-red-400: #F56565;
  --palette-red-500: #EF4444;
  --palette-red-550: #E53E3E;
  --palette-red-700: #C53030;

  /* Verde */
  --palette-green-25: #ECFDF5;
  --palette-green-50: #F0FDF4;
  --palette-green-50-alt: #E6FFED;
  --palette-green-300: #86EFAC;
  --palette-green-400: #48BB78;
  --palette-green-500: #10B981;
  --palette-green-500-alt: #22C55E;
  --palette-green-600: #059669;
  --palette-green-600-alt: #38A169;
  --palette-green-700: #047857;
  --palette-green-700-alt: #2F855A;
  --palette-green-750: #388114;
  --palette-green-950: #196617;
  --palette-emerald-100: #D1FAE5;
  --palette-emerald-300: #6EE7B7;
  --palette-prod-500: #49AA19;
  --palette-prod-600: #059624;

  /* Naranja / amarillo */
  --palette-orange-50: #FFF4E6;
  --palette-orange-200: #FED7AA;
  --palette-orange-400: #ED8936;
  --palette-orange-500: #F97316;
  --palette-orange-700: #C05621;
  --palette-orange-900: #7C2D12;
  --palette-amber-500: #F59E0B;
  --palette-yellow-25: #FEFCE8;
  --palette-yellow-50-alt: #FFF8E1;
  --palette-yellow-200: #FEF08A;
  --palette-yellow-500: #EAB308;
  --palette-yellow-800: #854D0E;
  --palette-yellow-900: #713F12;

  /* Violeta */
  --palette-violet-500: #8B5CF6;

  /* Neutro */
  --palette-neutral-25: #FDFDFD;
  --palette-neutral-50: #F7FAFC;
  --palette-neutral-100: #E8EDF3;
  --palette-neutral-200: #E2E2E2;
  --palette-neutral-200-alt: #E2E8F0;
  --palette-neutral-250: #D8D8D8;
  --palette-neutral-300: #CBD5E0;
  --palette-neutral-350: #B6BECA;
  --palette-neutral-500: #696969;
  --palette-neutral-500-alt: #5C5C5C;
  --palette-neutral-550: #65676B;
  --palette-neutral-600: #4A5568;
  --palette-neutral-600-alt: #4D545F;
  --palette-neutral-800: #38393A;
  --palette-neutral-800-alt: #38393B;
  --palette-neutral-900: #1D1D1D;
  --palette-neutral-950: #0F0F0F;
  --palette-neutral-975: #0C0C0C;
  --palette-neutral-1000: #050505;
}
```

**Total: 76 tokens de paleta**: los 74 valores únicos que sobreviven más las 2 excepciones aprobadas en `P2-05` (`--palette-sky-400` y `--palette-pink-500`).

> Implementado en `P1-02` el 2026-11-09 en `src/styles/base/variables.css`. Verificado: 74 nombres únicos, 74 valores únicos, 0 consumidores y build correcto. Ampliado en `P2-05` (2026-11-10) con 2 tokens exactos procedentes de JSX.

---

## 11. Mapeo semántico inicial

| Token semántico | Referencia | Uso |
|---|---|---|
| `--color-action-primary` | `--palette-blue-600` | Botón primario, filtro activo |
| `--color-action-primary-hover` | `--palette-blue-620` | Hover de acción primaria |
| `--color-action-primary-strong` | `--palette-blue-700` | Enlaces y acentos |
| `--color-link` | `--palette-blue-800` | Texto de enlace sobre fondo claro |
| `--color-danger-border` | `--palette-red-400` | Bordes de error |
| `--color-danger-500` | `--palette-red-500` | Iconos y acentos de error |
| `--color-danger-text` | `--palette-red-700` | Texto de error |
| `--color-success-500` | `--palette-green-500` | Iconos y acentos de éxito |
| `--color-success-text` | `--palette-green-700` | Texto de éxito |
| `--color-success-strong` | `--palette-green-750` | Badge sobre blanco |
| `--color-prod` | `--palette-prod-500` | Borde, punto y gráfico de producción |
| `--color-warning` | `--palette-amber-500` | Acento de advertencia |
| `--color-warning-border` | `--palette-yellow-500` | Borde de pendiente |
| `--color-accent-violet` | `--palette-violet-500` | Borde y gráfico de mejoras |
| `--color-focus-ring` | `--accent-hover` | Anillo de foco (token existente) |
| `--surface-primary` | `--bg-primary` | Fondo principal |
| `--surface-secondary` | `--bg-secondary` | Fondo secundario |
| `--surface-raised` | `--palette-neutral-25` | Tarjetas en claro |
| `--text-primary` | `--text-primary` | Texto principal |
| `--text-secondary` | `--text-secondary` | Texto secundario |
| `--border-default` | `--border-color` | Bordes |
| `--border-input` | `--input-border` | Bordes de campo |

> `--surface-raised` y los estados no se resuelven con hex nuevos: reutilizan los tokens existentes de `variables.css`.

---

## 12. Deuda de alias — no se resuelve en F1

Grupos donde varios hex cumplen funciones equivalentes. **Unificarlos cambia píxeles**, por lo que queda prohibido en F1 y se propone como spec posterior.

| Grupo | Valores | Diferencia perceptible |
|---|---|---|
| Azul de acción | `#1668DC`, `#3277D6`, `#2563EB`, `#0056CF` | Baja |
| Azul medio | `#3B82F6`, `#4299E1` | Media |
| Rojo de error | `#F56565`, `#EF4444`, `#E53E3E`, `#C53030` | Media |
| Verde de éxito | `#10B981`, `#059669`, `#22C55E`, `#48BB78`, `#38A169`, `#2F855A` | Media |
| Verde de producción | `#49AA19`, `#059624`, `#388114` | Media |
| Verde claro | `#ECFDF5`, `#F0FDF4`, `#E6FFED`, `#D1FAE5`, `#6EE7B7`, `#86EFAC` | Baja |
| Naranja | `#F97316`, `#ED8936`, `#F59E0B`, `#C05621` | Media |
| Amarillo | `#EAB308`, `#854D0E`, `#713F12`, `#FEF08A`, `#FEFCE8`, `#FFF8E1`, `#FFF4E6` | Alta |
| Neutro de texto | `#38393A`, `#38393B`, `#4A5568`, `#696969` | Baja |
| Neutro de borde | `#E2E8F0`, `#E2E2E2`, `#D8D8D8`, `#CBD5E0`, `#B6BECA` | Baja |
| Neutro oscuro | `#050505`, `#0C0C0C`, `#0F0F0F`, `#1D1D1D`, `#4D545F`, `#5C5C5C`, `#65676B` | Media |

---

## 13. Hallazgos de contraste para `P4-08`

Pares que **no** cumplen AA y deben corregirse reutilizando tonos existentes:

| Par | Ratio | Corrección propuesta |
|---|---:|---|
| `#49AA19` sobre `#ECFDF5` | 2,83 | Texto → `#047857` (5,21) |
| `#49AA19` sobre blanco | 2,98 | Texto → `#388114` (4,86) |
| `#1EE43F` sobre blanco (uso reportado en auditoría) | 1,72 | Eliminar el valor o confinarlo a gráficos |
| Blanco sobre `#EAB308` | 1,92 | Texto oscuro sobre amarillo |
| Blanco sobre `#10B981` | 2,54 | Texto → `#047857` o fondo más oscuro |
| `#8B5CF6` sobre blanco | 4,23 | Solo borde/gráfico, no texto |
| `#EF4444` sobre blanco | 3,76 | Texto → `#C53030` |
| `#F56565` sobre blanco | 3,03 | Texto → `#C53030` |
| `#3277D6` sobre blanco | 4,43 | Verificar uso; si es texto → `#1668DC` |

> `#1EE43F` no aparece en el inventario de CSS actual. Se reportó en la auditoría inicial; debe confirmarse si vive en JSX o en un token dinámico antes de `P4-08`.

---

## 14. Criterios de aceptación de `P1-01`

- [x] Los 85 valores únicos están identificados con ocurrencias y archivos.
- [x] Los 74 valores que sobreviven tienen token de paleta propuesto.
- [x] Los 11 valores huérfanos están separados y marcados para eliminación.
- [x] Cada valor con variable actual está mapeado a su variable y tema.
- [x] Los pares de contraste problemáticos están documentados.
- [x] La deuda de alias está explícita y fuera del alcance de F1.
- [x] No se modificó ningún archivo CSS ni de producción.
