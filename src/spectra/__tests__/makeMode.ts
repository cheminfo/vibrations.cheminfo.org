import type { VibrationalMode } from 'xtb-wasm';

/**
 * A `VibrationalMode` carrying only the fields the spectrum code reads, so a
 * test can state a stick spectrum as a list of (wavenumber, intensity) pairs.
 *
 * The displacement fields are present but empty: nothing in `src/spectra` looks
 * at them, and filling them in would only invite a reader to believe they mean
 * something here.
 * @param wavenumber - Harmonic wavenumber in cm⁻¹; negative for an imaginary mode.
 * @param irIntensity - IR intensity in km/mol, or `null` when not computed.
 * @param ramanActivity - Raman activity in Å⁴/amu, or `null` when not computed.
 * @returns The mode.
 */
export function makeMode(
  wavenumber: number,
  irIntensity: number | null,
  ramanActivity: number | null,
): VibrationalMode {
  return {
    wavenumber,
    irIntensity,
    ramanActivity,
    depolarizationRatio: null,
    eigenvector: new Float64Array(0),
    cartesianDisplacement: new Float64Array(0),
    maxDisplacement: 0,
    reducedMass: 0,
    forceConstant: 0,
    involvement: null,
  };
}
