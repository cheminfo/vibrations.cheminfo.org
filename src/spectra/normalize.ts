import type { MeasurementVariable, MeasurementXY } from 'cheminfo-types';

import type { NormalizationOptions, SpectrumTrace } from '../types/trace.ts';

import {
  HALF_TRANSMITTANCE_ABSORBANCE,
  scaleToWindowMax,
  transmittanceFromAbsorbance,
} from './absorbance.ts';

/**
 * The height a y-only curve's strongest band is scaled to. Raman activities and
 * bare text columns have no Beer–Lambert meaning, so they are put on a
 * "percent of the strongest band" axis instead of an absorbance one.
 */
export const RELATIVE_INTENSITY_REFERENCE = 100;

/**
 * Scale every trace so its strongest band inside `[from, to]` reaches the same
 * height, which is what makes a series of substituted carbonyls comparable.
 *
 * A trace carrying absorbance is rescaled on `a` — to `-log10(0.5)`, so the
 * band reads 50 % transmittance — and its `t` is recomputed from the rescaled
 * absorbance. Everything else is rescaled on `y` to 100. `y` is never touched
 * on an absorbance trace: for a computed spectrum it holds km/mol, which stays
 * comparable with a reference calculation only if it is left alone.
 *
 * The window is read against the stored wavenumbers, not against
 * `wavenumberScale`-shifted ones, so turning a scaling factor on and off does
 * not silently move the normalization window.
 * @param traces - The traces to normalize; they are not modified.
 * @param options - The window, and whether to normalize at all.
 * @returns A new array. When `enabled` is false the original traces are returned untouched.
 */
export function normalizeTraces(
  traces: readonly SpectrumTrace[],
  options: NormalizationOptions,
): SpectrumTrace[] {
  if (!options.enabled) return [...traces];

  const { from, to } = options;
  const normalized: SpectrumTrace[] = [];
  for (const trace of traces) {
    normalized.push({
      ...trace,
      measurement: normalizeMeasurement(trace.measurement, from, to),
    });
  }
  return normalized;
}

function normalizeMeasurement(
  measurement: MeasurementXY,
  from: number,
  to: number,
): MeasurementXY {
  const { variables } = measurement;
  const x = variables.x.data;
  const absorbance = variables.a;

  if (absorbance) {
    const a = scaleToWindowMax(x, absorbance.data, {
      from,
      to,
      reference: HALF_TRANSMITTANCE_ABSORBANCE,
    });
    return {
      ...measurement,
      variables: {
        ...variables,
        a: { ...absorbance, data: a },
        t: transmittanceVariable(variables.t, transmittanceFromAbsorbance(a)),
      },
    };
  }

  const y = scaleToWindowMax(x, variables.y.data, {
    from,
    to,
    reference: RELATIVE_INTENSITY_REFERENCE,
  });
  return {
    ...measurement,
    variables: { ...variables, y: { ...variables.y, data: y } },
  };
}

function transmittanceVariable(
  previous: MeasurementVariable | undefined,
  data: Float64Array,
): MeasurementVariable {
  return {
    label: previous?.label ?? 'Transmittance',
    units: previous?.units ?? '%',
    symbol: 't',
    data,
  };
}
