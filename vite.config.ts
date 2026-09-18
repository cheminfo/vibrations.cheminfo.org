import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Derived from the site's creation date, 2026-09-18: last digit of the year,
 * month, day gives 60918, which is above 60000 and so becomes 10918. The dev
 * server is PORT + 1, and strictPort so a second checkout fails loudly instead
 * of landing somewhere the proxy and the README do not agree with.
 */
const DEV_PORT = 10_919;

export default defineConfig({
  plugins: [react()],
  resolve: {
    // A linked xtb-wasm carries its own node_modules; two openchemlib copies
    // mean two Molecule classes, and the atom indices the bond-to-mode
    // highlighting depends on stop being comparable across the boundary.
    dedupe: ['openchemlib'],
  },
  server: {
    port: DEV_PORT,
    strictPort: true,
  },
  optimizeDeps: {
    // Both packages locate their WebAssembly next to an ESM entry point and
    // resolve it from import.meta.url; pre-bundling rewrites that and the wasm
    // stops loading. xtb-wasm also spawns its worker through a `new URL`, which
    // only survives if the package is served as source.
    exclude: ['@peterspackman/occjs', 'xtb-wasm'],
  },
  worker: { format: 'es' },
  build: { target: 'es2022' },

  preview: { port: DEV_PORT, strictPort: true },
});
