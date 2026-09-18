import type { SpectrumChartKind } from '../../shared/spectra/index.ts';

import type { ModeColumn } from './modeColumns.ts';
import { modeIntensity } from './modePicking.ts';
import type { ModeRow } from './modeRows.ts';

/** The strongest band shown, per chart, which every bar is drawn against. */
export type Strongest = Record<SpectrumChartKind, number>;

/**
 * The strongest intensity among the displayed rows, for each chart.
 * @param rows - The rows the table is showing.
 * @returns The two maxima, 0 where nothing was computed.
 */
export function strongestIntensities(rows: readonly ModeRow[]): Strongest {
  return {
    infrared: strongestIn(rows, 'infrared'),
    raman: strongestIn(rows, 'raman'),
  };
}

/**
 * The bar behind an intensity cell, as wide as that band is strong.
 *
 * It is a background rather than an element, so it can never change the row's
 * layout, and it is drawn from the right so the bars line up with the
 * right-aligned numbers they belong to.
 * @param row - The row being drawn.
 * @param column - The column being drawn.
 * @param strongest - The maxima from {@link strongestIntensities}.
 * @returns A CSS background, or `undefined` for a column that is not an intensity.
 */
export function intensityFill(
  row: ModeRow,
  column: ModeColumn,
  strongest: Strongest,
): string | undefined {
  const chart = column.sortKey === 'intensity' ? column.sortChart : undefined;
  if (chart === undefined) return undefined;
  const maximum = strongest[chart];
  const intensity = modeIntensity(row.mode, chart);
  if (maximum <= 0 || intensity === null || intensity <= 0) return undefined;
  const percent = Math.min(100, (intensity / maximum) * 100);
  return `linear-gradient(to left, rgb(45 114 210 / 18%) ${percent}%, transparent ${percent}%)`;
}

function strongestIn(
  rows: readonly ModeRow[],
  chart: SpectrumChartKind,
): number {
  let maximum = 0;
  for (const row of rows) {
    const intensity = modeIntensity(row.mode, chart);
    if (intensity !== null && intensity > maximum) maximum = intensity;
  }
  return maximum;
}
