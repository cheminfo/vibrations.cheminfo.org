import { expect, test } from 'vitest';
import type { VibrationalMode } from 'xtb-wasm';

import {
  CARBONYL_PROBE,
  COLLECTION_PROBES,
  countInfraredBands,
  strongestBand,
} from '../keyBand.ts';

function mode(wavenumber: number, irIntensity: number | null): VibrationalMode {
  return {
    wavenumber,
    irIntensity,
    ramanActivity: null,
    depolarizationRatio: null,
    eigenvector: new Float64Array(3),
    cartesianDisplacement: new Float64Array(3),
    maxDisplacement: 1,
    reducedMass: 1,
    forceConstant: 1,
    involvement: null,
  };
}

test('strongestBand picks the most intense mode inside the window', () => {
  const modes = [
    mode(1200, 400),
    mode(1610, 120),
    mode(1755, 310),
    mode(2900, 900),
  ];
  expect(strongestBand(modes, CARBONYL_PROBE)).toStrictEqual({
    index: 2,
    wavenumber: 1755,
    irIntensity: 310,
  });
});

test('strongestBand ignores imaginary modes', () => {
  const modes = [mode(-1800, 500), mode(1700, 40)];
  expect(strongestBand(modes, CARBONYL_PROBE)).toStrictEqual({
    index: 1,
    wavenumber: 1700,
    irIntensity: 40,
  });
});

test('strongestBand returns null when no mode falls in the window', () => {
  expect(strongestBand([mode(1100, 90), mode(3050, 12)], CARBONYL_PROBE)).toBe(
    null,
  );
});

test('strongestBand still reports a band whose intensity was not computed', () => {
  expect(strongestBand([mode(1748, null)], CARBONYL_PROBE)).toStrictEqual({
    index: 0,
    wavenumber: 1748,
    irIntensity: null,
  });
});

test('countInfraredBands merges degenerate modes and drops the forbidden ones', () => {
  const methane = [
    mode(1320, 14.2),
    mode(1320.4, 14.2),
    mode(1320.9, 14.2),
    mode(1560, 0.0001),
    mode(1560.2, 0.0001),
    mode(2930, 0.00002),
    mode(3040, 26.5),
    mode(3040.3, 26.5),
    mode(3040.6, 26.5),
  ];
  expect(countInfraredBands(methane)).toBe(2);
});

test('countInfraredBands is zero for a spectrum with no intensity at all', () => {
  expect(countInfraredBands([mode(2350, 0), mode(2360, 0)])).toBe(0);
});

test('the symmetry collection has no probe band, the carbonyl ones share it', () => {
  expect(COLLECTION_PROBES['gross-selection-rule']).toBe(undefined);
  expect(COLLECTION_PROBES['ring-strain']).toStrictEqual(CARBONYL_PROBE);
  expect(Object.keys(COLLECTION_PROBES)).toStrictEqual([
    'directing-groups',
    'inductive-mesomeric-effect',
    'mesomeric-effect',
    'ring-strain',
    'steric-effect',
    'theory-vs-experiment',
  ]);
});
