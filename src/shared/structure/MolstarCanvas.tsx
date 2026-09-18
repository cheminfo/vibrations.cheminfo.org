import { Callout } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Geometry, VibrationalMode } from 'xtb-wasm';

import { highlightAtoms } from './molstarHighlight.ts';
import { createViewer, setAnimation, showTrajectory } from './molstarPlugin.ts';
import type { PluginLike } from './molstarTypes.ts';

import 'molstar/build/viewer/molstar.css';

/** What {@link MolstarCanvas} draws. */
export interface MolstarCanvasProps {
  /** The equilibrium geometry, or `null` when there is nothing to show. */
  geometry: Geometry | null;
  /** The mode to animate, or `null` to show the geometry at rest. */
  mode: VibrationalMode | null;
  /** Peak displacement of the fastest atom, in ångström. */
  amplitude: number;
  /** Frames generated per oscillation period. */
  frames: number;
  /** Milliseconds between frames. */
  frameDelay: number;
  playing: boolean;
  /**
   * Atom indices to mark in the 3D view, or `null` to mark none.
   * @default null
   */
  highlightedAtoms?: readonly number[] | null;
}

/**
 * The Mol* canvas: the molecule, and one full oscillation of the selected mode
 * looped as a multi-model trajectory, which is how Mol* animates any frame
 * series. `react-cheminfo`'s `MoleculeViewer3D` is not used here because it
 * draws one static molfile and has no notion of a trajectory.
 * @param props - The geometry, the mode, and how it is animated.
 * @returns The viewer, with a callout when Mol* could not draw the molecule.
 */
export function MolstarCanvas(props: MolstarCanvasProps): ReactElement {
  const {
    geometry,
    mode,
    amplitude,
    frames,
    frameDelay,
    playing,
    highlightedAtoms = null,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<Promise<PluginLike | null> | null>(null);
  const loadedRef = useRef<Promise<PluginLike | null> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const created =
      container === null
        ? Promise.resolve(null)
        : createViewer(container).catch((error: unknown) => {
            setError(message(error));
            return null;
          });
    pluginRef.current = created;
    return () => {
      pluginRef.current = null;
      loadedRef.current = null;
      void created.then((plugin) => plugin?.dispose());
    };
  }, []);

  useEffect(() => {
    const queue = loadedRef.current ?? pluginRef.current;
    if (queue === null || geometry === null) return;
    let cancelled = false;
    // Chained onto the previous load rather than started beside it: two
    // interleaved rebuilds of the state tree leave Mol* showing neither.
    loadedRef.current = queue.then(async (plugin) => {
      if (plugin === null || cancelled) return plugin;
      try {
        await showTrajectory(plugin, geometry, mode, amplitude, frames);
        setError(null);
      } catch (error: unknown) {
        setError(message(error));
      }
      return plugin;
    });
    return () => {
      cancelled = true;
    };
  }, [geometry, mode, amplitude, frames]);

  useEffect(() => {
    const loaded = loadedRef.current;
    if (loaded === null) return;
    let cancelled = false;
    void loaded.then(async (plugin) => {
      if (plugin === null || cancelled) return;
      await setAnimation(plugin, playing && mode !== null, frameDelay);
    });
    return () => {
      cancelled = true;
    };
  }, [geometry, mode, amplitude, frames, playing, frameDelay]);

  useEffect(() => {
    const loaded = loadedRef.current;
    if (loaded === null) return;
    let cancelled = false;
    void loaded.then(async (plugin) => {
      if (plugin === null || cancelled) return;
      await highlightAtoms(plugin, highlightedAtoms);
    });
    return () => {
      cancelled = true;
    };
  }, [geometry, mode, amplitude, frames, highlightedAtoms]);

  return (
    <div style={rootStyle}>
      {error !== null && (
        <Callout intent="danger" compact>
          {error}
        </Callout>
      )}
      <div ref={containerRef} style={canvasStyle} />
    </div>
  );
}

/**
 * Read a thrown value as a sentence.
 * @param error - Whatever was thrown.
 * @returns Its message.
 */
function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: '100%',
  height: '100%',
  minHeight: 0,
} as const satisfies CSSProperties;

const canvasStyle = {
  position: 'relative',
  flex: '1 1 1px',
  width: '100%',
  minHeight: 260,
} as const satisfies CSSProperties;
