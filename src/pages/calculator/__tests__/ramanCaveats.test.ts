import { expect, test } from 'vitest';

import { ramanCaveats } from '../ramanCaveats.ts';

test('a molecule the model covers gets the model note alone', () => {
  const caveats = ramanCaveats({ elements: ['C', 'O', 'H'], source: 'graph' });
  expect(caveats.map((caveat) => caveat.id)).toStrictEqual(['model']);
  expect(caveats[0]?.intent).toBe('primary');
});

test('an element outside the tables is the most serious caveat', () => {
  const caveats = ramanCaveats({
    elements: ['C', 'U', 'H', 'U'],
    source: 'graph',
  });
  expect(caveats.map((caveat) => caveat.id)).toStrictEqual([
    'unsupported-elements',
    'model',
  ]);
  expect(caveats[0]?.intent).toBe('danger');
  expect(caveats[0]?.text).toContain('do not include U.');
});

test('the legacy connectivity setting is announced', () => {
  const caveats = ramanCaveats({ elements: ['C', 'H'], source: 'distance' });
  expect(caveats.map((caveat) => caveat.id)).toStrictEqual([
    'legacy-connectivity',
    'model',
  ]);
});

test('a disagreement between the two bond lists is reported with its counts', () => {
  const caveats = ramanCaveats({
    elements: ['C', 'Cl'],
    source: 'graph',
    connectivity: {
      extraBonds: [
        [1, 2],
        [1, 3],
      ],
      missingBonds: [[0, 4]],
      agree: false,
    },
  });
  expect(caveats.map((caveat) => caveat.id)).toStrictEqual([
    'connectivity-disagreement',
    'model',
  ]);
  expect(caveats[0]?.text).toContain('invents 2 bond(s)');
  expect(caveats[0]?.text).toContain('misses 1 it does');
});

test('agreeing bond lists produce no disagreement caveat', () => {
  const caveats = ramanCaveats({
    elements: ['C', 'H'],
    source: 'graph',
    connectivity: { extraBonds: [], missingBonds: [], agree: true },
  });
  expect(caveats.map((caveat) => caveat.id)).toStrictEqual(['model']);
});
