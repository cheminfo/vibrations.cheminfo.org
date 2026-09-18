/**
 * The IR-intensity assertions.
 *
 * Intensities are the most geometry-sensitive quantity the fixtures carry: a
 * 10⁻⁶ Å move of the geometry already shifts them by about 1 % relative while
 * the frequencies move by 0.04 cm⁻¹. They are therefore judged relatively where
 * there is signal and absolutely where there is not, at the split
 * `tolerances.json` prescribes.
 */

import { similarity } from 'ml-distance';

import type { Band } from './bands.ts';
import type { FixtureCheck } from './checkTypes.ts';
import { numericCheck } from './checkTypes.ts';

/** Above this reference intensity a band is judged relatively, km/mol. */
const STRONG_BAND_INTENSITY = 1;

/** Relative tolerance on the intensity of a strong band. */
const STRONG_INTENSITY_TOLERANCE = 0.02;

/** Absolute tolerance on the intensity of a weak band, km/mol. */
const WEAK_INTENSITY_TOLERANCE = 0.05;

/**
 * Judge the paired IR intensities in both regimes.
 * @param ours - Our bands, ascending.
 * @param theirs - The reference bands, ascending.
 * @param paired - How many bands line up.
 * @returns One check per intensity regime, or a single informational row when
 * no intensity was computed.
 */
export function intensityChecks(
  ours: readonly Band[],
  theirs: readonly Band[],
  paired: number,
): FixtureCheck[] {
  let worstRelative = 0;
  let worstAbsolute = 0;
  let strongBands = 0;
  let weakBands = 0;
  for (let index = 0; index < paired; index++) {
    const mine = (ours[index] as Band).intensity;
    const reference = (theirs[index] as Band).intensity;
    if (mine === null || reference === null) continue;
    const deviation = Math.abs(mine - reference);
    if (Math.abs(reference) > STRONG_BAND_INTENSITY) {
      strongBands++;
      const relative = deviation / Math.abs(reference);
      if (relative > worstRelative) worstRelative = relative;
    } else {
      weakBands++;
      if (deviation > worstAbsolute) worstAbsolute = deviation;
    }
  }

  if (strongBands + weakBands === 0) {
    return [
      {
        id: 'irIntensities',
        label: 'IR intensities',
        status: 'info',
        actual: 'not computed',
        tolerance: null,
        note: 'The run did not ask for dipole derivatives.',
      },
    ];
  }

  return [
    numericCheck({
      id: 'irStrong',
      label: `IR intensity, bands above ${STRONG_BAND_INTENSITY} km/mol`,
      deviation: worstRelative,
      tolerance: STRONG_INTENSITY_TOLERANCE,
      unit: 'relative',
      note: `Worst of ${strongBands} strong bands. 2 % is the tightest relative tolerance that is not dominated by geometry noise.`,
    }),
    numericCheck({
      id: 'irWeak',
      label: `IR intensity, bands at or below ${STRONG_BAND_INTENSITY} km/mol`,
      deviation: worstAbsolute,
      tolerance: WEAK_INTENSITY_TOLERANCE,
      unit: 'km/mol',
      note: `Worst of ${weakBands} weak bands, judged absolutely because a relative test on a near-zero intensity is meaningless.`,
    }),
  ];
}

/**
 * Cosine similarity of the paired IR intensity vectors.
 * @param ours - Our bands, ascending.
 * @param theirs - The reference bands, ascending.
 * @param paired - How many bands line up.
 * @returns The similarity, or 0 when no intensity is available.
 */
export function intensityCosine(
  ours: readonly Band[],
  theirs: readonly Band[],
  paired: number,
): number {
  const mine: number[] = [];
  const reference: number[] = [];
  for (let index = 0; index < paired; index++) {
    const value = (ours[index] as Band).intensity;
    const other = (theirs[index] as Band).intensity;
    if (value === null || other === null) continue;
    mine.push(value);
    reference.push(other);
  }
  if (mine.length === 0) return 0;
  const cosine = similarity.cosine(mine, reference);
  return Number.isFinite(cosine) ? cosine : 0;
}
