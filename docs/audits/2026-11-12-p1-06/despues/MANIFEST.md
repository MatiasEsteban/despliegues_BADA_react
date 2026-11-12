# MANIFEST — Línea base visual (2026-11-12)

> **Nota:** línea base del estado actual (2026-11-12); no es un baseline retroactivo, no atribuye cambios a F1–F3.

| Campo | Valor |
|---|---|
| Commit (HEAD al capturar) | `5ece225` |
| Fecha de captura | 2026-11-12T17:15:50.229Z |
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
| Duración total | 7.1 s |
| Capturas | 5 |

## Capturas

| Archivo | Vista | Ancho | Tema | Estado | Tamaño |
|---|---:|---:|---|---|---:|
| `320-detalle-light-default.png` | detalle | 320 | light | default | 39.8 KB |
| `320-detalle-dark-default.png` | detalle | 320 | dark | default | 40.0 KB |
| `1440-detalle-light-default.png` | detalle | 1440 | light | default | 138.3 KB |
| `1440-detalle-dark-default.png` | detalle | 1440 | dark | default | 138.8 KB |
| `768-detalle-light-default.png` | detalle | 768 | light | default | 78.1 KB |

## Notas de alcance

- **Lista/Grid** se captura en el modo **grid** de `VersionList`; la tabla lista comparte los mismos breakpoints.
- El hueco **comentarios** se cubre con `320-modal-info-light-default.png`: `CommentsModal.jsx` no tiene consumidor en la UI actual. Se usa `DeploymentInfoModal` (Info Despliegue), accesible y con el contenido de changelog/comentarios. No se deja hueco.
- `layouts/detail-header.css` está importado en `main.css` (P1-06.2): las capturas reflejan ese CSS efectivo.
- Las capturas se toman con viewport de 900 px de alto (no `fullPage`) para que las capas fijas de los modales se rendericen sin artefactos. La altura no forma parte de la matriz aprobada.
- Los PNG son evidencia: el script los sobrescribe en cada ejecución, pero no los borra.
