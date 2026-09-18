import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { COLLECTIONS, INTERACTIVE_ATOM_LIMIT } from '../collections.ts';

/**
 * Identity of all 36 entries, written out here rather than derived from the
 * data file, so an edit to one field cannot silently drift from the rest.
 */
const EXPECTED_IDENTITY: ReadonlyArray<readonly [string, string, number]> = [
  ['benzaldehyde', 'C7H6O', 14],
  ['o-methoxybenzaldehyde', 'C8H8O2', 18],
  ['m-methoxybenzaldehyde', 'C8H8O2', 18],
  ['p-methoxybenzaldehyde', 'C8H8O2', 18],
  ['o-nitrobenzaldehyde', 'C7H5NO3', 16],
  ['m-nitrobenzaldehyde', 'C7H5NO3', 16],
  ['p-nitrobenzaldehyde', 'C7H5NO3', 16],
  ['acetyl-fluoride', 'C2H3OF', 7],
  ['acetyl-chloride', 'C2H3OCl', 7],
  ['acetone', 'C3H6O', 10],
  ['acetaldehyde', 'C2H4O', 7],
  ['methyl-acetate', 'C3H6O2', 11],
  ['dimethylacetamide', 'C4H9NO', 15],
  ['pentan-3-one', 'C5H10O', 16],
  ['pent-1-en-3-one', 'C5H8O', 14],
  ['penta-1-4-dien-3-one', 'C5H6O', 12],
  ['carbon-dioxide', 'CO2', 3],
  ['water', 'H2O', 3],
  ['carbonyl-sulfide', 'COS', 3],
  ['nitrogen', 'N2', 2],
  ['methane', 'CH4', 5],
  ['bromochlorofluoroiodomethane', 'CBrClFI', 5],
  ['cyclopropanone', 'C3H4O', 8],
  ['cyclobutanone', 'C4H6O', 11],
  ['cyclopentanone', 'C5H8O', 14],
  ['cyclohexanone', 'C6H10O', 17],
  ['cycloheptanone', 'C7H12O', 20],
  ['cyclooctanone', 'C8H14O', 23],
  ['dimethylhex-4-en-3-one', 'C8H14O', 23],
  ['tetramethylhept-4-en-3-one', 'C11H20O', 32],
  ['trichlorodimethylhex-4-en-3-one', 'C8H11OCl3', 23],
  ['triphenyldimethylhex-4-en-3-one', 'C26H26O', 53],
  ['benzamide', 'C7H7NO', 16],
  ['salicylic-acid', 'C7H6O3', 16],
  ['methyl-2-methylbenzoate', 'C9H10O2', 21],
  ['dimethylbenzamide', 'C9H11NO', 22],
];

test('the 36 entries keep their recorded formula and atom count', () => {
  const actual: Array<readonly [string, string, number]> = [];
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) {
      actual.push([entry.id, entry.formula, entry.atoms]);
    }
  }
  expect(actual).toStrictEqual(EXPECTED_IDENTITY);
});

test('every idCode round-trips to the recorded formula, atoms, charge and SMILES', () => {
  const derived: unknown[] = [];
  const recorded: unknown[] = [];
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) {
      const molecule = Molecule.fromIDCode(entry.idCode);
      molecule.addImplicitHydrogens();
      const atoms = molecule.getAllAtoms();
      let charge = 0;
      for (let atom = 0; atom < atoms; atom++) {
        charge += molecule.getAtomCharge(atom);
      }
      derived.push({
        id: entry.id,
        formula: molecule.getMolecularFormula().formula,
        atoms,
        charge,
        smiles: molecule.toIsomericSmiles(),
      });
      recorded.push({
        id: entry.id,
        formula: entry.formula,
        atoms: entry.atoms,
        charge: entry.charge,
        smiles: entry.smiles,
      });
    }
  }
  expect(derived).toStrictEqual(recorded);
}, 30_000);

test('only the two largest steric entries are past the interactive atom limit', () => {
  expect(INTERACTIVE_ATOM_LIMIT).toBe(30);
  const expensive: string[] = [];
  for (const collection of COLLECTIONS) {
    for (const entry of collection.entries) {
      if (entry.atoms > INTERACTIVE_ATOM_LIMIT) expensive.push(entry.id);
    }
  }
  expect(expensive).toStrictEqual([
    'tetramethylhept-4-en-3-one',
    'triphenyldimethylhex-4-en-3-one',
  ]);
});
