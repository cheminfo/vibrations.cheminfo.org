/**
 * The native-xtb reference fixtures, taken from the engine package itself.
 *
 * `xtb-wasm` ships the ten calculations it is validated against behind its
 * `/reference` subpath, so the data cannot drift away from the engine it
 * describes and cannot be lost to a build that excludes a directory — which has
 * happened once already. The expected set is still written out and checked:
 * `FIXTURE_PROBLEM` is non-null whenever anything is missing, the page renders
 * it as an error instead of an empty table, and `__tests__/fixtures.test.ts`
 * fails CI on it.
 */

import { REFERENCE_FIXTURES } from 'xtb-wasm/reference';

import type { ReferenceFixture } from './fixtureShape.ts';
import { readFixture } from './fixtureShape.ts';

/** Where the fixtures come from, quoted in the error message. */
const FIXTURE_DIRECTORY = 'xtb-wasm/reference';

/**
 * Every fixture the validation page is expected to run. It is written out
 * rather than derived so that a fixture disappearing from the engine package is
 * an error here, not a quietly shorter table.
 */
export const EXPECTED_FIXTURE_IDS: readonly string[] = [
  'acetic_acid',
  'aspirin',
  'benzene',
  'caffeine',
  'cholesterol',
  'ibuprofen',
  'methanol',
  'paracetamol',
  'toluene',
  'water',
];

const MODULES: Readonly<Record<string, unknown>> = REFERENCE_FIXTURES;

/** One fixture, loaded on demand. */
export interface FixtureEntry {
  /** File base name, e.g. `caffeine`. */
  id: string;
  /** Fetch and normalize the fixture. */
  load: () => Promise<ReferenceFixture>;
}

const LOADERS = new Map<string, () => Promise<{ default: unknown }>>();
for (const [id, fixture] of Object.entries(MODULES)) {
  LOADERS.set(id, () => Promise.resolve({ default: fixture }));
}

/**
 * Why the fixtures cannot be trusted, or `null` when every expected one is
 * present. A non-null value must be shown rather than swallowed: an empty
 * validation table looks like "nothing to check", which is the opposite of what
 * a missing fixture means.
 */
export const FIXTURE_PROBLEM: string | null = describeProblem();

/** Every bundled fixture, ordered as `EXPECTED_FIXTURE_IDS` lists them. */
export const FIXTURES: readonly FixtureEntry[] = buildEntries();

/**
 * Compare what the glob resolved against what is expected.
 * @returns A message naming what is missing, or `null` when all is well.
 */
function describeProblem(): string | null {
  if (LOADERS.size === 0) {
    return `No reference fixture was bundled: the glob over ${FIXTURE_DIRECTORY} resolved nothing. The directory is missing from the build context.`;
  }
  const missing: string[] = [];
  for (const id of EXPECTED_FIXTURE_IDS) {
    if (!LOADERS.has(id)) missing.push(id);
  }
  if (missing.length === 0) return null;
  return `${missing.length} of ${EXPECTED_FIXTURE_IDS.length} reference fixtures are missing from ${FIXTURE_DIRECTORY}: ${missing.join(', ')}.`;
}

/**
 * Build the loader list from whatever the glob resolved.
 * @returns One entry per bundled fixture, expected ones first.
 */
function buildEntries(): FixtureEntry[] {
  const entries: FixtureEntry[] = [];
  const seen = new Set<string>();
  for (const id of EXPECTED_FIXTURE_IDS) {
    const load = LOADERS.get(id);
    if (load === undefined) continue;
    seen.add(id);
    entries.push({ id, load: () => loadFixture(id, load) });
  }
  for (const [id, load] of LOADERS) {
    if (seen.has(id)) continue;
    entries.push({ id, load: () => loadFixture(id, load) });
  }
  return entries;
}

/**
 * Fetch one fixture chunk and normalize it.
 * @param id - Fixture base name.
 * @param load - The glob's loader for that file.
 * @returns The normalized fixture.
 */
async function loadFixture(
  id: string,
  load: () => Promise<{ default: unknown }>,
): Promise<ReferenceFixture> {
  const module = await load();
  return readFixture(module.default, id);
}
