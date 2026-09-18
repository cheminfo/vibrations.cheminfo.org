import type { MeasurementXY } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import type { VibrationalMode } from 'xtb-wasm';

import type { NormalizationOptions } from '../types/trace.ts';

import { absorbanceAndTransmittance } from './absorbance.ts';

/** The grid and line shape a stick spectrum is folded onto. */
export interface BroadenOptions {
  /** Full width at half maximum of every band, cm⁻¹. */
  fwhm: number;
  /** Lower bound of the grid, cm⁻¹. */
  from: number;
  /** Upper bound of the grid, cm⁻¹. */
  to: number;
  /** Number of grid points. */
  points: number;
  /**
   * Line shape. Lorentzian is the shape of a homogeneously broadened
   * vibrational band and is what `irTraceFromModes` defaults to;
   * `ramanTraceFromModes` defaults to Gaussian instead, the shape of ASE's
   * `Infrared.fold`.
   * @default 'lorentzian' for IR, 'gaussian' for Raman
   */
  shape?: 'gaussian' | 'lorentzian';
}

/**
 * The grid of ASE's `Infrared.fold(normalize=False)`: a Gaussian of 4 cm⁻¹
 * over 0–4000 cm⁻¹
 * sampled at ten points per width, i.e. `(4000 − 0) / 4 × 10 + 1` points, with
 * each band's height rather than its area set to the mode intensity.
 *
 * `generateSpectrum` reproduces that fold to 0.016 % of peak height, the
 * residual being its own truncation of a Gaussian past ~1.7 FWHM. Pass this to
 * `ramanTraceFromModes` for a Raman curve on ASE's grid. It suits IR less
 * well: `irTraceFromModes` uses the Lorentzian a homogeneously broadened
 * vibrational band actually has.
 */
export const ASE_FOLD_BROADENING: BroadenOptions = {
  fwhm: 4,
  from: 0,
  to: 4000,
  points: 10_001,
  shape: 'gaussian',
};

/** A broadening request that also says which window to normalize inside. */
export interface IrBroadenOptions extends BroadenOptions {
  /**
   * The window whose strongest band is scaled to 50 % transmittance. When
   * absent or disabled the whole grid is the window.
   * @default undefined
   */
  normalization?: NormalizationOptions;
}

/**
 * Broaden computed IR modes into a measurement carrying three y variables:
 * `y` the raw intensity in km/mol, `a` the normalized absorbance and `t` the
 * transmittance in percent.
 *
 * `y` is never aliased to `a`: the km/mol magnitudes stay available for
 * comparison with a reference calculation, while `a` is the rescaled copy that
 * Beer–Lambert is allowed to act on. Each band carries its mode's intensity as
 * its height rather than its area, so an isolated band's maximum reads that
 * intensity in km/mol directly; with one width shared by every band, height and
 * area differ only by the constant `1.064 · fwhm` (Gaussian) and the plotted
 * shape is the same either way. Dividing a km/mol intensity by
 * `KM_PER_MOL_PER_DEBYE_ANGSTROM_AMU` from `src/chemistry/constants.ts`
 * gives ASE's `(D/Å)²/amu` magnitudes.
 *
 * Imaginary modes are dropped: a negative wavenumber is not an absorption band.
 * @param modes - The vibrational modes, in any order.
 * @param options - Grid, line shape and normalization window.
 * @returns The broadened IR measurement.
 */
export function irTraceFromModes(
  modes: readonly VibrationalMode[],
  options: IrBroadenOptions,
): MeasurementXY<Float64Array> {
  const { normalization, from, to } = options;
  const curve = broaden(modes, 'ir', { shape: 'lorentzian', ...options });

  const window =
    normalization?.enabled === true
      ? { from: normalization.from, to: normalization.to }
      : { from, to };
  const { a, t } = absorbanceAndTransmittance(curve.x, curve.y, window);

  return {
    id: crypto.randomUUID(),
    dataType: 'INFRARED SPECTRUM',
    variables: {
      x: { label: 'Wavenumber', units: 'cm-1', symbol: 'x', data: curve.x },
      y: { label: 'IR intensity', units: 'km/mol', symbol: 'y', data: curve.y },
      a: { label: 'Absorbance', units: '', symbol: 'a', data: a },
      t: { label: 'Transmittance', units: '%', symbol: 't', data: t },
    },
  };
}

/**
 * Broaden computed Raman modes into a measurement carrying the scattering
 * activity as `y`. No absorbance or transmittance is synthesised: Raman is a
 * scattering intensity and Beer–Lambert says nothing about it.
 * @param modes - The vibrational modes, in any order.
 * @param options - Grid and line shape; the shape defaults to Gaussian.
 * @returns The broadened Raman measurement.
 */
export function ramanTraceFromModes(
  modes: readonly VibrationalMode[],
  options: BroadenOptions,
): MeasurementXY<Float64Array> {
  const curve = broaden(modes, 'raman', { shape: 'gaussian', ...options });

  return {
    id: crypto.randomUUID(),
    dataType: 'RAMAN SPECTRUM',
    variables: {
      x: { label: 'Raman shift', units: 'cm-1', symbol: 'x', data: curve.x },
      y: {
        label: 'Raman activity',
        units: 'A^4/amu',
        symbol: 'y',
        data: curve.y,
      },
    },
  };
}

function broaden(
  modes: readonly VibrationalMode[],
  kind: 'ir' | 'raman',
  options: BroadenOptions,
): { x: Float64Array; y: Float64Array } {
  const { fwhm, from, to, points, shape = 'lorentzian' } = options;

  // spectrum-generator@8.2.1 rejects typed arrays at run time despite its own
  // types accepting them, so the peaks go in one object at a time.
  //
  // A mode outside [from, to] is kept: its band centre falls off the grid but
  // its wing does not, and a Lorentzian 15 cm⁻¹ below a grid edge still reaches
  // 31 % of its height at the first point, which clipping here would delete.
  const peaks: Array<{ x: number; y: number }> = [];
  let hasBandAboveGrid = false;
  for (const mode of modes) {
    const { wavenumber, irIntensity, ramanActivity } = mode;
    if (wavenumber <= 0) continue;
    const intensity = kind === 'ir' ? irIntensity : ramanActivity;
    if (intensity === null || intensity <= 0) continue;
    if (wavenumber > to) hasBandAboveGrid = true;
    peaks.push({ x: wavenumber, y: intensity });
  }

  // spectrum-generator@8.2.1 adds a band whose centre sits above `to` into the
  // final grid point twice, wherever that centre is — measured as exactly 2×
  // there and exact everywhere else. One extra step absorbs the doubled point
  // and is dropped, which leaves the requested grid unshifted to 5e-13 cm⁻¹.
  const step = points > 1 ? (to - from) / (points - 1) : 0;
  const extraPoints = hasBandAboveGrid && step > 0 ? 1 : 0;
  const generated = generateSpectrum(peaks, {
    generator: {
      from,
      to: to + extraPoints * step,
      nbPoints: points + extraPoints,
    },
    peakOptions: { width: fwhm, shape: { kind: shape } },
  });
  if (extraPoints === 0) return { x: generated.x, y: generated.y };
  return {
    x: generated.x.subarray(0, points),
    y: generated.y.subarray(0, points),
  };
}
