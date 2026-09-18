import { expect, test } from 'vitest';

import { intensityFill, strongestIntensities } from '../intensityFill.ts';
import type { ModeColumn } from '../modeColumns.ts';
import { modeColumns } from '../modeColumns.ts';
import type { ModeRow } from '../modeRows.ts';

import { makeMode } from './makeEntry.ts';

const ROWS: ModeRow[] = [
  { index: 0, mode: makeMode(400, 10, 90) },
  { index: 1, mode: makeMode(1600, 200, 45) },
  { index: 2, mode: makeMode(3400, 0, null) },
];

test('the maxima are read per chart', () => {
  expect(strongestIntensities(ROWS)).toStrictEqual({
    infrared: 200,
    raman: 90,
  });
});

test('a bar is as wide as the band is strong, against its own chart', () => {
  const strongest = strongestIntensities(ROWS);
  expect(intensityFill(row(0), column('ir'), strongest)).toBe(
    'linear-gradient(to left, rgb(45 114 210 / 18%) 5%, transparent 5%)',
  );
  expect(intensityFill(row(1), column('raman'), strongest)).toBe(
    'linear-gradient(to left, rgb(45 114 210 / 18%) 50%, transparent 50%)',
  );
});

test('a silent or uncomputed band gets no bar, and neither does another column', () => {
  const strongest = strongestIntensities(ROWS);
  expect(intensityFill(row(2), column('ir'), strongest)).toBeUndefined();
  expect(intensityFill(row(2), column('raman'), strongest)).toBeUndefined();
  expect(
    intensityFill(row(1), column('wavenumber'), strongest),
  ).toBeUndefined();
});

function row(index: number): ModeRow {
  const found = ROWS[index];
  if (found === undefined) throw new Error(`no row ${index}`);
  return found;
}

function column(id: string): ModeColumn {
  const found = modeColumns('both').find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`no column ${id}`);
  return found;
}
