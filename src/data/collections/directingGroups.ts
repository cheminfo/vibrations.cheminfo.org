import type { MoleculeCollection } from './types.ts';

/**
 * Benzaldehyde against its ortho/meta/para methoxy and nitro derivatives. The
 * methoxy group donates into the ring by resonance and the nitro group
 * withdraws, so the carbonyl stretch moves in opposite directions — and the
 * ortho isomers show that the position matters as much as the group.
 */
export const DIRECTING_GROUPS: MoleculeCollection = {
  id: 'directing-groups',
  name: 'Directing groups',
  explanation:
    'Using the carbonyl stretching frequency as probe for the directing effect of substituents on aromatic rings',
  entries: [
    {
      id: 'benzaldehyde',
      name: 'benzaldehyde',
      idCode: 'daDH@@RVU[f@@@@',
      smiles: 'O=Cc1ccccc1',
      formula: 'C7H6O',
      atoms: 14,
      charge: 0,
    },
    {
      id: 'o-methoxybenzaldehyde',
      name: 'o-methoxybenzaldehyde',
      idCode: 'deTD@@iIYe^e```@@',
      smiles: 'COc1c(C=O)cccc1',
      formula: 'C8H8O2',
      atoms: 18,
      charge: 0,
    },
    {
      id: 'm-methoxybenzaldehyde',
      name: 'm-methoxybenzaldehyde',
      idCode: 'deTD@@yIYVvE`BH@@',
      smiles: 'COc1cccc(C=O)c1',
      formula: 'C8H8O2',
      atoms: 18,
      charge: 0,
    },
    {
      id: 'p-methoxybenzaldehyde',
      name: 'p-methoxybenzaldehyde',
      idCode: 'deTD@@EIYWVy`@h@@',
      smiles: 'COc1ccc(C=O)cc1',
      formula: 'C8H8O2',
      atoms: 18,
      charge: 0,
    },
    {
      id: 'o-nitrobenzaldehyde',
      name: 'o-nitrobenzaldehyde',
      idCode: 'dmvLAHAEbTyInYTYZ@`P@@',
      smiles: '[O-][N+](c1c(C=O)cccc1)=O',
      formula: 'C7H5NO3',
      atoms: 16,
      charge: 0,
    },
    {
      id: 'm-nitrobenzaldehyde',
      name: 'm-nitrobenzaldehyde',
      idCode: 'dmvLAHAEbT{Hihdh^Eh@I@@',
      smiles: '[O-][N+](c1cc(C=O)ccc1)=O',
      formula: 'C7H5NO3',
      atoms: 16,
      charge: 0,
    },
    {
      id: 'p-nitrobenzaldehyde',
      name: 'p-nitrobenzaldehyde',
      idCode: 'dmvLAHAEbTyInUwaZ@BP@@',
      smiles: '[O-][N+](c1ccc(C=O)cc1)=O',
      formula: 'C7H5NO3',
      atoms: 16,
      charge: 0,
    },
  ],
};
