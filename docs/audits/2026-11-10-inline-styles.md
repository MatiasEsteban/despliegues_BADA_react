# Inventario de estilos inline y estrategia de migración — 2026-11-10

| Campo | Valor |
|---|---|
| Fecha | 2026-11-10 |
| Rama | `feat/spec-001-design-hardening` |
| Commit de referencia | `a7b0cc1` — `spec-001(P1-10.4/P1-10.5): eliminar selectores muertos en modales y changelog` |
| Spec | [`../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md`](../../specs/SPEC-001-endurecimiento-diseno-accesibilidad.md) |
| Plan | [`../../plan.md`](../../plan.md) — F2, requisito R-DS-03 |
| Tablero | [`../../specs/tasks.md`](../../specs/tasks.md) — §6.1 (`P2-01.1`–`P2-01.4`) |
| Script | `scripts/audit-inline-styles.mjs` |
| Comando | `node scripts/audit-inline-styles.mjs` |

> Este informe **no modifica JSX ni CSS**. Fija el inventario, la clasificación, la clase destino y la estrategia para valores dinámicos. La migración empieza en `P2-02` y termina en `P2-06`.

---

## 1. Resumen

| Métrica | Valor |
|---|---:|
| Usos de `style={{...}}` | **78** |
| Archivos afectados | **22** |
| Tipos distintos | 4 |
| Usos que reutilizan una regla existente | 12 |
| Usos que exigen CSS nuevo | 66 |
| Selectores CSS nuevos | 68 (61 netos + 7 trasladados desde un `<style>` embebido) |
| Usos de `element.style` | 0 (fuera del fallback de portapapeles, `P2-06`) |

### 1.1 Por destino

| Fase / tarea | Usos |
|---|---:|
| `P2-02` UI base (`Input`, `LoadingOverlay`, `Modal`) | 7 |
| `P2-03` Vistas, layout y raíz | 27 |
| `P2-04` Modales (estilos estáticos) | 29 |
| `P2-05` Geometría dinámica y caso permitido | 15 |
| **Total** | **78** |

> El desglose por archivo de `specs/tasks.md` es 7 (§6.2) + 27 (§6.3) + 36 (§6.4) + 8 (§6.5). La diferencia 36/8 → 29/15 se debe a que `P2-05.5` absorbe **7 usos de `ProgressModal`** (barra y tartas) que por archivo pertenecen a modales. No hay discrepancia real: 36 = 29 + 7 y 8 = 15 − 7.

### 1.2 Por tipo

| Tipo | Usos | % | Criterio |
|---|---:|---:|---|
| `ESTÁTICO` | 64 | 82,1 % | Valores fijos que pasan a una clase sin cálculo. |
| `GEOMETRÍA` | 11 | 14,1 % | Medidas o proporciones calculadas en runtime (`${x}%`, `finalProgress`, layout condicional por `expandedChart`). |
| `COLOR` | 3 | 3,8 % | Color elegido en runtime desde un mapa (`colors[key]`, `statusColors[status]`, `badaColors[ver]`). |
| `VAR-CSS` | 0 | 0 % | Inyección de custom properties. Ya no queda ninguna tras `P1-09.4`. |
| **Total** | **78** | **100 %** | |

### 1.3 Por archivo

| Archivo | Usos | Tarea(s) destino |
|---|---:|---|
| `src/components/modals/ProgressModal.jsx` | 24 | `P2-04.5` (17) · `P2-05.5` (7) |
| `src/components/modals/EvolutionModal.jsx` | 7 | `P2-04.4` |
| `src/components/layout/Header.jsx` | 6 | `P2-03.7` |
| `src/components/views/ChangelogCard.jsx` | 6 | `P2-03.1` |
| `src/components/layout/WorkspaceSwitcher.jsx` | 5 | `P2-03.8` |
| `src/components/ui/LoadingOverlay.jsx` | 4 | `P2-02.2` |
| `src/components/modals/ChangelogEntriesModal.jsx` | 3 | `P2-04.1` |
| `src/components/views/detail/CduRow.jsx` | 3 | `P2-05.2` |
| `src/components/Login.jsx` | 2 | `P2-03.10` |
| `src/components/ui/Input.jsx` | 2 | `P2-02.1` |
| `src/components/views/ChangelogView.jsx` | 2 | `P2-03.2` |
| `src/components/views/detail/BadaGraph.jsx` | 2 | `P2-05.1` |
| `src/components/views/detail/DetailHeader.jsx` | 2 | `P2-05.4` |
| `src/components/views/VersionRow.jsx` | 2 | `P2-03.5` |
| `src/components/Dashboard.jsx` | 1 | `P2-03.9` |
| `src/components/modals/CommentsModal.jsx` | 1 | `P2-04.2` |
| `src/components/modals/DeploymentReportModal.jsx` | 1 | `P2-04.3` |
| `src/components/ui/Modal.jsx` | 1 | `P2-02.3` |
| `src/components/views/DateQuickEditor.jsx` | 1 | `P2-03.3` |
| `src/components/views/detail/StepsEditor.jsx` | 1 | `P2-05.3` |
| `src/components/views/DetailView.jsx` | 1 | `P2-03.6` |
| `src/components/views/VersionList.jsx` | 1 | `P2-03.4` |
| **Total** | **78** | |

El script no hardcodea el número: hoy informa 78 y, tras la migración, debe informar 0 sin cambios de código.

---

## 2. Inventario completo (78 usos)

`<code>` se usa en las celdas cuyo fragmento contiene backticks para no romper la tabla.

