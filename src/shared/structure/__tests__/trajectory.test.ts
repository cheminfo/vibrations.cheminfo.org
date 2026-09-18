import { expect, test } from 'vitest';

import { framesPerSecond, trajectoryXyz } from '../trajectory.ts';

import { makeDisplacedMode, makeMolecule } from './makeMolecule.ts';

const geometry = makeMolecule(['H', 'H'], [0, 0, 0, 0.74, 0, 0]);
const mode = makeDisplacedMode(4400, [-0.5, 0, 0, 0.5, 0, 0]);

test('no mode gives the single equilibrium model', () => {
  const xyz = trajectoryXyz(geometry, null, 0.3, 20);
  expect(xyz).toBe(
    '2\nequilibrium\nH 0.000000 0.000000 0.000000\nH 0.740000 0.000000 0.000000\n',
  );
});

test('a mode gives one model per frame', () => {
  const xyz = trajectoryXyz(geometry, mode, 0.3, 8);
  const models = xyz.split('\n').filter((line) => line === '2');
  expect(models).toHaveLength(8);
  expect(xyz).toContain('frame 1 of 8 — 4400.0 cm-1');
  expect(xyz).toContain('frame 8 of 8 — 4400.0 cm-1');
});

test('the first frame is the equilibrium geometry, and the quarter frame the full amplitude', () => {
  const lines = trajectoryXyz(geometry, mode, 0.3, 4).split('\n');
  expect(lines[2]).toBe('H 0.000000 0.000000 0.000000');
  expect(lines[3]).toBe('H 0.740000 0.000000 0.000000');
  // Quarter period: sin = 1, and the mode's largest atom moves by `amplitude`.
  expect(lines[6]).toBe('H -0.300000 0.000000 0.000000');
  expect(lines[7]).toBe('H 1.040000 0.000000 0.000000');
});

test('a mode with no displacement leaves the geometry alone', () => {
  const still = makeDisplacedMode(0, [0, 0, 0, 0, 0, 0]);
  const lines = trajectoryXyz(geometry, still, 0.3, 4).split('\n');
  expect(lines[6]).toBe('H 0.000000 0.000000 0.000000');
});

test('fewer than two frames is raised to two', () => {
  const xyz = trajectoryXyz(geometry, mode, 0.3, 1);
  expect(xyz.split('\n').filter((line) => line === '2')).toHaveLength(2);
});

test('the frame rate is clamped to what Mol* accepts', () => {
  expect(framesPerSecond(40)).toBe(25);
  expect(framesPerSecond(1)).toBe(60);
  expect(framesPerSecond(1000)).toBe(5);
});
