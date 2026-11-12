# MANIFEST — Línea base visual (2026-11-12)

> **Nota:** línea base del estado actual (2026-11-12); no es un baseline retroactivo, no atribuye cambios a F1–F3.

| Campo | Valor |
|---|---|
| Commit (HEAD al capturar) | `5ece225` |
| Fecha de captura | 2026-11-12T17:08:29.002Z |
| Sistema operativo | Windows_NT 10.0.26300 (win32 x64) |
| Node | v24.12.0 |
| Playwright | 1.65.0 |
| Chromium | 158.0.8127.18 (Chrome for Testing, headless) |
| Build | `vite build --mode capture` + `vite preview --port 4173 --strictPort` |
| Datos | `VITE_APP_FIXTURES=1`; fixtures deterministas de `src/test/fixtures/appState.js`; sin Firestore |
| Tema | `localStorage.theme` (lo lee `Header.jsx`) + `data-theme` en `<html>` |
| Reloj | `2026-11-12T13:00:00.000Z` fijado en el navegador para que `FullSummaryModal` sea reproducible |
| Viewport | Ancho de la matriz x 900 px; `deviceScaleFactor: 1`; `reducedMotion: reduce` |
| Script | `npm run capture` (`scripts/capture-baseline.mjs`) |
| Duración total | 15.9 s |
| Capturas | 24 |

## Capturas

| Archivo | Vista | Ancho | Tema | Estado | Tamaño |
|---|---:|---:|---|---|---:|
| `320-changelog-light-default.png` | changelog | 320 | light | default | 47.0 KB |
| `320-changelog-dark-default.png` | changelog | 320 | dark | default | 48.5 KB |
| `1440-changelog-light-default.png` | changelog | 1440 | light | default | 114.7 KB |
| `1440-changelog-dark-default.png` | changelog | 1440 | dark | default | 116.2 KB |
| `320-lista-light-grid.png` | lista | 320 | light | grid | 44.3 KB |
| `320-lista-dark-grid.png` | lista | 320 | dark | grid | 43.9 KB |
| `1440-lista-light-grid.png` | lista | 1440 | light | grid | 118.1 KB |
| `1440-lista-dark-grid.png` | lista | 1440 | dark | grid | 118.6 KB |
| `320-detalle-light-default.png` | detalle | 320 | light | default | 47.2 KB |
| `320-detalle-dark-default.png` | detalle | 320 | dark | default | 45.8 KB |
| `1440-detalle-light-default.png` | detalle | 1440 | light | default | 138.6 KB |
| `1440-detalle-dark-default.png` | detalle | 1440 | dark | default | 138.5 KB |
| `320-modal-exportacion-light-default.png` | modal-exportacion | 320 | light | default | 42.8 KB |
| `1440-modal-exportacion-light-default.png` | modal-exportacion | 1440 | light | default | 139.2 KB |
| `320-modal-progreso-light-default.png` | modal-progreso | 320 | light | default | 38.7 KB |
| `1440-modal-progreso-light-default.png` | modal-progreso | 1440 | light | default | 139.1 KB |
| `320-modal-entradas-light-default.png` | modal-entradas | 320 | light | default | 31.9 KB |
| `1440-modal-entradas-light-default.png` | modal-entradas | 1440 | light | default | 91.1 KB |
| `320-modal-resumen-light-default.png` | modal-resumen | 320 | light | default | 33.8 KB |
| `320-modal-info-light-default.png` | modal-info | 320 | light | default | 42.3 KB |
| `320-workspace-light-abierto.png` | workspace | 320 | light | abierto | 48.6 KB |
| `1440-workspace-light-abierto.png` | workspace | 1440 | light | abierto | 122.3 KB |
| `768-changelog-light-default.png` | changelog | 768 | light | default | 83.2 KB |
| `768-detalle-light-default.png` | detalle | 768 | light | default | 77.8 KB |

## Notas de alcance

- **Lista/Grid** se captura en el modo **grid** de `VersionList`; la tabla lista comparte los mismos breakpoints.
- El hueco **comentarios** se cubre con `320-modal-info-light-default.png`: `CommentsModal.jsx` no tiene consumidor en la UI actual. Se usa `DeploymentInfoModal` (Info Despliegue), accesible y con el contenido de changelog/comentarios. No se deja hueco.
- `layouts/detail-header.css` aún no se importa en `main.css` (P1-06.2 pendiente). Las capturas reflejan el estado **actual**, no el esperado tras esa tarea.
- Las capturas se toman con viewport de 900 px de alto (no `fullPage`) para que las capas fijas de los modales se rendericen sin artefactos. La altura no forma parte de la matriz aprobada.
- Los PNG son evidencia: el script los sobrescribe en cada ejecución, pero no los borra.
