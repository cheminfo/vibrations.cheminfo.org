import { SiteMark } from 'react-cheminfo/ui';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SITE } from '../../site.ts';
import { siteGlyph } from '../siteGlyph.tsx';

// A file served on its own cannot read the page's custom properties, so the
// favicon is the mark in literal colours. `vitest -u` rewrites it.
test('the favicon is the site mark drawn in literal colours', async () => {
  const mark = renderToStaticMarkup(
    <SiteMark site={SITE} glyph={siteGlyph} size={32} colors="literal" />,
  );
  const favicon = `${mark.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')}\n`;

  await expect(favicon).toMatchFileSnapshot('../../../public/favicon.svg');
});
