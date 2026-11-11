# Infraestructura de tests — Vitest + Testing Library (2026-11-10)

Lote **P6-01.1–P6-01.4** de SPEC-001 (F6). Instalado con `npm install -D` sobre
`node_modules` de `npm ci`; Node 24.12, npm 11.21, Vite 5.4.21, React 18.2.

## 1. Versiones resueltas

| Paquete | Versión | Nota |
|---|---|---|
| `vitest` | **3.2.7** | pineado a `^3`: la rama 5.x exige Vite ≥ 6 y el repo usa Vite 5.4.21 |
| `jsdom` | **29.1.1** | entorno de `test.environment` |
| `@testing-library/react` | **16.3.3** | |
| `@testing-library/dom` | **10.4.2** | peer obligatorio de RTL 16 |
| `@testing-library/user-event` | **14.6.9** | |
| `@testing-library/jest-dom` | **7.0.1** | importado como `/vitest` |
| `jest-axe` | **11.0.0** | matcher `toHaveNoViolations` |

`package.json` añade:

```json
"test": "vitest run",
"test:watch": "vitest"
```

No se añadió `verify` (P6-05) ni coverage (fuera de la spec; añadiría
`@vitest/coverage-v8`). ESLint/Stylelint siguen pendientes de P6-02.

## 2. `vitest.config.js`

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuración de tests separada de `vite.config.ts` (que se mantiene para
// `npm run dev` / `npm run build`). `css: false` evita que los tests procesen
// CSS: las hojas solo se importan desde `src/main.jsx`, nunca desde componentes.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
    restoreMocks: true,
  },
});
```

Decisiones:

- `vite.config.ts` se conserva intacto; Vitest usa `vitest.config.js` y no
  duplica el puerto de desarrollo.
- `css: false` evita PostCSS en tests: ningún componente importa hojas de estilo.
- `globals: true` deja `describe/it/expect/vi` disponibles. **Anotado para
  P6-02**: al añadir ESLint habrá que declarar `globals: { ...globals.vitest }`
  o importar de `vitest` en cada archivo.

## 3. `src/test/setup.js`

```js
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.ResizeObserver = ResizeObserverStub;
  globalThis.ResizeObserver = ResizeObserverStub;
}

export { axe };
```

- `matchMedia`: el tema real se resuelve con `localStorage` + `data-theme`, pero
  el stub evita `ReferenceError` en componentes o dependencias que consulten
  `prefers-color-scheme`.
- `ResizeObserver`: stub no-op. jsdom no lo implementa y algunos componentes
  futuros podrían medir contenedores.
- `jest-axe` se extiende una sola vez por suite; los tests pueden importar
  `axe` desde el setup o directamente desde `jest-axe`.

## 4. Smoke test

`src/components/ui/__tests__/Button.test.jsx` — 4 tests, sin snapshots:

1. Renderiza un `<button>` y `type="button"` por defecto (R-CODE-02).
2. Renderiza children y clases de variante (`btn btn-danger`).
3. Responde a `onClick` con `userEvent`.
4. Respeta `type="submit"` explícito (T-05 → cierra **P6-04.3**).

## 5. Cómo ejecutar

```bash
npm test          # vitest run (CI)
npm run test:watch
```

## 6. Verificación y limitaciones

```text
npm test        ✓ 1 archivo · 4 tests pasan (vitest 3.2.7)
npm run build   ✓ 121 módulos · 95.59 kB CSS
audit-inline-styles  0 usos
audit-selectors      502 clases · 480 consumidas · 21 dinámicas · 1 muerta · 17 JSX sin regla
```

Limitaciones:

- Sin **coverage** (no hay `@vitest/coverage-v8`) y sin umbrales automáticos;
  los umbrales de la constitución (statsCalculator, validator, importadores) se
  medirán en P6-03/P6-05.
- Sin **E2E** ni emulación táctil/navegador: jsdom no pinta ni mide layout.
- `PointerEvent`, `matchMedia` y `ResizeObserver` son stubs: no reproducen
  comportamiento real de puntero/ventana.
- `audit-selectors` no contó las clases usadas en `src/test` ni en los tests
  como consumidores nuevos: los contadores no cambian.
