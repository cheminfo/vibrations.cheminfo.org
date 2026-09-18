import { expect, test } from 'vitest';
import type { Thermochemistry } from 'xtb-wasm';

import { energyRows, entropyRows } from '../thermoRows.ts';

const THERMOCHEMISTRY: Thermochemistry = {
  temperature: 298.15,
  pressure: 101_325,
  zeroPointEnergy: 0.021,
  thermalCorrection: 0.0025,
  enthalpyCorrection: 0.0244,
  entropy: 0.00003,
  gibbsCorrection: 0.0155,
  totalFreeEnergy: -5.2345,
  totalEnthalpy: -5.2256,
  heatCapacity: 0.0000095,
  symmetryNumber: 2,
  pointGroup: 'C2v',
  isLinear: false,
  skippedImaginaryModes: 0,
};

test('the six energies are reported in reading order', () => {
  expect(energyRows(THERMOCHEMISTRY).map((row) => row.label)).toStrictEqual([
    'Zero-point vibrational energy',
    'Thermal correction',
    'Enthalpy correction H(T) − E',
    'Gibbs correction G(T) − E',
    'Total enthalpy',
    'Total free energy',
  ]);
});

test('an energy is converted to both molar units', () => {
  const zeroPoint = energyRows(THERMOCHEMISTRY)[0];
  expect(zeroPoint?.hartree).toBe(0.021);
  expect(zeroPoint?.kcalPerMol).toBeCloseTo(13.177_698_955_32, 9);
  expect(zeroPoint?.kilojoulePerMol).toBeCloseTo(55.135_492_429_06, 9);
});

test('a negative total free energy keeps its sign in every unit', () => {
  const rows = energyRows(THERMOCHEMISTRY);
  const total = rows[5];
  expect(total?.label).toBe('Total free energy');
  expect(total?.hartree).toBe(-5.2345);
  expect(total?.kcalPerMol).toBeCloseTo(-3284.698_341_98, 6);
});

test('entropy and heat capacity are reported per mole and per kelvin', () => {
  const rows = entropyRows(THERMOCHEMISTRY);
  expect(rows.map((row) => row.label)).toStrictEqual([
    'Entropy S',
    'Heat capacity Cv',
  ]);
  expect(rows[0]?.hartreePerKelvin).toBe(0.00003);
  expect(rows[0]?.caloriePerMoleKelvin).toBeCloseTo(18.825_284_221_89, 9);
  expect(rows[0]?.joulePerMoleKelvin).toBeCloseTo(78.764_989_184_37, 9);
});
