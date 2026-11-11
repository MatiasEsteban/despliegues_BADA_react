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
