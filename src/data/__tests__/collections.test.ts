import { expect, test } from 'vitest';

import type { CollectionEntry } from '../collections.ts';
import {
  COLLECTIONS,
  findCollection,
  findCollectionEntry,
  isExpensiveEntry,
} from '../collections.ts';

/** The seven collections, in the order the picker lists them. */
const EXPECTED_COLLECTIONS: ReadonlyArray<readonly [string, string, number]> = [
  ['directing-groups', 'Directing groups', 7],
  ['inductive-mesomeric-effect', 'Inductive / mesomeric effect', 6],
  ['mesomeric-effect', 'Mesomeric effect', 3],
  ['gross-selection-rule', 'Gross selection rule', 6],
  ['ring-strain', 'Ring strain', 6],
  ['steric-effect', 'Steric effect', 4],
  ['theory-vs-experiment', 'Theory vs. experiment', 4],
];

function allEntries(): CollectionEntry[] {
  const entries: CollectionEntry[] = [];
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) entries.push(entry);
  }
  return entries;
}

test('the seven collections keep their order, names and sizes', () => {
  const actual: Array<readonly [string, string, number]> = [];
  for (const collection of COLLECTIONS) {
    actual.push([collection.id, collection.name, collection.entries.length]);
  }
  expect(actual).toStrictEqual(EXPECTED_COLLECTIONS);
  expect(allEntries()).toHaveLength(36);
});

test('the ring-strain series grows by one CH2 per step', () => {
  const ringStrain = findCollection('ring-strain');
  const ids: string[] = [];
  const atoms: number[] = [];
  for (const entry of ringStrain?.entries ?? []) {
    ids.push(entry.id);
    atoms.push(entry.atoms);
  }
  expect(ids).toStrictEqual([
    'cyclopropanone',
    'cyclobutanone',
    'cyclopentanone',
    'cyclohexanone',
    'cycloheptanone',
    'cyclooctanone',
  ]);
  expect(atoms).toStrictEqual([8, 11, 14, 17, 20, 23]);
  for (let i = 1; i < atoms.length; i++) {
    const previous = atoms[i - 1] ?? 0;
    const current = atoms[i] ?? 0;
    expect(current - previous).toBe(3);
  }
});

test('cyclopentanone is cyclopentanone, C5H8O, and not a copied neighbour', () => {
  expect(findCollectionEntry('ring-strain', 'cyclopentanone')).toStrictEqual({
    id: 'cyclopentanone',
    name: 'cyclopentanone',
    idCode: 'gFq@@drfmU@@',
    smiles: 'O=C1CCCC1',
    formula: 'C5H8O',
    atoms: 14,
    charge: 0,
  });
});

test('the four SDBS wavenumbers are the only experimental values, and none is left in a name', () => {
  const measured: Array<readonly [string, number]> = [];
  for (const entry of allEntries()) {
    if (entry.experimentalWavenumber !== undefined) {
      measured.push([entry.id, entry.experimentalWavenumber]);
    }
    expect(entry.name).not.toMatch(/\d{4}|cm/);
  }
  expect(measured).toStrictEqual([
    ['benzamide', 1661],
    ['salicylic-acid', 1662],
    ['methyl-2-methylbenzoate', 1737],
    ['dimethylbenzamide', 1626],
  ]);
});

test('ids are unique globally and idCodes unique within a collection', () => {
  const ids = new Set<string>();
  for (const collection of COLLECTIONS) {
    const idCodes = new Set<string>();
    for (const entry of collection.entries) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
      expect(idCodes.has(entry.idCode)).toBe(false);
      idCodes.add(entry.idCode);
    }
    expect(idCodes.size).toBe(collection.entries.length);
  }
  expect(ids.size).toBe(36);
});

test('explanations are the plain-text originals, with no markup left', () => {
  expect(findCollection('steric-effect')?.explanation).toBe(
    'Steric crowding can change the geometry of a molecule. This can have an impact on the strength of the mesomeric effect.\n\nWe can probe the strength of this effect using the carbonyl stretching frequency.',
  );
  expect(findCollection('theory-vs-experiment')?.explanation).toBe(
    'Clearly, also theory has its limitations. You can use this collection to explore some of the limitations.\n\nExperimental shifts taken from the SDBS database.',
  );
  for (const collection of COLLECTIONS) {
    expect(collection.explanation).not.toMatch(/<|&nbsp;/);
  }
});

test('lookups resolve known ids and reject unknown ones', () => {
  expect(findCollection('gross-selection-rule')?.name).toBe(
    'Gross selection rule',
  );
  expect(findCollection('no-such-collection')).toBeNull();
  expect(findCollectionEntry('gross-selection-rule', 'nitrogen')?.formula).toBe(
    'N2',
  );
  expect(
    findCollectionEntry('gross-selection-rule', 'benzaldehyde'),
  ).toBeNull();
  expect(findCollectionEntry('no-such-collection', 'nitrogen')).toBeNull();
});

test('only entries above the interactive limit are reported expensive', () => {
  const water = findCollectionEntry('gross-selection-rule', 'water');
  const triphenyl = findCollectionEntry(
    'steric-effect',
    'triphenyldimethylhex-4-en-3-one',
  );
  expect(water === null ? null : isExpensiveEntry(water)).toBe(false);
  expect(triphenyl === null ? null : isExpensiveEntry(triphenyl)).toBe(true);
});
