import { signal } from '@preact/signals-react';
import type { Molecule } from 'xtb-wasm';

import { resetStructureOverrides } from './settings.ts';

/** One row of the validation table: a fixture and how far the browser landed from it. */
export interface ValidationRow {
  fixtureId: string;
  label: string;
  atoms: number;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'error';
  /** Largest absolute frequency deviation from the reference, in cm⁻¹. */
  maxFrequencyDelta: number | null;
  /** Energy deviation from the reference, in Hartree. */
  energyDelta: number | null;
  cosineSimilarity: number | null;
  durationMs: number | null;
  message: string | null;
}

export const data = {
  /**
   * The molecule in the editor, i.e. the one the next run will compute. It is
   * not the molecule the panels describe — that one belongs to the selected
   * history entry, and the two differ as soon as the user draws something new.
   */
  molecule: signal<Molecule | null>(null),
  /** What the loader had to say about the molecule: guessed geometry, dropped records. */
  moleculeWarnings: signal<readonly string[]>([]),
  validation: signal<readonly ValidationRow[]>([]),
};

/**
 * Load a molecule into the editor. The result history is left alone — comparing
 * several molecules at once is the point of it — but the charge and
 * unpaired-electron overrides are dropped so the new structure's own values
 * apply.
 * @param molecule - The molecule to load.
 * @param warnings - What the loader wants the user to know.
 * @default warnings []
 */
export function setMolecule(
  molecule: Molecule,
  warnings: readonly string[] = [],
): void {
  data.molecule.value = molecule;
  data.moleculeWarnings.value = warnings;
  resetStructureOverrides();
}

/** Empty the editor. */
export function clearMolecule(): void {
  data.molecule.value = null;
  data.moleculeWarnings.value = [];
}
