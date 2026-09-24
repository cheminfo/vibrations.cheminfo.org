import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { MoleculeCollection } from '../../../data/index.ts';
import { COLLECTION_THEORY, findCollection } from '../../../data/index.ts';
import { CollectionHeader } from '../CollectionHeader.tsx';

const COLLECTION = findCollection('mesomeric-effect') as MoleculeCollection;

test('the explanation and the theory paragraph are quotable', () => {
  const html = renderToStaticMarkup(
    <CollectionHeader collection={COLLECTION} />,
  );
  const selectable = [...html.matchAll(/<p class="(?<classes>[^"]*)"/g)].map(
    (match) => match.groups?.classes as string,
  );
  expect(selectable).toHaveLength(2);
  for (const classes of selectable) {
    expect(classes).toContain('text-selectable');
  }
  expect(html).toContain(COLLECTION.explanation);
  expect(html).toContain(COLLECTION_THEORY['mesomeric-effect'] as string);
});

test('the title row, the tags and the cost callout stay chrome', () => {
  const html = renderToStaticMarkup(
    <CollectionHeader collection={COLLECTION} />,
  );
  const chrome = html.slice(0, html.indexOf('<p class='));
  expect(chrome).toContain('Mesomeric effect');
  expect(chrome).toContain('3 molecules');
  expect(chrome).not.toContain('text-selectable');
});
