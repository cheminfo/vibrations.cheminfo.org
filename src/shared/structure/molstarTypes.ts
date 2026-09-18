import type { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type {
  Structure,
  StructureElement,
  Unit,
} from 'molstar/lib/mol-model/structure.js';

/**
 * The part of Mol*'s plugin this app uses.
 *
 * Mol* is loaded lazily, so its plugin type cannot be imported as a value
 * without pulling several megabytes into the initial chunk; this names the
 * handful of members that are actually called.
 */
export interface PluginLike {
  clear: () => Promise<void>;
  dispose: () => void;
  builders: {
    data: {
      rawData: (params: { data: string; label?: string }) => Promise<unknown>;
    };
    structure: {
      parseTrajectory: (data: unknown, format: string) => Promise<unknown>;
      hierarchy: {
        applyPreset: (trajectory: unknown, preset: string) => Promise<unknown>;
      };
    };
  };
  managers: {
    animation: {
      play: (animation: unknown, params: unknown) => Promise<void>;
      stop: () => Promise<void>;
    };
    interactivity: {
      lociHighlights: {
        clearHighlights: (noRender?: boolean) => void;
        highlightOnly: (
          current: { loci: unknown },
          applyGranularity?: boolean,
        ) => void;
      };
    };
    structure: {
      hierarchy: {
        current: {
          structures: Array<{ cell: { obj?: { data: Structure } } }>;
        };
      };
    };
  };
}

/** One unit of a Mol* structure and the atoms of it that are selected. */
export interface LociElement {
  unit: Unit;
  indices: OrderedSet<StructureElement.UnitIndex>;
}
