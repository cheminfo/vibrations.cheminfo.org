import { expect, test } from 'vitest';

import { MAX_ELECTRONS, electronCount, moleculeGuards } from '../electrons.ts';

import { makeMolecule } from './makeMolecule.ts';

test('water carries ten electrons', () => {
  expect(electronCount(['O', 'H', 'H'], 0)).toBe(10);
});

test('a charge is subtracted from the neutral count', () => {
  expect(electronCount(['N', 'H', 'H', 'H', 'H'], 1)).toBe(10);
  expect(electronCount(['O', 'H'], -1)).toBe(10);
});

test('an unknown element symbol is rejected', () => {
  expect(() => electronCount(['Xx'], 0)).toThrow(
    '"Xx" is not an element symbol',
  );
});

test('no molecule means nothing to say', () => {
  expect(moleculeGuards(null)).toStrictEqual({
    electrons: 0,
    atoms: 0,
    refusals: [],
    warnings: [],
  });
});

test('benzene passes both guards', () => {
  const elements = 'CCCCCCHHHHHH'.split('');
  const guards = moleculeGuards(makeMolecule(elements, new Array(36).fill(0)));
  expect(guards.electrons).toBe(42);
  expect(guards.atoms).toBe(12);
  expect(guards.refusals).toStrictEqual([]);
  expect(guards.warnings).toStrictEqual([]);
});

test('too many electrons is a refusal, and too many atoms a warning', () => {
  const elements = new Array<string>(40).fill('Br');
  const guards = moleculeGuards(makeMolecule(elements, new Array(120).fill(0)));
  expect(guards.electrons).toBe(1400);
  expect(guards.refusals).toStrictEqual([
    `test molecule carries 1400 electrons; this build stops at ${MAX_ELECTRONS}`,
  ]);
  expect(guards.warnings).toStrictEqual([
    '40 atoms is past the interactive limit of 30: the optimization and the Hessian will take tens of seconds',
  ]);
});
