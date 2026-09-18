import type { NumberArray } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import type { SeriesPoint } from 'react-plot';

import type { SpectrumTrace } from '../../types/trace.ts';

import type { SpectrumVariable } from './chartAxes.ts';

/** How one trace is turned into the points react-plot draws. */
export interface TracePointsOptions {
  /** Which measurement variable to read; falls back to `y` when absent. */
  variable: SpectrumVariable;
  /** Lowest wavenumber the chart shows, cm⁻¹. */
  from: number;
  /** Highest wavenumber the chart shows, cm⁻¹. */
  to: number;
  /** The value a mirrored trace is reflected about. @default 0 */
  baseline?: number;
}

/**
 * One trace as react-plot's point objects, in chart coordinates.
 *
 * Three things happen here and nowhere else: `wavenumberScale` is applied to x,
 * a mirrored trace is reflected about `baseline` rather than negated — so a
 * mirrored transmittance still hangs from 100 % instead of falling to −100 —
 * and points outside the chart's window are dropped, keeping one point past
 * each edge so the line still enters the plot.
 *
 * react-plot needs an array of `{x, y}` objects, so the conversion is a real
 * format change rather than a copy made to scan the data. It is cached on the
 * variable's own array, which every step of the spectra layer reallocates when
 * it changes anything, so a redraw caused by another trace, a hover or a zoom
 * reuses the points already built.
 * @param trace - The trace to draw.
 * @param options - Variable, window and baseline.
 * @returns The points, ascending in stored wavenumber.
 */
export function tracePoints(
  trace: SpectrumTrace,
  options: TracePointsOptions,
): readonly SeriesPoint[] {
  const { variable, from, to, baseline = 0 } = options;
  const { variables } = trace.measurement;
  const values = (variables[variable] ?? variables.y).data;
  const x = variables.x.data;
  const scale =
    trace.wavenumberScale === undefined || trace.wavenumberScale <= 0
      ? 1
      : trace.wavenumberScale;
  const mirrored = trace.mirrored === true;

  const key = `${variable}|${scale}|${mirrored}|${baseline}|${from}|${to}`;
  const cached = CACHE.get(values);
  const hit = cached?.get(key);
  if (hit !== undefined) return hit;

  const points = buildPoints(x, values, {
    scale,
    mirrored,
    baseline,
    from,
    to,
  });
  if (cached === undefined) {
    CACHE.set(values, new Map([[key, points]]));
  } else {
    cached.set(key, points);
  }
  return points;
}

interface BuildOptions {
  scale: number;
  mirrored: boolean;
  baseline: number;
  from: number;
  to: number;
}

const CACHE = new WeakMap<NumberArray, Map<string, readonly SeriesPoint[]>>();

function buildPoints(
  x: NumberArray,
  values: NumberArray,
  options: BuildOptions,
): readonly SeriesPoint[] {
  const { scale, mirrored, baseline, from, to } = options;
  const { length } = x;
  if (length === 0) return [];

  // The stored wavenumbers are unscaled, so the window has to be un-scaled too
  // rather than the whole axis being rebuilt.
  const { fromIndex, toIndex } = xGetFromToIndex(x, {
    from: from / scale,
    to: to / scale,
  });
  const first = Math.max(0, fromIndex - 1);
  const last = Math.min(length - 1, toIndex + 1);
  if (last < first) return [];

  const points = new Array<SeriesPoint>(last - first + 1);
  for (let index = first; index <= last; index++) {
    const value = values[index] as number;
    points[index - first] = {
      x: (x[index] as number) * scale,
      y: mirrored ? 2 * baseline - value : value,
    };
  }
  return points;
}
