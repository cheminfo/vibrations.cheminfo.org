import { expect, test } from 'vitest';

import type { NormalizationOptions } from '../../../types/trace.ts';
import {
  SPECTRUM_POINTS,
  computedTraces,
  resultIdFromTraceId,
  spectrumBands,
  traceId,
} from '../traces.ts';

import { makeEntry, makeMode } from './makeEntry.ts';

const NO_NORMALIZATION: NormalizationOptions = {
  enabled: false,
  from: 500,
  to: 4000,
};

const OPTIONS = {
  fwhm: 20,
  from: 400,
  to: 4000,
  irVariable: 'transmittance' as const,
  normalization: NO_NORMALIZATION,
};

test('an infrared trace carries absorbance and transmittance', () => {
  const entry = makeEntry('water', [makeMode(1600, 50, 3)]);
  const traces = computedTraces([entry], 'infrared', OPTIONS);

  expect(traces).toHaveLength(1);
  const trace = traces[0];
  expect(trace?.id).toBe('infrared:water');
  expect(trace?.label).toBe('water');
  expect(trace?.color).toBe('#0072b2');
  expect(trace?.kind).toBe('ir-transmittance');
  expect(trace?.origin).toStrictEqual({
    kind: 'computed',
    resultId: 'water',
    engineId: 'occjs',
  });
  expect(Object.keys(trace?.measurement.variables ?? {})).toStrictEqual([
    'x',
    'y',
    'a',
    't',
  ]);
  expect(trace?.measurement.variables.x.data).toHaveLength(SPECTRUM_POINTS);
});

test('the absorbance kind follows the reading the user picked', () => {
  const entry = makeEntry('water', [makeMode(1600, 50, 3)]);
  const traces = computedTraces([entry], 'infrared', {
    ...OPTIONS,
    irVariable: 'absorbance',
  });
  expect(traces[0]?.kind).toBe('ir-absorbance');
});

test('a Raman trace carries the activity alone', () => {
  const entry = makeEntry('water', [makeMode(1600, 50, 3)]);
  const traces = computedTraces([entry], 'raman', OPTIONS);

  expect(traces[0]?.kind).toBe('raman');
  expect(Object.keys(traces[0]?.measurement.variables ?? {})).toStrictEqual([
    'x',
    'y',
  ]);
  expect(traces[0]?.measurement.variables.y.units).toBe('A^4/amu');
});

test('a result with no intensity on this chart is left out', () => {
  const entries = [
    makeEntry('with', [makeMode(1600, 50, null)]),
    makeEntry('without', [makeMode(1600, 50, null)]),
  ];
  expect(computedTraces(entries, 'raman', OPTIONS)).toStrictEqual([]);
  expect(computedTraces(entries, 'infrared', OPTIONS)).toHaveLength(2);
});

test('a hidden entry still becomes a trace, marked hidden', () => {
  const entry = makeEntry('water', [makeMode(1600, 50, 3)], {
    visible: false,
    color: '#d55e00',
  });
  const trace = computedTraces([entry], 'infrared', OPTIONS)[0];
  expect(trace?.visible).toBe(false);
  expect(trace?.color).toBe('#d55e00');
});

test('the wavenumber scale travels with the trace', () => {
  const entry = makeEntry('water', [makeMode(1600, 50, 3)]);
  const trace = computedTraces([entry], 'infrared', {
    ...OPTIONS,
    wavenumberScale: 0.96,
  })[0];
  expect(trace?.wavenumberScale).toBe(0.96);
});

test('a trace id round-trips to its result id, and only for its own chart', () => {
  expect(traceId('raman', 'abc')).toBe('raman:abc');
  expect(resultIdFromTraceId('raman:abc', 'raman')).toBe('abc');
  expect(resultIdFromTraceId('raman:abc', 'infrared')).toBeNull();
  expect(resultIdFromTraceId('7f1e-experimental', 'infrared')).toBeNull();
});

test('bands drop imaginary and silent modes and stack downwards', () => {
  const modes = [
    makeMode(-120, 5, 5),
    makeMode(1600, 50, 3),
    makeMode(3400, 0, 12),
    makeMode(2900, 20, null),
  ];
  const bands = spectrumBands(modes, 'infrared');

  expect(bands.map((band) => band.modeIndex)).toStrictEqual([3, 1]);
  expect(bands.map((band) => band.wavenumber)).toStrictEqual([2900, 1600]);
  expect(bands[1]?.title).toBe('1600.0 cm⁻¹ · 50.0 km mol⁻¹');
});

test('Raman bands read the activity, and the scale moves them', () => {
  const modes = [makeMode(1600, 50, 3), makeMode(3400, 0, 12)];
  const bands = spectrumBands(modes, 'raman', 0.5);

  expect(bands.map((band) => band.modeIndex)).toStrictEqual([1, 0]);
  expect(bands.map((band) => band.wavenumber)).toStrictEqual([1700, 800]);
  expect(bands[0]?.title).toBe('3400.0 cm⁻¹ · 12.0 Å⁴ amu⁻¹');
});
