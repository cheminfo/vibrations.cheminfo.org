import { expect, test } from 'vitest';
import type { Molecule, MoleculeSource } from 'xtb-wasm';
import { DEFAULT_OUTPUTS, DEFAULT_SETTINGS } from 'xtb-wasm';

import { RING_STRAIN } from '../../../data/collections/index.ts';
import type { ResultEntry } from '../../../state/index.ts';
import { findEntryResult, pendingEntries } from '../entryStatus.ts';

function molecule(source: MoleculeSource): Molecule {
  return {
    id: `molecule-${JSON.stringify(source)}`,
    label: 'test',
    formula: 'C3H4O',
    source,
    charge: 0,
    unpairedElectrons: 0,
    elements: ['O'],
    coordinates: new Float64Array(3),
  };
}

function entry(id: string, source: MoleculeSource): ResultEntry {
  const built = molecule(source);
  return {
    id,
    molecule: built,
    color: '#C10020',
    visible: true,
    completedAt: 0,
    result: {
      id,
      engineId: 'occjs',
      request: {
        molecule: built,
        settings: DEFAULT_SETTINGS,
        outputs: DEFAULT_OUTPUTS,
      },
      geometry: { elements: built.elements, coordinates: built.coordinates },
      energy: {
        total: -1,
        scc: null,
        repulsion: null,
        dispersion: null,
      },
      modes: [],
      imaginaryCount: 0,
      thermochemistry: null,
      timings: { optimize: 0, hessian: 0, analyse: 0, total: 0 },
      warnings: [],
    },
  };
}

const collectionSource = (entryId: string): MoleculeSource => ({
  kind: 'collection',
  collectionId: 'ring-strain',
  entryId,
});

test('findEntryResult matches on provenance, not on the molecule id', () => {
  const results = [
    entry('a', { kind: 'smiles', smiles: 'O=C1CC1', seed: 42 }),
    entry('b', collectionSource('cyclobutanone')),
  ];
  expect(findEntryResult(results, 'ring-strain', 'cyclobutanone')?.id).toBe(
    'b',
  );
  expect(findEntryResult(results, 'ring-strain', 'cyclopropanone')).toBe(null);
  expect(findEntryResult(results, 'steric-effect', 'cyclobutanone')).toBe(null);
});

test('findEntryResult returns the most recent run of the same entry', () => {
  const results = [
    entry('old', collectionSource('cyclohexanone')),
    entry('new', collectionSource('cyclohexanone')),
  ];
  expect(findEntryResult(results, 'ring-strain', 'cyclohexanone')?.id).toBe(
    'new',
  );
});

test('pendingEntries lists only what has no result yet, in collection order', () => {
  const results = [
    entry('b', collectionSource('cyclobutanone')),
    entry('h', collectionSource('cyclohexanone')),
  ];
  const pending = pendingEntries(RING_STRAIN.entries, results, 'ring-strain');
  expect(pending.map((item) => item.id)).toStrictEqual([
    'cyclopropanone',
    'cyclopentanone',
    'cycloheptanone',
    'cyclooctanone',
  ]);
  expect(pendingEntries(RING_STRAIN.entries, [], 'ring-strain')).toHaveLength(
    6,
  );
});
