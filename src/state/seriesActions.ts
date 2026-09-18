import type { VibrationalResult } from 'xtb-wasm';

import type { SpectrumTrace } from '../types/trace.ts';

import { assignSeriesColor } from './colors.ts';
import type { ResultEntry } from './series.ts';
import { series, usedSeriesColors } from './series.ts';

/** How a finished result enters the history. */
export interface AddResultOptions {
  /** Make it the active entry. @default true */
  select?: boolean;
  /** Draw it straight away. @default true */
  visible?: boolean;
}

/**
 * Put a finished calculation in the history, keeping the colour of any entry it
 * replaces so a recomputed molecule does not jump colour on the chart.
 * @param result - The calculation that just finished.
 * @param options - See {@link AddResultOptions}.
 * @returns The stored entry, colour and visibility included.
 */
export function addResult(
  result: VibrationalResult,
  options: AddResultOptions = {},
): ResultEntry {
  const { select = true, visible = true } = options;
  const existing = findEntry(result.id);
  const entry: ResultEntry = {
    id: result.id,
    result,
    molecule: result.request.molecule,
    color: existing?.color ?? assignSeriesColor(usedSeriesColors.value),
    visible: existing?.visible ?? visible,
    completedAt: Date.now(),
  };

  series.results.value =
    existing === null
      ? [...series.results.value, entry]
      : series.results.value.map((item) =>
          item.id === entry.id ? entry : item,
        );
  if (select) series.activeResultId.value = entry.id;
  return entry;
}

/**
 * Drop one calculation from the history — the trash in the history table. When
 * it was the active one, the neighbour that takes its place becomes active.
 * @param id - Entry id.
 */
export function removeResult(id: string): void {
  const entries = series.results.value;
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return;

  const remaining = entries.filter((entry) => entry.id !== id);
  series.results.value = remaining;
  if (series.activeResultId.value !== id) return;
  const neighbour = remaining[index] ?? remaining[index - 1] ?? null;
  series.activeResultId.value = neighbour === null ? null : neighbour.id;
}

/**
 * Show or hide one calculation on the chart — the eye in the history table.
 * @param id - Entry id.
 */
export function toggleResultVisible(id: string): void {
  series.results.value = series.results.value.map((entry) =>
    entry.id === id ? { ...entry, visible: !entry.visible } : entry,
  );
}

/**
 * Show or hide one calculation explicitly.
 * @param id - Entry id.
 * @param visible - Whether it should be drawn.
 */
export function setResultVisible(id: string, visible: boolean): void {
  series.results.value = series.results.value.map((entry) =>
    entry.id === id ? { ...entry, visible } : entry,
  );
}

/**
 * Choose the calculation the mode table, the depiction and the 3D viewer show.
 * An unknown id selects nothing rather than leaving a stale selection behind.
 * @param id - Entry id, or `null` to select nothing.
 */
export function selectResult(id: string | null): void {
  series.activeResultId.value =
    id === null || findEntry(id) === null ? null : id;
}

/** Empty the history, leaving the experimental traces alone. */
export function clearResults(): void {
  series.results.value = [];
  series.activeResultId.value = null;
}

/**
 * Add spectra loaded from a file, giving each one a colour no series on the
 * chart is already using.
 * @param traces - Traces as the spectra loader produced them; their `color` is replaced.
 * @returns The traces as stored, with their assigned colours.
 */
export function addExperimentalTraces(
  traces: readonly SpectrumTrace[],
): SpectrumTrace[] {
  const used = [...usedSeriesColors.value];
  const added: SpectrumTrace[] = [];
  for (const trace of traces) {
    const color = assignSeriesColor(used);
    used.push(color);
    added.push({ ...trace, color, visible: trace.visible ?? true });
  }
  series.experimental.value = [...series.experimental.value, ...added];
  return added;
}

/**
 * Remove one experimental trace.
 * @param id - Trace id.
 */
export function removeTrace(id: string): void {
  series.experimental.value = series.experimental.value.filter(
    (trace) => trace.id !== id,
  );
}

/**
 * Show or hide one experimental trace.
 * @param id - Trace id.
 */
export function toggleTraceVisible(id: string): void {
  series.experimental.value = series.experimental.value.map((trace) =>
    trace.id === id ? { ...trace, visible: trace.visible === false } : trace,
  );
}

/** Drop every experimental trace, leaving the computed history alone. */
export function clearExperimental(): void {
  series.experimental.value = [];
}

function findEntry(id: string): ResultEntry | null {
  for (const entry of series.results.value) {
    if (entry.id === id) return entry;
  }
  return null;
}
