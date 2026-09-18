import { useCallback, useEffect, useRef, useState } from 'react';
import type { Molecule } from 'xtb-wasm';

import type { CollectionEntry, MoleculeCollection } from '../../data/index.ts';
import {
  cancelRun,
  clearResults,
  currentOutputs,
  preferences,
  removeResult,
  run,
  selectResult,
  series,
  settingsForMolecule,
  startRun,
} from '../../state/index.ts';

import { buildEntryMolecule } from './entryMolecule.ts';
import { findEntryResult, pendingEntries } from './entryStatus.ts';

/** What the page shows about a queue of calculations. */
export interface QueueState {
  /** The collection being run, or `null` when nothing is queued. */
  collectionId: string | null;
  /** Ids of every entry this queue was started with, in run order. */
  entryIds: readonly string[];
  /** The entry in flight, or `null`. */
  currentEntryId: string | null;
  /** How many entries of this queue have finished, successfully or not. */
  completed: number;
  /** How many entries the queue started with. */
  total: number;
  /** Why an entry did not produce a result, keyed by entry id. */
  failures: Readonly<Record<string, string>>;
  running: boolean;
}

/** How a whole collection is queued. */
export interface RunCollectionOptions {
  /**
   * Empty the history first, so the chart carries this collection and nothing
   * else. With `false` the entries
   * that already have a result are skipped instead.
   * @default true
   */
  fresh?: boolean;
}

const EMPTY_QUEUE: QueueState = {
  collectionId: null,
  entryIds: [],
  currentEntryId: null,
  completed: 0,
  total: 0,
  failures: {},
  running: false,
};

/**
 * Run collection entries one after another, pushing every result into the
 * shared history so the spectra overlay.
 *
 * One at a time is deliberate: each run already spreads its displacement sweep
 * across the worker pool, so starting a second molecule would only make both
 * slower and the progress unreadable. Cancelling stops the queue and the run in
 * flight, and keeps every result that had already finished.
 * @returns The queue state and the actions that drive it.
 */
export function useCollectionQueue() {
  const [queue, setQueue] = useState<QueueState>(EMPTY_QUEUE);
  const cancelled = useRef(false);
  const busy = useRef(false);

  const runEntries = useCallback(
    async (collectionId: string, entries: readonly CollectionEntry[]) => {
      if (busy.current || entries.length === 0) return;
      busy.current = true;
      cancelled.current = false;
      setQueue({
        collectionId,
        entryIds: entries.map((entry) => entry.id),
        currentEntryId: null,
        completed: 0,
        total: entries.length,
        failures: {},
        running: true,
      });

      async function runFrom(index: number): Promise<void> {
        if (cancelled.current || index >= entries.length) return;
        const entry = entries[index] as CollectionEntry;
        setQueue((previous) => ({
          ...previous,
          currentEntryId: entry.id,
          completed: index,
        }));

        const failure = await runOne(collectionId, entry);
        if (cancelled.current) return;
        if (failure !== null) {
          setQueue((previous) => ({
            ...previous,
            failures: { ...previous.failures, [entry.id]: failure },
          }));
        }
        return runFrom(index + 1);
      }

      try {
        await runFrom(0);
      } finally {
        busy.current = false;
        setQueue((previous) => ({
          ...previous,
          running: false,
          currentEntryId: null,
          completed: cancelled.current ? previous.completed : previous.total,
        }));
      }

      const first = entries[0];
      if (!cancelled.current && first !== undefined) {
        const stored = findEntryResult(
          series.results.value,
          collectionId,
          first.id,
        );
        if (stored !== null) selectResult(stored.id);
      }
    },
    [],
  );

  const runCollection = useCallback(
    (collection: MoleculeCollection, options: RunCollectionOptions = {}) => {
      const { fresh = true } = options;
      if (fresh) {
        clearResults();
        void runEntries(collection.id, collection.entries);
        return;
      }
      const missing = pendingEntries(
        collection.entries,
        series.results.value,
        collection.id,
      );
      void runEntries(collection.id, missing);
    },
    [runEntries],
  );

  const runEntry = useCallback(
    (collectionId: string, entry: CollectionEntry) => {
      void runEntries(collectionId, [entry]);
    },
    [runEntries],
  );

  const cancel = useCallback(() => {
    cancelled.current = true;
    cancelRun(preferences.engine.primary.value);
  }, []);

  useEffect(() => cancel, [cancel]);

  return { queue, runCollection, runEntry, cancel };
}

async function runOne(
  collectionId: string,
  entry: CollectionEntry,
): Promise<string | null> {
  const engineId = preferences.engine.primary.value;
  let molecule: Molecule;
  try {
    molecule = await buildEntryMolecule(collectionId, entry);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  const existing = findEntryResult(
    series.results.value,
    collectionId,
    entry.id,
  );
  if (existing !== null) removeResult(existing.id);

  const result = await startRun(
    {
      molecule,
      settings: settingsForMolecule(molecule),
      outputs: currentOutputs(),
    },
    { engineId, select: false },
  );
  if (result !== null) return null;
  return run.errors.value[engineId] ?? 'the calculation did not finish';
}
