import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { COLLECTIONS } from '../collections.ts';

/**
 * Display name and an independent reading of that name as SMILES, for all 36
 * entries. The idCode each one implies is recomputed here, so an entry whose
 * structure does not match the molecule its name promises fails — the failure
 * mode that actually happened on the live site, where cyclopentanone carried a
 * perfectly self-consistent C8H14O enone.
 */
const NAMED_STRUCTURE: Readonly<Record<string, readonly [string, string]>> = {
  benzaldehyde: ['benzaldehyde', 'O=Cc1ccccc1'],
  'o-methoxybenzaldehyde': ['o-methoxybenzaldehyde', 'COc1ccccc1C=O'],
  'm-methoxybenzaldehyde': ['m-methoxybenzaldehyde', 'COc1cccc(C=O)c1'],
  'p-methoxybenzaldehyde': ['p-methoxybenzaldehyde', 'COc1ccc(C=O)cc1'],
  'o-nitrobenzaldehyde': ['o-nitrobenzaldehyde', 'O=Cc1ccccc1[N+]([O-])=O'],
  'm-nitrobenzaldehyde': ['m-nitrobenzaldehyde', 'O=Cc1cccc([N+]([O-])=O)c1'],
  'p-nitrobenzaldehyde': ['p-nitrobenzaldehyde', 'O=Cc1ccc([N+]([O-])=O)cc1'],
  'acetyl-fluoride': ['acetyl fluoride', 'CC(F)=O'],
  'acetyl-chloride': ['acetyl chloride', 'CC(Cl)=O'],
  acetone: ['acetone', 'CC(C)=O'],
  acetaldehyde: ['acetaldehyde', 'CC=O'],
  'methyl-acetate': ['methyl acetate', 'COC(C)=O'],
  dimethylacetamide: ['N,N-dimethylacetamide', 'CN(C)C(C)=O'],
  'pentan-3-one': ['pentan-3-one', 'CCC(=O)CC'],
  'pent-1-en-3-one': ['pent-1-en-3-one', 'C=CC(=O)CC'],
  'penta-1-4-dien-3-one': ['penta-1,4-dien-3-one', 'C=CC(=O)C=C'],
  'carbon-dioxide': ['carbon dioxide', 'O=C=O'],
  water: ['water', 'O'],
  'carbonyl-sulfide': ['carbonyl sulfide', 'O=C=S'],
  nitrogen: ['nitrogen', 'N#N'],
  methane: ['methane', 'C'],
  bromochlorofluoroiodomethane: ['bromochlorofluoroiodomethane', 'FC(Cl)(Br)I'],
  cyclopropanone: ['cyclopropanone', 'O=C1CC1'],
  cyclobutanone: ['cyclobutanone', 'O=C1CCC1'],
  cyclopentanone: ['cyclopentanone', 'O=C1CCCC1'],
  cyclohexanone: ['cyclohexanone', 'O=C1CCCCC1'],
  cycloheptanone: ['cycloheptanone', 'O=C1CCCCCC1'],
  cyclooctanone: ['cyclooctanone', 'O=C1CCCCCCC1'],
  'dimethylhex-4-en-3-one': [
    '(Z)-2,2-dimethylhex-4-en-3-one',
    String.raw`CC(C)(C)C(=O)/C=C\C`,
  ],
  'tetramethylhept-4-en-3-one': [
    '(Z)-2,2,6,6-tetramethylhept-4-en-3-one',
    String.raw`CC(C)(C)C(=O)/C=C\C(C)(C)C`,
  ],
  'trichlorodimethylhex-4-en-3-one': [
    '(Z)-6,6,6-trichloro-2,2-dimethylhex-4-en-3-one',
    String.raw`CC(C)(C)C(=O)/C=C\C(Cl)(Cl)Cl`,
  ],
  'triphenyldimethylhex-4-en-3-one': [
    '(Z)-2,2-dimethyl-6,6,6-triphenylhex-4-en-3-one',
    String.raw`CC(C)(C)C(=O)/C=C\C(c1ccccc1)(c1ccccc1)c1ccccc1`,
  ],
  benzamide: ['benzamide', 'NC(=O)c1ccccc1'],
  'salicylic-acid': ['salicylic acid', 'OC(=O)c1ccccc1O'],
  'methyl-2-methylbenzoate': ['methyl 2-methylbenzoate', 'COC(=O)c1ccccc1C'],
  dimethylbenzamide: ['N,N-dimethylbenzamide', 'CN(C)C(=O)c1ccccc1'],
};

test('every entry holds the molecule its display name promises', () => {
  const actual: Array<readonly [string, string, string]> = [];
  const expected: Array<readonly [string, string, string]> = [];
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) {
      const reference = NAMED_STRUCTURE[entry.id];
      if (reference === undefined) {
        throw new Error(`no reference structure for entry ${entry.id}`);
      }
      actual.push([entry.id, entry.name, entry.idCode]);
      expected.push([
        entry.id,
        reference[0],
        Molecule.fromSmiles(reference[1]).getIDCode(),
      ]);
    }
  }
  expect(actual).toStrictEqual(expected);
  expect(actual).toHaveLength(36);
}, 30_000);

test('no molecule appears twice across the seven collections', () => {
  const owner = new Map<string, string>();
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) {
      expect(owner.get(entry.idCode)).toBeUndefined();
      owner.set(entry.idCode, `${collection.id}/${entry.id}`);
    }
  }
  expect(owner.size).toBe(36);
});
