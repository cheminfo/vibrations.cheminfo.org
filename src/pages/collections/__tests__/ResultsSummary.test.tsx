import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { Molecule, VibrationalMode } from 'xtb-wasm';
import { DEFAULT_OUTPUTS, DEFAULT_SETTINGS } from 'xtb-wasm';

import type { MoleculeCollection } from '../../../data/index.ts';
import { makeMode } from '../../../spectra/__tests__/makeMode.ts';
import type { ResultEntry } from '../../../state/index.ts';
import { ResultsSummary } from '../ResultsSummary.tsx';

const COLLECTION: MoleculeCollection = {
  id: 'mesomeric-effect',
  name: 'Mesomeric effect',
  explanation: 'A donor on the carbonyl lowers the C=O stretch.',
  entries: [
    {
      id: 'propanone',
      name: 'propanone',
      idCode: 'gFp@DiTt7Fh@',
      smiles: 'CC(C)=O',
      formula: 'C3H6O',
      atoms: 10,
      charge: 0,
      experimentalWavenumber: 1715,
    },
    {
      id: 'acetamide',
      name: 'acetamide',
      idCode: 'gGY@DiTt7VCB',
      smiles: 'CC(N)=O',
      formula: 'C2H5NO',
      atoms: 9,
      charge: 0,
    },
  ],
};

function entry(
  entryId: string,
  modes: readonly VibrationalMode[],
): ResultEntry {
  const molecule: Molecule = {
    id: entryId,
    label: entryId,
    formula: 'C3H6O',
    source: {
      kind: 'collection',
      collectionId: COLLECTION.id,
      entryId,
    },
    charge: 0,
    unpairedElectrons: 0,
    elements: ['O'],
    coordinates: new Float64Array(3),
  };
  return {
    id: entryId,
    molecule,
    color: '#0072b2',
    visible: true,
    completedAt: 0,
    result: {
      id: entryId,
      engineId: 'occjs',
      request: {
        molecule,
        settings: DEFAULT_SETTINGS,
        outputs: DEFAULT_OUTPUTS,
      },
      geometry: {
        elements: molecule.elements,
        coordinates: new Float64Array(3),
      },
      energy: { total: -5, scc: null, repulsion: null, dispersion: null },
      modes: [...modes],
      imaginaryCount: 0,
      thermochemistry: null,
      timings: { optimize: 1, hessian: 2, analyse: 3, total: 6 },
      warnings: [],
    },
  };
}

function markup() {
  const results = [
    entry('propanone', [makeMode(1786.4, 312.57, null)]),
    entry('acetamide', [makeMode(1737.8, 401.2, null)]),
  ];
  return renderToStaticMarkup(
    <ResultsSummary collection={COLLECTION} results={results} />,
  );
}

test('every number of the trend table is copied without its unit', () => {
  const html = markup();
  expect(html).toContain('title="Copy the C=O stretch in cm⁻¹ (1786)"');
  expect(html).toContain('title="Copy the IR intensity in km/mol (312.6)"');
  expect(html).toContain(
    'title="Copy the experimental wavenumber in cm⁻¹ (1715)"',
  );
  expect(html).toContain('title="Copy the computed − experiment in cm⁻¹ (71)"');
  expect(html).toContain('title="Copy the shift vs. propanone in cm⁻¹ (-49)"');
});

test('a cell the collection has no number for is drawn plain', () => {
  const html = markup();
  expect(html).not.toContain(
    'title="Copy the experimental wavenumber in cm⁻¹ ()"',
  );
  const dashes = html.match(/<td[^>]*>—<\/td>/g) ?? [];
  expect(dashes).toHaveLength(2);
});

test('the reading columns are shown but not offered as values', () => {
  const html = markup();
  expect(html).toContain('<td>propanone</td>');
  expect(html).toContain('<td>acetamide</td>');
  expect(html).not.toContain('title="Copy the name');
});
