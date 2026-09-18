import { useCallback, useRef, useState } from 'react';
import type { LoadedMolecules, Molecule } from 'xtb-wasm';
import {
  moleculeFromMolfile,
  moleculesFromFile,
  moleculesFromText,
} from 'xtb-wasm';

import { setMolecule, state } from '../../state/index.ts';

/** What the molecule input shows while and after a load. */
export interface MoleculeLoaderState {
  loading: boolean;
  /** Why the last load failed, or `null`. */
  error: string | null;
  /** Non-fatal notes from the loader: generated geometry, skipped records. */
  warnings: readonly string[];
  /**
   * Every molecule the last load yielded, when it yielded more than one. The
   * first is already loaded; the rest are offered so the user can switch.
   */
  candidates: readonly Molecule[];
}

/** The loader state plus the ways to feed it. */
export interface MoleculeLoader extends MoleculeLoaderState {
  /** Read dropped or chosen files. */
  loadFiles: (files: readonly File[]) => void;
  /** Read pasted text: SMILES, molfile, SDF, XYZ or PDB. */
  loadText: (text: string, fileName?: string) => void;
  /** Read one molfile, which is what the drawing canvas produces. */
  loadMolfile: (molfile: string, label: string) => void;
  /** Make one of the candidates the molecule in the editor. */
  choose: (molecule: Molecule) => void;
  /** Forget the last error, warnings and candidates. */
  dismiss: () => void;
}

/**
 * Load molecules into the editor from text, from files, or from the drawing
 * canvas, keeping one place for the loading flag, the error and the warnings.
 *
 * A load that has been superseded is dropped rather than applied late, so
 * dropping a second file while the first is still parsing cannot leave the
 * earlier molecule in the editor.
 * @returns The loader state and its actions.
 */
export function useMoleculeLoader(): MoleculeLoader {
  const [status, setStatus] = useState<MoleculeLoaderState>(IDLE);
  const tokenRef = useRef(0);

  const run = useCallback(
    async (load: () => Promise<LoadedMolecules>): Promise<void> => {
      const token = ++tokenRef.current;
      setStatus({ loading: true, error: null, warnings: [], candidates: [] });
      try {
        const loaded = await load();
        if (tokenRef.current !== token) return;
        const first = loaded.molecules[0];
        if (first === undefined) {
          throw new Error('no molecule was found in that input');
        }
        setMolecule(first, loaded.warnings);
        setStatus({
          loading: false,
          error: null,
          warnings: loaded.warnings,
          candidates: loaded.molecules.length > 1 ? loaded.molecules : [],
        });
      } catch (error: unknown) {
        if (tokenRef.current !== token) return;
        setStatus({
          loading: false,
          error: error instanceof Error ? error.message : String(error),
          warnings: [],
          candidates: [],
        });
      }
    },
    [],
  );

  const loadFiles = useCallback(
    (files: readonly File[]) => {
      void run(async () => {
        const loads = new Array<Promise<LoadedMolecules>>(files.length);
        for (let index = 0; index < files.length; index++) {
          loads[index] = moleculesFromFile(files[index] as File);
        }
        const results = await Promise.all(loads);
        const merged: LoadedMolecules = { molecules: [], warnings: [] };
        for (const result of results) {
          merged.molecules.push(...result.molecules);
          merged.warnings.push(...result.warnings);
        }
        return merged;
      });
    },
    [run],
  );

  const loadText = useCallback(
    (text: string, fileName?: string) => {
      void run(() => moleculesFromText(text, fileName));
    },
    [run],
  );

  const loadMolfile = useCallback(
    (molfile: string, label: string) => {
      void run(async () => ({
        molecules: [await moleculeFromMolfile(molfile, label)],
        warnings: [],
      }));
    },
    [run],
  );

  const choose = useCallback((molecule: Molecule) => {
    setMolecule(molecule, state.data.moleculeWarnings.value);
  }, []);

  const dismiss = useCallback(() => setStatus(IDLE), []);

  return { ...status, loadFiles, loadText, loadMolfile, choose, dismiss };
}

const IDLE: MoleculeLoaderState = {
  loading: false,
  error: null,
  warnings: [],
  candidates: [],
};
