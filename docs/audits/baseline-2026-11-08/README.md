# Baseline visual — 2026-11-08

Protocolo de captura para la tarea `P0-04` del [`plan.md`](../../../plan.md).

## Estado

**Pendiente de ejecución manual.** No se capturaron imágenes automatizadas: el proyecto no tiene herramienta de navegador headless instalada y `F0` no autoriza añadir dependencias de ese tipo.

## Convención de nombres

```
[ancho]-[vista]-[tema]-[estado].png
```

Ejemplo: `320-changelog-dark-expanded.png`

## Matriz mínima

| Vista | Estados | Anchos | Temas |
|---|---|---|---|
| Changelog | Colapsado, expandido, búsqueda activa, sin resultados | 320, 768, 1440 | Claro, oscuro |
| Lista | Grid y lista | 320, 768, 1440 | Claro, oscuro |
| Detalle CDU | Cabecera, pasos, responsables, gráfico BADA | 320, 768, 1440 | Claro, oscuro |
| Modales | Entradas, exportación, progreso, resumen global, comentarios | 320, 768, 1440 | Claro, oscuro |
| Workspace switcher | Cerrado, abierto | 320, 768 | Claro, oscuro |

Total mínimo: **36 capturas**.

## Procedimiento

1. `npm run dev` en `despliegues-bada-react/`.
2. Fijar el viewport exacto (DevTools → dispositivo personalizado).
3. Forzar el tema correspondiente desde el control de la aplicación, no desde el sistema operativo.
4. Capturar la ventana completa, sin recortes manuales.
5. Guardar en este directorio con la convención de nombres.
6. Registrar la fecha y el commit en `MANIFEST.md`.

## Uso posterior

Cada gate de fase (`G1`–`G5`) compara el estado actual contra estas capturas. Cualquier diferencia perceptible en color, espaciado o jerarquía bloquea el gate hasta justificarse.