| # | Archivo:línea | Fragmento | Tipo | Destino | Clase CSS destino | Nota |
|---:|---|---|---|---|---|---|
| 1 | `src/components/Dashboard.jsx:46` | `{{ display: 'block', marginBottom: '1rem' }}` | ESTÁTICO | P2-03.9 | .login-error | Existente: añadir display/margin |
| 2 | `src/components/layout/Header.jsx:93` | `{{ display: 'none' }}` | ESTÁTICO | P2-03.7 | .header-file-input | Input file oculto; alternativa: atributo hidden |
| 3 | `src/components/layout/Header.jsx:104` | `{{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}` | ESTÁTICO | P2-03.7 | .header-title-block h1 | Existente: ampliar layout |
| 4 | `src/components/layout/Header.jsx:107` | `{{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500', disp…` | ESTÁTICO | P2-03.7 | .header-sync-status + --saving | Estado guardando |
| 5 | `src/components/layout/Header.jsx:108` | `{{ width: '12px', height: '12px' }}` | ESTÁTICO | P2-03.7 | .icon-xs | 12px; escala nueva |
| 6 | `src/components/layout/Header.jsx:112` | `{{ fontSize: '0.75rem', color: '#10B981', fontWeight: '500', display: 'flex', a…` | ESTÁTICO | P2-03.7 | .header-sync-status--ok | Hex #10B981: doble incumplimiento R-DS-01 + R-DS-03 |
| 7 | `src/components/layout/Header.jsx:113` | `{{ width: '16px', height: '16px' }}` | ESTÁTICO | P2-03.7 | .icon-small | Existente (16px) |
| 8 | `src/components/layout/WorkspaceSwitcher.jsx:97` | `{{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}` | ESTÁTICO | P2-03.8 | .ws-trigger-chevron--open | Modificador de estado (rotación) |
| 9 | `src/components/layout/WorkspaceSwitcher.jsx:115` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.8 | .icon-md | 14px |
| 10 | `src/components/layout/WorkspaceSwitcher.jsx:129` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-03.8 | .icon-sm | 13px |
| 11 | `src/components/layout/WorkspaceSwitcher.jsx:161` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-03.8 | .icon-sm |  |
| 12 | `src/components/layout/WorkspaceSwitcher.jsx:169` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.8 | .icon-md |  |
| 13 | `src/components/Login.jsx:33` | `{{ display: 'flex', alignItems: 'center', gap: '10px' }}` | ESTÁTICO | P2-03.10 | .modal-login .modal-title | Existente: ampliar flex/gap |
| 14 | `src/components/Login.jsx:64` | `{{ display: 'block' }}` | ESTÁTICO | P2-03.10 | .login-error | Existente |
| 15 | `src/components/modals/ChangelogEntriesModal.jsx:127` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-04.1 | .icon-sm |  |
| 16 | `src/components/modals/ChangelogEntriesModal.jsx:138` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-04.1 | .icon-sm |  |
| 17 | `src/components/modals/ChangelogEntriesModal.jsx:187` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-04.1 | .icon-md |  |
| 18 | `src/components/modals/CommentsModal.jsx:85` | `{{ padding: 0 }}` | ESTÁTICO | P2-04.2 | .modal-comentarios-categorized-content | Existente: padding 0 |
| 19 | `src/components/modals/DeploymentReportModal.jsx:74` | `{{ padding: '2rem', textAlign: 'center', width: '100%', color: 'var(--text-seco…` | ESTÁTICO | P2-04.3 | .deployment-report-empty | Estado vacío del reporte |
| 20 | `src/components/modals/EvolutionModal.jsx:45` | `{{ display: 'flex', flexDirection: 'column', gap: '1rem' }}` | ESTÁTICO | P2-04.4 | .evolution-form | Clase en JSX sin regla CSS: crear regla |
| 21 | `src/components/modals/EvolutionModal.jsx:46` | `{{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}` | ESTÁTICO | P2-04.4 | .evolution-warning | Clase en JSX sin regla: crear |
| 22 | `src/components/modals/EvolutionModal.jsx:50` | `{{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}` | ESTÁTICO | P2-04.4 | .form-row--two-cols | Grid 1fr 1fr |
| 23 | `src/components/modals/EvolutionModal.jsx:64` | `{{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}` | ESTÁTICO | P2-04.4 | .evolution-form label | Selector contextual, sin clase nueva |
| 24 | `src/components/modals/EvolutionModal.jsx:68` | `{{ width: '100%', padding: '0.5rem' }}` | ESTÁTICO | P2-04.4 | .input-field | Clase en JSX sin regla: width/padding |
| 25 | `src/components/modals/EvolutionModal.jsx:88` | `{{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}` | ESTÁTICO | P2-04.4 | .evolution-form label |  |
| 26 | `src/components/modals/EvolutionModal.jsx:96` | `{{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}` | ESTÁTICO | P2-04.4 | .evolution-form label |  |
| 27 | `src/components/modals/ProgressModal.jsx:68` | `{{ backgroundColor: colors[key] }}` | COLOR | P2-05.5 | .legend-color--* (9) | Modificadores por estado/dificultad/V1-V2 |
| 28 | `src/components/modals/ProgressModal.jsx:86` | `{{ display: 'grid', gap: '2rem' }}` | ESTÁTICO | P2-04.5 | .modal-progress-content | Existente: ampliar grid/gap |
| 29 | `src/components/modals/ProgressModal.jsx:97` | <code>{{ width: `${finalProgress}%` }}</code> | GEOMETRÍA | P2-05.5 | .progress-native | `<progress value max>`; aspecto con `::-webkit-progress-value` |
| 30 | `src/components/modals/ProgressModal.jsx:106` | `{{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'…` | ESTÁTICO | P2-04.5 | .charts-grid | Clase en JSX sin regla: crear |
| 31 | `src/components/modals/ProgressModal.jsx:112` | `{{ cursor: 'pointer', gridColumn: expandedChart === 'status' ? '1 / -1' : 'auto…` | GEOMETRÍA | P2-04.5 | .chart-card.expanded | `.expanded` ya está en JSX; solo falta la regla |
| 32 | `src/components/modals/ProgressModal.jsx:120` | `{{ display: 'flex', flexDirection: expandedChart === 'status' ? 'row' : 'column…` | GEOMETRÍA | P2-04.5 | .chart-content-wrapper.expanded | Añadir `.expanded` al wrapper |
| 33 | `src/components/modals/ProgressModal.jsx:127` | `{{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}` | ESTÁTICO | P2-04.5 | .pie-chart-container | Clase en JSX sin regla: crear |
| 34 | `src/components/modals/ProgressModal.jsx:133` | `{{ width: expandedChart === 'status' ? '120px' : '80px', height: expandedChart …` | GEOMETRÍA | P2-05.5 | .pie-chart + .chart-card.expanded .pie-chart | Tarta → SVG; tamaño por contexto, sin clase nueva |
| 35 | `src/components/modals/ProgressModal.jsx:146` | `{{ flex: 1, columnCount: 'auto', columnWidth: '300px', columnGap: '2rem', colum…` | ESTÁTICO | P2-04.5 | .chart-details | Clase en JSX sin regla: crear |
| 36 | `src/components/modals/ProgressModal.jsx:161` | `{{ breakInside: 'avoid', marginBottom: '1.5rem' }}` | ESTÁTICO | P2-04.5 | .status-column | Clase en JSX sin regla: crear |
| 37 | `src/components/modals/ProgressModal.jsx:162` | `{{ color: statusColors[status], marginBottom: '0.5rem', fontSize: '1rem', borde…` | COLOR | P2-05.5 | .status-heading--{status} | Color de estado en runtime; 4 modificadores |
| 38 | `src/components/modals/ProgressModal.jsx:170` | `{{ listStyle: 'none', padding: 0, margin: 0 }}` | ESTÁTICO | P2-04.5 | .status-list | Añadir clase al `<ul>`; hoy no tiene |
| 39 | `src/components/modals/ProgressModal.jsx:172` | `{{ fontSize: '0.9rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' …` | ESTÁTICO | P2-04.5 | .status-list li | Selector contextual |
| 40 | `src/components/modals/ProgressModal.jsx:192` | `{{ display: 'flex', alignItems: 'center', gap: '1rem' }}` | ESTÁTICO | P2-04.5 | .pie-chart-container |  |
| 41 | `src/components/modals/ProgressModal.jsx:193` | `{{ width: '80px', height: '80px', borderRadius: '50%', background: difficultyGr…` | GEOMETRÍA | P2-05.5 | .pie-chart | Tarta dificultad → SVG |
| 42 | `src/components/modals/ProgressModal.jsx:208` | `{{ cursor: 'pointer', gridColumn: expandedChart === 'bada' ? '1 / -1' : 'auto',…` | GEOMETRÍA | P2-04.5 | .chart-card.expanded |  |
| 43 | `src/components/modals/ProgressModal.jsx:216` | `{{ display: 'flex', flexDirection: expandedChart === 'bada' ? 'row' : 'column',…` | GEOMETRÍA | P2-04.5 | .chart-content-wrapper.expanded |  |
| 44 | `src/components/modals/ProgressModal.jsx:222` | `{{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}` | ESTÁTICO | P2-04.5 | .pie-chart-container |  |
| 45 | `src/components/modals/ProgressModal.jsx:228` | `{{ width: expandedChart === 'bada' ? '120px' : '80px', height: expandedChart ==…` | GEOMETRÍA | P2-05.5 | .pie-chart + .chart-card.expanded .pie-chart | Tarta BADA → SVG + tamaño por contexto |
| 46 | `src/components/modals/ProgressModal.jsx:241` | `{{ flex: 1, columnCount: 'auto', columnWidth: '300px', columnGap: '2rem', colum…` | ESTÁTICO | P2-04.5 | .chart-details |  |
| 47 | `src/components/modals/ProgressModal.jsx:272` | `{{ breakInside: 'avoid', marginBottom: '1.5rem' }}` | ESTÁTICO | P2-04.5 | .status-column |  |
| 48 | `src/components/modals/ProgressModal.jsx:273` | `{{ color: badaColors[ver], marginBottom: '0.5rem', fontSize: '1rem', borderBott…` | COLOR | P2-05.5 | .status-heading--v1 / --v2 |  |
| 49 | `src/components/modals/ProgressModal.jsx:281` | `{{ listStyle: 'none', padding: 0, margin: 0 }}` | ESTÁTICO | P2-04.5 | .status-list |  |
| 50 | `src/components/modals/ProgressModal.jsx:283` | `{{ fontSize: '0.9rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' …` | ESTÁTICO | P2-04.5 | .status-list li |  |
| 51 | `src/components/ui/Input.jsx:10` | `{{ position: 'relative', display: 'flex', alignItems: 'center' }}` | ESTÁTICO | P2-02.1 | .input-icon-wrap |  |
| 52 | `src/components/ui/Input.jsx:18` | `{{ position: 'absolute', right: '0.75rem', color: 'var(--text-secondary)', poin…` | ESTÁTICO | P2-02.1 | .input-icon |  |
| 53 | `src/components/ui/LoadingOverlay.jsx:5` | `{{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}` | ESTÁTICO | P2-02.2 | .loading-overlay |  |
| 54 | `src/components/ui/LoadingOverlay.jsx:6` | `{{ maxWidth: '300px', textAlign: 'center' }}` | ESTÁTICO | P2-02.2 | .loading-overlay-card |  |
| 55 | `src/components/ui/LoadingOverlay.jsx:9` | `{{ marginBottom: '1rem', fontWeight: '600' }}` | ESTÁTICO | P2-02.2 | .loading-overlay-message |  |
| 56 | `src/components/ui/LoadingOverlay.jsx:11` | `{{ margin: '0 auto', width: '30px', height: '30px', borderWidth: '4px' }}` | ESTÁTICO | P2-02.2 | .loading-overlay-spinner |  |
| 57 | `src/components/ui/Modal.jsx:42` | `{{ width: showIcon ? 'auto' : '100%' }}` | GEOMETRÍA | P2-02.3 | .modal-message--full | Width condicional → clsx |
| 58 | `src/components/views/ChangelogCard.jsx:135` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.1 | .icon-md |  |
| 59 | `src/components/views/ChangelogCard.jsx:150` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.1 | .icon-md |  |
| 60 | `src/components/views/ChangelogCard.jsx:151` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.1 | .icon-md |  |
| 61 | `src/components/views/ChangelogCard.jsx:169` | `{{ width: '14px', height: '14px' }}` | ESTÁTICO | P2-03.1 | .icon-md |  |
| 62 | `src/components/views/ChangelogCard.jsx:174` | `{{ width: '16px', height: '16px', transform: expanded ? 'rotate(180deg)' : 'rot…` | ESTÁTICO | P2-03.1 | .icon-small + .changelog-chevron-icon--open | Rotación por estado; transition a CSS |
| 63 | `src/components/views/ChangelogCard.jsx:194` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-03.1 | .icon-sm |  |
| 64 | `src/components/views/ChangelogView.jsx:74` | `{{ width: '15px', height: '15px', opacity: 0.5, flexShrink: 0 }}` | ESTÁTICO | P2-03.2 | .changelog-search-icon | 15px + opacity .5 + flex-shrink en una clase contextual |
| 65 | `src/components/views/ChangelogView.jsx:88` | `{{ width: '13px', height: '13px' }}` | ESTÁTICO | P2-03.2 | .icon-sm |  |
| 66 | `src/components/views/DateQuickEditor.jsx:81` | `{{ width: '11px', height: '11px', opacity: 0.6 }}` | ESTÁTICO | P2-03.3 | .date-quick-edit-icon + .icon-xs | Existente; 11px → 12px (+1px). El inline opacity .6 anula el hover .4→.9: al retirarlo se restaura (cambio a validar) |
| 67 | `src/components/views/detail/BadaGraph.jsx:19` | <code>{{ width: `${v1Percent}%` }}</code> | GEOMETRÍA | P2-05.1 | .bada-segment | `SVG rect width={v1Percent}`; atributo permitido |
| 68 | `src/components/views/detail/BadaGraph.jsx:20` | <code>{{ width: `${v2Percent}%` }}</code> | GEOMETRÍA | P2-05.1 | .bada-segment | `SVG rect width={v2Percent}` |
| 69 | `src/components/views/detail/CduRow.jsx:125` | `{{ textAlign: 'center' }}` | ESTÁTICO | P2-05.2 | .cdu-actions-cell |  |
| 70 | `src/components/views/detail/CduRow.jsx:126` | `{{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}` | ESTÁTICO | P2-05.2 | .cdu-actions |  |
| 71 | `src/components/views/detail/CduRow.jsx:131` | `{{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}` | ESTÁTICO | P2-05.2 | .cdu-evolve-btn |  |
| 72 | `src/components/views/detail/DetailHeader.jsx:114` | `{{ position: 'relative' }}` | ESTÁTICO | P2-05.4 | .version-header-btn-wrap |  |
| 73 | `src/components/views/detail/DetailHeader.jsx:118` | `{{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', col…` | ESTÁTICO | P2-05.4 | .comment-badge | Hex #ef4444: R-DS-01; usar --palette-red-500 |
| 74 | `src/components/views/detail/StepsEditor.jsx:47` | `{{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transfo…` | ESTÁTICO | P2-05.3 | .steps-toggle-icon--open | Rotación por estado; transition a CSS |
| 75 | `src/components/views/DetailView.jsx:181` | `{{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}` | ESTÁTICO | P2-03.6 | .empty-table-cell |  |
| 76 | `src/components/views/VersionList.jsx:128` | `{{ margin: '0 10px' }}` | ESTÁTICO | P2-03.4 | .pagination-container span | Existente: añadir margin 0 10px |
| 77 | `src/components/views/VersionRow.jsx:58` | `{{ opacity: 0.7 }}` | ESTÁTICO | P2-03.5 | .version-time |  |
| 78 | `src/components/views/VersionRow.jsx:62` | `{{ opacity: 0.7 }}` | ESTÁTICO | P2-03.5 | .version-time |  |

