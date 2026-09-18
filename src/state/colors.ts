import { CHART_SERIES_COLORS } from 'react-cheminfo/core';

import { SPECTRUM_PALETTE, nextColor } from '../spectra/index.ts';

/**
 * The order colours are handed out in: the eight-hue Okabe–Ito set that is the
 * house default for a chart, then a twenty-colour set for the overlays that
 * run past eight series.
 *
 * The two sets share no colour, so the combined sequence never repeats.
 */
export const SERIES_PALETTE: readonly string[] = [
  ...CHART_SERIES_COLORS,
  ...SPECTRUM_PALETTE,
];

/**
 * The first palette colour that is not already on the chart, so appending a
 * series never repeats a colour while one is still free.
 *
 * Once all twenty-eight are taken the answer comes from `nextColor`, which wraps
 * deterministically inside the twenty-colour set rather than returning nothing.
 * @param used - Colours already drawn, in any order. Comparison ignores case.
 * @returns A six-digit hex colour.
 */
export function assignSeriesColor(used: readonly string[]): string {
  const taken = new Set<string>();
  for (const color of used) {
    taken.add(color.toUpperCase());
  }

  for (const color of SERIES_PALETTE) {
    if (!taken.has(color.toUpperCase())) return color;
  }

  return nextColor(used);
}
