import type { Molecule, VibrationalMode } from 'xtb-wasm';

/**
 * A `Molecule` carrying only what the structure panel reads.
 * @param elements - Element symbols, one per atom.
 * @param coordinates - Flat Cartesian coordinates in Å.
 * @param charge - Total charge in units of e.
 * @returns The molecule.
 */
export function makeMolecule(
  elements: string[],
  coordinates: number[],
  charge = 0,
): Molecule {
  return {
    id: 'test',
    label: 'test molecule',
    formula: elements.join(''),
    source: { kind: 'molfile', molfile: '' },
    charge,
    unpairedElectrons: 0,
    elements,
    coordinates: new Float64Array(coordinates),
  };
}

/**
 * A `VibrationalMode` stated by its Cartesian displacement.
 * @param wavenumber - Harmonic wavenumber in cm⁻¹.
 * @param displacement - Cartesian displacement, length `3 · atoms`.
 * @returns The mode, with `maxDisplacement` measured from `displacement`.
 */
export function makeDisplacedMode(
  wavenumber: number,
  displacement: number[],
): VibrationalMode {
  const cartesianDisplacement = new Float64Array(displacement);
  let maxDisplacement = 0;
  for (let atom = 0; atom * 3 < displacement.length; atom++) {
    const magnitude = Math.hypot(
      cartesianDisplacement[atom * 3] as number,
      cartesianDisplacement[atom * 3 + 1] as number,
      cartesianDisplacement[atom * 3 + 2] as number,
    );
    if (magnitude > maxDisplacement) maxDisplacement = magnitude;
  }
  return {
    wavenumber,
    irIntensity: null,
    ramanActivity: null,
    depolarizationRatio: null,
    eigenvector: new Float64Array(0),
    cartesianDisplacement,
    maxDisplacement,
    reducedMass: 0,
    forceConstant: 0,
    involvement: null,
  };
}