### 2.1 Reutilización de reglas existentes (12 usos)

| # | Regla existente | Acción |
|---:|---|---|
| 1, 14 | `.login-error` | Añadir `display: block` y `margin-bottom` en el consumidor; no crear clase nueva. |
| 3 | `.header-title-block h1` | Ampliar con `display:flex`, `gap`, `flex-wrap`. |
| 7, 62 | `.icon-small` | Reutilizar; el 62 añade modificador de rotación. |
| 13 | `.modal-login .modal-title` | Ampliar con `display:flex`, `gap`. |
| 18 | `.modal-comentarios-categorized-content` | Añadir `padding: 0` a la regla existente. |
| 28 | `.modal-progress-content` | Ampliar con `display:grid`, `gap`. |
| 66 | `.date-quick-edit-icon` | Añadir tamaño 12px; el modificador `.icon-xs` lo aporta. |
| 67, 68 | `.bada-segment` | Reutilizar; solo cambia el nodo (`div` → `rect`). |
| 76 | `.pagination-container span` | Añadir `margin: 0 10px`. |

### 2.2 Casos no detectados por `style={{`

| Archivo | Línea | Código | Acción |
|---|---:|---|---|
| `src/components/ui/Input.jsx` | 14 | `style={Icon ? { paddingRight: '2.5rem' } : {}}` | **Resuelto en P2-02.1**: `.filter-input--with-icon`. No cuenta en los 78. |
| `src/components/modals/ProgressModal.jsx` | 304–315 | `<style>{...}` con 8 reglas | `P2-04.5` debe moverlo a `modal-progress.css`. Incluye propiedades camelCase inválidas (`borderRadius`, `alignItems`) que hoy no se aplican. |

---

## 3. Casos especiales y decisiones

### 3.1 `ProgressModal.jsx` — 24 usos (31 % de F2)

Es el caso central. Se reparte en dos tareas para no mezclar estático con geometría:

| Bloque | Usos | Destino | Tratamiento |
|---|---:|---|---|
| Layout estático (contenedor, grid, columnas, listas) | 17 | `P2-04.5` | Clases `.modal-progress-content`, `.charts-grid`, `.chart-content-wrapper`, `.pie-chart-container`, `.chart-details`, `.status-column`, `.status-list`; `.chart-card.expanded` como estado. |
| Barra global (`width: ${finalProgress}%`) | 1 | `P2-05.5` | `<progress className="progress-native" value={finalProgress} max={100}>`. |
| Tartas (`conic-gradient` + tamaño condicional) | 6 | `P2-05.5` | SVG con `strokeDasharray`/`strokeDashoffset`; tamaño 80/120 por `.chart-card.expanded .pie-chart`. |
| Colores de leyenda y encabezados | 3 | `P2-05.5` | Modificadores `legend-color--*` y `status-heading--*` derivados de tokens. |
| Bloque `<style>` embebido | — | `P2-04.5` | Trasladar 8 reglas a `modal-progress.css`; corregir `borderRadius`/`alignItems`. |

**Barra: cómo conservar el aspecto actual.** Hoy el relleno es un `<div class="progress-bar-fill">` con `width` inline y transición de 1 s. El sustituto:

```jsx
<progress className={`progress-native ${progressClass}`} value={finalProgress} max={100}>
  {finalProgress}%
</progress>
```

```css
.progress-native {
  appearance: none;
  width: 100%;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
.progress-native::-webkit-progress-bar { background: var(--bg-secondary); }
.progress-native::-webkit-progress-value {
  border-radius: 12px;
  transition: inline-size 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-native.progress-low::-webkit-progress-value { background: var(--palette-orange-500); }
.progress-native.progress-mid::-webkit-progress-value { background: var(--palette-blue-500); }
.progress-native.progress-complete::-webkit-progress-value { background: var(--palette-green-500); }
```

La clase de estado (`progress-low|mid|complete`) ya se calcula en JS y se conserva. Firefox usa `::-moz-progress-bar`; se declara el mismo color. El texto interior es fallback para navegadores sin `<progress>`; se oculta con `color: transparent` o `font-size: 0` si estorba.

**Tartas: cómo conservar el aspecto.** Hoy son `<div>` circulares con `conic-gradient` construido en JS (`statusGradient`, `difficultyGradient`, `badaGradient`). Pasan a un SVG de 42×42 con `strokeDasharray` calculado por segmento:

```jsx
<svg className="pie-chart" viewBox="0 0 42 42" role="img" aria-label={`Distribución por estado: ${...}`}>
  <circle className="pie-ring" cx="21" cy="21" r="15.9" />
  {segments.map((s) => (
    <circle
      key={s.slug}
      className={`pie-segment pie-segment--${s.slug}`}
      cx="21" cy="21" r="15.9"
      strokeDasharray={`${s.percent} ${100 - s.percent}`}
      strokeDashoffset={-s.offset}
    />
  ))}
</svg>
```

Los porcentajes y offsets ya se calculan hoy en `getConicGradient`; se reutiliza el mismo cálculo y se elimina la generación de la cadena CSS. El tamaño 80/120 px no necesita clase nueva: `.chart-card.expanded .pie-chart { width: 120px; height: 120px; }`.

**Colores de leyenda y encabezados.** Los mapas `statusColors`/`difficultyColors`/`badaColors` siguen existiendo solo como fuente de verdad de datos; la representación pasa a clases. Se necesita un mapa `slug` estable (`'En Desarrollo' → desarrollo`, etc.) para no generar nombres de clase desde texto libre:

| Grupo | Modificadores | Tokens |
|---|---|---|
| Estado | `--desarrollo`, `--pendiente`, `--certificado`, `--produccion` | `--palette-blue-500`, `--palette-amber-500`, `--palette-green-500`, `--palette-violet-500` |
| Dificultad | `--baja`, `--media`, `--alta` | `--palette-green-500-alt`, `--palette-yellow-500`, `--palette-red-500` |
| BADA | `--v1`, `--v2` | `--palette-blue-500`, `--palette-orange-500` |

> **Delta de color documentado:** `badaColors` usa `#0ea5e9` y `#ec4899`, que **no existen** en la paleta congelada. ~~Se alinean con `.segment-v1`/`.segment-v2` (`--palette-blue-500`/`--palette-orange-500`) para que `ProgressModal` y `BadaGraph` coincidan.~~ **Propuesta superada:** descartado; el owner aprobó tokenizar los valores existentes como `--palette-sky-400` y `--palette-pink-500`, de modo que `ProgressModal` y `BadaGraph` conservan el tono original sin excepción a la paleta.

### 3.2 `BadaGraph.jsx` — 2 usos

Dos segmentos `div` con `width: ${x}%` alineados a la izquierda (el `display:flex` original no tenía `justify-content`; el SVG reproduce el mismo orden). Pasan a SVG con atributos (permitidos: son atributos, no `style`):

```jsx
<svg className="bada-graph-bar" viewBox="0 0 100 12" preserveAspectRatio="none" role="img" aria-label="...">
  {v1Count > 0 && <rect className="bada-segment segment-v1" x="0" width={v1Percent} height="12" />}
  {v2Count > 0 && <rect className="bada-segment segment-v2" x={v1Percent} width={v2Percent} height="12" />}
</svg>
```

`x`/`width` son atributos de geometría, no estilo inline. Se reutilizan `.bada-segment`, `.segment-v1` y `.segment-v2`. La transición CSS de `.bada-segment` (`width .5s`) se mantiene si Chromium anima la propiedad de geometría; **no verificable sin baseline**, se valida en G2 y, si no anima, se acepta el delta o se documenta.

### 3.3 Iconos con `width`/`height` — 18 usos

