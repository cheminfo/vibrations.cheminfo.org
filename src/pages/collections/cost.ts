import type { CollectionEntry } from '../../data/index.ts';

/**
 * Seconds a 33-atom molecule takes, measured in `experiments/benchmark` after
 * the fused displacement sweep and the worker pool landed.
 */
const REFERENCE_SECONDS = 4;

/** Atom count `REFERENCE_SECONDS` was measured at. */
const REFERENCE_ATOMS = 33;

/**
 * A rough wall-clock estimate for one molecule, in seconds.
 *
 * The displacement sweep costs 6N gradients and each gradient grows about with
 * the square of the atom count, so the run scales close to N³ — which is what
 * the measured points (1.2 s at 12 atoms, 8 s at 24, 20 s at 33, all before the
 * speedups) actually follow. It is an order of magnitude, not a promise, and
 * the UI must present it as one.
 * @param atoms - Atom count including hydrogens.
 * @returns Estimated seconds, never negative.
 */
export function estimateSeconds(atoms: number): number {
  if (atoms <= 0) return 0;
  const ratio = atoms / REFERENCE_ATOMS;
  return REFERENCE_SECONDS * ratio * ratio * ratio;
}

/**
 * A rough wall-clock estimate for a whole queue, in seconds.
 * @param entries - The entries that will be run, in any order.
 * @returns Estimated seconds for all of them, run one after another.
 */
export function estimateQueueSeconds(
  entries: readonly CollectionEntry[],
): number {
  let total = 0;
  for (const entry of entries) total += estimateSeconds(entry.atoms);
  return total;
}

/**
 * A duration written the way a person reads it.
 * @param seconds - The duration.
 * @returns `12 s`, `3 min 20 s`, or `< 1 s` for anything shorter than a second.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 1) return '< 1 s';
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole} s`;
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}
