# Desvíos del split de `changelog.css` — 2026-11-10

| Campo | Valor |
|---|---|
| Fecha | 2026-11-10 |
| Rama | `feat/spec-001-design-hardening` |
| Commit de referencia | `735c8a6` — `spec-001(A-01/P1-09): plan en la raiz y tablero actualizado` |
| Commit previo al split | `6b8e447` — `feat: agregar Resumen Global de versiones en Changelog` |
| Spec | [`../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Plan | [`../../plan.md`](../../plan.md) — tarea `P1-08.3` |
| Tarea | `P1-08.3` (origen `P1-08.1`, split ejecutado en `0560aa9`) |

> Este informe cierra `P1-08.3`: describe los cuatro desvíos conocidos del split, su impacto real en la cascada y el método reproducible con el que se verificaron. No modifica CSS.

---

## 1. Resumen

El `changelog.css` original (`6b8e447`) contenía **209 bloques**. El split repartió **208** en seis archivos y dejó **1** fuera (`.header-view-toggle`, en `view-toggle.css`). `P1-09.4` añadió después **10** reglas de categoría en `modal-entries.css`, por lo que hoy el conjunto suma **218 + 1 = 219** bloques.

| Desvío | Impacto en cascada |
|---|---|
| `.header-view-toggle` fuera de los 6 archivos | **Sin conflicto**: ninguna otra regla apunta a esa clase; cambia la posición de carga (33 en vez de 35), no el resultado |
| Reordenación de `.changelog-empty` y `.changelog-entry-autor-badge` | **Sin conflicto**: apuntan a elementos distintos, mutuamente excluyentes en el render, y no comparten selector compuesto |
| Recuento 209 = 208 + 1 | **Documental**: el criterio «208 bloques» de `P1-08.1` cuenta solo los 6 archivos |
| «Round-trip exacto» | **Criterio impreciso**: se conservan todos los bloques y declaraciones, pero no el orden byte a byte |

**Conclusión: no hay conflicto de cascada.**

---

## 2. Bloques por archivo

Conteo con el script de la sección 4, sobre el árbol de `735c8a6`:

| Archivo | Bloques antes de `P1-09.4` | Bloques hoy | Import en `main.css` | Orden de import |
|---|---:|---:|---|---:|
| `src/styles/components/changelog/timeline.css` | 16 | 16 | Sí | 35 |
| `src/styles/components/changelog/card.css` | 60 | 60 | Sí | 36 |
| `src/styles/components/changelog/modal-entries.css` | 45 | 55 | Sí | 37 |
| `src/styles/components/changelog/date-editor.css` | 23 | 23 | Sí | 38 |
| `src/styles/components/modals/export-modal.css` | 17 | 17 | Sí | 39 |
| `src/styles/components/modals/deployment-info.css` | 47 | 47 | Sí | 40 |
| **Subtotal 6 archivos del split** | **208** | **218** | — | — |
| `src/styles/components/view-toggle.css` (solo el bloque migrado) | 1 | 1 (de 7 en el archivo) | Sí | 33 |
| **Total** | **209** | **219** | — | — |

La diferencia de +10 en `modal-entries.css` corresponde a `P1-09.4`: cinco bloques `.changelog-modal-tab--{key}.active` y cinco `.changelog-modal-tab--{key} .tab-badge`, uno por categoría.

> `P1-08.1` y `P1-09.4` comparten el commit `0560aa9`, así que el estado «antes de `P1-09.4`» no existe como commit consultable. La columna se reconstruye restando esas 10 reglas, que son la única diferencia con `6b8e447` aparte del bloque migrado a `view-toggle.css` (sección 4.2).

---

## 3. Los cuatro desvíos

### 3.1 `.header-view-toggle` quedó en `view-toggle.css`

- Ubicación actual: `src/styles/components/view-toggle.css:49`, dentro de un bloque de 7 reglas.
- Import: `src/styles/main.css:33` (`/* === OTROS === */`), antes del grupo de changelog (líneas 35–40).
- En `6b8e447` era la posición **76 de 209** dentro de `changelog.css`, que se importaba en la línea 35 del antiguo `main.css`. Es decir, ahora se carga **antes** que entonces.

Impacto: nulo. `.header-view-toggle` es una clase de un solo elemento (`Header.jsx:124`), sin reglas competidoras ni selectores compuestos que la mencionen. Al no existir otra declaración para esa clase, el orden de carga no altera el resultado.

### 3.2 Reordenación de `.changelog-empty` y `.changelog-entry-autor-badge`

| Momento | `.changelog-empty` | `.changelog-entry-autor-badge` |
|---|---|---|
| `6b8e447` | Posición 73 de 209 | Posición 54 de 209 → **antes** |
| Hoy | 14.ª de 16 en `timeline.css` (import 35) | 1.ª de 55 en `modal-entries.css` (import 37) → **después** |

El orden relativo se invirtió. Es seguro por cuatro razones:

1. **Elementos distintos**: `.changelog-empty` es el contenedor del estado vacío (`ChangelogView.jsx:139`); `.changelog-entry-autor-badge` es un `<span>` dentro de una entrada (`ChangelogCard.jsx:231`). Ningún elemento lleva ambas clases.
2. **Render mutuamente excluyente**: `ChangelogView` pinta el estado vacío cuando `displayVersions.length === 0` y, en caso contrario, el timeline con tarjetas (`ChangelogView.jsx:137-146`). Nunca coexisten.
3. **Sin selector compuesto**: ninguna regla combina ambas clases ni depende de su posición; ambas tienen especificidad `(0,1,0)`.
4. **Declaraciones compartidas resueltas por elemento**: coinciden en `color` y `padding`, pero cada propiedad se aplica al elemento que casa con su propio selector; al no haber solapamiento de sujeto, el orden es irrelevante.

Conclusión explícita: **sin conflicto de cascada**.

### 3.3 Recuento: 209 = 208 + 1

`P1-08.1` registró «208 bloques», cifra correcta para los seis archivos del split, pero no para el total del original. La contabilidad completa es:

```
209 (changelog.css en 6b8e447)
= 208 (6 archivos del split)
+   1 (.header-view-toggle en view-toggle.css)
```

Hoy el subtotal es 218 por las 10 reglas de `P1-09.4`; el total equivalente sería 219.

### 3.4 El criterio «round-trip exacto» es impreciso

La comparación regla a regla entre `6b8e447:src/styles/components/changelog.css` y los seis archivos actuales da:

- **Solo en el original**: `.header-view-toggle` (1).
- **Solo en el split**: las 10 reglas de categoría de `P1-09.4`.
- **Bloques con contenido distinto**: ninguno.

Por tanto se conservan todos los bloques y todas las declaraciones, pero **no** hay garantía de orden byte a byte ni de orden relativo entre archivos. El criterio correcto para las tareas de cierre es «sin pérdida de bloques y sin conflicto de cascada», no «round-trip exacto».

---

## 4. Evidencia reproducible

### 4.1 Conteo de bloques

```bash
node -e "const fs=require('fs');const files=['src/styles/components/changelog/timeline.css','src/styles/components/changelog/card.css','src/styles/components/changelog/modal-entries.css','src/styles/components/changelog/date-editor.css','src/styles/components/modals/export-modal.css','src/styles/components/modals/deployment-info.css','src/styles/components/view-toggle.css'];function rules(css){const c=css.replace(/\/\*[\s\S]*?\*\//g,'');const out=[];const st=[];let buf='';for(let i=0;i<c.length;i++){const ch=c[i];if(ch==='{'){st.push(buf);buf='';continue;}if(ch==='}'){const h=st.pop();const t=(h||'').trim();if(t&&!t.startsWith('@'))out.push(t);buf='';continue;}buf+=ch;}return out;}for(const f of files){console.log(f+'\t'+rules(fs.readFileSync(f,'utf8')).length);}"
```

Salida:

```
src/styles/components/changelog/timeline.css	16
src/styles/components/changelog/card.css	60
src/styles/components/changelog/modal-entries.css	55
src/styles/components/changelog/date-editor.css	23
src/styles/components/modals/export-modal.css	17
src/styles/components/modals/deployment-info.css	47
src/styles/components/view-toggle.css	7
```

### 4.2 Comparación contra el original

```bash
cmd /c "git show 6b8e447:src/styles/components/changelog.css > %TEMP%\changelog-original.css"
```

Con un script de extracción de cabeceras de bloque idéntico al anterior sobre `%TEMP%\changelog-original.css` frente a los seis archivos del split:

```
original total: 209    split total: 218

Solo en split (10):
.changelog-modal-tab--mejoras.active
.changelog-modal-tab--mejoras .tab-badge
.changelog-modal-tab--salidas.active
.changelog-modal-tab--salidas .tab-badge
.changelog-modal-tab--cambiosCaliente.active
.changelog-modal-tab--cambiosCaliente .tab-badge
.changelog-modal-tab--observaciones.active
.changelog-modal-tab--observaciones .tab-badge
.changelog-modal-tab--cambiosCDU.active
.changelog-modal-tab--cambiosCDU .tab-badge

Solo en original (1):
.header-view-toggle

Conteo distinto:
(ninguno)
```

> Nota operativa: en PowerShell, `git show ... > archivo` escribe UTF-16 y falsea el conteo (209 → 67328 bytes). Hay que usar `cmd /c` para obtener UTF-8, como en el comando de arriba.

---

## 5. Riesgos residuales

- **Orden no garantizado**: futuras tareas no deben asumir equivalencia byte a byte con `6b8e447`. La referencia válida es «mismos bloques» (sección 4.2).
- **Base de conteo**: tras `P1-09.4` el subtotal es 218, no 208. Cualquier verificación de duplicados (`P1-08.2`) debe correr sobre el árbol actual.
- **`view-toggle.css` no es un archivo del split**: si una tarea futura limpia «archivos del split», `.header-view-toggle` está consumido por `Header.jsx:124` y no debe eliminarse.
- **Verificación visual pendiente**: `P1-08.4` sigue bloqueada por `P0-04`. Este informe es análisis estático de cascada; no sustituye el diff visual.
