import type { Geometry, VibrationalMode } from 'xtb-wasm';
import { toXyz } from 'xtb-wasm';

/**
 * A multi-model XYZ holding one full oscillation of a mode, or the single model
 * at rest when no mode is selected.
 *
 * The frames sample a sine over a whole period, so the last one wraps smoothly
 * onto the first and a looped playback never jumps. The stored displacement
 * vector is read, never written: it is divided by the mode's own
 * `maxDisplacement` so the largest atom moves by `amplitude` ångström whatever
 * the eigenvector's normalization.
 * @param geometry - The equilibrium geometry, in ångström.
 * @param mode - The mode to animate, or `null` for the equilibrium geometry.
 * @param amplitude - Peak displacement of the fastest atom, in ångström.
 * @param frames - Frames per period; at least two.
 * @returns XYZ text, one model per frame.
 */
export function trajectoryXyz(
  geometry: Geometry,
  mode: VibrationalMode | null,
  amplitude: number,
  frames: number,
): string {
  if (mode === null) return toXyz(geometry, 'equilibrium');

  const scale =
    mode.maxDisplacement === 0 ? 0 : amplitude / mode.maxDisplacement;
  const size = geometry.coordinates.length;
  const frameCount = Math.max(2, Math.round(frames));
  const displaced = new Float64Array(size);
  const parts = new Array<string>(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    const step = scale * Math.sin((2 * Math.PI * frame) / frameCount);
    for (let index = 0; index < size; index++) {
      displaced[index] =
        (geometry.coordinates[index] as number) +
        step * (mode.cartesianDisplacement[index] as number);
    }
    parts[frame] = toXyz(
      { elements: geometry.elements, coordinates: displaced },
      `frame ${frame + 1} of ${frameCount} — ${mode.wavenumber.toFixed(1)} cm-1`,
    );
  }
  return parts.join('');
}

/**
 * Turn a frame delay into the frame rate Mol*'s animation manager wants.
 * @param frameDelay - Milliseconds between frames.
 * @returns A rate Mol* accepts, between 5 and 60 frames per second.
 */
export function framesPerSecond(frameDelay: number): number {
  return Math.min(60, Math.max(5, Math.round(1000 / frameDelay)));
}
