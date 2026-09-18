/**
 * The tier-1 spectral assertions: mode counts and band positions, with the
 * tolerances from `experiments/reference/tolerances.json` and the pairing rules
 * from its `comparison_rules`.
 */

import type { VibrationalMode } from 'xtb-wasm';

import type { Band } from './bands.ts';
import { ourBands, referenceBands } from './bands.ts';
import type { FixtureCheck } from './checkTypes.ts';
import { numericCheck } from './checkTypes.ts';
import type { TierOneReference } from './fixtureShape.ts';
import { intensityChecks, intensityCosine } from './intensityChecks.ts';

/**
 * Absolute tolerance on an element-wise frequency comparison, cm⁻¹. The native
 * spread across LAPACK, thread-count and FMA variants is 0.00 cm⁻¹ at the
 * 0.01 cm⁻¹ print precision, so 0.5 cm⁻¹ leaves fifty times that headroom while
 * staying about sixty times tighter than GFN2's own error against experiment.
 */
const FREQUENCY_TOLERANCE = 0.5;

/** What the spectral comparison produced. */
export interface SpectralComparison {
  checks: FixtureCheck[];
  /** Largest paired |Δν|, cm⁻¹, or `null` when nothing could be paired. */
  maxFrequencyDelta: number | null;
  /**
   * Σ|Δν| over the paired modes, cm⁻¹. The zero-point energy is half the sum of
   * the frequencies, so this is exactly the budget its deviation inherits.
   */
  summedFrequencyDelta: number;
  /** Cosine similarity of the paired IR intensity vectors, in [0, 1]. */
  cosineSimilarity: number;
}

/**
 * Compare our modes with a fixture's tier-1 block.
 * @param modes - Our modes, as the engine returned them.
 * @param imaginaryCount - How many of them came back imaginary.
 * @param reference - The fixture's tier-1 block.
 * @returns The checks plus the aggregates the other checks and the table need.
 */
export function spectralChecks(
  modes: readonly VibrationalMode[],
  imaginaryCount: number,
  reference: TierOneReference,
): SpectralComparison {
  const ours = ourBands(modes);
  const theirs = referenceBands(reference);
  const paired = Math.min(ours.length, theirs.length);

  let maxFrequencyDelta = 0;
  let summedFrequencyDelta = 0;
  let worstIndex = -1;
  for (let index = 0; index < paired; index++) {
    const delta = Math.abs(
      (ours[index] as Band).wavenumber - (theirs[index] as Band).wavenumber,
    );
    summedFrequencyDelta += delta;
    if (delta > maxFrequencyDelta) {
      maxFrequencyDelta = delta;
      worstIndex = index;
    }
  }

  const checks: FixtureCheck[] = [
    exactCheck(
      'modeCount',
      'Vibrational mode count',
      ours.length,
      reference.modeCount,
      '3N − 6, or 3N − 5 when linear. A mismatch means the translation and rotation projection differs.',
    ),
    exactCheck(
      'imaginary',
      'Imaginary modes',
      imaginaryCount,
      reference.imaginaryCount,
      'Every fixture is a true minimum, so an imaginary mode means the Hessian is wrong, not that the tolerance is tight.',
    ),
    numericCheck({
      id: 'frequencies',
      label: 'Largest band-position deviation',
      deviation: paired === 0 ? Number.NaN : maxFrequencyDelta,
      tolerance: FREQUENCY_TOLERANCE,
      unit: 'cm⁻¹',
      note:
        worstIndex === -1
          ? 'No mode could be paired.'
          : `Worst at mode ${worstIndex + 1}, ${(theirs[worstIndex] as Band).wavenumber.toFixed(2)} cm⁻¹ in the reference.`,
    }),
    ...intensityChecks(ours, theirs, paired),
  ];

  return {
    checks,
    maxFrequencyDelta: paired === 0 ? null : maxFrequencyDelta,
    summedFrequencyDelta,
    cosineSimilarity: intensityCosine(ours, theirs, paired),
  };
}

/**
 * Build an exact-count check.
 * @param id - Check id.
 * @param label - Display label.
 * @param actual - What we produced.
 * @param expected - What the fixture says.
 * @param note - Why it matters.
 * @returns The check.
 */
function exactCheck(
  id: string,
  label: string,
  actual: number,
  expected: number,
  note: string,
): FixtureCheck {
  return {
    id,
    label,
    status: actual === expected ? 'pass' : 'fail',
    actual: String(actual),
    tolerance: `exactly ${expected}`,
    note,
  };
}
