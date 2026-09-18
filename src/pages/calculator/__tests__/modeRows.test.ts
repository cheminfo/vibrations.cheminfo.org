import { expect, test } from 'vitest';

import { sortedModeRows } from '../modeRows.ts';

import { makeMode } from './makeEntry.ts';

const MODES = [
  makeMode(400, 10, 90),
  makeMode(1600, 200, 5),
  makeMode(3400, 200, null),
];

test('sorting by wavenumber keeps the result order', () => {
  const rows = sortedModeRows(MODES, { key: 'wavenumber', chart: 'infrared' });
  expect(rows.map((row) => row.index)).toStrictEqual([0, 1, 2]);
  expect(rows[0]?.mode).toBe(MODES[0]);
});

test('sorting descending by intensity ranks the strongest band first', () => {
  const rows = sortedModeRows(MODES, {
    key: 'intensity',
    descending: true,
    chart: 'infrared',
  });
  // Two modes share 200 km/mol, so the result's own order breaks the tie.
  expect(rows.map((row) => row.index)).toStrictEqual([1, 2, 0]);
});

test('the Raman column sorts on the activity, and a missing one sorts as zero', () => {
  const rows = sortedModeRows(MODES, {
    key: 'intensity',
    descending: true,
    chart: 'raman',
  });
  expect(rows.map((row) => row.index)).toStrictEqual([0, 1, 2]);
});

test('a row keeps the index the result gave it whatever the sort', () => {
  const rows = sortedModeRows(MODES, {
    key: 'intensity',
    descending: true,
    chart: 'infrared',
  });
  expect(rows[0]?.index).toBe(1);
  expect(rows[0]?.mode.wavenumber).toBe(1600);
});
