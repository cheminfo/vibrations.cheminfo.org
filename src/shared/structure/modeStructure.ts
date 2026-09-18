import type { Geometry, VibrationalMode } from 'xtb-wasm';

import type { BondPair } from './structureLayout.ts';

/** The atoms and bonds a depiction marks for one mode. */
export interface StructureHighlight {
  /** Atom indices, ascending. */
  atoms: readonly number[];
  /** Bond indices into the depiction's bond table, ascending. */
  bonds: readonly number[];
}

/**
 * Which atoms and bonds a mode moves.
 *
 * The engine's own `involvement` is used when it is there; otherwise the same
 * answer is derived here from the Cartesian displacements, so a result produced
 * without the involvement analyser still lights up the structure.
 * @param mode - The mode to describe.
 * @param geometry - The geometry the mode was computed at.
 * @param bonds - The depiction's bond table.
 * @returns The atoms and bonds to mark.
 */
export function modeHighlight(
  mode: VibrationalMode,
  geometry: Geometry,
  bonds: readonly BondPair[],
): StructureHighlight {
  const involvement = mode.involvement;
  if (involvement !== null) {
    return { atoms: involvement.atoms, bonds: involvement.bonds };
  }

  const magnitudes = atomDisplacementMagnitudes(mode);
  let largestAtom = 0;
  for (const magnitude of magnitudes) {
    if (magnitude > largestAtom) largestAtom = magnitude;
  }
  const atoms: number[] = [];
  if (largestAtom > 0) {
    const cutoff = largestAtom * PARTICIPATION_THRESHOLD;
    for (let atom = 0; atom < magnitudes.length; atom++) {
      if ((magnitudes[atom] as number) >= cutoff) atoms.push(atom);
    }
  }

  const stretches = new Float64Array(bonds.length);
  let largestBond = 0;
  for (let bond = 0; bond < bonds.length; bond++) {
    const stretch = bondStretch(mode, geometry, bonds[bond] as BondPair);
    stretches[bond] = stretch;
    if (stretch > largestBond) largestBond = stretch;
  }
  const marked: number[] = [];
  if (largestBond > 0) {
    const cutoff = largestBond * PARTICIPATION_THRESHOLD;
    for (let bond = 0; bond < stretches.length; bond++) {
      if ((stretches[bond] as number) >= cutoff) marked.push(bond);
    }
  }
  return { atoms, bonds: marked };
}

/**
 * The mode that stretches one bond most, so that clicking a bond jumps to the
 * band it produces.
 * @param modes - The modes of the active result.
 * @param geometry - The geometry they were computed at.
 * @param bonds - The depiction's bond table.
 * @param bond - Index of the clicked bond.
 * @returns Index into `modes`, or `null` when no mode changes that bond length.
 */
export function modeForBond(
  modes: readonly VibrationalMode[],
  geometry: Geometry,
  bonds: readonly BondPair[],
  bond: number,
): number | null {
  const pair = bonds[bond];
  if (pair === undefined) return null;

  let best = -1;
  let bestStretch = 0;
  for (let index = 0; index < modes.length; index++) {
    const mode = modes[index] as VibrationalMode;
    const stretch = bondStretch(mode, geometry, pair);
    if (stretch > bestStretch) {
      bestStretch = stretch;
      best = index;
    }
  }
  return best === -1 ? null : best;
}

/**
 * How fast a mode changes one bond's length, per unit of animation amplitude.
 *
 * It is the projection of the two atoms' relative displacement onto the bond
 * axis, so a mode that swings both atoms the same way scores zero however
 * violently it moves them.
 * @param mode - The mode.
 * @param geometry - The geometry the mode was computed at.
 * @param pair - The two atoms the bond joins.
 * @returns A non-negative rate; `0` when the bond length does not change.
 */
export function bondStretch(
  mode: VibrationalMode,
  geometry: Geometry,
  pair: BondPair,
): number {
  const [first, second] = pair;
  const coordinates = geometry.coordinates;
  const axisX =
    (coordinates[second * 3] as number) - (coordinates[first * 3] as number);
  const axisY =
    (coordinates[second * 3 + 1] as number) -
    (coordinates[first * 3 + 1] as number);
  const axisZ =
    (coordinates[second * 3 + 2] as number) -
    (coordinates[first * 3 + 2] as number);
  const length = Math.hypot(axisX, axisY, axisZ);
  if (length === 0 || mode.maxDisplacement === 0) return 0;

  const displacement = mode.cartesianDisplacement;
  const scale = 1 / mode.maxDisplacement;
  const relativeX =
    ((displacement[second * 3] as number) -
      (displacement[first * 3] as number)) *
    scale;
  const relativeY =
    ((displacement[second * 3 + 1] as number) -
      (displacement[first * 3 + 1] as number)) *
    scale;
  const relativeZ =
    ((displacement[second * 3 + 2] as number) -
      (displacement[first * 3 + 2] as number)) *
    scale;
  return Math.abs(
    (relativeX * axisX + relativeY * axisY + relativeZ * axisZ) / length,
  );
}

/**
 * Length of each atom's Cartesian displacement vector.
 * @param mode - The mode.
 * @returns One magnitude per atom, in the geometry's atom order.
 */
export function atomDisplacementMagnitudes(
  mode: VibrationalMode,
): Float64Array {
  const displacement = mode.cartesianDisplacement;
  const atoms = Math.floor(displacement.length / 3);
  const magnitudes = new Float64Array(atoms);
  for (let atom = 0; atom < atoms; atom++) {
    magnitudes[atom] = Math.hypot(
      displacement[atom * 3] as number,
      displacement[atom * 3 + 1] as number,
      displacement[atom * 3 + 2] as number,
    );
  }
  return magnitudes;
}

/** Fraction of the largest displacement an atom or bond must reach to be marked. */
const PARTICIPATION_THRESHOLD = 0.3;
