/**
 * The shape of one assertion on the validation page.
 *
 * Every check reports the deviation it actually measured next to the tolerance
 * it was judged against, because a bare tick hides the two failure modes that
 * matter: a check that passes by a hair, and a check that passes only because
 * its tolerance is meaningless.
 */

/** Whether a check was judged, and how it came out. */
export type CheckStatus = 'pass' | 'fail' | 'info';

/** One assertion, already formatted for display. */
export interface FixtureCheck {
  /** Stable id, used as the React key. */
  id: string;
  label: string;
  status: CheckStatus;
  /** The measured value or deviation, with its unit. */
  actual: string;
  /** The tolerance it was judged against, or `null` for an informational row. */
  tolerance: string | null;
  /** Where the deviation sits, or why this tolerance. @default null */
  note: string | null;
}

/** Everything one fixture's comparison produced. */
export interface FixtureComparison {
  checks: readonly FixtureCheck[];
  /** True when no check failed. */
  passed: boolean;
  /** Largest paired |Δν| in cm⁻¹, or `null` when nothing could be paired. */
  maxFrequencyDelta: number | null;
  /** Our electronic energy minus the reference one, Eh. */
  energyDelta: number;
  /** Cosine similarity of the two IR intensity vectors, in [0, 1]. */
  cosineSimilarity: number;
  /** The first failure, for the table's message column. `null` when all passed. */
  summary: string | null;
}

/** A judged numeric deviation. */
export interface NumericCheckOptions {
  id: string;
  label: string;
  /** The measured deviation; its absolute value is compared. */
  deviation: number;
  /** The largest deviation that still passes. */
  tolerance: number;
  /** Unit appended to both numbers, e.g. `cm⁻¹`. Empty for a ratio. */
  unit: string;
  /** Where the deviation sits, or why this tolerance. @default null */
  note?: string | null;
}

/**
 * Judge a deviation against a tolerance and format both the same way.
 * @param options - The deviation, its tolerance and how to label them.
 * @returns The formatted check.
 */
export function numericCheck(options: NumericCheckOptions): FixtureCheck {
  const { id, label, deviation, tolerance, unit, note = null } = options;
  return {
    id,
    label,
    status: Math.abs(deviation) <= tolerance ? 'pass' : 'fail',
    actual: formatWithUnit(deviation, unit),
    tolerance: formatWithUnit(tolerance, unit),
    note,
  };
}

/**
 * Format a number so small deviations stay readable.
 * @param value - The number.
 * @param unit - Unit to append, empty for none.
 * @returns The formatted value.
 */
export function formatWithUnit(value: number, unit: string): string {
  const magnitude = Math.abs(value);
  const text =
    magnitude !== 0 && (magnitude < 1e-3 || magnitude >= 1e5)
      ? value.toExponential(2)
      : value.toFixed(magnitude < 1 ? 4 : 3);
  return unit === '' ? text : `${text} ${unit}`;
}
