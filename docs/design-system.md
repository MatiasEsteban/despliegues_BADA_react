# Sistema de diseño — tokens y escalas

| Campo | Valor |
|---|---|
| Estado | Vivo — Fase 1 completada (`P1-02`, `P1-03`, `P1-04`) |
| Última actualización | 2026-11-09 |
| Spec | [`SPEC-001`](../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Plan | [`plan.md`](../plan.md) |
| Fuente de verdad | `despliegues-bada-react/src/styles/base/variables.css` |
| Inventario de color | [`design-system/color-inventory.md`](design-system/color-inventory.md) |

---

## 1. Principios

1. **Paleta congelada.** Ningún token introduce un color nuevo.
2. **Una sola fuente de verdad.** `variables.css` es el único archivo con hex.
3. **Cuatro capas.** Paleta → tema → semántica → escalas.
4. **Sin valores mágicos.** Los componentes consumen tokens, no literales.
5. **Los tokens no cambian el render hasta que se consumen.** Añadir una declaración sin consumidores es seguro; reemplazar un consumidor exige verificación visual.

---

## 2. Capa 1 — Paleta cruda

- 76 tokens `--palette-*`, 76 valores únicos: 74 corresponden a hex de CSS activos y 2 son la excepción aprobada el 2026-11-10 (`--palette-sky-400: #0EA5E9`, `--palette-pink-500: #EC4899`), valores ya presentes en `BadaGraph.jsx`; no son hues nuevos.
- Independiente del tema: el mismo token vale lo mismo en claro y oscuro.
- Los 11 hex de archivos huérfanos no se tokenizaron y desaparecen con esos archivos.

Documentación completa, ocurrencias, contraste y deuda de alias: [`design-system/color-inventory.md`](design-system/color-inventory.md).

---

## 3. Capa 2 — Tokens de tema

Tokens preexistentes, conservados sin cambios:

| Token | Claro | Oscuro |
|---|---|---|
| `--bg-primary` | `#FDFDFD` | `#050505` |
| `--bg-secondary` | `#F7FAFC` | `#0F0F0F` |
| `--text-primary` | `#38393A` | `#E2E8F0` |
| `--text-secondary` | `#38393B` | `#E8EDF3` |
| `--border-color` | `#E2E8F0` | `#65676B` |
| `--input-border` | `#CBD5E0` | `#5C5C5C` |
| `--accent-color` | `#B6BECA` | `#0C0C0C` |
| `--accent-hover` | `#696969` | `#4D545F` |
| `--shadow` | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.3)` |

Y la familia de estados `--estado-*`, que sigue siendo la fuente de verdad de los estados de negocio.

---

## 4. Capa 3 — Tokens semánticos

35 tokens. Se declaran una sola vez en `:root` porque referencian tokens que ya cambian con el tema.

### Acción y enlaces

| Token | Referencia |
|---|---|
| `--color-action-primary` | `--palette-blue-600` |
| `--color-action-primary-hover` | `--palette-blue-620` |
| `--color-action-primary-strong` | `--palette-blue-700` |
| `--color-link` | `--palette-blue-800` |

### Foco

| Token | Referencia |
|---|---|
| `--color-focus-ring` | `--accent-hover` |
| `--focus-ring-width` | `2px` |

### Feedback

| Token | Referencia |
|---|---|
| `--color-danger-border` | `--palette-red-400` |
| `--color-danger-icon` | `--palette-red-500` |
| `--color-danger-text` | `--palette-red-700` |
| `--color-success-icon` | `--palette-green-500` |
| `--color-success-text` | `--palette-green-700` |
| `--color-success-strong` | `--palette-green-750` |
| `--color-warning-icon` | `--palette-amber-500` |
| `--color-warning-border` | `--palette-yellow-500` |

### Dominio

| Token | Referencia |
|---|---|
| `--color-prod` | `--palette-prod-500` |
| `--color-accent-violet` | `--palette-violet-500` |

### Superficies, texto y bordes

| Token | Referencia |
|---|---|
| `--surface-canvas` | `--bg-primary` |
| `--surface-sunken` | `--bg-secondary` |
| `--surface-raised` | `--bg-primary` |
| `--text-strong` | `--text-primary` |
| `--text-muted` | `--text-secondary` |
| `--border-default` | `--border-color` |
| `--border-input` | `--input-border` |

### Estados (alias de migración)

`--state-dev-*`, `--state-pending-*`, `--state-certified-*` y `--state-prod-*` apuntan a `--estado-*`.

Son un **alias temporal de nomenclatura**: en `P1-05` se migran los consumidores y `--state-*` pasa a ser canónico. Hasta entonces, la fuente de verdad es `--estado-*`.

---

## 5. Capa 4 — Escalas

### Tipografía

| Token | Valor | Uso previsto |
|---|---|---|
| `--font-family-base` | Stack del sistema de `reset.css` | Toda la aplicación |
| `--font-size-2xs` | `0.65rem` | Metadatos mínimos |
| `--font-size-xs` | `0.75rem` | Badges |
| `--font-size-sm` | `0.8rem` | Texto auxiliar |
| `--font-size-base` | `0.875rem` | Cuerpo estándar |
| `--font-size-md` | `0.95rem` | Cuerpo destacado |
| `--font-size-lg` | `1rem` | Cuerpo grande |
| `--font-size-xl` | `1.25rem` | Títulos de modal |
| `--font-size-2xl` | `1.5rem` | Título de versión |
| `--font-size-3xl` | `2rem` | Título de detalle |

**Desviación respecto a la spec:** la tabla original no incluía `0.65rem` ni `1rem`, ambos con uso real (5 y 15 ocurrencias). Se añaden como pasos propios para evitar remapeos masivos y cambios visuales innecesarios. El resto de nombres se conserva.

### Espaciado

| Token | Valor |
|---|---|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |
| `--space-6` | `2rem` |
| `--space-7` | `3rem` |
| `--space-8` | `4rem` |

### Radios

| Token | Valor |
|---|---|
| `--radius-2xs` | `2px` |
| `--radius-xs` | `4px` |
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `20px` |
| `--radius-pill` | `9999px` |
| `--radius-full` | `50%` |

**Desviación:** se añaden `2px` y `20px` porque existen en el CSS. Los valores `3px`, `5px`, `9px` y `10px` quedan como intermedios a mapear en `P1-05`.

### Sombras

| Token | Valor | Ocurrencias del valor |
|---|---|---:|
| `--shadow-sm` | `0 1px 3px var(--shadow)` | 3 |
| `--shadow-md` | `0 4px 6px var(--shadow)` | 11 |
| `--shadow-lg` | `0 10px 25px var(--shadow)` | 1 |

### z-index

| Token | Valor | Ocurrencias del valor |
|---|---|---:|
| `--z-base` | `1` | 2 |
| `--z-raised` | `10` | 4 |
| `--z-dropdown` | `200` | 1 |
| `--z-floating` | `999` | 1 |
| `--z-modal` | `1000` | 1 |
| `--z-toast` | `10000` | 1 |

Los seis valores cubren exactamente los z-index en uso.

---

## 6. Estado de adopción

> `P1-05` reemplazó 144 hex por `var(--palette-*)` en 14 hojas. Verificación de ida y vuelta: al expandir cada token a su valor, el archivo es idéntico al de `HEAD`. El CSS compilado crece de 84,20 kB a 88,92 kB porque `var(--palette-…)` es más largo que el hex; es costo de mantenibilidad, no de ejecución.
>
> `P1-07` y `P1-08` dejaron **32 hojas**, con 30 imports desde `main.css`. El único archivo no alcanzable es `detail-header.css`. `changelog.css` (1.526 líneas) se dividió en `changelog/timeline.css`, `changelog/card.css`, `changelog/modal-entries.css`, `changelog/date-editor.css`, `modals/export-modal.css` y `modals/deployment-info.css`, sin selectores duplicados.

| Capa | Tokens | Consumidores externos |
|---|---:|---:|
| Paleta | 76 | 144 usos directos + 14 referencias desde la capa semántica |
| Semántica | 35 | **0** |
| Escalas | 35 | **1** (`--radius-md`) |
| Tema | 23 | Los consumidores preexistentes |

### Único delta visual de la fase

`modal-history.css:38` usa `var(--radius-md)`, que hasta ahora **no estaba definido**. Al definirlo como `8px`, el contenedor de `CduHistoryModal` pasa de borde recto a radio de 8 px.

Es una corrección de defecto, no una regresión, pero **debe verificarse contra las capturas baseline cuando `P0-04` se complete**. Queda registrado como delta intencional.

---

## 7. Reglas de uso

1. Un componente **no** usa `#hex`. Usa un token semántico o de escala.
2. Si un token semántico no cubre el caso, se añade a la capa semántica referenciando paleta; nunca se escribe el hex en el componente.
3. Los estados de negocio usan `--state-*` (o `--estado-*` hasta `P1-05`), no colores sueltos.
4. El foco usa `--color-focus-ring` y `--focus-ring-width`.
5. Prohibido `style={{}}` para cualquier valor que tenga token.
6. Los gráficos usan `<progress>`/SVG con atributos, no estilos inline.

