import type { MoleculeCollection } from './types.ts';

/**
 * Cyclopropanone through cyclooctanone. The small rings force the carbonyl
 * carbon away from its preferred sp² geometry, the C=O stretch has to change
 * the ring bond lengths much more, and the effective force constant — so the
 * wavenumber — rises sharply as the ring shrinks.
 *
 * The six rings differ by exactly one CH₂, so their atom counts must step by
 * three; `collections.test.ts` checks that, and checks cyclopentanone's
 * structure explicitly, because a copy of another collection's molecule in
 * this slot would still parse and still run.
 */
export const RING_STRAIN: MoleculeCollection = {
  id: 'ring-strain',
  name: 'Ring strain',
  explanation:
    'Use the carbonyl stretching frequency as probe for ring strain. How do you expect the carbonyl frequency to change for increasing ring size?',
  entries: [
    {
      id: 'cyclopropanone',
      name: 'cyclopropanone',
      idCode: 'gBQ@@drsT@@',
      smiles: 'O=C1CC1',
      formula: 'C3H4O',
      atoms: 8,
      charge: 0,
    },
    {
      id: 'cyclobutanone',
      name: 'cyclobutanone',
      idCode: 'gKQ@@dsbuP@',
      smiles: 'O=C1CCC1',
      formula: 'C4H6O',
      atoms: 11,
      charge: 0,
    },
    {
      id: 'cyclopentanone',
      name: 'cyclopentanone',
      idCode: 'gFq@@drfmU@@',
      smiles: 'O=C1CCCC1',
      formula: 'C5H8O',
      atoms: 14,
      charge: 0,
    },
    {
      id: 'cyclohexanone',
      name: 'cyclohexanone',
      idCode: 'gOq@@drm[UT@@',
      smiles: 'O=C1CCCCC1',
      formula: 'C6H10O',
      atoms: 17,
      charge: 0,
    },
    {
      id: 'cycloheptanone',
      name: 'cycloheptanone',
      idCode: 'daDH@@RYU[fjj@@',
      smiles: 'O=C1CCCCCC1',
      formula: 'C7H12O',
      atoms: 20,
      charge: 0,
    },
    {
      id: 'cyclooctanone',
      name: 'cyclooctanone',
      idCode: 'didH@@RYU^Ejjh@@',
      smiles: 'O=C1CCCCCCC1',
      formula: 'C8H14O',
      atoms: 23,
      charge: 0,
    },
  ],
};
