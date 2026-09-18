import type { MoleculeCollection } from './types.ts';

/**
 * Six small molecules whose symmetry decides how many bands survive. N₂ has a
 * single mode and no IR spectrum at all; water is here as the bent partner of
 * CO₂, three atoms each but 3N−6 modes against 3N−5; CO₂ is centrosymmetric, so its
 * symmetric stretch is Raman-only while OCS — the same shape without the
 * inversion centre — shows every mode; methane's nine modes collapse onto two
 * IR-active triply degenerate ones, and the four different halogens on
 * bromochlorofluoroiodomethane remove all symmetry so all nine appear. That
 * last one is a stereocentre, but the two enantiomers share one spectrum, so
 * the unspecified configuration in the idCode costs nothing here.
 */
export const GROSS_SELECTION_RULE: MoleculeCollection = {
  id: 'gross-selection-rule',
  name: 'Gross selection rule',
  explanation:
    'Symmetry dictates what normal modes are IR active. Can you predict how many IR active modes these molecules will have?',
  entries: [
    {
      id: 'carbon-dioxide',
      name: 'carbon dioxide',
      idCode: 'eMDARU@',
      smiles: 'O=C=O',
      formula: 'CO2',
      atoms: 3,
      charge: 0,
    },
    {
      id: 'water',
      name: 'water',
      idCode: 'fI@@',
      smiles: 'O',
      formula: 'H2O',
      atoms: 3,
      charge: 0,
    },
    {
      id: 'carbonyl-sulfide',
      name: 'carbonyl sulfide',
      idCode: 'eMJDBDeP@',
      smiles: 'O=C=S',
      formula: 'COS',
      atoms: 3,
      charge: 0,
    },
    {
      id: 'nitrogen',
      name: 'nitrogen',
      idCode: 'eFPBc`@',
      smiles: 'N#N',
      formula: 'N2',
      atoms: 2,
      charge: 0,
    },
    {
      id: 'methane',
      name: 'methane',
      idCode: 'fH@@',
      smiles: 'C',
      formula: 'CH4',
      atoms: 5,
      charge: 0,
    },
    {
      id: 'bromochlorofluoroiodomethane',
      name: 'bromochlorofluoroiodomethane',
      idCode: 'gJPBAVKDtPYAIjj@@',
      smiles: 'FC(Cl)(Br)I',
      formula: 'CBrClFI',
      atoms: 5,
      charge: 0,
    },
  ],
};
