import type { VibrationalMode } from 'xtb-wasm';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';

import { modeIntensity } from './modePicking.ts';

/** Which column the mode table is ordered on. */
export type ModeSortKey = 'wavenumber' | 'intensity';

/** One row of the mode table: the mode plus where it sits in the result. */
export interface ModeRow {
  /** Index into the result's `modes`, which is what the selection refers to. */
  index: number;
  mode: VibrationalMode;
}

/** How the mode table is ordered. */
export interface ModeSortOptions {
  key: ModeSortKey;
  /** Largest first. @default false */
  descending?: boolean;
  /** Whose intensity `key: 'intensity'` reads. */
  chart: SpectrumChartKind;
}

/**
 * The mode table's rows in display order.
 *
 * Sorting never renumbers anything: a row keeps the index the mode has in the
 * result, so the number the chemist reads, the selection and the animation all
 * stay the same object whichever column the table is ordered on. A mode with no
 * intensity sorts as zero rather than being dropped, because an inactive mode
 * is a result, not a gap.
 * @param modes - The active result's modes, ascending in wavenumber.
 * @param options - Column, direction and which intensity to read.
 * @returns A new array of rows.
 */
export function sortedModeRows(
  modes: readonly VibrationalMode[],
  options: ModeSortOptions,
): ModeRow[] {
  const { key, descending = false, chart } = options;
  const rows = new Array<ModeRow>(modes.length);
  for (let index = 0; index < modes.length; index++) {
    rows[index] = { index, mode: modes[index] as VibrationalMode };
  }

  const direction = descending ? -1 : 1;
  return rows.toSorted((first, second) => {
    const difference =
      key === 'wavenumber'
        ? first.mode.wavenumber - second.mode.wavenumber
        : (modeIntensity(first.mode, chart) ?? 0) -
          (modeIntensity(second.mode, chart) ?? 0);
    // Equal intensities — degenerate modes, or two modes with none at all —
    // fall back to the result's own order so the table never reshuffles.
    if (difference !== 0) return direction * difference;
    return first.index - second.index;
  });
}