`Icons.jsx` implementa cada icono como `(props) => <svg {...props}>`, por lo que **`className` llega al `<svg>`** y ya se usa hoy (`.icon`, `.icon-small`, `.date-quick-edit-icon`). No hace falta tocar `Icons.jsx`.

| Tamaño actual | Usos | Clase |
|---|---:|---|
| 11px | 1 | `.icon-xs` (12px; +1px documentado) |
| 12px | 1 | `.icon-xs` |
| 13px | 6 | `.icon-sm` |
| 14px | 7 | `.icon-md` |
| 15px | 1 | `.changelog-search-icon` (contextual: 15px + opacity .5 + flex-shrink) |
| 16px | 2 | `.icon-small` (existente) |

De los 18: **15 solo fijan tamaño** y **3 son mixtos** (row 62 chevron con rotación, row 64 lupa con opacidad, row 66 lápiz con opacidad). Los tres mixtos resuelven el extra con modificadores de estado o clases contextuales.

> **Row 66 (`DateQuickEditor`):** el `opacity: 0.6` inline **anula** el hover existente `.date-quick-chip:hover .date-quick-edit-icon { opacity: .9 }`. Al retirarlo, el icono pasa de `.4` a `.9` en hover: es una restauración de comportamiento, no una regresión, pero debe validarse visualmente en G2.

### 3.4 `LoadingOverlay`, `Modal`, `Input`

- **`LoadingOverlay` (4):** trivial. `.loading-overlay` (z-index + fondo), `.loading-overlay-card`, `.loading-overlay-message`, `.loading-overlay-spinner` (30×30, borde 4px). El spinner reutiliza `.toast-spinner`; solo se añade tamaño.
- **`Modal` (1):** `width: showIcon ? 'auto' : '100%'` → `clsx('modal-message', !showIcon && 'modal-message--full')`.
- **`Input` (2 + 1 oculto):** `.input-icon-wrap`, `.input-icon` y, además, el `style={Icon ? ...}` de la línea 14 que no detecta el script → `.filter-input--with-icon`.

### 3.5 Hex dentro de estilos inline (doble incumplimiento)

| Archivo:línea | Valor | Incumplimiento | Corrección |
|---|---|---|---|
| `Header.jsx:112` | `#10B981` | R-DS-01 (hex fuera de tokens) **y** R-DS-03 (inline) | `.header-sync-status--ok { color: var(--palette-green-500); }` |
| `DetailHeader.jsx:118` | `#ef4444` | R-DS-01 + R-DS-03 | `.comment-badge { background: var(--palette-red-500); }` |

`--estado-certificado-color` **no** sirve para el primero: vale `#1E40AF` (azul) de día y `#DBEAFE` de noche. El token correcto es `--palette-green-500`, que coincide exactamente con `#10B981`.

---

## 4. Riesgos y orden de ejecución

### 4.1 Orden recomendado

1. **UI base (`P2-02`)** — 7 usos, componentes hoja, cero dependencias de datos. Crea la escala de iconos que reutilizan las fases siguientes.
2. **Vistas y layout (`P2-03`)** — 27 usos. Agrupar por hoja CSS para reducir diffs: changelog (`03.1`–`03.3`), layout (`03.7`–`03.8`), listas/tablas (`03.4`–`03.5`).
3. **Modales estáticos (`P2-04`)** — 29 usos. `EvolutionModal` y `ProgressModal` comparten `modal-progress.css`; revisar juntos `P2-04.4` + `P2-04.5`.
4. **Gráficos y geometría (`P2-05`)** — 15 usos. Es el único bloque que necesita baseline (P0-04) para cerrar `P2-05.6`.
5. **Fallback de portapapeles (`P2-06`)** — aislar el único `element.style` permitido.

### 4.2 Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sin baseline (P0-04) no se puede validar el resultado visual | Alto | Migrar primero bloques sin geometría; dejar `P2-05` para cuando existan capturas. |
| `ProgressModal` mezcla estático y dinámico en el mismo archivo | Alto | Separar `P2-04.5` (estático) de `P2-05.5` (gráficos); no tocar JSX de gráficos en `P2-04.5`. |
| Colores BADA sin token exacto (`#0ea5e9`, `#ec4899`) | Medio | Alinear con `.segment-v1/v2`; documentar delta o solicitar excepción. |
| Clases usadas en JSX sin regla CSS (8 reales) | Medio | Crearlas en el mismo commit que retira el inline, no antes. |
| Nombres de estado en español como base de clase | Medio | Mapa `slug` explícito con fallback; nunca interpolar texto libre. |
| Transición `width` en SVG puede no animar | Bajo | Validar en G2; si no anima, aceptar delta documentado. |
| `date-quick-edit-icon` recupera hover `.4 → .9` | Bajo | Validar en G2; es restauración esperada. |
| Eliminar objetos inline reduce re-renders de forma no medible | Bajo | No añadir `useMemo`/`useCallback` por este motivo; el beneficio es de mantenibilidad. |

### 4.3 Lo que P0-04 debe aportar

Capturas de referencia (escritorio y móvil) de: `ProgressModal` con y sin gráfico expandido, `BadaGraph` con V1/V2 y con un solo tipo, `Header` en estado guardando/guardado, `DateQuickEditor` en reposo y hover, `EvolutionModal`, `LoadingOverlay` y tabla de CDUs. Sin ellas, 11 casos de geometría, el delta de 1px del lápiz, el hover restaurado y las nuevas reglas `.chart-*`/`.evolution-*` quedan como deuda de verificación de G2.

---

## 5. Estrategia aprobada para valores dinámicos (`P2-01.4`)

### 5.1 Reglas

1. **Barras de progreso → `<progress>` nativo** (preferido) **o SVG** con atributos `value`/`width`. Prohibido `style` para el ancho. El aspecto se conserva con pseudo-elementos (`::-webkit-progress-bar`, `::-webkit-progress-value`, `::-moz-progress-bar`).
2. **Tartas y segmentos → SVG** con `strokeDasharray`/`strokeDashoffset` (tartas) o `width`/`x` (segmentos). Los porcentajes se calculan en JS; la representación es declarativa. Alternativa aceptada: `<progress>` cuando el dato sea lineal.
3. **Color por categoría/estado → clase CSS** derivada de tokens (`legend-color--*`, `status-heading--*`, `pie-segment--*`). El mapa dato→slug vive en JS; el color, solo en CSS.
4. **Prohibido `style` incluso para custom properties.** No se reintroduce el patrón `--tab-color` eliminado en `P1-09.4`; si un valor debe variar, se expresa con una clase o un atributo, nunca con una variable inyectada.
5. **Único `element.style` permitido:** el fallback de copiado a portapapeles, aislado en un helper y documentado (`P2-06`). Cualquier otro uso es un fallo de gate.

### 5.2 Casos reales: antes → después

| Caso | Antes | Después |
|---|---|---|
| Barra global `ProgressModal.jsx:97` | ``<div className="progress-bar-fill" style={{ width: `${finalProgress}%` }} />`` | ``<progress className={`progress-native ${progressClass}`} value={finalProgress} max={100} />`` |
| Tarta de estados `ProgressModal.jsx:133` | ``<div className="pie-chart" style={{ width: expanded ? '120px' : '80px', background: statusGradient }} />`` | ``<svg className="pie-chart">…<circle strokeDasharray={`${p} ${100 - p}`} />…</svg>`` + `.chart-card.expanded .pie-chart { width:120px; height:120px }` |
| Leyenda `ProgressModal.jsx:68` | ``<span className="legend-color" style={{ backgroundColor: colors[key] }} />`` | ``<span className={clsx('legend-color', `legend-color--${slug}`)} />`` |
| Encabezado de estado `ProgressModal.jsx:162` | ``<h5 style={{ color: statusColors[status], borderBottom: `2px solid ${statusColors[status]}` }}>`` | ``<h5 className={`status-heading status-heading--${statusSlug}`}>`` |
| Segmentos BADA `BadaGraph.jsx:19` | ``<div className="bada-segment segment-v1" style={{ width: `${v1Percent}%` }} />`` | `<rect className="bada-segment segment-v1" x="0" width={v1Percent} height="12" />` |
| Icono `ChangelogCard.jsx:135` | `<Icons.Edit style={{ width: '14px', height: '14px' }} />` | `<Icons.Edit className="icon-md" />` |
| Icono con rotación `ChangelogCard.jsx:174` | `<Icons.ChevronDown style={{ width:'16px', height:'16px', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />` | `<Icons.ChevronDown className={clsx('icon-small', 'changelog-chevron-icon', expanded && 'changelog-chevron-icon--open')} />` |
| Badge `DetailHeader.jsx:118` | `<span style={{ position:'absolute', background:'#ef4444', … }}>` | `<span className="comment-badge">` con `background: var(--palette-red-500)` |
| Mensaje de modal `Modal.jsx:42` | `<div className="modal-message" style={{ width: showIcon ? 'auto' : '100%' }}>` | `<div className={clsx('modal-message', !showIcon && 'modal-message--full')}>` |
| Input `Input.jsx:14` | `style={Icon ? { paddingRight: '2.5rem' } : {}}` | `className={clsx('filter-input', Icon && 'filter-input--with-icon', error && 'campo-invalido', className)}` |

### 5.3 Criterio de cierre de F2

- `grep -R "style={{" src/components` → **0**.
- `node scripts/audit-inline-styles.mjs` → **0 usos** y exit 0.
- `grep -R "\.style\." src` → solo el helper de portapapeles de `P2-06`.
- Sin hex en JSX: los dos detectados aquí quedan tokenizados.
- G2 firmado con baseline de P0-04.

---

## 6. Ejecución P2-02 — UI base

