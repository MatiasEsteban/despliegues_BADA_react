# Baseline visual — 2026-11-08

Protocolo de captura para la tarea `P0-04` del [`plan.md`](../../../plan.md).

## Estado

**Ejecutado el 2026-11-12** con Playwright headless sobre el build de captura
(`vite build --mode capture` + `vite preview`). Son **24 capturas** del estado
actual; no es un baseline retroactivo.

- Capturas: [`captures/`](captures/)
- Manifiesto (commit, fecha, SO, Node, Playwright, Chromium, tema y datos):
  [`MANIFEST.md`](MANIFEST.md)

## Convención de nombres

```
[ancho]-[vista]-[tema]-[estado].png
```

Ejemplo: `320-changelog-dark-default.png`.

## Matriz real (24 capturas)

| Grupo | Anchos y temas | Estado capturado | Total |
|---|---|---|---:|
| Changelog | 320 y 1440 × claro/oscuro; 768 claro | `default` | 5 |
| Lista/Grid | 320 y 1440 × claro/oscuro | `grid` | 4 |
| Detalle CDU | 320 y 1440 × claro/oscuro; 768 claro | `default` | 5 |
| Modales de exportación, progreso y entradas | 320 y 1440 × claro | `default` | 6 |
| Resumen global e Info Despliegue | 320 claro | `default` | 2 |
| Workspace switcher abierto | 320 y 1440 claro | `abierto` | 2 |
| **Total** | | | **24** |

Notas de la matriz:

- La vista Lista/Grid se captura en modo **grid** de `VersionList`; la tabla
  lista comparte los mismos breakpoints.
- El hueco «comentarios» se cubre con `320-modal-info-light-default.png`
  (`DeploymentInfoModal`): `CommentsModal.jsx` no tiene consumidor en la UI
  actual. No se deja hueco.
- 768 solo se captura en Changelog y Detalle, donde cambia el layout.

## Procedimiento automatizado

1. `npm run capture` en `despliegues-bada-react/`.
2. El script compila con `--mode capture` (`.env.capture` activa
   `VITE_APP_FIXTURES=1`), levanta `vite preview` en el puerto 4173 con
   `--strictPort` y recorre la matriz con Chromium headless.
3. Fija `localStorage.theme` antes de navegar (lo lee `Header.jsx`) y
   `page.emulateMedia({ reducedMotion: 'reduce' })` para capturas estables.
4. Escribe los PNG en `captures/` y regenera `MANIFEST.md` con commit, fecha,
   SO, versiones, tema y estado de datos.
5. Cierra el navegador y el servidor en `finally`.

## Uso posterior

Las capturas del **2026-11-12** son la referencia del estado actual. Sirven para
verificar `P4-08`, F5 y `P5-04`; **no** se usan para atribuir cambios
retroactivos a F1–F3. Cualquier diferencia perceptible en color, espaciado o
jerarquía debe justificarse contra el `MANIFEST.md`.
