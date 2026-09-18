import type { MoleculeCollection } from './types.ts';

/**
 * A (Z)-enone with a tert-butyl group on the carbonyl and a growing substituent
 * at the far end of the C=C. Bulk at that end twists the alkene out of the
 * carbonyl plane, the π systems overlap less, the mesomeric donation that was
 * lowering the C=O weakens, and the stretch moves back up.
 *
 * The trichloro member is sterically close to a tert-butyl group but strongly
 * electron-withdrawing, so it changes the electronics as well as the geometry —
 * read it as a control rather than as another step of the same trend.
 */
export const STERIC_EFFECT: MoleculeCollection = {
  id: 'steric-effect',
  name: 'Steric effect',
  explanation:
    'Steric crowding can change the geometry of a molecule. This can have an impact on the strength of the mesomeric effect.\n\nWe can probe the strength of this effect using the carbonyl stretching frequency.',
  entries: [
    {
      id: 'dimethylhex-4-en-3-one',
      name: '(Z)-2,2-dimethylhex-4-en-3-one',
      idCode: 'diDH@@RYZVfjBLP',
      smiles: String.raw`CC(C)(C)C(/C=C\C)=O`,
      formula: 'C8H14O',
      atoms: 23,
      charge: 0,
    },
    {
      id: 'tetramethylhept-4-en-3-one',
      name: '(Z)-2,2,6,6-tetramethylhept-4-en-3-one',
      idCode: 'dctH@@rJIRJrMMUTDX`',
      smiles: String.raw`CC(C)(C)/C=C\C(C(C)(C)C)=O`,
      formula: 'C11H20O',
      atoms: 32,
      charge: 0,
    },
    {
      id: 'trichlorodimethylhex-4-en-3-one',
      name: '(Z)-6,6,6-trichloro-2,2-dimethylhex-4-en-3-one',
      idCode: 'dctHpNBHRHrHrJPiSRUSMTDD`',
      smiles: String.raw`CC(C)(C)C(/C=C\C(Cl)(Cl)Cl)=O`,
      formula: 'C8H11OCl3',
      atoms: 23,
      charge: 0,
    },
    {
      id: 'triphenyldimethylhex-4-en-3-one',
      name: '(Z)-2,2-dimethyl-6,6,6-triphenylhex-4-en-3-one',
      idCode: 'fmwA@@@YEDiEYEEEDddemd]Y}VtuUP@@@@@@HXP',
      smiles: String.raw`CC(C)(C)C(/C=C\C(c1ccccc1)(c1ccccc1)c1ccccc1)=O`,
      formula: 'C26H26O',
      atoms: 53,
      charge: 0,
    },
  ],
};
