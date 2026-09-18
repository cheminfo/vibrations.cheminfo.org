import { expect, test } from 'vitest';

import {
  CHART_LAYOUTS,
  chartsFor,
  showsInfrared,
  showsRaman,
} from '../layouts.ts';

test('the three layouts are offered infrared, Raman, then both', () => {
  expect(CHART_LAYOUTS.map((layout) => layout.id)).toStrictEqual([
    'infrared',
    'raman',
    'both',
  ]);
  expect(CHART_LAYOUTS.map((layout) => layout.label)).toStrictEqual([
    'Infrared',
    'Raman',
    'Infrared + Raman',
  ]);
});

test('only the stacked layout draws two charts', () => {
  expect(chartsFor('infrared')).toStrictEqual(['infrared']);
  expect(chartsFor('raman')).toStrictEqual(['raman']);
  expect(chartsFor('both')).toStrictEqual(['infrared', 'raman']);
});

test('each layout declares which intensity columns it wants', () => {
  expect([
    showsInfrared('infrared'),
    showsInfrared('raman'),
    showsInfrared('both'),
  ]).toStrictEqual([true, false, true]);
  expect([
    showsRaman('infrared'),
    showsRaman('raman'),
    showsRaman('both'),
  ]).toStrictEqual([false, true, true]);
});
