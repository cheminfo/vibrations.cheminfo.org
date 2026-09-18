import type { Geometry, VibrationalMode } from 'xtb-wasm';

import type { PluginLike } from './molstarTypes.ts';
import { framesPerSecond, trajectoryXyz } from './trajectory.ts';

/**
 * Create a Mol* plugin inside a container.
 *
 * Every Mol* module is imported dynamically: the viewer is several megabytes
 * and must not sit in the chunk that draws the first spectrum.
 * @param container - The element the canvas is mounted in.
 * @returns The plugin, with its own UI controls hidden.
 */
export async function createViewer(
  container: HTMLDivElement,
): Promise<PluginLike> {
  const [{ createPluginUI }, { renderReact18 }, specModule] = await Promise.all(
    [
      import('molstar/lib/mol-plugin-ui/index.js'),
      import('molstar/lib/mol-plugin-ui/react18.js'),
      import('molstar/lib/mol-plugin-ui/spec.js'),
    ],
  );
  // Mol* names this factory like a constructor, but it is a plain function.
  const defaultSpec = specModule.DefaultPluginUISpec;

  return createPluginUI({
    target: container,
    render: renderReact18,
    spec: {
      ...defaultSpec(),
      layout: { initial: { isExpanded: false, showControls: false } },
    },
  }) as unknown as Promise<PluginLike>;
}

/**
 * Replace whatever the viewer holds with one oscillation of a mode.
 * @param plugin - The Mol* plugin.
 * @param geometry - The equilibrium geometry.
 * @param mode - The mode to animate, or `null` for the geometry at rest.
 * @param amplitude - Peak displacement of the fastest atom, in ångström.
 * @param frames - Frames per period.
 */
export async function showTrajectory(
  plugin: PluginLike,
  geometry: Geometry,
  mode: VibrationalMode | null,
  amplitude: number,
  frames: number,
): Promise<void> {
  // A running animation must not tick against a half-built state tree: it reads
  // zero models and stops itself.
  await plugin.managers.animation.stop();
  await plugin.clear();
  const raw = await plugin.builders.data.rawData({
    data: trajectoryXyz(geometry, mode, amplitude, frames),
    label: 'molecule',
  });
  const trajectory = await plugin.builders.structure.parseTrajectory(
    raw,
    'xyz',
  );
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
}

/**
 * Start or stop looping through the loaded frames.
 * @param plugin - The Mol* plugin.
 * @param playing - Whether the animation should run.
 * @param frameDelay - Milliseconds between frames.
 */
export async function setAnimation(
  plugin: PluginLike,
  playing: boolean,
  frameDelay: number,
): Promise<void> {
  if (!playing) {
    await plugin.managers.animation.stop();
    return;
  }
  const { AnimateModelIndex } =
    await import('molstar/lib/mol-plugin-state/animation/built-in/model-index.js');
  await plugin.managers.animation.play(AnimateModelIndex, {
    mode: { name: 'loop', params: { direction: 'forward' } },
    duration: {
      name: 'sequential',
      params: { maxFps: framesPerSecond(frameDelay) },
    },
  });
}
