import { expect, test } from 'vitest';

import { SPECTRUM_PALETTE, nextColor } from '../palette.ts';

test('the overlay palette holds twenty contrast colours in a fixed order', () => {
  expect(SPECTRUM_PALETTE).toStrictEqual([
    '#C10020',
    '#007D34',
    '#803E75',
    '#232C16',
    '#F4C800',
    '#00538A',
    '#B32851',
    '#7F180D',
    '#A6BDD7',
    '#CEA262',
    '#817066',
    '#FF6800',
    '#F6768E',
    '#FF7A5C',
    '#53377A',
    '#FFB300',
    '#FF8E00',
    '#93AA00',
    '#593315',
    '#F13A13',
  ]);
});

test('the first trace on an empty chart is dark red', () => {
  expect(nextColor([])).toBe('#C10020');
});

test('twenty successive traces walk the palette without repeating', () => {
  const used: string[] = [];
  for (let index = 0; index < 20; index++) {
    used.push(nextColor(used));
  }
  expect(used).toStrictEqual([...SPECTRUM_PALETTE]);
  expect(new Set(used).size).toBe(20);
});

test('the twenty-first and twenty-second traces wrap to the start', () => {
  const used = [...SPECTRUM_PALETTE];
  expect(nextColor(used)).toBe('#C10020');
  expect(nextColor([...used, '#C10020'])).toBe('#007D34');
});

test('a gap in the middle of the palette is filled before later colours', () => {
  const used = SPECTRUM_PALETTE.filter((color) => color !== '#232C16');
  expect(nextColor(used)).toBe('#232C16');
});

test('colours already used are matched case-insensitively', () => {
  expect(nextColor(['#c10020', '#007d34'])).toBe('#803E75');
});

test('colours from outside the palette never consume a palette entry', () => {
  expect(nextColor(['#123456', '#abcdef'])).toBe('#C10020');
});
