import { expect, test } from 'vitest';

import { TOUR_STEPS } from '../tour.ts';

test('the guided tour keeps its eight original steps in order', () => {
  const steps: Array<readonly [string, string, string]> = [];
  for (const step of TOUR_STEPS) {
    steps.push([step.id, step.section, step.title]);
  }
  expect(steps).toStrictEqual([
    ['introduction', 'introduction', "Let's make molecules vibrate"],
    ['adding-a-structure', 'structure-editor', 'Adding a structure'],
    ['loading-a-set', 'collections', 'Loading a set'],
    [
      'toggling-between-molecules',
      'molecule-table',
      'Toggling between molecules',
    ],
    [
      'interacting-with-the-spectrum',
      'spectrum',
      'Interacting with the spectrum',
    ],
    ['selecting-modes', 'mode-table', 'Selecting modes'],
    [
      'bond-to-band',
      'structure-view',
      'Where do I see this bond in the spectrum?',
    ],
    ['help', 'help', 'Help! That was too much information!'],
  ]);
});

test('no step still carries markup, an entity or a screenshot placeholder', () => {
  const counts: number[] = [];
  for (const step of TOUR_STEPS) {
    expect(step.title).not.toMatch(/^"|<|&nbsp;/);
    counts.push(step.paragraphs.length);
    for (const paragraph of step.paragraphs) {
      expect(paragraph).not.toMatch(/<|&nbsp;|\[IMG]|\[IMAGE]/);
      expect(paragraph.endsWith('.')).toBe(true);
    }
  }
  expect(counts).toStrictEqual([1, 3, 1, 1, 1, 1, 2, 1]);
});

test('the mode-table step states the vibrational mode count of this app', () => {
  const step = TOUR_STEPS[5];
  expect(step?.id).toBe('selecting-modes');
  const prose = (step?.paragraphs ?? []).join(' ');
  expect(prose).toContain('3N−6');
  expect(prose).toContain('3N−5');
  expect(prose).not.toContain('translational');
});
