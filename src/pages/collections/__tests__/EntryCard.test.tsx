import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { CollectionEntry } from '../../../data/index.ts';
import type { ResultEntry } from '../../../state/index.ts';
import { makeEntry, makeMode } from '../../calculator/__tests__/makeEntry.ts';
import { EntryCard } from '../EntryCard.tsx';
import type { BandProbe } from '../keyBand.ts';
import { CARBONYL_PROBE } from '../keyBand.ts';

const ENTRY: CollectionEntry = {
  id: 'propanone',
  name: 'propanone',
  idCode: 'gFp@DiTt7Fh@',
  smiles: 'CC(C)=O',
  formula: 'C3H6O',
  atoms: 10,
  charge: 0,
  experimentalWavenumber: 1715,
};

/** Water carries no carbonyl, and its bend lands inside the carbonyl window. */
const WATER: CollectionEntry = {
  id: 'water',
  name: 'water',
  idCode: 'fI@@',
  smiles: 'O',
  formula: 'H2O',
  atoms: 3,
  charge: 0,
};

function markup(
  entry: CollectionEntry,
  result: ResultEntry | null,
  probe: BandProbe | undefined,
) {
  return renderToStaticMarkup(
    <EntryCard
      entry={entry}
      status="idle"
      result={result}
      failure={null}
      probe={probe}
      onRun={() => undefined}
      onInspect={() => undefined}
      onToggleVisible={() => undefined}
    />,
  );
}

test('the structure, the name and the formula of an entry are copyable', () => {
  const html = markup(ENTRY, null, CARBONYL_PROBE);
  expect(html).toContain('title="Copy the SMILES (CC(C)=O)"');
  expect(html).toContain('title="Copy the name (propanone)"');
  expect(html).toContain('title="Copy the molecular formula (C3H6O)"');
});

test('a computed band is copied without its unit, named after the probe', () => {
  const html = markup(
    ENTRY,
    makeEntry('propanone', [makeMode(1786.4, 312.57, null)]),
    CARBONYL_PROBE,
  );
  expect(html).toContain('1786 cm⁻¹');
  expect(html).toContain(
    'title="Copy the C=O stretch wavenumber in cm⁻¹ (1786)"',
  );
});

test('a collection with no probe band names no band on its cards', () => {
  const html = markup(
    WATER,
    makeEntry('water', [makeMode(1538.9, 61.4, null)]),
    undefined,
  );
  expect(html).not.toContain('C=O stretch');
  expect(html).not.toContain('1539');
  expect(html).not.toContain('cm⁻¹');
});

test('the card buttons are never wrapped in a copy target', () => {
  const html = markup(ENTRY, null, CARBONYL_PROBE);
  expect(html).not.toMatch(/class="click-to-copy[^"]*"[^>]*>\s*<button/);
});
