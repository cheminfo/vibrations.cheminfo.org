import { expect, test } from 'vitest';

import { modeColumns } from '../modeColumns.ts';
import { sortedModeRows } from '../modeRows.ts';
import { modeTableText } from '../modeTableText.ts';

import { makeMode } from './makeEntry.ts';

function modes() {
  const bend = makeMode(1613.42, 245.67, 3.21);
  bend.reducedMass = 1.0824;
  bend.forceConstant = 1.660_25;
  bend.depolarizationRatio = 0.75;

  const stretch = makeMode(3821.9, 12.5, null);
  stretch.reducedMass = 1.0456;
  stretch.forceConstant = 9.0123;

  const imaginary = makeMode(-142.8, 0.44, 1.02);
  imaginary.reducedMass = 5.5;
  imaginary.forceConstant = 0.066;
  imaginary.depolarizationRatio = 0.12;

  return [bend, stretch, imaginary];
}

test('the stacked layout writes every column with its unit', () => {
  const rows = sortedModeRows(modes(), {
    key: 'wavenumber',
    chart: 'infrared',
  });
  const text = modeTableText(rows, modeColumns('both'));

  expect(text).toBe(
    [
      'mode\tν̃ (cm⁻¹)\tIR (km/mol)\tRaman (Å⁴/amu)\tρ\tμ (amu)\tk (mDyn/Å)',
      '3\t-142.8\t0.4\t1.02\t0.120\t5.50\t0.066',
      '1\t1613.4\t245.7\t3.21\t0.750\t1.08\t1.660',
      '2\t3821.9\t12.5\t\t\t1.05\t9.012',
    ].join('\n'),
  );
});

test('the infrared layout drops the Raman columns and keeps the display order', () => {
  const rows = sortedModeRows(modes(), {
    key: 'intensity',
    chart: 'infrared',
    descending: true,
  });
  const text = modeTableText(rows, modeColumns('infrared'));

  expect(text).toBe(
    [
      'mode\tν̃ (cm⁻¹)\tIR (km/mol)\tμ (amu)\tk (mDyn/Å)',
      '1\t1613.4\t245.7\t1.08\t1.660',
      '2\t3821.9\t12.5\t1.05\t9.012',
      '3\t-142.8\t0.4\t5.50\t0.066',
    ].join('\n'),
  );
});
