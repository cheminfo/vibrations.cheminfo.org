import { expect, test } from 'vitest';

import { tracePoints } from '../tracePoints.ts';

import { makeTrace } from './traceFixture.ts';

test('only the window is converted, plus one point past each edge', () => {
  const points = tracePoints(makeTrace(), {
    variable: 'y',
    from: 480,
    to: 520,
  });
  expect(points).toStrictEqual([
    { x: 450, y: 2 },
    { x: 500, y: 3 },
    { x: 550, y: 4 },
  ]);
});

test('the chosen variable is drawn, and a missing one falls back to y', () => {
  const trace = makeTrace({ a: [10, 20, 30, 40, 50] });
  const options = { variable: 'a', from: 400, to: 600 } as const;
  expect(tracePoints(trace, options)[0]).toStrictEqual({ x: 400, y: 10 });

  const withoutTransmittance = tracePoints(trace, {
    variable: 't',
    from: 400,
    to: 600,
  });
  expect(withoutTransmittance[0]).toStrictEqual({ x: 400, y: 1 });
});

test('the wavenumber scale moves x and un-scales the window', () => {
  const points = tracePoints(makeTrace({ wavenumberScale: 0.96 }), {
    variable: 'y',
    from: 470,
    to: 490,
  });
  // 470–490 cm⁻¹ on screen is 489.58–510.42 cm⁻¹ stored, i.e. the 500 point.
  expect(points).toStrictEqual([
    { x: 432, y: 2 },
    { x: 480, y: 3 },
    { x: 528, y: 4 },
  ]);
});

test('a mirrored trace is reflected about the baseline, not negated', () => {
  const trace = makeTrace({ t: [90, 80, 70, 60, 50], mirrored: true });
  const points = tracePoints(trace, {
    variable: 't',
    from: 400,
    to: 600,
    baseline: 100,
  });
  expect(points).toStrictEqual([
    { x: 400, y: 110 },
    { x: 450, y: 120 },
    { x: 500, y: 130 },
    { x: 550, y: 140 },
    { x: 600, y: 150 },
  ]);
});

test('a mirrored trace on a zero baseline is negated', () => {
  const points = tracePoints(makeTrace({ mirrored: true }), {
    variable: 'y',
    from: 400,
    to: 600,
  });
  expect(points[4]).toStrictEqual({ x: 600, y: -5 });
});

test('the same request reuses the points already built', () => {
  const trace = makeTrace();
  const options = { variable: 'y', from: 400, to: 600 } as const;
  expect(tracePoints(trace, options)).toBe(tracePoints(trace, options));
  expect(tracePoints(trace, options)).not.toBe(
    tracePoints(trace, { ...options, to: 550 }),
  );
});

test('an empty measurement draws nothing', () => {
  const points = tracePoints(makeTrace({ x: [], y: [] }), {
    variable: 'y',
    from: 400,
    to: 600,
  });
  expect(points).toStrictEqual([]);
});
