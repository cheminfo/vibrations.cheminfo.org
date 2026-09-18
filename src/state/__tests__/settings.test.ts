import { beforeEach, expect, test } from 'vitest';

import {
  resetStructureOverrides,
  settingsForMolecule,
  settingsSignals,
} from '../settings.ts';

import { fakeMolecule } from './fakeResult.ts';

beforeEach(() => {
  resetStructureOverrides();
});

test('charge and unpaired electrons come from the molecule', () => {
  const settings = settingsForMolecule({
    ...fakeMolecule('anion', -1),
    unpairedElectrons: 1,
  });
  expect(settings.charge).toBe(-1);
  expect(settings.unpairedElectrons).toBe(1);
  expect(settings.method).toBe('GFN2');
});

test('an override wins over the molecule and survives until it is reset', () => {
  settingsSignals.chargeOverride.value = 2;
  expect(settingsForMolecule(fakeMolecule('anion', -1)).charge).toBe(2);
  resetStructureOverrides();
  expect(settingsForMolecule(fakeMolecule('anion', -1)).charge).toBe(-1);
});

test('no molecule falls back to the neutral closed-shell defaults', () => {
  const settings = settingsForMolecule(null);
  expect(settings.charge).toBe(0);
  expect(settings.unpairedElectrons).toBe(0);
});
