import { effect } from '@preact/signals-react';
import { persistSignalBucket } from 'react-cheminfo/core';

/** Storage keys are namespaced so the app never collides with a sibling site. */
const NAMESPACE = 'vibrations';

/**
 * Schema version of the persisted preferences. Raise it when a stored shape can
 * no longer be reconciled field by field with the declared one; every entry
 * written by an older version is then ignored and the defaults are used.
 */
export const PREFERENCES_VERSION = 2;

/**
 * Rehydrate a tree of signals from one versioned `localStorage` entry and keep
 * it written there.
 *
 * The whole tree is stored as a single JSON mirror of itself, so the stability
 * contract is the property names, never a key per signal: a leaf added since the
 * last save keeps its default, and a stored value of the wrong shape is
 * discarded. Reads and writes are best effort — a private window, disabled site
 * data or a full quota all leave the app working with preferences that last only
 * as long as the tab.
 * @param key - Bucket name, namespaced and versioned into the storage key.
 * @param bucket - Plain object tree whose leaves are writable signals. Never a `computed()`.
 * @param version - Schema version appended to the key.
 * @default version PREFERENCES_VERSION
 * @returns The same bucket, rehydrated, so it can be exported directly.
 */
export function persistBucket<T extends object>(
  key: string,
  bucket: T,
  version: number = PREFERENCES_VERSION,
): T {
  return persistSignalBucket({
    key: `${NAMESPACE}:${key}`,
    version,
    bucket,
    effect,
  });
}