Fecha: 2026-11-10. Alcance: `Input`, `LoadingOverlay`, `Modal` y `Button` (`P2-02.1`–`P2-02.4`). No se cambió la API pública de los componentes: `Input` sigue aceptando `icon`, `LoadingOverlay` sigue aceptando `message`, `Modal` no cambia sus props y `Button` solo añade el valor por defecto de `type`.

### 6.1 Uso → destino

| Uso | Archivo:línea | Antes | Destino | Clase CSS |
|---|---|---|---|---|
| Wrapper del input | `ui/Input.jsx:10` | `style={{ position, display, alignItems }}` | `forms.css` | `.input-wrapper` |
| Contenedor del icono | `ui/Input.jsx:18` | `style={{ position, right, color, pointerEvents, display }}` | `forms.css` | `.input-icon` |
| Padding condicional | `ui/Input.jsx:14` | `style={Icon ? { paddingRight: '2.5rem' } : {}}` | `forms.css` | `.filter-input--with-icon` |
| Overlay de carga | `ui/LoadingOverlay.jsx:5` | `style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}` | `notifications.css` + regla existente | `.loading-overlay` sobre `.modal-overlay` |
| Caja del overlay | `ui/LoadingOverlay.jsx:6` | `style={{ maxWidth: '300px', textAlign: 'center' }}` | `notifications.css` | `.loading-overlay .modal` |
| Mensaje | `ui/LoadingOverlay.jsx:9` | `style={{ marginBottom: '1rem', fontWeight: '600' }}` | `notifications.css` | `.loading-overlay-message` |
| Spinner | `ui/LoadingOverlay.jsx:11` | `style={{ margin, width, height, borderWidth }}` | `notifications.css` | `.loading-overlay-spinner` sobre `.toast-spinner` |
| Mensaje de modal | `ui/Modal.jsx:42` | `style={{ width: showIcon ? 'auto' : '100%' }}` | `modal-base.css` | `.modal-message--full` (solo sin icono) |

### 6.2 Decisiones de implementación

- **Input:** la clase base del campo es `.filter-input` (definida en `filters.css`), por lo que el modificador se nombra `.filter-input--with-icon` y se declara como `.filter-input.filter-input--with-icon` para no depender del orden de imports. `.input-wrapper` y `.input-icon` se añaden a `forms.css`, junto al resto de reglas del componente.
- **LoadingOverlay:** se reutiliza `.modal-overlay` (ya tiene `z-index` y color de fondo) en lugar de duplicar la capa. `z-index: 1000` pasa a `var(--z-modal)` en la regla existente; el token vale exactamente 1000. El `rgba(0,0,0,0.5)` inline **no** se reintroduce: se usa el `rgba(0,0,0,0.4)` que ya declara `.modal-overlay`. Delta visual asumido (overlay ligeramente más claro) y anotado para G2.
- **Modal:** el estado por defecto de `.modal-message` en el contenedor flex ya es `width: auto`, así que el único caso que necesita clase es el opuesto: `--full` cuando no hay icono. No se añade una clase `--with-icon` que sería un no-op.
- **Button:** `type = 'button'` por defecto, pasado explícitamente al `<button>` antes de `{...props}`. El único `<form>` del proyecto es `Login.jsx:40`; su botón ya declaraba `type="submit"` (línea 71), por lo que **no hubo que añadir ningún `submit` explícito**. No se detectaron otros `Button` dentro de formularios.

### 6.3 Conteos antes / después

| Métrica | Antes | Después | Delta |
|---|---:|---:|---:|
| `style={{` globales | 78 (22 archivos) | **71 (19 archivos)** | −7 |
| `style={{` en UI base | 7 | **0** | −7 |
| Atributos `style=` en UI base (incl. condicional) | 8 | **0** | −8 |
| `ESTÁTICO` / `GEOMETRÍA` / `COLOR` / `VAR-CSS` | 64 / 11 / 3 / 0 | **58 / 10 / 3 / 0** | −6 / −1 / 0 / 0 |
| Clases CSS (`audit-selectors`) | 424 | **431** | +7 |
| Clases consumidas | 402 | **409** | +7 |
| Clases dinámicas | 21 | **21** | 0 |
| Clases muertas | 1 | **1** (`deployment-report`) | 0 |
| Clases JSX sin regla | 32 | **32** | 0 |

### 6.4 Clases nuevas (7 nombres / 6 reglas)

`notifications.css` no define `.loading-overlay` sola: el fondo y el `z-index` viven en el selector compuesto `.loading-overlay .modal`, que modifica una clase ya existente. Por eso el listado son 7 nombres pero solo 6 reglas de clase nueva (3 en `forms.css`, 2 en `notifications.css` y 1 en `modal-base.css`); la séptima regla del grupo es la del compuesto sobre `.modal`.

| Clase | Archivo | Consumidor |
|---|---|---|
| `.input-wrapper` | `forms.css` | `Input.jsx` |
| `.input-icon` | `forms.css` | `Input.jsx` |
| `.filter-input--with-icon` | `forms.css` | `Input.jsx` (condicional con `Icon`) |
| `.loading-overlay` | `notifications.css` (selector compuesto `.loading-overlay .modal`) | `LoadingOverlay.jsx` |
| `.loading-overlay-message` | `notifications.css` | `LoadingOverlay.jsx` |
| `.loading-overlay-spinner` | `notifications.css` | `LoadingOverlay.jsx` |
| `.modal-message--full` | `modal-base.css` | `Modal.jsx` (condicional sin icono) |

---

## 7. Ejecución P2-03 — Vistas, layout y raíz

Fecha: 2026-11-10. Alcance: los 27 usos de §6.3 repartidos en 10 archivos. Ningún componente cambió su API ni su comportamiento; solo se sustituyeron atributos `style` por clases.

### 7.1 Uso → destino

| # | Uso | Archivo:línea | Antes | Destino | Clase | Delta visual conocido |
|---:|---|---|---|---|---|---|
| 1 | Icono editar changelog | `views/ChangelogCard.jsx:135` | `width/height: 14px` | `changelog/card.css` | `.icon-md` | Ninguno |
| 2 | Icono producción activa | `views/ChangelogCard.jsx:150` | `width/height: 14px` | `changelog/card.css` | `.icon-md` | Ninguno |
| 3 | Icono marcar producción | `views/ChangelogCard.jsx:151` | `width/height: 14px` | `changelog/card.css` | `.icon-md` | Ninguno |
| 4 | Icono eliminar | `views/ChangelogCard.jsx:169` | `width/height: 14px` | `changelog/card.css` | `.icon-md` | Ninguno |
| 5 | Chevron expandir | `views/ChangelogCard.jsx:174` | `16px` + `transform` + `transition` | `changelog/card.css` | `.changelog-expand-icon` + `.changelog-expand-icon--open` | Ninguno; se omite `.icon-small` por su `stroke` forzado |
| 6 | Icono agregar entradas | `views/ChangelogCard.jsx:194` | `width/height: 13px` | `changelog/card.css` | `.icon-sm` | Ninguno |
| 7 | Lupa del buscador | `views/ChangelogView.jsx:74` | `15px` + `opacity: .5` + `flexShrink: 0` | `changelog/timeline.css` | `.changelog-search-icon` | Ninguno; no hay tamaño 15px en la escala |
| 8 | Limpiar búsqueda | `views/ChangelogView.jsx:88` | `width/height: 13px` | `changelog/timeline.css` | `.icon-sm` | Ninguno |
| 9 | Lápiz de fecha rápida | `views/DateQuickEditor.jsx:81` | `11px` + `opacity: .6` | `changelog/date-editor.css` | `.date-quick-edit-icon` + `.icon-xs` | **+1px** (11→12px); opacidad base `.6 → .4` y **hover `.4 → .9` recuperado** |
| 10 | Separador del paginador | `views/VersionList.jsx:128` | `margin: 0 10px` | `list-view.css` | `.pagination-container span` (regla existente) | Ninguno; el `gap` del contenedor se mantiene |
| 11 | Hora de creación | `views/VersionRow.jsx:58` | `opacity: .7` | `list-view.css` | `.version-time` | Ninguno |
| 12 | Hora de despliegue | `views/VersionRow.jsx:62` | `opacity: .7` | `list-view.css` | `.version-time` | Ninguno |
| 13 | Celda vacía de CDUs | `views/DetailView.jsx:181` | `textAlign`, `padding: 3rem`, `color` | `table.css` | `.table-empty-cell` | Ninguno; `colSpan` sigue como atributo |
| 14 | Input file oculto | `layout/Header.jsx:93` | `display: none` | `layouts/header.css` | `.header-file-input` | Ninguno; se descarta `.visually-hidden` para no añadir un tab stop |
| 15 | Título con badge | `layout/Header.jsx:104` | `display:flex`, `alignItems`, `gap: 12px`, `flexWrap` | `layouts/header.css` | `.header-title` | Ninguno |
| 16 | Badge «Guardando…» | `layout/Header.jsx:107` | `fontSize .75rem`, color, `fontWeight`, flex, gap, fondo, padding, radius, borde | `layouts/header.css` | `.header-status-badge` | Ninguno; `--font-size-xs` y `--radius-lg` coinciden exactamente |
| 17 | Icono de sincronización | `layout/Header.jsx:108` | `width/height: 12px` | `reset.css` + `header.css` | `.icon-xs` + `.header-status-badge .icon-xs` | Ninguno; `.toast-spinner` fija 20px y exige la regla con dos clases |
| 18 | Estado «Sincronizado» | `layout/Header.jsx:112` | `color: #10B981` + resto | `layouts/header.css` | `.header-sync-status` | Ninguno; hex → `var(--palette-green-500)` (mismo valor) |
| 19 | Icono nube OK | `layout/Header.jsx:113` | `width/height: 16px` | `reset.css` | `.icon-small` (ya aplicada) | Ninguno |
| 20 | Chevron del workspace | `layout/WorkspaceSwitcher.jsx:97` | `transform: rotate(180deg｜0deg)` | `workspace-switcher.css` | `.ws-trigger-chevron--open` | Ninguno; sin modificador no se aplica `transform` (= `rotate(0deg)`) |
| 21 | Check de workspace activo | `layout/WorkspaceSwitcher.jsx:115` | `width/height: 14px` | `reset.css` | `.icon-md` | Ninguno |
| 22 | Papelera de workspace | `layout/WorkspaceSwitcher.jsx:129` | `width/height: 13px` | `reset.css` | `.icon-sm` | Ninguno |
| 23 | Cancelar nuevo workspace | `layout/WorkspaceSwitcher.jsx:161` | `width/height: 13px` | `reset.css` | `.icon-sm` | Ninguno |
| 24 | Nuevo workspace | `layout/WorkspaceSwitcher.jsx:169` | `width/height: 14px` | `reset.css` | `.icon-md` | Ninguno |
| 25 | Error de sincronización | `Dashboard.jsx:46` | `display: block` + `marginBottom: 1rem` | `modal-login.css` + `container.css` | `.login-error--visible` + `.view-container > .login-error` | Ninguno |
| 26 | Título de Login | `Login.jsx:33` | `display:flex`, `alignItems`, `gap: 10px` | `modal-login.css` | `.login-title` | Ninguno |
| 27 | Error de Login | `Login.jsx:64` | `display: block` | `modal-login.css` | `.login-error--visible` | Ninguno |

