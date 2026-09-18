import { xFindClosestIndex } from 'ml-spectra-processing';

import type { SpectrumTrace } from '../../types/trace.ts';

import type { SpectrumVariable } from './chartAxes.ts';

/** One line of the cursor readout: a series and its value under the pointer. */
export interface ReadoutRow {
  /** The trace's id, used as the React key. */
  id: string;
  label: string;
  /** The trace's own colour, so the line can be matched to the curve. */
  color: string;
  /** The value at the pointer, in chart coordinates. */
  value: number;
  /** The trace's own wavenumber nearest the pointer, cm⁻¹, unscaled. */
  wavenumber: number;
}

/**
 * Every visible series' value at the pointer's wavenumber, strongest first.
 *
 * The traces do not share a grid: a dropped file brings its own sampling and
 * its own range, so each trace is searched separately and one that does not cover the
 * pointer is left out rather than reported at its nearest endpoint.
 *
 * Mirroring is deliberately not applied: the readout answers what the spectrum
 * measures, not which way it happens to be drawn.
 * @param traces - The traces drawn on the chart; hidden ones should not be passed.
 * @param wavenumber - The pointer's position in chart coordinates, cm⁻¹.
 * @param variable - The measurement variable the chart draws.
 * @returns One row per covering trace, sorted by descending value.
 */
export function cursorReadout(
  traces: readonly SpectrumTrace[],
  wavenumber: number,
  variable: SpectrumVariable,
): ReadoutRow[] {
  const rows: ReadoutRow[] = [];
  for (const trace of traces) {
    const row = readTrace(trace, wavenumber, variable);
    if (row !== null) rows.push(row);
  }
  rows.sort((a, b) => b.value - a.value);
  return rows;
}

function readTrace(
  trace: SpectrumTrace,
  wavenumber: number,
  variable: SpectrumVariable,
): ReadoutRow | null {
  const { variables } = trace.measurement;
  const x = variables.x.data;
  const { length } = x;
  if (length === 0) return null;

  const scale =
    trace.wavenumberScale === undefined || trace.wavenumberScale <= 0
      ? 1
      : trace.wavenumberScale;
  const target = wavenumber / scale;
  if (target < (x[0] as number) || target > (x[length - 1] as number)) {
    return null;
  }

  const index = xFindClosestIndex(x, target);
  const values = (variables[variable] ?? variables.y).data;
  const value = values[index];
  if (value === undefined || !Number.isFinite(value)) return null;

  return {
    id: trace.id,
    label: trace.label,
    color: trace.color,
    value,
    wavenumber: x[index] as number,
  };
}