---

## 8. Deuda conocida

| Deuda | Resolución |
|---|---|
| 11 grupos de colores casi idénticos | Spec posterior con diff visual aprobado |
| `--state-*` como alias temporal | `P1-05` migra consumidores |
| 3 variables indefinidas en `modal-history.css` (`--bg-card`, `--primary-color`, `--text-tertiary`) | `P1-06`, con verificación visual |
| 30 tamaños de fuente en uso frente a 9 de la escala | `P1-05` mapea intermedios con verificación visual |
| 14 radios en uso frente a 8 de la escala | `P1-05` mapea intermedios con verificación visual |
| 31 variantes de `box-shadow` | `P1-05`; requiere revisión caso a caso |
| `detail-header.css` sin importar | `P1-06`, bloqueado por `P0-04` |

---

## 9. Literales pendientes de `P5-04.7–9`

`F2` solo sustituyó literales cuando el token existía con el mismo valor exacto (`8px → var(--radius-md)` en `.chart-card`, `12px → var(--space-3)` en `.header-title`); en la misma pasada se quitó la clase redundante `icon-small` del spinner del header. El resto se deja intacto para no introducir deltas visuales sin baseline (`P0-04`).

Medición del 2026-11-10 sobre `src/styles/**/*.css` excluyendo `variables.css` (declaraciones con literal numérico):

