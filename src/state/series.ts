import { computed, signal } from '@preact/signals-react';
import type { Molecule, VibrationalMode, VibrationalResult } from 'xtb-wasm';

import type { SpectrumTrace } from '../types/trace.ts';

/**
 * One finished calculation as the history carries it: the result plus the three
 * things the history table lets the user change — its colour on the chart,
 * whether it is drawn, and whether it is the one the panels describe.
 */
export interface ResultEntry {
  /** Same value as `result.id`, lifted out so it can be used as a React key. */
  id: string;
  result: VibrationalResult;
  /** The molecule that was computed, i.e. `result.request.molecule`. */
  molecule: Molecule;
  /** Six-digit hex colour, unique among the entries and experimental traces. */
  color: string;
  /** The eye in the history table. A hidden entry keeps its colour. */
  visible: boolean;
  /** When the run finished, in milliseconds since the epoch. */
  completedAt: number;
}

export const series = {
  /** Every completed calculation, oldest first. */
  results: signal<readonly ResultEntry[]>([]),
  /** Which entry the mode table, the depiction and the 3D viewer describe. */
  activeResultId: signal<string | null>(null),
  /** Spectra dropped by the user, drawn on the same charts as the computed ones. */
  experimental: signal<readonly SpectrumTrace[]>([]),
};

/** The history entry currently selected, or `null` when nothing is selected. */
export const activeEntry = computed<ResultEntry | null>(() => {
  const id = series.activeResultId.value;
  if (id === null) return null;
  for (const entry of series.results.value) {
    if (entry.id === id) return entry;
  }
  return null;
});

/** The selected calculation, or `null`. */
export const activeResult = computed<VibrationalResult | null>(
  () => activeEntry.value?.result ?? null,
);

/** The molecule of the selected calculation, or `null`. */
export const activeMolecule = computed<Molecule | null>(
  () => activeEntry.value?.molecule ?? null,
);

/** The modes of the selected calculation, empty when nothing is selected. */
export const activeModes = computed<readonly VibrationalMode[]>(
  () => activeEntry.value?.result.modes ?? [],
);

/** The history entries the chart should draw, in history order. */
export const visibleResults = computed<readonly ResultEntry[]>(() => {
  const shown: ResultEntry[] = [];
  for (const entry of series.results.value) {
    if (entry.visible) shown.push(entry);
  }
  return shown;
});

/** The experimental traces the chart should draw. */
export const visibleExperimental = computed<readonly SpectrumTrace[]>(() => {
  const shown: SpectrumTrace[] = [];
  for (const trace of series.experimental.value) {
    if (trace.visible !== false) shown.push(trace);
  }
  return shown;
});

/**
 * Every colour already claimed, hidden series included. A hidden entry keeps its
 * colour, so handing it out again would make two series swap identity the moment
 * the eye is clicked.
 */
export const usedSeriesColors = computed<readonly string[]>(() => {
  const used: string[] = [];
  for (const entry of series.results.value) {
    used.push(entry.color);
  }
  for (const trace of series.experimental.value) {
    used.push(trace.color);
  }
  return used;
});
