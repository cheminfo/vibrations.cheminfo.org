import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { StructureEditorChange } from 'react-cheminfo/structure';
import { StructureEditor } from 'react-cheminfo/structure';

import { state } from '../../state/index.ts';

import type { MoleculeLoader } from './useMoleculeLoader.ts';

/** What the uncontrolled canvas was last loaded with. */
interface EditorSeed {
  /** The molfile pushed into the canvas. */
  molfile: string;
  /** Bumped to load `molfile` into the canvas again. */
  revision: number;
  /** The molfile the canvas itself last produced, which must not be pushed back. */
  drawn: string | null;
}

/** What {@link StructureDrawer} needs. */
export interface StructureDrawerProps {
  /** Where a finished drawing goes. */
  loader: MoleculeLoader;
}

/**
 * The drawing canvas.
 *
 * The editor is uncontrolled, so the molecule in the editor is pushed into it
 * only when it came from somewhere else — a file, a SMILES, a collection. The
 * molfile the canvas itself just produced is remembered and skipped, because
 * feeding a drawing back into the pen replaces the structure under it and
 * resets every coordinate the user placed.
 * @param props - The loader the drawing is sent to.
 * @returns The canvas.
 */
export function StructureDrawer(props: StructureDrawerProps): ReactElement {
  useSignals();
  const { loader } = props;
  const molfile = state.data.molecule.value?.molfile ?? '';
  const [seed, setSeed] = useState<EditorSeed>({
    molfile,
    revision: 0,
    drawn: null,
  });

  if (seed.molfile !== molfile && seed.drawn !== molfile) {
    setSeed({ molfile, revision: seed.revision + 1, drawn: null });
  }

  const { loadMolfile } = loader;
  const handleChange = useCallback(
    (change: StructureEditorChange) => {
      if (change.smiles.trim() === '') return;
      setSeed((current) => ({ ...current, drawn: change.molfile }));
      loadMolfile(change.molfile, 'Drawn structure');
    },
    [loadMolfile],
  );

  return (
    <StructureEditor
      inputFormat="molfile"
      value={seed.molfile}
      revision={seed.revision}
      debounce={DEBOUNCE_MILLISECONDS}
      minHeight={MINIMUM_HEIGHT}
      onChange={handleChange}
    />
  );
}

/** Long enough that drawing a ring does not queue six conformer generations. */
const DEBOUNCE_MILLISECONDS = 500;

/** Room for the editor's own tool palette in a 400px-wide panel. */
const MINIMUM_HEIGHT = 320;
