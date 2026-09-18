import type { Molecule, VibrationalResult } from 'xtb-wasm';
import { DEFAULT_OUTPUTS, DEFAULT_SETTINGS } from 'xtb-wasm';

/**
 * A molecule with just enough on it for the state layer, which never looks at
 * the geometry.
 * @param id - Molecule id, also used as the label.
 * @param charge - Total charge in e.
 * @default charge 0
 * @returns The molecule.
 */
export function fakeMolecule(id: string, charge = 0): Molecule {
  return {
    id,
    label: id,
    formula: 'H2O',
    source: { kind: 'fixture', fixtureId: id },
    charge,
    unpairedElectrons: 0,
    elements: ['O', 'H', 'H'],
    coordinates: new Float64Array(9),
    molfile: undefined,
  };
}

/**
 * A finished result the history can store.
 * @param id - Result id.
 * @returns The result.
 */
export function fakeResult(id: string): VibrationalResult {
  const molecule = fakeMolecule(id);
  return {
    id,
    engineId: 'occjs',
    request: { molecule, settings: DEFAULT_SETTINGS, outputs: DEFAULT_OUTPUTS },
    geometry: {
      elements: molecule.elements,
      coordinates: molecule.coordinates,
    },
    energy: {
      total: -5,
      scc: null,
      repulsion: null,
      dispersion: null,
    },
    modes: [],
    imaginaryCount: 0,
    thermochemistry: null,
    timings: { optimize: 1, hessian: 2, analyse: 3, total: 6 },
    warnings: [],
  };
}
