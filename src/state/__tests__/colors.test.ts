import { expect, test } from 'vitest';

import { SERIES_PALETTE, assignSeriesColor } from '../colors.ts';

test('the palette is the eight house hues followed by the twenty-colour set', () => {
  expect(SERIES_PALETTE).toHaveLength(28);
  expect(SERIES_PALETTE[0]).toBe('#0072b2');
  expect(SERIES_PALETTE[8]).toBe('#C10020');
  expect(new Set(SERIES_PALETTE.map((color) => color.toUpperCase())).size).toBe(
    28,
  );
});

test('a colour already on the chart is never handed out again', () => {
  const used: string[] = [];
  for (let index = 0; index < 28; index++) {
    const color = assignSeriesColor(used);
    expect(used).not.toContain(color);
    used.push(color);
  }
  expect(used).toStrictEqual([...SERIES_PALETTE]);
});

test('an unused colour is taken even when it sits in the middle of the palette', () => {
  const used = [...SERIES_PALETTE];
  used.splice(3, 1);
  expect(assignSeriesColor(used)).toBe('#cc79a7');
});

test('case does not make a taken colour look free', () => {
  expect(assignSeriesColor(['#0072B2'])).toBe('#d55e00');
});

test('the twenty-ninth series wraps deterministically instead of failing', () => {
  expect(assignSeriesColor(SERIES_PALETTE)).toBe('#A6BDD7');
});
