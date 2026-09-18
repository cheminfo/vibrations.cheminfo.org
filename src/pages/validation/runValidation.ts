/**
 * Driving the validation table.
 *
 * Every run goes through `occjsSerialEngine`, never the parallel one. The
 * parallel sweep reproduces itself only to about 0.01 cm⁻¹ because the SCF
 * warm start depends on the order the workers visit the displacements in, and
 * this page exists to compare exact digits against a native reference.
 */

import type { Molecule, VibrationalRequest } from 'xtb-wasm';
import { DEFAULT_SETTINGS, occjsSerialEngine } from 'xtb-wasm';

import { state } from '../../state/index.ts';

import { compareToFixture } from './checks.ts';
import type { ReferenceFixture } from './fixtureShape.ts';
import { FIXTURES } from './fixtures.ts';
import { setFixtureChecks, updateRow } from './validationRows.ts';

let controller: AbortController | null = null;

/** Stop the run in flight; the remaining fixtures are left pending. */
export function cancelValidation(): void {
  controller?.abort();
  controller = null;
}

/**
 * Recompute one fixture's Hessian at exactly the reference geometry and judge
 * the result against the fixture.
 * @param fixtureId - Which fixture to run.
 */
export async function runOne(fixtureId: string): Promise<void> {
  const entry = FIXTURES.find((item) => item.id === fixtureId);
  if (entry === undefined) return;

  const signal = (controller ??= new AbortController()).signal;
  updateRow(fixtureId, {
    status: 'running',
    message: null,
    maxFrequencyDelta: null,
    energyDelta: null,
    cosineSimilarity: null,
    durationMs: null,
  });

  try {
    const fixture = await entry.load();
    const request = validationRequest(fixture);

    const refusals = occjsSerialEngine.validate(request);
    if (refusals.length > 0) {
      updateRow(fixtureId, { status: 'error', message: refusals.join(' ') });
      return;
    }

    const startedAt = performance.now();
    const result = await occjsSerialEngine.compute(request, { signal });
    const durationMs = performance.now() - startedAt;

    const comparison = compareToFixture(result, fixture);
    setFixtureChecks(fixtureId, comparison.checks);
    updateRow(fixtureId, {
      status: comparison.passed ? 'pass' : 'fail',
      maxFrequencyDelta: comparison.maxFrequencyDelta,
      energyDelta: comparison.energyDelta,
      cosineSimilarity: comparison.cosineSimilarity,
      durationMs,
      message: comparison.summary,
    });
  } catch (error) {
    if (signal.aborted) {
      updateRow(fixtureId, { status: 'pending', message: 'Cancelled.' });
      return;
    }
    updateRow(fixtureId, {
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Run every fixture at or below an atom count, smallest first.
 * @param atomLimit - Largest molecule to include, in atoms.
 */
export async function runAll(atomLimit: number): Promise<void> {
  controller = new AbortController();
  const { signal } = controller;
  for (const row of state.data.validation.value) {
    if (row.atoms > atomLimit || signal.aborted) continue;
    // eslint-disable-next-line no-await-in-loop -- the serial engine is pinned to one wasm instance, so the fixtures must run one after another
    await runOne(row.fixtureId);
  }
  controller = null;
}

/**
 * The tier-1 request for one fixture: the stored geometry, no optimizer, and
 * the molecule's own charge and spin.
 *
 * `optimize` is false and `maxCycles` is 1 on purpose. The fixture coordinates
 * are already xtb's minimum, and relaxing them again would move the geometry —
 * the input-sensitivity study measured a 10⁻⁴ Å move as worth up to 19 cm⁻¹ on
 * a soft mode, which is forty times the tolerance this page asserts.
 * @param fixture - The reference fixture.
 * @returns The request to hand the serial engine.
 */
export function validationRequest(
  fixture: ReferenceFixture,
): VibrationalRequest {
  return {
    molecule: fixtureMolecule(fixture),
    settings: {
      ...DEFAULT_SETTINGS,
      charge: fixture.charge,
      unpairedElectrons: fixture.unpairedElectrons,
      optimize: false,
      maxCycles: 1,
    },
    // Raman has no reference in the fixtures; the mRRHO block does.
    outputs: { ir: true, raman: false, thermochemistry: true },
  };
}

/**
 * The fixture's stored geometry as a molecule.
 * @param fixture - The reference fixture.
 * @returns The molecule, tagged with its fixture provenance.
 */
function fixtureMolecule(fixture: ReferenceFixture): Molecule {
  return {
    id: `fixture-${fixture.id}`,
    label: fixture.name,
    formula: fixture.formula,
    smiles: fixture.smiles,
    source: { kind: 'fixture', fixtureId: fixture.id },
    charge: fixture.charge,
    unpairedElectrons: fixture.unpairedElectrons,
    elements: fixture.geometry.elements,
    coordinates: fixture.geometry.coordinates,
  };
}
