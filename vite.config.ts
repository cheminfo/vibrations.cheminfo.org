import react from '@vitejs/plugin-react';
import { cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { NOSCRIPT_ROUTES, PAGE_ROUTES } from './src/seo/routes.ts';
import { SITE, SITE_URL } from './src/site.ts';

/**
 * Derived from the site's creation date, 2026-09-18: last digit of the year,
 * month, day gives 60918, which is above 60000 and so becomes 10918. The dev
 * server is PORT + 1, and strictPort so a second checkout fails loudly instead
 * of landing somewhere the proxy and the README do not agree with.
 */
const DEV_PORT = 10_919;

export default defineConfig({
  plugins: [
    react(),
    // One real HTML file per address, plus the sitemap, robots.txt and the
    // structured data. A static image has nothing to rewrite a head per
    // request, so without this every address carries the same title and a
    // search engine folds the whole site into one result.
    cheminfoPrerender({
      // The site writes its own record: it is deliberately not one of the
      // cheminfo family, so there is no id to name here.
      site: SITE,
      routes: PAGE_ROUTES,
      origin: SITE_URL,
      description:
        'Draw a molecule and compute its infrared and Raman spectrum with GFN2-xTB in your own browser: frequencies, intensities, normal modes in 3D and the thermochemistry.',
      noscript: {
        heading:
          'vibrations.cheminfo.org — IR and Raman spectra in your browser',
        intro:
          'Draw or paste a structure and a GFN2-xTB geometry optimization, Hessian, normal modes, intensities and thermochemistry run on your own machine; nothing is uploaded. The tool needs JavaScript; these are the pages it offers:',
        // No ecosystem list: no other site of the family links here, and this
        // one links to none of them.
        routes: NOSCRIPT_ROUTES,
      },
    }),
  ],
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
