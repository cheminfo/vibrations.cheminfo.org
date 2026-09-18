import { expect, test } from 'vitest';

import { modeAtWavenumber, modeIntensity } from '../modePicking.ts';

import { makeMode } from './makeEntry.ts';

const MODES = [
  makeMode(-140, 2, 2),
  makeMode(1600, 200, 1),
  makeMode(1640, 5, 90),
  makeMode(3400, 30, 4),
];

test('a click picks the mode whose band dominates there, not the nearest stick', () => {
  expect(modeAtWavenumber(MODES, 1630, { fwhm: 20, chart: 'infrared' })).toBe(
    1,
  );
  expect(modeAtWavenumber(MODES, 1630, { fwhm: 20, chart: 'raman' })).toBe(2);
});

test('a click far from every band picks nothing until the reach is widened', () => {
  expect(
    modeAtWavenumber(MODES, 2400, { fwhm: 20, chart: 'infrared' }),
  ).toBeNull();
  // Widened, the strong 1600 band still owns 2400 cm-1 rather than the nearer
  // 3400 one: a Lorentzian wing falls off slowly, and 200 km/mol beats 30.
  expect(
    modeAtWavenumber(MODES, 2400, { fwhm: 20, chart: 'infrared', reach: 40 }),
  ).toBe(1);
});

test('an imaginary mode is never picked', () => {
  expect(
    modeAtWavenumber(MODES, -140, { fwhm: 20, chart: 'infrared' }),
  ).toBeNull();
});

test('the wavenumber scale moves the bands the click is matched against', () => {
  const options = {
    fwhm: 20,
    chart: 'infrared' as const,
    wavenumberScale: 0.5,
  };
  expect(modeAtWavenumber(MODES, 800, options)).toBe(1);
  expect(modeAtWavenumber(MODES, 1600, options)).toBeNull();
});

test('a mode with no intensity on this chart still answers a click, with unit weight', () => {
  const modes = [makeMode(1600, null, null)];
  expect(modeAtWavenumber(modes, 1602, { fwhm: 20, chart: 'infrared' })).toBe(
    0,
  );
});

test('modeIntensity reads the chart it is asked about', () => {
  const mode = makeMode(1600, 200, 90);
  expect(modeIntensity(mode, 'infrared')).toBe(200);
  expect(modeIntensity(mode, 'raman')).toBe(90);
  expect(modeIntensity(makeMode(1600, null, 4), 'infrared')).toBeNull();
});
