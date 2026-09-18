import { signal } from '@preact/signals-react';

import type { NormalizationOptions } from '../types/trace.ts';

/**
 * Which chart or charts the spectrum view shows. `both` stacks the infrared and
 * the Raman chart and puts the two intensities side by side in the mode table.
 */
export type ChartSelection = 'infrared' | 'raman' | 'both';

/**
 * Which infrared variable the chart draws. Transmittance, with the bands
 * pointing down, is the default because that is how a measured IR spectrum is
 * read.
 */
export type IrVariable = 'absorbance' | 'transmittance';

/**
 * How the molecular graph used by the Raman model and the bond→mode mapping is
 * derived. `graph` is the molecule's own connectivity; `distance` is the legacy
 * ASE rule `d < 1.5·(rᵢ + rⱼ)`, kept because it disagrees on three of the
 * thirty-six collection molecules and the difference is worth showing.
 */
export type ConnectivitySource = 'graph' | 'distance';

export const displaySignals = {
  charts: signal<ChartSelection>('infrared'),
  irVariable: signal<IrVariable>('transmittance'),
  normalization: {
    enabled: signal(false),
    /** Lower bound of the normalization window, cm⁻¹. */
    from: signal(500),
    /** Upper bound of the normalization window, cm⁻¹. */
    to: signal(4000),
  },
  /** Show every series' intensity at the pointer's wavenumber. */
  tracking: signal(true),
  /** Draw the x axis high-to-low, the way IR spectra are conventionally shown. */
  reverseAxis: signal(true),
  /** Lorentzian FWHM in cm⁻¹ used to broaden the stick spectrum. */
  fwhm: signal(20),
  /** Lowest wavenumber drawn, cm⁻¹. */
  from: signal(400),
  /** Highest wavenumber drawn, cm⁻¹. */
  to: signal(4000),
  /**
   * Multiplies every computed wavenumber before drawing. Harmonic frequencies
   * are systematically too high and a scaling factor is the conventional fix, so
   * it is exposed rather than silently applied.
   */
  wavenumberScale: signal(1),
  connectivity: signal<ConnectivitySource>('graph'),
  animation: {
    /** Peak Cartesian displacement in Ångström. */
    amplitude: signal(0.35),
    /** Frames per animation period. */
    frames: signal(20),
    /** Milliseconds between frames. */
    frameDelay: signal(40),
  },
};

/** The normalization window as the spectra layer wants it. */
export function currentNormalization(): NormalizationOptions {
  return {
    enabled: displaySignals.normalization.enabled.value,
    from: displaySignals.normalization.from.value,
    to: displaySignals.normalization.to.value,
  };
}
