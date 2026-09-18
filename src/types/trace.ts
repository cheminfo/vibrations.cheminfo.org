import type { MeasurementXY } from 'cheminfo-types';

/**
 * Which physical observable a trace carries. IR absorbance, IR transmittance
 * and Raman never share an intensity axis, so the kind decides which chart a
 * trace belongs on and which way its bands point.
 */
export type SpectrumKind = 'ir-absorbance' | 'ir-transmittance' | 'raman';

/** Where a trace came from, which is what the legend shows. */
export type TraceOrigin =
  | { kind: 'computed'; resultId: string; engineId: string }
  | {
      kind: 'experimental';
      fileName: string;
      /** Which package parsed the file. */
      parser: 'ir-spectrum' | 'raman-spectrum' | 'spc-parser' | 'xy-parser';
    };

/**
 * One curve on the chart. A computed spectrum and a dropped experimental file
 * are the same shape here, which is what makes superposition possible:
 * everything is a `MeasurementXY` by the time it reaches the plot.
 */
export interface SpectrumTrace {
  /** Stable id, used as the React key and by the legend. */
  id: string;
  label: string;
  /** Colour from the colour-blind-safe palette; never repeated within a chart. */
  color: string;
  kind: SpectrumKind;
  origin: TraceOrigin;
  /**
   * x is wavenumber in cm⁻¹. The available y variables follow the ir-spectrum
   * convention: `y` the source values, `a` absorbance, `t` transmittance in %.
   */
  measurement: MeasurementXY;
  /** Draw below the baseline, for a mirrored computed-vs-experimental view. @default false */
  mirrored?: boolean;
  /**
   * Multiplies every wavenumber before drawing. Harmonic frequencies are
   * systematically too high, and a scaling factor is the conventional fix, so
   * it is exposed rather than silently applied.
   * @default 1
   */
  wavenumberScale?: number;
  /** @default true */
  visible?: boolean;
}

/**
 * How a set of traces is normalized before being drawn: each spectrum is scaled
 * so its strongest band inside a chosen window reaches the same height, which
 * is what makes a series of substituted carbonyls comparable.
 */
export interface NormalizationOptions {
  /** @default false */
  enabled: boolean;
  /** Lower bound of the window, cm⁻¹. @default 500 */
  from: number;
  /** Upper bound of the window, cm⁻¹. @default 4000 */
  to: number;
}