### 7.2 Decisiones de implementación

- **Escala de iconos:** `.icon-xs` (12px), `.icon-sm` (13px) y `.icon-md` (14px) se añaden una sola vez en `base/reset.css`, junto a `.icon` y `.icon-small`. Se usan `px` porque `.icon-small` (16px) ya está en `px`; equivalencias exactas: 12px = 0.75rem, 13px = 0.8125rem, 14px = 0.875rem.
- **Chevron de `ChangelogCard`:** no se reutiliza `.icon-small` porque esa clase impone `stroke: var(--text-primary)` y el chevron hereda `var(--text-secondary)` de `.changelog-chevron`; usarla habría cambiado el color. Se crea `.changelog-expand-icon` con el tamaño de 16px y la transición, más el modificador de rotación.
- **Lupa de `ChangelogView`:** no existe un tamaño de 15px en la escala y `.icon-md` lo habría reducido a 14px; se crea `.changelog-search-icon` con tamaño, opacidad y `flex-shrink` exactos.
- **Icono `Sync` de `Header`:** `.toast-spinner` (notifications.css) fija `width/height: 20px` y se importa después de `reset.css`; una sola clase no basta. Se añade `.header-status-badge .icon-xs` (especificidad 0,2,0) para conservar los 12px.
- **Input file de `Header`:** se mantiene `display: none` en `.header-file-input`. No se usa un patrón `.visually-hidden`/`.sr-only` porque el input se abre por JS (`fileInputRef.click()`) y hacerlo visible para lectores lo añadiría al orden de tabulación: sería un cambio de comportamiento, no de estilo. No existían `.visually-hidden` ni `.sr-only` en el proyecto.
- **Badge de `Header`:** `--font-size-xs` (0.75rem) y `--radius-lg` (12px) coinciden exactamente con el inline, por lo que se usan tokens. `gap: 6px` y el padding vertical de `2px` no tienen token exacto y quedan literales (deuda menor para P5-04).
- **Hex `#10B981`:** sustituido por `var(--palette-green-500)`, que vale exactamente `#10B981`. No se usa `--estado-certificado-color` porque es azul.
- **Paginador:** el margen se incorpora a la regla existente `.pagination-container span` para no crear una clase para un único nodo.
- **Errores `.login-error`:** la clase base no está oculta por defecto, así que `display: block` es redundante pero se conserva vía `.login-error--visible`. El `margin-bottom: 1rem` del Dashboard se aplica contextualmente con `.view-container > .login-error` para no alterar la separación del formulario de Login (que ya tiene `margin-top: 1rem` en `.login-actions`).
- **Chevron de `WorkspaceSwitcher`:** sin modificador no se declara `transform`, lo que equivale al antiguo `rotate(0deg)`.

### 7.3 Conteos antes / después

| Métrica | Antes | Después | Delta |
|---|---:|---:|---:|
| `style={{` globales | 71 (19 archivos) | **44 (9 archivos)** | −27 |
| `style={{` en los 10 archivos de §6.3 | 27 | **0** | −27 |
| `ESTÁTICO` / `GEOMETRÍA` / `COLOR` / `VAR-CSS` | 58 / 10 / 3 / 0 | **31 / 10 / 3 / 0** | −27 / 0 / 0 / 0 |
| Clases CSS (`audit-selectors`) | 431 | **446** | +15 |
| Clases consumidas | 409 | **424** | +15 |
| Clases dinámicas | 21 | **21** | 0 |
| Clases muertas | 1 (`deployment-report`) | **1 (`deployment-report`)** | 0 |
| Clases JSX sin regla | 32 | **32** | 0 |
| Hex en `src/components` (JSX/JS) | 12 coincidencias / 4 archivos | **11 / 3 archivos** | −1 (`Header.jsx:112`) |

Nota sobre el chequeo de hex: el encargo esperaba 10 → 9 excluyendo el `fill` del SVG de `ui/Icons.jsx` y el objeto de color de `views/detail/DetailHeader.jsx`. El conteo real con `#[0-9a-fA-F]{3,8}` sobre todo `src/components` es **12 → 11**; desaparece la única coincidencia de `Header.jsx`, y las restantes están en `ProgressModal.jsx` (9), `Icons.jsx` (1) y `DetailHeader.jsx` (1).

### 7.4 Clases nuevas (15)

| Clase | Archivo | Consumidor |
|---|---|---|
| `.icon-xs` | `base/reset.css` | `Header.jsx`, `DateQuickEditor.jsx` |
| `.icon-sm` | `base/reset.css` | `ChangelogCard.jsx`, `ChangelogView.jsx`, `WorkspaceSwitcher.jsx` |
| `.icon-md` | `base/reset.css` | `ChangelogCard.jsx`, `WorkspaceSwitcher.jsx` |
| `.changelog-expand-icon` | `changelog/card.css` | `ChangelogCard.jsx` |
| `.changelog-expand-icon--open` | `changelog/card.css` | `ChangelogCard.jsx` |
| `.changelog-search-icon` | `changelog/timeline.css` | `ChangelogView.jsx` |
| `.version-time` | `list-view.css` | `VersionRow.jsx` |
| `.table-empty-cell` | `table.css` | `DetailView.jsx` |
| `.header-file-input` | `layouts/header.css` | `Header.jsx` |
| `.header-title` | `layouts/header.css` | `Header.jsx` |
| `.header-status-badge` | `layouts/header.css` | `Header.jsx` |
| `.header-sync-status` | `layouts/header.css` | `Header.jsx` |
| `.ws-trigger-chevron--open` | `workspace-switcher.css` | `WorkspaceSwitcher.jsx` |
| `.login-error--visible` | `modals/modal-login.css` | `Dashboard.jsx`, `Login.jsx` |
| `.login-title` | `modals/modal-login.css` | `Login.jsx` |

### 7.5 P2-03.11 — verificación visual pendiente

`P2-03.11` queda en `◐` (no cerrada): sin `node_modules` no hay dev server ni capturas, y la baseline de `P0-04` todavía no existe. Lo que **no** se puede verificar y debe revisarse en G2:

- Rotación del chevron de `ChangelogCard` y transición de 0.25s.
- Lápiz de `DateQuickEditor`: +1px de tamaño, opacidad base más tenue y hover recuperado (`.4 → .9`).
- Chevron de `WorkspaceSwitcher` a 180° con el dropdown abierto.
- Badge «Guardando…»/«Sincronizado»: separación, radio y color verde en ambos temas.
- Paginador: separación real entre botones y texto (gap + margen).
- Tabla de CDUs sin datos: centrado, padding de 3rem y color secundario.
- Error de Login y de Dashboard en sus dos contextos (formulario y vista).
- Input file oculto: la importación debe seguir funcionando.
- De P2-02: overlay de carga más claro y `Button.type` por defecto (submit de Login).

---

## 8. Ejecución P2-04 — Modales

Fecha: 2026-11-10. Alcance: 29 usos en 5 modales. No se tocaron los 7 usos dinámicos de `ProgressModal` (barra, tartas y colores) reservados a `P2-05.5`.

### 8.1 Uso → destino (29)

