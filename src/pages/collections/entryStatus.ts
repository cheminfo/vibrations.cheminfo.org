import type { CollectionEntry } from '../../data/index.ts';
import type { ResultEntry } from '../../state/index.ts';

/** How far one collection entry has got. */
export type EntryStatus = 'idle' | 'queued' | 'running' | 'done' | 'failed';

/**
 * The finished calculation belonging to one collection entry, if the history
 * holds one.
 *
 * The match is on provenance rather than on the molecule id, because every
 * build of the same entry makes a fresh molecule: what identifies it is the
 * collection and entry it came from.
 * @param results - The calculation history, oldest first.
 * @param collectionId - Id of the collection.
 * @param entryId - Id of the entry within that collection.
 * @returns The most recent matching entry, or `null`.
 */
export function findEntryResult(
  results: readonly ResultEntry[],
  collectionId: string,
  entryId: string,
): ResultEntry | null {
  for (let index = results.length - 1; index >= 0; index--) {
    const candidate = results[index] as ResultEntry;
    const { source } = candidate.molecule;
    if (source.kind !== 'collection') continue;
    if (source.collectionId !== collectionId) continue;
    if (source.entryId !== entryId) continue;
    return candidate;
  }
  return null;
}

/**
 * The entries of a collection that have no result yet, so a second run of the
 * same collection only computes what is missing.
 * @param entries - Every entry of the collection.
 * @param results - The calculation history.
 * @param collectionId - Id of the collection.
 * @returns The entries still to compute, in collection order.
 */
export function pendingEntries(
  entries: readonly CollectionEntry[],
  results: readonly ResultEntry[],
  collectionId: string,
): CollectionEntry[] {
  const pending: CollectionEntry[] = [];
  for (const entry of entries) {
    if (findEntryResult(results, collectionId, entry.id) === null) {
      pending.push(entry);
    }
  }
  return pending;
}
