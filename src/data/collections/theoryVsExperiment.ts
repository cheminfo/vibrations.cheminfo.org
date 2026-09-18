import type { MoleculeCollection } from './types.ts';

/**
 * Four molecules whose measured carbonyl band the gas-phase harmonic
 * calculation cannot reproduce. Benzamide and salicylic acid are hydrogen
 * bonded in the condensed phase the SDBS spectra were recorded in — between
 * molecules through the N–H for the amide, inside the molecule for the acid —
 * and the isolated-molecule model knows nothing about either. The tertiary
 * amide has no N–H to donate, so its very low band is amide resonance rather
 * than hydrogen bonding; the ester is the mildest case and lands closest.
 */
export const THEORY_VS_EXPERIMENT: MoleculeCollection = {
  id: 'theory-vs-experiment',
  name: 'Theory vs. experiment',
  explanation:
    'Clearly, also theory has its limitations. You can use this collection to explore some of the limitations.\n\nExperimental shifts taken from the SDBS database.',
  entries: [
    {
      id: 'benzamide',
      name: 'benzamide',
      idCode: 'difH@DAInUxV`@@@',
      smiles: 'NC(c1ccccc1)=O',
      formula: 'C7H7NO',
      atoms: 16,
      charge: 0,
      experimentalWavenumber: 1661,
    },
    {
      id: 'salicylic-acid',
      name: 'salicylic acid',
      idCode: 'deTL@@QdfygFV``@@@',
      smiles: 'OC(c(cccc1)c1O)=O',
      formula: 'C7H6O3',
      atoms: 16,
      charge: 0,
      experimentalWavenumber: 1662,
    },
    {
      id: 'methyl-2-methylbenzoate',
      name: 'methyl 2-methylbenzoate',
      idCode: 'dmtD@@QIenVUZ`H@@@',
      smiles: 'Cc(cccc1)c1C(OC)=O',
      formula: 'C9H10O2',
      atoms: 21,
      charge: 0,
      experimentalWavenumber: 1737,
    },
    {
      id: 'dimethylbenzamide',
      name: 'N,N-dimethylbenzamide',
      idCode: 'dmvH@DCHhhhTiUj`@@@',
      smiles: 'CN(C)C(c1ccccc1)=O',
      formula: 'C9H11NO',
      atoms: 22,
      charge: 0,
      experimentalWavenumber: 1626,
    },
  ],
};
