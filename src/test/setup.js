import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

// Matcher `toHaveNoViolations` para las pruebas de accesibilidad (T-10/T-12).
expect.extend(toHaveNoViolations);

// jsdom no implementa `window.matchMedia`. El tema de la app se resuelve con
// `localStorage` + `data-theme`, pero componentes de terceros o futuros checks
// de `prefers-color-scheme` lo consultan: se instala un stub funcional.
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

// jsdom tampoco implementa `ResizeObserver`; algunos componentes lo usan para
// medir contenedores. Stub sin comportamiento (no-op) para evitar ReferenceError.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.ResizeObserver = ResizeObserverStub;
  globalThis.ResizeObserver = ResizeObserverStub;
}

// Exportado para que los tests puedan invocarlo sin volver a importar jest-axe
// por cada archivo (los tests también pueden importarlo directamente).
export { axe };
