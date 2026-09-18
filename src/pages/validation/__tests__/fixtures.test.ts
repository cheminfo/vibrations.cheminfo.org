import { expect, test } from 'vitest';

import type { ReferenceFixture } from '../fixtureShape.ts';
import {
  EXPECTED_FIXTURE_IDS,
  FIXTURES,
  FIXTURE_PROBLEM,
} from '../fixtures.ts';

/**
 * This is the guard the Docker build broke once: `import.meta.glob` resolves at
 * build time and yields an empty record when `experiments/` is outside the build
 * context, which would leave the validation page showing an empty table instead
 * of an error. Failing here fails CI.
 */
test('every expected reference fixture is bundled', () => {
  expect(FIXTURE_PROBLEM).toBe(null);
  expect(FIXTURES.map((entry) => entry.id)).toStrictEqual([
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
  ]);
  expect(EXPECTED_FIXTURE_IDS).toHaveLength(10);
});

test('the water fixture reads back exactly', async () => {
  const fixture = await loadFixture('water');

  expect(fixture.name).toBe('water');
  expect(fixture.formula).toBe('H2O');
  expect(fixture.smiles).toBe('O');
  expect(fixture.atomCount).toBe(3);
  expect(fixture.charge).toBe(0);
  expect(fixture.unpairedElectrons).toBe(0);
  expect(fixture.geometry.elements).toStrictEqual(['O', 'H', 'H']);
  expect(fixture.geometry.coordinates).toHaveLength(9);
  expect(fixture.geometry.coordinates[0]).toBe(1.053_473_772_846_25);
});

test('both reference blocks of the water fixture are read', async () => {
  const fixture = await loadFixture('water');

  expect(fixture.tierOne).toStrictEqual({
    totalEnergy: -5.070_544_344_175,
    zeroPointEnergy: 0.020_124_421_574,
    modeCount: 3,
    imaginaryCount: 0,
    wavenumbers: [1538.9, 3643.06, 3651.64],
    irIntensities: [133.287, 6.787_51, 16.6759],
    hessianFrobeniusNorm: 1.364_888_979_028_654_7,
    hessianTrace: 2.049_617_824_2,
  });
  expect(fixture.thermochemistry.electronicEnergy).toBe(-5.070_544_344_175);
  expect(fixture.thermochemistry.zeroPointEnergy).toBe(0.020_124_421_574);
  expect(fixture.thermochemistry.gibbsCorrection).toBe(0.002_499_307_772);
  // xtb's TOTAL ENTHALPY minus its TOTAL ENERGY.
  expect(fixture.thermochemistry.enthalpyCorrection).toBeCloseTo(
    0.023_905_339_256,
    12,
  );
});

test('the largest fixture is cholesterol at 74 atoms', async () => {
  const fixture = await loadFixture('cholesterol');

  expect(fixture.atomCount).toBe(74);
  expect(fixture.tierOne.modeCount).toBe(216);
  expect(fixture.tierOne.wavenumbers).toHaveLength(216);
  expect(fixture.tierOne.irIntensities).toHaveLength(216);
  expect(fixture.tierOne.imaginaryCount).toBe(0);
});

/**
 * Load one bundled fixture through the same glob the page uses.
 * @param id - Fixture base name.
 * @returns The normalized fixture.
 */
async function loadFixture(id: string): Promise<ReferenceFixture> {
  const entry = FIXTURES.find((item) => item.id === id);
  if (entry === undefined) throw new Error(`the ${id} fixture is not bundled`);
  return entry.load();
}
