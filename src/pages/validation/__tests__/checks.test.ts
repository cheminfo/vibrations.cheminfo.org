import { expect, test } from 'vitest';

import type { CheckStatus, FixtureCheck } from '../checkTypes.ts';
import { compareToFixture } from '../checks.ts';
import type { ReferenceFixture } from '../fixtureShape.ts';
import { FIXTURES } from '../fixtures.ts';

import { perfectResult } from './syntheticResult.ts';

const WATER = await loadWater();

test('an exact reproduction passes every judged check', () => {
  const comparison = compareToFixture(perfectResult(WATER), WATER);

  expect(comparison.checks.map((check) => check.id)).toStrictEqual([
    'modeCount',
    'imaginary',
    'frequencies',
    'irStrong',
    'irWeak',
    'zeroPoint',
    'enthalpy',
    'gibbs',
    'symmetry',
    'energy',
    'hessian',
  ]);
  expect(comparison.checks.map((check) => check.status)).toStrictEqual([
    'pass',
    'pass',
    'pass',
    'pass',
    'pass',
    'pass',
    'pass',
    'pass',
    'info',
    'info',
    'info',
  ] satisfies CheckStatus[]);
  expect(comparison.passed).toBe(true);
  expect(comparison.summary).toBe(null);
  expect(comparison.maxFrequencyDelta).toBe(0);
  expect(comparison.energyDelta).toBe(0);
  expect(comparison.cosineSimilarity).toBeCloseTo(1, 12);
});

test('a band 0.6 cm-1 out of place fails the frequency check', () => {
  const comparison = compareToFixture(
    perfectResult(WATER, { wavenumbers: [1538.9, 3643.06, 3652.24] }),
    WATER,
  );

  expect(checkById(comparison.checks, 'frequencies')).toMatchObject({
    status: 'fail',
    actual: '0.6000 cm⁻¹',
    tolerance: '0.5000 cm⁻¹',
  });
  expect(comparison.maxFrequencyDelta).toBeCloseTo(0.6, 10);
  expect(comparison.summary).toBe(
    'Largest band-position deviation: 0.6000 cm⁻¹, tolerance 0.5000 cm⁻¹',
  );
});

test('a strong band 3 % off fails the relative intensity check', () => {
  const comparison = compareToFixture(
    perfectResult(WATER, {
      irIntensities: [133.287 * 1.03, 6.787_51, 16.6759],
    }),
    WATER,
  );

  expect(checkById(comparison.checks, 'irStrong')).toMatchObject({
    status: 'fail',
    actual: '0.0300 relative',
    tolerance: '0.0200 relative',
  });
  expect(checkById(comparison.checks, 'irWeak').status).toBe('pass');
});

test('a free energy 2 mEh out fails the mRRHO check alone', () => {
  const comparison = compareToFixture(
    perfectResult(WATER, { gibbsCorrection: 0.002_499_307_772 + 2e-3 }),
    WATER,
  );

  expect(checkById(comparison.checks, 'gibbs').status).toBe('fail');
  expect(checkById(comparison.checks, 'zeroPoint').status).toBe('pass');
  expect(checkById(comparison.checks, 'enthalpy').status).toBe('pass');
  expect(comparison.passed).toBe(false);
});

test('a missing mode fails the count check and pairs what is left', () => {
  const comparison = compareToFixture(
    perfectResult(WATER, {
      wavenumbers: [1538.9, 3643.06],
      irIntensities: [133.287, 6.787_51],
    }),
    WATER,
  );

  expect(checkById(comparison.checks, 'modeCount')).toMatchObject({
    status: 'fail',
    actual: '2',
    tolerance: 'exactly 3',
  });
  expect(comparison.maxFrequencyDelta).toBe(0);
});

test('the symmetry row reports the point group the engine detected', () => {
  const comparison = compareToFixture(perfectResult(WATER), WATER);

  expect(checkById(comparison.checks, 'symmetry')).toMatchObject({
    status: 'info',
    actual: 'C2v, σ = 2',
    tolerance: null,
  });
});

test('a run without thermochemistry says so instead of passing', () => {
  const result = perfectResult(WATER);
  const comparison = compareToFixture(
    { ...result, thermochemistry: null },
    WATER,
  );

  expect(checkById(comparison.checks, 'thermochemistry')).toMatchObject({
    status: 'info',
    actual: 'not computed',
  });
  expect(comparison.passed).toBe(true);
});

/**
 * Look one check up by id.
 * @param checks - The checks.
 * @param id - The id to find.
 * @returns The check; throws when it is absent.
 */
function checkById(checks: readonly FixtureCheck[], id: string): FixtureCheck {
  const found = checks.find((check) => check.id === id);
  if (found === undefined) throw new Error(`no check ${id}`);
  return found;
}

/**
 * The water fixture, loaded through the same glob the page uses.
 * @returns The fixture.
 */
async function loadWater(): Promise<ReferenceFixture> {
  const entry = FIXTURES.find((item) => item.id === 'water');
  if (entry === undefined) throw new Error('the water fixture is not bundled');
  return entry.load();
}
