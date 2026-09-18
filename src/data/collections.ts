import {
  DIRECTING_GROUPS,
  GROSS_SELECTION_RULE,
  INDUCTIVE_MESOMERIC,
  MESOMERIC,
  RING_STRAIN,
  STERIC_EFFECT,
  THEORY_VS_EXPERIMENT,
} from './collections/index.ts';
import type {
  CollectionEntry,
  MoleculeCollection,
} from './collections/types.ts';

export type {
  CollectionEntry,
  MoleculeCollection,
} from './collections/types.ts';

/**
 * The seven curated collections, in teaching order. Each one makes a single
 * effect visible by holding everything but one structural variable fixed and
 * comparing the carbonyl stretch — or, for the symmetry collection, the number
 * of bands.
 */
export const COLLECTIONS: readonly MoleculeCollection[] = [
  DIRECTING_GROUPS,
  INDUCTIVE_MESOMERIC,
  MESOMERIC,
  GROSS_SELECTION_RULE,
  RING_STRAIN,
  STERIC_EFFECT,
  THEORY_VS_EXPERIMENT,
];

/**
 * Atom count above which a full optimization plus Hessian leaves the measured
 * interactive band. `experiments/benchmark` puts an in-browser run under ~30 s
 * up to 30–40 atoms, so anything larger deserves a warning before it starts.
 */
export const INTERACTIVE_ATOM_LIMIT = 30;

/**
 * Whether an entry is expensive enough that the UI should warn before running it.
 * @param entry - The collection entry to judge.
 * @returns True when the entry is past `INTERACTIVE_ATOM_LIMIT`.
 */
export function isExpensiveEntry(entry: CollectionEntry): boolean {
  return entry.atoms > INTERACTIVE_ATOM_LIMIT;
}

/**
 * Look up a collection by its id.
 * @param collectionId - Id of the collection, e.g. `ring-strain`.
 * @returns The collection, or `null` when no collection carries that id.
 */
export function findCollection(
  collectionId: string,
): MoleculeCollection | null {
  for (const collection of COLLECTIONS) {
    if (collection.id === collectionId) return collection;
  }
  return null;
}

/**
 * Look up one molecule inside one collection, which is exactly what a
 * `MoleculeSource` of kind `collection` records.
 * @param collectionId - Id of the collection.
 * @param entryId - Id of the entry within that collection.
 * @returns The entry, or `null` when either id is unknown.
 */
export function findCollectionEntry(
  collectionId: string,
  entryId: string,
): CollectionEntry | null {
  const collection = findCollection(collectionId);
  if (collection === null) return null;
  for (const entry of collection.entries) {
    if (entry.id === entryId) return entry;
  }
  return null;
}
