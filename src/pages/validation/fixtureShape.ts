/**
 * The native-xtb reference fixtures, normalized into the shape the browser
 * comparison consumes.
 *
 * Each fixture carries two frequency sets and they are NOT interchangeable. The
 * `tier1_hess_at_optimized_geometry` block is a plain `--hess` at exactly the
 * stored coordinates and is the one this page reproduces, because the optimizer
 * is excluded from it. The top-level `vibrations` block came from `--ohess`,
 * which relaxed the geometry a little further first; only its own
 * `energies_hartree` enthalpy and free energy belong to it.
 */

import type { Geometry } from 'xtb-wasm';

import {
  asRecord,
  childRecord,
  numberAt,
  numberList,
  stringAt,
} from './jsonAccess.ts';

/** The `--hess`-at-stored-coordinates block, the primary validation target. */
export interface TierOneReference {
  /** Electronic energy, Eh. */
  totalEnergy: number;
  /** Zero-point vibrational energy, Eh. */
  zeroPointEnergy: number;
  /** 3N − 6 (3N − 5 when linear). */
  modeCount: number;
  /** Modes with a negative wavenumber; zero for every shipped fixture. */
  imaginaryCount: number;
  /** Wavenumbers in cm⁻¹, ascending, translations and rotations removed. */
  wavenumbers: number[];
  /** IR intensities in km/mol, paired with `wavenumbers` by index. */
  irIntensities: number[];
  /** Frobenius norm of the full 3N × 3N Cartesian Hessian. */
  hessianFrobeniusNorm: number;
  /** Trace of the full 3N × 3N Cartesian Hessian. */
  hessianTrace: number;
}

/** The `--ohess` thermochemistry block, which nothing else in the app checks. */
export interface ThermochemistryReference {
  /** Electronic energy the corrections below are added to, Eh. */
  electronicEnergy: number;
  /** Zero-point vibrational energy, Eh. */
  zeroPointEnergy: number;
  /** H(T) − E_el, Eh, i.e. xtb's `TOTAL ENTHALPY` minus its `TOTAL ENERGY`. */
  enthalpyCorrection: number;
  /** G(T) − E_el, Eh, i.e. xtb's `G(RRHO) contrib.`. */
  gibbsCorrection: number;
}

/** One reference fixture. */
export interface ReferenceFixture {
  /** File base name, e.g. `caffeine`. */
  id: string;
  /** Molecule name as the fixture spells it. */
  name: string;
  formula: string;
  smiles: string;
  atomCount: number;
  charge: number;
  unpairedElectrons: number;
  /** The stored optimized coordinates, in Ångström. */
  geometry: Geometry;
  tierOne: TierOneReference;
  thermochemistry: ThermochemistryReference;
}

/**
 * Normalize one parsed fixture JSON document.
 * @param raw - The parsed JSON, straight from the bundled module.
 * @param id - File base name, used as the fixture id and in error messages.
 * @returns The fixture in camelCase, with every field present.
 */
export function readFixture(raw: unknown, id: string): ReferenceFixture {
  const root = asRecord(raw, `fixture ${id}`);
  const molecule = childRecord(root, 'molecule');
  const energies = childRecord(root, 'energies_hartree');
  const electronicEnergy = numberAt(energies, 'total_energy');

  return {
    id,
    name: stringAt(molecule, 'name'),
    formula: stringAt(molecule, 'formula'),
    smiles: stringAt(molecule, 'smiles'),
    atomCount: numberAt(molecule, 'n_atoms'),
    charge: numberAt(molecule, 'charge'),
    unpairedElectrons: numberAt(molecule, 'uhf'),
    geometry: readGeometry(childRecord(root, 'optimized_geometry_xyz')),
    tierOne: readTierOne(childRecord(root, 'tier1_hess_at_optimized_geometry')),
    thermochemistry: {
      electronicEnergy,
      zeroPointEnergy: numberAt(energies, 'zero_point_energy'),
      enthalpyCorrection:
        numberAt(energies, 'total_enthalpy') - electronicEnergy,
      gibbsCorrection: numberAt(energies, 'g_rrho_contribution'),
    },
  };
}

/**
 * Read the tier-1 block.
 * @param block - The `tier1_hess_at_optimized_geometry` record.
 * @returns The normalized block.
 */
function readTierOne(block: Record<string, unknown>): TierOneReference {
  const invariants = childRecord(block, 'hessian_invariants');
  return {
    totalEnergy: numberAt(block, 'total_energy_hartree'),
    zeroPointEnergy: numberAt(block, 'zero_point_energy_hartree'),
    modeCount: numberAt(block, 'n_vibrational_modes'),
    imaginaryCount: numberAt(block, 'n_imaginary'),
    wavenumbers: numberList(block, 'frequencies'),
    irIntensities: numberList(block, 'ir_intensities'),
    hessianFrobeniusNorm: numberAt(invariants, 'frobenius_norm'),
    hessianTrace: numberAt(invariants, 'trace'),
  };
}

/**
 * Turn a fixture's XYZ block into a geometry.
 * @param block - The `optimized_geometry_xyz` record.
 * @returns Element symbols and flat Cartesian coordinates in Ångström.
 */
function readGeometry(block: Record<string, unknown>): Geometry {
  const atoms = block.atoms;
  if (!Array.isArray(atoms)) {
    throw new TypeError('the fixture geometry has no atom list');
  }
  const elements = new Array<string>(atoms.length);
  const coordinates = new Float64Array(3 * atoms.length);
  for (let atom = 0; atom < atoms.length; atom++) {
    const record = asRecord(atoms[atom], `atom ${atom}`);
    elements[atom] = stringAt(record, 'symbol');
    coordinates[3 * atom] = numberAt(record, 'x');
    coordinates[3 * atom + 1] = numberAt(record, 'y');
    coordinates[3 * atom + 2] = numberAt(record, 'z');
  }
  return { elements, coordinates };
}
