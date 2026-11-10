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
| `src/components/ui/Input.jsx` | 14 | `style={Icon ? { paddingRight: '2.5rem' } : {}}` | `P2-02.1` debe eliminarlo también (`.filter-input--with-icon`). No cuenta en los 78. |
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

> **Delta de color documentado:** `badaColors` usa `#0ea5e9` y `#ec4899`, que **no existen** en la paleta congelada. Se alinean con `.segment-v1`/`.segment-v2` (`--palette-blue-500`/`--palette-orange-500`) para que `ProgressModal` y `BadaGraph` coincidan. Si se exige el tono exacto, hace falta una excepción explícita a la paleta congelada (decisión del owner, no del implementador).

### 3.2 `BadaGraph.jsx` — 2 usos

Dos segmentos `div` con `width: ${x}%` alineados a la derecha. Pasan a SVG con atributos (permitidos: son atributos, no `style`):

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
