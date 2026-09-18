import { expect, test } from 'vitest';
import { moleculeFromIdCode } from 'xtb-wasm';

import type { CollectionEntry } from '../../data/collections.ts';
import { COLLECTIONS } from '../../data/collections.ts';
import { COLLECTION_TIMEOUT } from '../../test/timeouts.ts';

const COLLECTION_ENTRIES = collectionEntries();

test('every collection molecule is a distinct structure', () => {
  const idCodes = new Set<string>();
  for (const entry of COLLECTION_ENTRIES) idCodes.add(entry.idCode);

  expect(COLLECTIONS).toHaveLength(7);
  expect(COLLECTION_ENTRIES).toHaveLength(36);
  expect(idCodes.size).toBe(36);
  expect(COLLECTION_ENTRIES[0]?.name).toBe('benzaldehyde');
});

test(
  'every collection molecule reaches a 3D geometry, with the formula it claims',
  async () => {
    const failures: string[] = [];

    for (const entry of COLLECTION_ENTRIES) {
      try {
        /* eslint-disable-next-line no-await-in-loop -- conformer generation is
           CPU-bound and single-threaded, so running these concurrently would
           not be faster */
        const molecule = await moleculeFromIdCode(entry.idCode, entry.name);
        if (molecule.formula !== entry.formula) {
          failures.push(
            `${entry.name}: formula ${molecule.formula}, expected ${entry.formula}`,
          );
        }
        if (molecule.elements.length !== entry.atoms) {
          failures.push(
            `${entry.name}: ${molecule.elements.length} atoms, expected ${entry.atoms}`,
          );
        }
        if (molecule.charge !== entry.charge) {
          failures.push(
            `${entry.name}: charge ${molecule.charge}, expected ${entry.charge}`,
          );
        }
        if (molecule.coordinates.length !== entry.atoms * 3) {
          failures.push(
            `${entry.name}: ${molecule.coordinates.length} coordinates for ${entry.atoms} atoms`,
          );
        }
        if (!hasNonZeroThirdDimension(molecule.coordinates)) {
          failures.push(`${entry.name}: the conformer is flat`);
        }
      } catch (error) {
        failures.push(`${entry.name}: threw ${(error as Error).message}`);
      }
    }

    expect(failures).toStrictEqual([]);
  },
  COLLECTION_TIMEOUT,
);

/**
 * Flatten the curated collections into one list of entries.
 *
 * Read from `src/data/collections.ts` rather than copied into a fixture, so a
 * molecule added to a collection is covered here the day it lands.
 * @returns Every entry of every collection, in collection order.
 */
function collectionEntries(): CollectionEntry[] {
  const entries: CollectionEntry[] = [];
  for (const collection of COLLECTIONS) entries.push(...collection.entries);
  return entries;
}

/**
 * Whether a geometry leaves the plane, which every generated conformer should.
 * @param coordinates - Flat Cartesian coordinates in Angstrom.
 * @returns `true` as soon as one z differs measurably from zero.
 */
function hasNonZeroThirdDimension(coordinates: Float64Array): boolean {
  for (let index = 2; index < coordinates.length; index += 3) {
    if (Math.abs(coordinates[index] as number) > 1e-6) return true;
  }
  return false;
}