| Uso (repetidos agrupados) | Archivo:línea | Antes | Destino | Clase | Delta visual |
|---|---|---|---|---|---|
| `Icons.Plus` ×2 | `ChangelogEntriesModal.jsx:127,138` | `13px` | `base/reset.css` | `.icon-sm` | Ninguno |
| `Icons.X` | `ChangelogEntriesModal.jsx:187` | `14px` | `base/reset.css` | `.icon-md` | Ninguno |
| `padding: 0` | `CommentsModal.jsx:85` | `style={{ padding: 0 }}` | `modal-comentarios.css` | regla existente `.modal-comentarios-categorized-content` | Ninguno; se elimina el `padding` de la regla porque el inline ya lo anulaba |
| Estado vacío | `DeploymentReportModal.jsx:74` | `padding: 2rem`, `textAlign`, `width`, `color` | `modal-deployment-report.css` | `.deployment-report-empty` | Ninguno |
| Contenedor del formulario | `EvolutionModal.jsx:45` | `display:flex`, `flexDirection`, `gap: 1rem` | `modal-evolution.css` | `.evolution-form` | Ninguno |
| Aviso superior | `EvolutionModal.jsx:46` | `fontSize: .9rem`, `color`, `marginBottom` | `modal-evolution.css` | `.evolution-warning` | Ninguno |
| Fila de dos campos | `EvolutionModal.jsx:50` | `display:grid`, `1fr 1fr`, `gap: 1rem` | `modal-evolution.css` | `.form-row--split` | Ninguno; el modificador se aplica solo a la fila de dos `Input` (ver 8.2) |
| Etiquetas ×3 | `EvolutionModal.jsx:64,88,96` | `display:block`, `marginBottom`, `fontWeight` | `modal-evolution.css` | `.evolution-label` | Ninguno |
| Textarea de descripción | `EvolutionModal.jsx:68` | `width: 100%`, `padding: .5rem` | `modal-evolution.css` | `.evolution-textarea` | Ninguno; sustituye a `.input-field`, que no tenía regla |
| Contenedor del modal | `ProgressModal.jsx:86` | `display:grid`, `gap: 2rem` | `modal-progress.css` | `.modal-progress-content` (regla existente ampliada) | Ninguno; se conserva `align-items: center` |
| Grid de gráficos | `ProgressModal.jsx:106` | `display:grid`, `auto-fit minmax(200px,1fr)`, `gap: 1.5rem` | `modal-progress.css` | `.charts-grid` | Ninguno |
| Tarjeta expandible ×2 | `ProgressModal.jsx:112,208` | `cursor`, `gridColumn` condicional, `transition` | `modal-progress.css` | `.chart-card--expandable` + `.chart-card.expanded` | Ninguno; `grid-column: 1/-1` solo con `.expanded` |
| Wrapper de contenido ×2 | `ProgressModal.jsx:120,216` | `display:flex`, `flexDirection`/`alignItems` condicional, `gap: 2rem` | `modal-progress.css` | `.chart-content-wrapper` + `.chart-content-wrapper.expanded` | Ninguno; se añade la clase `expanded` al wrapper |
| Contenedor de tarta ×2 | `ProgressModal.jsx:127,222` | `display:flex`, `alignItems`, `gap: 1rem`, `flexShrink: 0` | `modal-progress.css` | `.pie-chart-container` + `.pie-chart-container--fixed` | Ninguno |
| Contenedor de tarta (dificultad) | `ProgressModal.jsx:192` | `display:flex`, `alignItems`, `gap: 1rem` | `modal-progress.css` | `.pie-chart-container` | Ninguno; sin `flex-shrink` |
| Detalles expandidos ×2 | `ProgressModal.jsx:146,241` | `flex`, columnas, `height`, `overflowX`, borde, `paddingLeft`, `animation` | `modal-progress.css` | `.chart-details` | Ninguno |
| Columna de estado ×2 | `ProgressModal.jsx:161,272` | `breakInside: avoid`, `marginBottom: 1.5rem` | `modal-progress.css` | `.status-column` | Ninguno |
| Lista ×2 | `ProgressModal.jsx:170,281` | `listStyle`, `padding: 0`, `margin: 0` | `modal-progress.css` | `.status-list` | Ninguno |
| Elemento de lista ×2 | `ProgressModal.jsx:172,283` | `fontSize`, `marginBottom`, `color` | `modal-progress.css` | `.status-list li` | Ninguno |

### 8.2 Decisiones de implementación

- **`modal-evolution.css`:** no existía bloque de evolución en `modal-progress.css`, así que se crea el archivo y se importa en `main.css` justo después de `modal-full-summary.css`, sin reordenar los imports existentes.
- **`.form-row` no se define:** el marcado usa `form-row` en tres sitios y solo el primero (dos `Input`) debe ser una rejilla de 2 columnas. Aplicar `display: grid; grid-template-columns: 1fr 1fr` a `.form-row` habría puesto la etiqueta al lado del textarea (línea 63) y habría dejado el `Select` de la línea 74 a media anchura. La rejilla se limita a `.form-row--split`, aplicado solo a la fila de dos campos.
- **Textarea:** no existía una clase de textarea reutilizable (`forms.css` no define ninguna; `.input-field` se usa en JSX pero nunca se estiló), así que se crea `.evolution-textarea` con los mismos valores del inline.
- **`CommentsModal`:** `.modal-comentarios-categorized-content` solo se usa en este modal y su `padding: 1rem 1.5rem 1.5rem 1.5rem` estaba anulado por el inline; se elimina la declaración en lugar de crear un modificador. Cada `.comentario-categoria` aporta su propio espaciado.
- **`ProgressModal` — separación estático/dinámico:** los usos con `expandedChart ===` se resolvieron con clases (la tarjeta ya llevaba `.expanded`; el wrapper recibe ahora `.expanded` condicional), por lo que se pudieron eliminar completos sin tocar la lógica. Los 7 usos verdaderamente dinámicos (ancho `${finalProgress}%`, `colors[key]`, `statusGradient`/`difficultyGradient`/`badaGradient` y los dos `h5` con color de estado) permanecen intactos y pasan a `P2-05.5`.
- **`.document`:** `.chart-title`, `.chart-subtitle`, `.legend-item`, `.legend-color` y `.legend-label` solo se usan en `ProgressModal`; pasan del `<style>` embebido al CSS global sin efectos cruzados.

### 8.3 Bloque `<style>` embebido (`ProgressModal.jsx:304-315`)

Contenía 7 reglas y 1 `@keyframes`:

| Regla | Estado previo | Acción |
|---|---|---|
| `.chart-title` | válida | movida a `modal-progress.css` |
| `.chart-subtitle` | válida | movida a `modal-progress.css` |
| `.chart-card` | `borderRadius: 8px` **inválida** | movida con `border-radius: 8px` corregido |
| `.legend-item` | `alignItems: center` **inválida** | movida con `align-items: center` corregido |
| `.legend-color` | válida | movida a `modal-progress.css` |
| `.legend-label` | válida | movida a `modal-progress.css` |
| `@keyframes fadeIn` | válida | **no se duplica**: `base/animations.css` ya define exactamente la misma animación |

Lo que **sí cambia el render** al corregir las propiedades camelCase:

1. `.chart-card` gana `border-radius: 8px`. Antes la declaración se ignoraba y las tarjetas tenían esquinas rectas; ahora quedan redondeadas.
2. `.legend-item` gana `align-items: center`. Antes el cuadradito de color y la etiqueta se alineaban por el valor inicial (`stretch`/baseline de flex), ahora se centran verticalmente.

Ambos deltas son consecuencia de corregir CSS inválido, no de una decisión de diseño; deben validarse en G2.

### 8.4 Conteos antes / después

| Métrica | Antes | Después | Delta |
|---|---:|---:|---:|
| `style={{` globales | 44 (9 archivos) | **15 (5 archivos)** | −29 |
| `style={{` en los 5 modales | 29 | **0** | −29 |
| `ProgressModal` (usos restantes) | 24 | **7** (`P2-05.5`) | −17 |
| `ESTÁTICO` | 31 | **6** | −25 |
| `GEOMETRÍA` | 10 | **6** | −4 |
| `COLOR` | 3 | **3** | 0 |
| Clases CSS / consumidas | 446 / 424 | **467 / 445** | +21 / +21 |
| Dinámicas / muertas | 21 / 1 | **21 / 1** | 0 |
| Clases JSX sin regla | 32 | **18** | −14 |
| Hex en `src/components` | 11 | **11** | 0 |

**Nota sobre los tipos:** el encargo esperaba `ESTÁTICO 31 → 2` y `GEOMETRÍA 10 → 10`, asumiendo que los 29 usos eran ESTÁTICO. El script clasifica como GEOMETRÍA los 4 usos mixtos de `chart-card` y `chart-content-wrapper` porque contienen `expandedChart ===`; al migrarlos también, quedan `ESTÁTICO 6` (`CduRow` 3, `DetailHeader` 2, `StepsEditor` 1) y `GEOMETRÍA 6` (`BadaGraph` 2 + barra y 3 tartas de `ProgressModal`). El total de 15 restantes coincide con lo previsto.

### 8.5 Clases nuevas (21)

