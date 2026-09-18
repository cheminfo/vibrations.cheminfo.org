import { expect, test } from 'vitest';

import { cursorReadout } from '../cursorReadout.ts';

import { makeTrace } from './traceFixture.ts';

test('every covering series is reported, strongest first', () => {
  const weak = makeTrace({ id: 'weak', label: 'Weak', color: '#007D34' });
  const strong = makeTrace({
    id: 'strong',
    label: 'Strong',
    color: '#C10020',
    y: [10, 20, 30, 40, 50],
  });

  expect(cursorReadout([weak, strong], 500, 'y')).toStrictEqual([
    {
      id: 'strong',
      label: 'Strong',
      color: '#C10020',
      value: 30,
      wavenumber: 500,
    },
    { id: 'weak', label: 'Weak', color: '#007D34', value: 3, wavenumber: 500 },
  ]);
});

test('the nearest stored point is read, not an interpolated one', () => {
  const rows = cursorReadout([makeTrace()], 519, 'y');
  expect(rows).toHaveLength(1);
  expect(rows[0]?.wavenumber).toBe(500);
  expect(rows[0]?.value).toBe(3);
});

test('a series that does not reach the pointer is left out', () => {
  const narrow = makeTrace({ id: 'narrow', x: [400, 450], y: [1, 2] });
  const wide = makeTrace({ id: 'wide' });
  expect(cursorReadout([narrow, wide], 3000, 'y')).toStrictEqual([]);

  const inside = cursorReadout([narrow, wide], 590, 'y');
  expect(inside).toHaveLength(1);
  expect(inside[0]?.id).toBe('wide');
});

test('the pointer is un-scaled before the series is searched', () => {
  const rows = cursorReadout([makeTrace({ wavenumberScale: 0.5 })], 275, 'y');
  expect(rows[0]?.wavenumber).toBe(550);
  expect(rows[0]?.value).toBe(4);
});

test('mirroring is not applied: the readout says what was measured', () => {
  const rows = cursorReadout([makeTrace({ mirrored: true })], 600, 'y');
  expect(rows[0]?.value).toBe(5);
});

test('a variable the trace does not carry falls back to y', () => {
  const rows = cursorReadout([makeTrace()], 400, 't');
  expect(rows[0]?.value).toBe(1);
});
