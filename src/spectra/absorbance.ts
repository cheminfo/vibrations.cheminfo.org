import type { NumberArray } from 'cheminfo-types';
import { xDivide, xGetFromToIndex, xMaxValue } from 'ml-spectra-processing';

/**
 * The absorbance the strongest band is scaled to by default: `-log10(0.5)`, so
 * that band reads exactly 50 % transmittance. It is a pedagogic choice rather
 * than a physical one — a computed IR intensity has no path length or concentration behind it,
 * so there is no absolute absorbance to report.
 */
export const HALF_TRANSMITTANCE_ABSORBANCE = -Math.log10(0.5);

/** How a raw intensity curve is turned into absorbance and transmittance. */
export interface AbsorbanceOptions {
  /** Lower bound of the window the strongest band is looked for in, cm⁻¹. @default x[0] */
  from?: number;
  /** Upper bound of that window, cm⁻¹. @default x[x.length - 1] */
  to?: number;
  /** Absorbance the strongest band in the window is scaled to. @default HALF_TRANSMITTANCE_ABSORBANCE */
  reference?: number;
}

/** A matched absorbance / transmittance pair, both freshly allocated. */
export interface AbsorbanceTransmittance {
  /** Normalized absorbance, dimensionless. */
  a: Float64Array;
  /** Transmittance in percent. */
  t: Float64Array;
}

/**
 * Absorbance and transmittance for a raw intensity curve.
 *
 * The intensity is first rescaled so its largest value inside `[from, to]`
 * equals `reference`, and only then is Beer–Lambert applied as
 * `T(%) = 100 · 10^(−A)`. The rescaling is not cosmetic and must not be
 * skipped: a computed band carries an intensity in km/mol, and feeding 300
 * km/mol straight into `10^(−A)` underflows to a flat zero transmittance.
 *
 * The steps are `xGetFromToIndex(x, {from, to})`, then
 * `xMaxValue(a, {fromIndex, toIndex})`, then `a = xDivide(a, maxValue /
 * reference)`, and finally `T = 10^(−a) · 100`. Plotting absorbance rather
 * than transmittance uses `reference: 1`.
 *
 * The rescaling does not depend on the normalization switch: a computed
 * intensity has no absolute absorbance to fall back on, so a raw km/mol value
 * fed to `10^(−a)` would draw a flat zero. Transmittance is always plain
 * Beer–Lambert on the rescaled absorbance, never a separately min–max-scaled
 * quantity.
 * @param x - Wavenumbers in cm⁻¹, matching `intensity` point for point.
 * @param intensity - Raw intensities, in any unit.
 * @param options - Normalization window and target absorbance.
 * @returns The absorbance and transmittance arrays.
 */
export function absorbanceAndTransmittance(
  x: NumberArray,
  intensity: NumberArray,
  options: AbsorbanceOptions = {},
): AbsorbanceTransmittance {
  const { reference = HALF_TRANSMITTANCE_ABSORBANCE, ...window } = options;
  const a = scaleToWindowMax(x, intensity, { ...window, reference });
  return { a, t: transmittanceFromAbsorbance(a) };
}

/**
 * Rescale a curve so its largest value inside `[from, to]` equals `reference`.
 *
 * A window whose maximum is zero or negative leaves the values untouched: there
 * is nothing to scale to, and dividing by it would produce infinities.
 * @param x - The abscissa, matching `values` point for point.
 * @param values - The values to rescale.
 * @param options - The window and the height its maximum is scaled to.
 * @returns A new array of rescaled values.
 */
export function scaleToWindowMax(
  x: NumberArray,
  values: NumberArray,
  options: AbsorbanceOptions & { reference: number },
): Float64Array {
  const { from, to, reference } = options;
  const { fromIndex, toIndex } = xGetFromToIndex(x, { from, to });
  const maxValue = xMaxValue(values, { fromIndex, toIndex });
  return xDivide(values, maxValue > 0 ? maxValue / reference : 1);
}

/**
 * Transmittance in percent from absorbance, `T = 100 · 10^(−A)`.
 * @param a - Absorbance values.
 * @returns A new array of transmittances in percent.
 */
export function transmittanceFromAbsorbance(a: NumberArray): Float64Array {
  const { length } = a;
  const t = new Float64Array(length);
  for (let index = 0; index < length; index++) {
    t[index] = 100 * 10 ** -(a[index] as number);
  }
  return t;
}
