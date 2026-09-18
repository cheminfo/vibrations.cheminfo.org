import { expect, test } from 'vitest';

import {
  atomDisplacementMagnitudes,
  bondStretch,
  modeForBond,
  modeHighlight,
} from '../modeStructure.ts';

import { makeDisplacedMode, makeMolecule } from './makeMolecule.ts';

// Three atoms on the x axis: a central one at the origin with a neighbour on
// each side, so one bond can be stretched while the other is left alone.
const geometry = makeMolecule(
  ['C', 'O', 'H'],
  [0, 0, 0, 1.2, 0, 0, -1.1, 0, 0],
);
const bonds = [
  [0, 1],
  [0, 2],
] as const;

const stretch = makeDisplacedMode(1700, [0, 0, 0, 0.4, 0, 0, 0, 0, 0]);
const translation = makeDisplacedMode(5, [0.4, 0, 0, 0.4, 0, 0, 0.4, 0, 0]);
const bend = makeDisplacedMode(600, [0, 0, 0, 0, 0.4, 0, 0, 0, 0]);

test('a bond stretch scores its full relative displacement', () => {
  expect(bondStretch(stretch, geometry, bonds[0])).toBeCloseTo(1, 12);
});

test('a rigid translation stretches nothing', () => {
  expect(bondStretch(translation, geometry, bonds[0])).toBe(0);
  expect(bondStretch(translation, geometry, bonds[1])).toBe(0);
});

test('motion perpendicular to the bond axis does not change its length', () => {
  expect(bondStretch(bend, geometry, bonds[0])).toBe(0);
});

test('a bond is mapped to the mode that stretches it most', () => {
  const modes = [translation, bend, stretch];
  expect(modeForBond(modes, geometry, bonds, 0)).toBe(2);
});

test('a bond no mode stretches maps to no mode', () => {
  expect(modeForBond([translation, bend], geometry, bonds, 1)).toBe(null);
});

test('a bond index outside the table maps to no mode', () => {
  expect(modeForBond([stretch], geometry, bonds, 7)).toBe(null);
});

test("the engine's own involvement is used when it is there", () => {
  const annotated = {
    ...bend,
    involvement: { atoms: [2], bonds: [1], participation: 0.9 },
  };
  expect(modeHighlight(annotated, geometry, bonds)).toStrictEqual({
    atoms: [2],
    bonds: [1],
  });
});

test('without an involvement the moving atoms and bonds are derived', () => {
  expect(modeHighlight(stretch, geometry, bonds)).toStrictEqual({
    atoms: [1],
    bonds: [0],
  });
});

test('a mode that moves nothing marks nothing', () => {
  const still = makeDisplacedMode(0, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(modeHighlight(still, geometry, bonds)).toStrictEqual({
    atoms: [],
    bonds: [],
  });
});

test('displacement magnitudes are one per atom', () => {
  expect([...atomDisplacementMagnitudes(bend)]).toStrictEqual([0, 0.4, 0]);
});
