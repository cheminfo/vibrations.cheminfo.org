/**
 * The validation table's rows and their per-fixture detail.
 *
 * The summary row lives in the global store, because `ValidationRow` is the
 * shared contract every consumer of the page reads. The individual assertions
 * stay here: they are the page's own detail, they exist only while the page is
 * mounted, and no other view has a reason to know their shape.
 */

import { signal } from '@preact/signals-react';

import type { ValidationRow } from '../../state/index.ts';
import { state } from '../../state/index.ts';

import type { FixtureCheck } from './checkTypes.ts';
import { FIXTURES } from './fixtures.ts';

/** Why the table could not be built, or `null` when it was. */
export const loadProblem = signal<string | null>(null);

/** Every assertion of the last run of each fixture, keyed by fixture id. */
export const fixtureChecks = signal<
  Readonly<Record<string, readonly FixtureCheck[]>>
>({});

/**
 * Populate the table, smallest molecule first. The atom count only becomes
 * known once a fixture chunk is fetched, so every fixture is loaded here — they
 * are small, and loading them in parallel keeps this to one round of requests.
 * @returns Nothing; the rows land in `state.data.validation`.
 */
export async function loadValidationRows(): Promise<void> {
  let fixtures;
  try {
    fixtures = await Promise.all(FIXTURES.map(async (entry) => entry.load()));
  } catch (error) {
    loadProblem.value = error instanceof Error ? error.message : String(error);
    return;
  }
  const rows: ValidationRow[] = fixtures.map((fixture) => ({
    fixtureId: fixture.id,
    label: fixture.name,
    atoms: fixture.atomCount,
    status: 'pending',
    maxFrequencyDelta: null,
    energyDelta: null,
    cosineSimilarity: null,
    durationMs: null,
    message: null,
  }));
  state.data.validation.value = rows.toSorted((a, b) => a.atoms - b.atoms);
}

/**
 * Patch one row in place, leaving the others untouched.
 * @param fixtureId - Which row to patch.
 * @param patch - The fields to overwrite.
 */
export function updateRow(
  fixtureId: string,
  patch: Partial<ValidationRow>,
): void {
  state.data.validation.value = state.data.validation.value.map((row) =>
    row.fixtureId === fixtureId ? { ...row, ...patch } : row,
  );
}

/**
 * Store the assertions of one fixture's latest run.
 * @param fixtureId - Which fixture they belong to.
 * @param checks - The assertions, in display order.
 */
export function setFixtureChecks(
  fixtureId: string,
  checks: readonly FixtureCheck[],
): void {
  fixtureChecks.value = { ...fixtureChecks.value, [fixtureId]: checks };
}

/**
 * Forget every result, so the table can be re-run from a clean state.
 */
export function clearValidation(): void {
  fixtureChecks.value = {};
  state.data.validation.value = state.data.validation.value.map((row) => ({
    ...row,
    status: 'pending',
    maxFrequencyDelta: null,
    energyDelta: null,
    cosineSimilarity: null,
    durationMs: null,
    message: null,
  }));
}