| Grupo | Ejemplos en uso | Declaraciones |
|---|---|---:|
| Radios (`P5-04.7`) | `border-radius: 6px` (49), `8px` (40), `12px` (17) | 92 |
| Espaciado (`P5-04.8`) | `gap: 6px` (10), `padding: 1px 7px` (5), `margin-bottom: 2rem` (15) | 344 |
| Sombras (`P5-04.8`) | `0 4px 6px var(--shadow)` (9), `0 2px 4px var(--shadow)` (4) | 43 |
| `z-index` (`P5-04.8`) | `10` (4), `1000` (1) | 8 |
| **Total** | — | **487** |

Quedan fuera de esta tabla los 147 `font-size` con literal, que pertenecen a `P5-04.2–4` (escala tipográfica). `P5-04.9` cierra el grupo cuando el recuento de las cuatro filas sea 0.

---

## 10. Foco y diálogos

R-A11Y-01 / R-CODE-01. Todo modal del proyecto pasa por `src/components/ui/Modal.jsx`; los modales de negocio (`src/components/modals/*`) solo lo configuran con props y no gestionan foco por su cuenta.

### 10.1 API de `useFocusTrap`

```js
import { useFocusTrap } from '../../hooks/useFocusTrap';

const modalRef = useRef(null);

useFocusTrap({
  isActive: isOpen,       // activa foco, ciclo de Tab y bloqueo de scroll
  onClose,                // se invoca al pulsar Escape (una vez)
  containerRef: modalRef, // elemento que recibe el foco y contiene el ciclo
});
```

| Comportamiento | Implementación |
|---|---|
| Foco inicial | primer elemento de `a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])`; si no hay, el contenedor (debe tener `tabIndex={-1}`) |
| Tab / Shift+Tab | primer y último enfocable recalculados en cada `keydown`; en los bordes se cicla con `preventDefault` |
| Sin enfocables | el foco se mantiene en el contenedor y se cancela el Tab |
| Escape | `onClose` a través de un ref (identidad estable) y un único listener |
| Restauración | guarda `document.activeElement` al activarse y lo enfoca en el `cleanup` si sigue en el DOM |
| Scroll | `document.body.style.overflow = 'hidden'` y restaura el valor previo en el `cleanup` |

El `overflow` es el único `style` que escribe el hook: R-DS-03 lo admite como manipulación directa del DOM para bloquear el scroll del documento, no como estilo de componente. El hook no aplica estilos a elementos del modal.

### 10.2 Atributos que impone `Modal`

| Elemento | Atributo |
|---|---|
| `.modal` | `role="dialog"`, `aria-modal="true"`, `tabIndex={-1}` |
| `<h2 class="modal-title">` | `id` generado con `useId()` |
| `.modal` | `aria-labelledby` → id del título; si `title` es falsy, `aria-label="Diálogo"` |
| `.modal-close-btn` | `aria-label="Cerrar"`; el `×` va en `<span aria-hidden="true">` |

El overlay no lleva rol: el diálogo es `.modal`. Un modal sin `title` conserva el `<h2>` vacío para no alterar el layout del header, pero su nombre accesible es `Diálogo`. Los modales reales siempre pasan título.
