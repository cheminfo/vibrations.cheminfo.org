/**
 * Turning modes and reference blocks into comparable band lists.
 *
 * `comparison_rules` in `experiments/reference/tolerances.json` requires both
 * lists to be sorted ascending before an element-wise comparison, because
 * near-degenerate modes — benzene has several — can be emitted in a different
 * order by two builds that otherwise agree exactly.
 */

import type { VibrationalMode } from 'xtb-wasm';

import type { TierOneReference } from './fixtureShape.ts';

/** A band: its position and the intensity that belongs to it. */
export interface Band {
  /** Wavenumber in cm⁻¹. */
  wavenumber: number;
  /** IR intensity in km/mol, or `null` when it was not computed. */
  intensity: number | null;
}

/**
 * Our modes as bands, ascending.
 * @param modes - The engine's modes.
 * @returns One band per mode.
 */
export function ourBands(modes: readonly VibrationalMode[]): Band[] {
  const bands = new Array<Band>(modes.length);
  for (let index = 0; index < modes.length; index++) {
    const mode = modes[index] as VibrationalMode;
    bands[index] = { wavenumber: mode.wavenumber, intensity: mode.irIntensity };
  }
  return sortedBands(bands);
}

/**
 * A fixture's tier-1 block as bands, ascending.
 * @param reference - The fixture's tier-1 block.
 * @returns One band per stored frequency.
 */
export function referenceBands(reference: TierOneReference): Band[] {
  const { wavenumbers, irIntensities } = reference;
  const bands = new Array<Band>(wavenumbers.length);
  for (let index = 0; index < wavenumbers.length; index++) {
    bands[index] = {
      wavenumber: wavenumbers[index] as number,
      intensity:
        index < irIntensities.length ? (irIntensities[index] as number) : null,
    };
  }
  return sortedBands(bands);
}

/**
 * Sort bands by position.
 * @param bands - The bands to sort.
 * @returns The same bands, ascending.
 */
function sortedBands(bands: Band[]): Band[] {
  return bands.toSorted((a, b) => a.wavenumber - b.wavenumber);
}
