import type { MoleculeCollection } from './types.ts';

/**
 * A ladder of acetyl derivatives, CH₃–C(=O)–X with X running F, Cl, CH₃, H,
 * OCH₃ and N(CH₃)₂. The halogens withdraw density through the σ bond and stiffen
 * the C=O; a methyl donates weakly instead and relaxes it, which is why acetone
 * sits a little below acetaldehyde rather than above it. The ester oxygen and
 * the amide nitrogen do both at once — withdrawing through the σ bond and
 * donating a lone pair into the π system — and which contribution wins is the
 * point of the series: for the ester the inductive withdrawal still dominates
 * and its band sits above the ketone, while nitrogen is the far better π donor
 * and the amide ends up lowest of all.
 */
export const INDUCTIVE_MESOMERIC: MoleculeCollection = {
  id: 'inductive-mesomeric-effect',
  name: 'Inductive / mesomeric effect',
  explanation:
    'Using the carbonyl stretching frequency as probe for the inductive and mesomeric effect',
  entries: [
    {
      id: 'acetyl-fluoride',
      name: 'acetyl fluoride',
      idCode: 'gCaHDIAIi`@',
      smiles: 'CC(F)=O',
      formula: 'C2H3OF',
      atoms: 7,
      charge: 0,
    },
    {
      id: 'acetyl-chloride',
      name: 'acetyl chloride',
      idCode: 'gCaHDHaIi`@',
      smiles: 'CC(Cl)=O',
      formula: 'C2H3OCl',
      atoms: 7,
      charge: 0,
    },
    {
      id: 'acetone',
      name: 'acetone',
      idCode: 'gCa@@dsP@',
      smiles: 'CC(C)=O',
      formula: 'C3H6O',
      atoms: 10,
      charge: 0,
    },
    {
      id: 'acetaldehyde',
      name: 'acetaldehyde',
      idCode: 'eMHAIX@',
      smiles: 'CC=O',
      formula: 'C2H4O',
      atoms: 7,
      charge: 0,
    },
    {
      id: 'methyl-acetate',
      name: 'methyl acetate',
      idCode: 'gJP`@dfVh@',
      smiles: 'CC(OC)=O',
      formula: 'C3H6O2',
      atoms: 11,
      charge: 0,
    },
    {
      id: 'dimethylacetamide',
      name: 'N,N-dimethylacetamide',
      idCode: 'gGY@DDfYj`@',
      smiles: 'CC(N(C)C)=O',
      formula: 'C4H9NO',
      atoms: 15,
      charge: 0,
    },
  ],
};
