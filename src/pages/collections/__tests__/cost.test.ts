import { expect, test } from 'vitest';

import { RING_STRAIN } from '../../../data/collections/index.ts';
import {
  estimateQueueSeconds,
  estimateSeconds,
  formatDuration,
} from '../cost.ts';

test('the estimate follows the cube of the atom count', () => {
  expect(estimateSeconds(33)).toBeCloseTo(4, 10);
  expect(estimateSeconds(66) / estimateSeconds(33)).toBeCloseTo(8, 10);
  expect(estimateSeconds(0)).toBe(0);
  expect(estimateSeconds(-3)).toBe(0);
});

test('a queue costs the sum of its molecules', () => {
  const entries = RING_STRAIN.entries;
  let expected = 0;
  for (const entry of entries) expected += estimateSeconds(entry.atoms);
  expect(estimateQueueSeconds(entries)).toBeCloseTo(expected, 10);
  expect(estimateQueueSeconds([])).toBe(0);
});

test('durations read the way a person writes them', () => {
  expect(formatDuration(0.4)).toBe('< 1 s');
  expect(formatDuration(12.4)).toBe('12 s');
  expect(formatDuration(59.6)).toBe('1 min');
  expect(formatDuration(200)).toBe('3 min 20 s');
  expect(formatDuration(120)).toBe('2 min');
  expect(formatDuration(Number.NaN)).toBe('< 1 s');
});
