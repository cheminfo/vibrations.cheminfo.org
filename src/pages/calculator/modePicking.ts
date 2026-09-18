import type { VibrationalMode } from 'xtb-wasm';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';

/** How a point on a spectrum is resolved back to the mode that produced it. */
export interface ModePickOptions {
  /** The width the chart was drawn with, cm⁻¹. */
  fwhm: number;
  /** Which chart was clicked, which decides whose intensity is weighed. */
  chart: SpectrumChartKind;
  /** How far from a band a pick may land, in multiples of `fwhm`. @default 3 */
  reach?: number;
  /** The wavenumber scaling the chart was drawn with. @default 1 */
  wavenumberScale?: number;
}

/**
 * Which mode a point on the spectrum belongs to.
 *
 * Modes are weighed by the Lorentzian contribution they make at that
 * wavenumber, so picking a band picks the mode that produced it rather than
 * whichever stick happens to sit nearest. A mode with no intensity on this
 * chart still counts, with unit weight, because an inactive mode is exactly
 * what a student clicking an empty region is looking for.
 * @param modes - The modes drawn in the spectrum.
 * @param wavenumber - Where the user pointed, cm⁻¹, on the drawn axis.
 * @param options - The broadening and chart the spectrum was drawn with.
 * @returns Index into `modes`, or `null` when nothing is close enough.
 */
export function modeAtWavenumber(
  modes: readonly VibrationalMode[],
  wavenumber: number,
  options: ModePickOptions,
): number | null {
  const { fwhm, chart, reach = 3, wavenumberScale = 1 } = options;
  const maxDistance = fwhm * reach;

  let best: number | null = null;
  let bestWeight = 0;
  for (let index = 0; index < modes.length; index++) {
    const mode = modes[index] as VibrationalMode;
    // An imaginary mode is not a band, so it is not drawn and cannot be picked.
    if (mode.wavenumber <= 0) continue;
    const centre = mode.wavenumber * wavenumberScale;
    const distance = Math.abs(wavenumber - centre);
    if (distance > maxDistance) continue;
    const halfWidths = (2 * distance) / fwhm;
    const intensity = modeIntensity(mode, chart) ?? 1;
    const weight = intensity / (1 + halfWidths * halfWidths);
    if (weight > bestWeight) {
      bestWeight = weight;
      best = index;
    }
  }
  return best;
}

/**
 * The intensity a mode shows on one chart.
 * @param mode - The mode.
 * @param chart - Which chart is being read.
 * @returns The intensity, or `null` when it was not computed.
 */
export function modeIntensity(
  mode: VibrationalMode,
  chart: SpectrumChartKind,
): number | null {
  return chart === 'raman' ? mode.ramanActivity : mode.irIntensity;
}
