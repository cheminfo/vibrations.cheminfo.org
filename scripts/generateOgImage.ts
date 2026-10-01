/**
 * Draw `public/og.png`, the card a link to the site unfurls into.
 *
 * Run with `npm run og-image`. The card is drawn from the site's own record and
 * its own glyph — the same two the header and the favicon are drawn from — so
 * it is regenerated rather than hand-edited: a mark that changes must not leave
 * a card showing the old one.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import { OG_HEIGHT, OG_WIDTH, ogCardHtml } from 'react-cheminfo/vite';
import { createServer } from 'vite';

import type * as SiteGlyph from '../src/shared/siteGlyph.tsx';
import { SITE } from '../src/site.ts';

// The glyph is drawn in JSX, which Node strips no types from and cannot parse,
// so it is loaded through vite rather than copied into this file — a second
// drawing of the mark is a drawing that drifts from the one the site shows.
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
});
const { siteGlyph } = (await server.ssrLoadModule(
  '/src/shared/siteGlyph.tsx',
)) as typeof SiteGlyph;
await server.close();

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: OG_WIDTH, height: OG_HEIGHT },
});
// The site writes its own record and its own glyph: the family's mark set holds
// neither, because no other site of the family links here.
await page.setContent(await ogCardHtml({ site: SITE, glyph: siteGlyph }), {
  waitUntil: 'load',
});
const png = await page.screenshot({ type: 'png' });
await browser.close();

const target = join(import.meta.dirname, '..', 'public', 'og.png');
writeFileSync(target, png);
process.stdout.write(`${target} written (${OG_WIDTH}×${OG_HEIGHT})\n`);
