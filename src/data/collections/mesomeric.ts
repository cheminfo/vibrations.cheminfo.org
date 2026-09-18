import type { MoleculeCollection } from './types.ts';

/**
 * Pentan-3-one, then one and two vinyl groups on the same carbonyl. Each
 * conjugated double bond delocalizes the C=O π system further, lowers the bond
 * order and moves the stretch down.
 */
export const MESOMERIC: MoleculeCollection = {
  id: 'mesomeric-effect',
  name: 'Mesomeric effect',
  explanation:
    'Using the carbonyl stretching frequency as probe for the mesomeric effect',
  entries: [
    {
      id: 'pentan-3-one',
      name: 'pentan-3-one',
      idCode: 'gGQ@@drmT@@',
      smiles: 'CCC(CC)=O',
      formula: 'C5H10O',
      atoms: 16,
      charge: 0,
    },
    {
      id: 'pent-1-en-3-one',
      name: 'pent-1-en-3-one',
      idCode: 'gGQ@@drmL@@',
      smiles: 'CCC(C=C)=O',
      formula: 'C5H8O',
      atoms: 14,
      charge: 0,
    },
    {
      id: 'penta-1-4-dien-3-one',
      name: 'penta-1,4-dien-3-one',
      idCode: 'gGQ@@drmJ@@',
      smiles: 'C=CC(C=C)=O',
      formula: 'C5H6O',
      atoms: 12,
      charge: 0,
    },
  ],
};