| Clase | Archivo | Consumidor |
|---|---|---|
| `.evolution-form` | `modals/modal-evolution.css` | `EvolutionModal.jsx` |
| `.evolution-warning` | `modals/modal-evolution.css` | `EvolutionModal.jsx` |
| `.form-row--split` | `modals/modal-evolution.css` | `EvolutionModal.jsx` |
| `.evolution-label` | `modals/modal-evolution.css` | `EvolutionModal.jsx` |
| `.evolution-textarea` | `modals/modal-evolution.css` | `EvolutionModal.jsx` |
| `.deployment-report-empty` | `modals/modal-deployment-report.css` | `DeploymentReportModal.jsx` |
| `.charts-grid` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-title` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-subtitle` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-card` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-card--expandable` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.expanded` (en `.chart-card`) | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-content-wrapper` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-content-wrapper.expanded` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.pie-chart-container` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.pie-chart-container--fixed` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.chart-details` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.status-column` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.status-list` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.legend-item` | `modals/modal-progress.css` | `ProgressModal.jsx` |
| `.legend-color`, `.legend-label` | `modals/modal-progress.css` | `ProgressModal.jsx` |

### 8.6 P2-04.6 — verificación visual pendiente

Queda en `◐` por la ausencia de `node_modules`, dev server y baseline `P0-04`. A validar en G2:

- Esquinas de `.chart-card` (nuevo `border-radius: 8px`) y alineación vertical de la leyenda (`align-items: center`).
- `ProgressModal` con y sin tarjeta expandida: grid de 3 columnas, salto a `1 / -1`, wrapper en fila/columna, altura de 70vh y columnas de 300px en `.chart-details`.
- `EvolutionModal`: rejilla de dos campos, etiquetas, textarea y aviso.
- `CommentsModal`: ausencia de padding del contenedor y scroll.
- `DeploymentReportModal` sin datos: centrado y ancho completo.
- Iconos `Plus`/`X` de `ChangelogEntriesModal`.

---

## 9. Ejecución P2-05 — Geometría dinámica y colores por categoría

Fecha: 2026-11-10. Alcance: los 15 usos restantes. Resultado: **0 `style={{}}` y 0 hex en `src/components`**.

### 9.1 Uso → destino (15)

| # | Uso (línea base) | Tipo | Técnica | Clase / atributo | Delta |
|---|---|---|---|---|---|
| 1 | `BadaGraph.jsx:19` ancho `${v1Percent}%` | GEOMETRÍA | SVG | `<rect width={v1Percent} height={12}>` + `.bada-graph` | Animación de ancho depende de SVG2; proporción idéntica |
| 2 | `BadaGraph.jsx:20` ancho `${v2Percent}%` | GEOMETRÍA | SVG | `<rect x={v1Percent} width={v2Percent}>` | Idem |
| 3 | `CduRow.jsx:125` `textAlign: center` | ESTÁTICO | clase | `.cdu-actions-cell` | Ninguno |
| 4 | `CduRow.jsx:126` `display/gap/justifyContent` | ESTÁTICO | clase | `.cdu-actions` | Ninguno |
| 5 | `CduRow.jsx:131` `padding`/`fontSize` | ESTÁTICO | clase | `.cdu-action-btn` (`--space-1`, `--space-2`, `--font-size-sm`) | Ninguno |
| 6 | `StepsEditor.jsx:47` `transform`/`transition` | ESTÁTICO | clase | `.pasos-toggle-icon` + `.pasos-toggle-icon--active` | Ninguno |
| 7 | `DetailHeader.jsx:114` `position: relative` | ESTÁTICO | clase | `.version-comments-wrapper` (`layouts/header.css`) | Ninguno |
| 8 | `DetailHeader.jsx:118` badge (12 declaraciones + `#ef4444`) | ESTÁTICO + COLOR | clase + token | `.version-comments-badge` + `--palette-red-500` | Ninguno: mismo valor exacto |
| 9 | `ProgressModal.jsx:68` `backgroundColor: colors[key]` | COLOR | clase | `.legend-color--*` (9 slugs) | Ninguno: mismos valores |
| 10 | `ProgressModal.jsx:97` ancho `${finalProgress}%` | GEOMETRÍA | `<progress>` | `<progress className="progress-bar" value={finalProgress} max={100}>` | Valor final idéntico; la transición de 1 s puede no animar en nativo |
| 11 | `ProgressModal.jsx:118` tarta de estados | GEOMETRÍA | SVG | `<PieChart>`: `<circle r="25" stroke-width="50" pathLength="100" stroke-dasharray>` | Mismos ángulos y colores; borde de sector con antialiasing distinto |
| 12 | `ProgressModal.jsx:136` color del `h5` de estado | COLOR | clase | `.status-heading` + `.status-heading--*` | Ninguno |
| 13 | `ProgressModal.jsx:163` tarta de dificultad | GEOMETRÍA | SVG | `<PieChart>` | Idem |
| 14 | `ProgressModal.jsx:183` tarta de versión Bada | GEOMETRÍA | SVG | `<PieChart>` | Idem |
| 15 | `ProgressModal.jsx:217` color del `h5` de Bada | COLOR | clase | `.status-heading--v1/--v2` | Ninguno |

### 9.2 Decisiones de implementación

- **BadaGraph:** el `<svg>` (`viewBox="0 0 100 12"`, `preserveAspectRatio="none"`) va dentro del marco existente `.bada-graph-bar`, que conserva fondo, borde y `border-radius: 6px` con `overflow: hidden`. Los rectángulos llevan `x`/`width` como atributos; las reglas pasan de `background-color` a `fill`. El gráfico es decorativo (`aria-hidden="true"`) porque las etiquetas `V1: n%` / `V2: n%` ya describen el dato.
- **Tartas:** un `<circle r="25">` con `stroke-width: 50` y `pathLength="100"` pinta un disco de radio 50 y convierte `stroke-dasharray` en porcentajes; `transform="rotate(-90 50 50)"` alinea el inicio a las 12 en punto y `stroke-dashoffset` acumula los segmentos. Se elimina el `conic-gradient` construido en JS: ningún degradado se sustituye por relleno sólido, porque el SVG conserva los mismos sectores.
- **`<progress>`:** se mantiene `.progress-bar-container` como marco y `.progress-bar` se estiliza con `::-webkit-progress-bar`, `::-webkit-progress-value` y `::-moz-progress-bar`. Las variantes `.progress-low/mid/complete` se conservan en el elemento para el color del valor, con `background-color: transparent` para anular el fondo que esas reglas aplican al texto grande.
- **DetailHeader — desviación justificada:** las reglas nuevas se añaden a `layouts/header.css`, que ya contiene `.version-header-buttons` y sí está importado. `layouts/detail-header.css` sigue sin importarse (bloqueo `P1-06.2`): escribir allí las clases habría eliminado el badge en producción. El archivo huérfano queda intacto y su importación sigue pendiente de `P0-04`.
- **Tokenización de hex:** `#ef4444` → `--palette-red-500` (mismo valor, distinta caja). Los 9 colores de `ProgressModal` se mapean a tokens ya existentes con valores idénticos: `blue-500`, `amber-500`, `green-500`, `violet-500`, `green-500-alt`, `yellow-500`, `red-500`, y los dos nuevos `sky-400`/`pink-500`. Los mapas `status → clase` son constantes con slugs estables; ninguna clase se genera a partir del texto visible.
- **`Icons.Info`:** `fill="#ffffff"` → `fill="white"`. Es el mismo color (`#FFFFFF`) sin hex en JSX; el icono sigue con relleno fijo, deuda de contraste registrada en `P5-01.1` (`Icons.Info` → `currentColor`).

### 9.3 Deltas visuales asumidos, por riesgo

| Riesgo | Delta | Motivo |
|---|---|---|
| Medio | La barra nativa puede no animar el crecimiento de 1 s | `::-webkit-progress-value` no siempre acepta `transition`; el estado final es idéntico |
| Medio | El borde de cada sector de tarta puede mostrar antialiasing algo distinto al `conic-gradient` | Cambio de técnica de pintado, mismos ángulos y colores |
| Bajo | La transición de ancho de `BadaGraph` depende de que el navegador anime la geometría SVG (`width` CSS en `<rect>`) | En el peor caso, el gráfico aparece en su valor final sin animar |
| Bajo | `pie-chart` sin datos queda invisible | Antes el `conic-gradient` se generaba inválido (`gray 0% 100%`) y también era invisible |

### 9.4 Conteos antes / después

| Métrica | Antes | Después | Delta |
|---|---:|---:|---:|
| `style={{` en `src/components` | 15 (5 archivos) | **0** | −15 |
| ESTÁTICO / GEOMETRÍA / COLOR / VAR-CSS | 6 / 6 / 3 / 0 | **0 / 0 / 0 / 0** | −15 |
| Hex en `src/components` | 11 | **0** | −11 |
| Clases CSS / consumidas | 467 / 445 | **502 / 480** | +35 / +35 |
| Dinámicas / muertas | 21 / 1 | **21 / 1** | 0 |
| Clases JSX sin regla | 18 | **17** | −1 |
| Imports de `main.css` / rotos | 30 / 0 | **30 / 0** | 0 |

### 9.5 Clases nuevas (35 netas)

| Archivo | Clases |
|---|---|
| `components/table.css` | `.bada-graph`, `.cdu-actions-cell`, `.cdu-actions`, `.cdu-action-btn`, `.pasos-toggle-icon`, `.pasos-toggle-icon--active` |
| `layouts/header.css` | `.version-comments-wrapper`, `.version-comments-badge` |
| `modals/modal-progress.css` | `.progress-bar`, `.pie-chart`, `.pie-segment` + 9 `.pie-segment--*`, 9 `.legend-color--*`, `.status-heading` + 6 `.status-heading--*` |

Se retira `.progress-bar-fill`: 36 nombres nuevos − 1 eliminado = +35.

### 9.6 P2-06 — fallback de portapapeles

- **P2-06.1 ✅.** Estado previo a la corrección: solo había dos copias — `DeploymentInfoModal.jsx:99-125` (asignaciones `textArea.style.*`) y `FullSummaryModal.jsx:113-127` (`Object.assign(ta.style, {...})`). Fuera del alcance de portapapeles, `validator.js:126` usa `parent.style.position = 'relative'` para anclar mensajes de validación (excepción conocida, fuera de F2).
- **P2-06.2 ✅ — ejecutada.** `src/utils/clipboard.js` exporta `copyText(text): Promise<boolean>`: Clipboard API → fallback con `<textarea>` oculto dentro de `try/finally`, de modo que el nodo se elimina siempre (antes quedaba en el DOM si `execCommand` lanzaba). Es el único archivo con `element.style`; los dos modales delegan y conservan su flujo observable (mismo `alert` y mismo `setCopied`), aunque sus mensajes de consola se unifican en el helper.
- **P2-06.3 ✅.** `grep 'style={{'` en `src/components` = 0; `.style.` en `src/components` = 0; `element.style` solo en `src/utils/clipboard.js` (1 asignación agrupada) y en `validator.js:126`.

### 9.7 P2-05.6 — verificación visual pendiente (`⛔ P0-04`)

Sin `node_modules` ni dev server no se puede comparar contra baseline. A validar en G2:

- `BadaGraph`: proporción V1/V2, esquinas redondeadas del marco y animación.
- `ProgressModal`: barra en 0/49/50/100 %, tartas con 1, 2 y 3 categorías, leyenda y encabezados por estado.
- `DetailHeader`: posición y color del badge con y sin comentarios.
- `CduRow` y `StepsEditor`: botones de acción y rotación del chevron.
