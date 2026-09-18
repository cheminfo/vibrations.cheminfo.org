import { expect, test } from 'vitest';

import {
  COLUMN_GAP,
  INDEX_WIDTH,
  columnsWidth,
  modeColumns,
} from '../modeColumns.ts';

import { makeMode } from './makeEntry.ts';

test('the infrared layout drops the Raman columns', () => {
  expect(modeColumns('infrared').map((column) => column.id)).toStrictEqual([
    'wavenumber',
    'ir',
    'reducedMass',
    'forceConstant',
  ]);
});

test('the Raman layout drops the infrared column and adds the depolarization', () => {
  expect(modeColumns('raman').map((column) => column.id)).toStrictEqual([
    'wavenumber',
    'raman',
    'depolarization',
    'reducedMass',
    'forceConstant',
  ]);
});

test('the stacked layout carries both intensities side by side', () => {
  const columns = modeColumns('both');
  expect(columns.map((column) => column.id)).toStrictEqual([
    'wavenumber',
    'ir',
    'raman',
    'depolarization',
    'reducedMass',
    'forceConstant',
  ]);
  const intensities = columns.filter(
    (column) => column.sortKey === 'intensity',
  );
  expect(intensities.map((column) => column.sortChart)).toStrictEqual([
    'infrared',
    'raman',
  ]);
});

test('a cell renders a number it has and an em dash for one it does not', () => {
  const mode = makeMode(1613.42, 245.67, null);
  mode.reducedMass = 1.0824;
  mode.forceConstant = 1.660_25;
  const columns = modeColumns('both');
  const values = columns.map((column) => column.value(mode));
  expect(values).toStrictEqual(['1613.4', '245.7', '—', '—', '1.08', '1.660']);
});

test('the table is as wide as its columns plus the mode-number column', () => {
  const columns = modeColumns('infrared');
  const expected =
    INDEX_WIDTH + 62 + 54 + 48 + 48 + COLUMN_GAP * columns.length;
  expect(columnsWidth(columns)).toBe(expected);
});
