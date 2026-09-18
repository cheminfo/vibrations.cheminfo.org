import type { VibrationalMode } from 'xtb-wasm';

/** The band a collection uses as its probe, and where to look for it. */
export interface BandProbe {
  /** What the band is, e.g. `C=O stretch`. */
  label: string;
  /** Lower edge of the search window, in cm⁻¹. */
  from: number;
  /** Upper edge of the search window, in cm⁻¹. */
  to: number;
}

/** One band read off a computed spectrum. */
export interface KeyBand {
  /** Index into the result's `modes`. */
  index: number;
  wavenumber: number;
  /** IR intensity in km/mol, or `null` when intensities were not computed. */
  irIntensity: number | null;
}

/**
 * The window every carbonyl collection probes.
 *
 * Wide on purpose: GFN2 harmonic wavenumbers are systematically high, and the
 * series here run from a conjugated amide near 1600 cm⁻¹ to an acyl fluoride
 * well above 1900 cm⁻¹, so a tight window would silently miss an end member.
 */
export const CARBONYL_PROBE: BandProbe = {
  label: 'C=O stretch',
  from: 1500,
  to: 2100,
};

/**
 * Which band makes each collection's point, keyed by collection id.
 *
 * `gross-selection-rule` has no entry: nitrogen, carbon dioxide and methane
 * carry no carbonyl, and what that collection teaches is how many bands are
 * visible at all, not where one of them sits.
 */
export const COLLECTION_PROBES: Readonly<Record<string, BandProbe>> = {
  'directing-groups': CARBONYL_PROBE,
  'inductive-mesomeric-effect': CARBONYL_PROBE,
  'mesomeric-effect': CARBONYL_PROBE,
  'ring-strain': CARBONYL_PROBE,
  'steric-effect': CARBONYL_PROBE,
  'theory-vs-experiment': CARBONYL_PROBE,
};

/**
 * Fraction of the strongest band an IR intensity must reach to be counted as a
 * visible band. Harmonic intensities of formally forbidden modes are not
 * exactly zero, so a bare non-zero test would report every mode as active and
 * the mutual-exclusion collection would teach the opposite of its point.
 */
export const IR_ACTIVE_FRACTION = 0.01;

/**
 * The strongest infrared band inside a probe window.
 * @param modes - The modes of one result.
 * @param probe - The window to look in.
 * @returns The band, or `null` when no real mode falls inside the window.
 */
export function strongestBand(
  modes: readonly VibrationalMode[],
  probe: BandProbe,
): KeyBand | null {
  let best: KeyBand | null = null;
  let bestIntensity = -1;
  for (let index = 0; index < modes.length; index++) {
    const mode = modes[index] as VibrationalMode;
    if (mode.wavenumber <= 0) continue;
    if (mode.wavenumber < probe.from || mode.wavenumber > probe.to) continue;
    const intensity = mode.irIntensity ?? 0;
    if (intensity <= bestIntensity) continue;
    bestIntensity = intensity;
    best = {
      index,
      wavenumber: mode.wavenumber,
      irIntensity: mode.irIntensity,
    };
  }
  return best;
}

/**
 * How many distinct infrared bands a spectrum really shows.
 *
 * Degenerate modes are counted once, because a spectrum cannot resolve them:
 * that is what makes methane show two bands where it has nine modes.
 * @param modes - The modes of one result, ascending by wavenumber as every
 * engine returns them.
 * @param tolerance - How close two wavenumbers must be to count as one band, in cm⁻¹.
 * @returns The number of bands above {@link IR_ACTIVE_FRACTION} of the strongest.
 */
export function countInfraredBands(
  modes: readonly VibrationalMode[],
  tolerance = 5,
): number {
  let strongest = 0;
  for (const mode of modes) {
    if (mode.wavenumber <= 0) continue;
    const intensity = mode.irIntensity ?? 0;
    if (intensity > strongest) strongest = intensity;
  }
  if (strongest <= 0) return 0;

  const cutoff = strongest * IR_ACTIVE_FRACTION;
  let bands = 0;
  let previous = Number.NEGATIVE_INFINITY;
  for (const mode of modes) {
    if (mode.wavenumber <= 0) continue;
    if ((mode.irIntensity ?? 0) < cutoff) continue;
    if (mode.wavenumber - previous <= tolerance) continue;
    bands++;
    previous = mode.wavenumber;
  }
  return bands;
}
