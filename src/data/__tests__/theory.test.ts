import { expect, test } from 'vitest';

import { COLLECTIONS } from '../collections.ts';
import { COLLECTION_THEORY, THEORY_SECTIONS } from '../theory.ts';

/**
 * A phrase each collection's paragraph must carry, so a paragraph cannot be
 * swapped for another collection's or emptied without the test noticing.
 */
const COLLECTION_SUBJECT: Readonly<Record<string, string>> = {
  'directing-groups': 'ortho, meta and para isomers do not shift by the same',
  'inductive-mesomeric-effect': 'travels through π bonds instead',
  'mesomeric-effect': 'C=O bond order drops',
  'gross-selection-rule': 'homonuclear diatomic',
  'ring-strain': 'larger effective force constant',
  'steric-effect': 'Geometry, not electronegativity',
  'theory-vs-experiment': 'SDBS database',
};

test('the theory panel carries the eight sections in reading order', () => {
  const ids: string[] = [];
  const titles: string[] = [];
  for (const section of THEORY_SECTIONS) {
    ids.push(section.id);
    titles.push(section.title);
  }
  expect(ids).toStrictEqual([
    'gross-selection-rule',
    'specific-selection-rule',
    'mutual-exclusion',
    'degrees-of-freedom',
    'spectra-from-the-hessian',
    'method',
    'curated-collections',
    'limitations',
  ]);
  expect(titles[0]).toBe('Gross selection rule');
  expect(titles[7]).toBe('What the simulation does not include');
});

test('every section is prose with no markup, LaTeX or image left over', () => {
  const counts: number[] = [];
  for (const section of THEORY_SECTIONS) {
    counts.push(section.paragraphs.length);
    for (const paragraph of section.paragraphs) {
      expect(paragraph).not.toMatch(/<|\$|&nbsp;|!\[|\\mathbf/);
      expect(paragraph.endsWith('.')).toBe(true);
    }
  }
  expect(counts).toStrictEqual([2, 1, 2, 2, 3, 2, 1, 2]);
});

test('the degrees-of-freedom section states both mode counts', () => {
  const section = THEORY_SECTIONS[3];
  expect(section?.id).toBe('degrees-of-freedom');
  const prose = (section?.paragraphs ?? []).join(' ');
  expect(prose).toContain('3N−6');
  expect(prose).toContain('3N−5');
});

test('the mutual-exclusion section cites the exclusion rule', () => {
  const section = THEORY_SECTIONS[2];
  expect(section?.id).toBe('mutual-exclusion');
  expect(section?.references).toStrictEqual([
    {
      label: 'Rule of mutual exclusion',
      url: 'https://en.wikipedia.org/wiki/Rule_of_mutual_exclusion',
    },
  ]);
});

test('every borrowed work is credited with the source it came from', () => {
  const labels: string[] = [];
  for (const section of THEORY_SECTIONS) {
    for (const reference of section.references ?? []) {
      if (reference.url !== undefined) {
        expect(reference.url).toMatch(/^https:\/\//);
      }
      labels.push(reference.label);
    }
  }
  expect(labels).toStrictEqual([
    'Malte Oppermann, lecture notes on electronic spectroscopy, EPFL (2015)',
    'Rule of mutual exclusion',
    'Frank Neese, lecture on molecular vibrations and IR spectra',
    'C. David Sherrill, lecture notes on molecular vibrations',
    'Porezag & Pederson, IR intensities and Raman activities within DFT, Phys. Rev. B 54, 7830 (1996)',
    'Bannwarth, Ehlert & Grimme, GFN2-xTB, J. Chem. Theory Comput. (2019)',
  ]);
});

test('each collection has exactly one explanatory paragraph', () => {
  const collectionIds: string[] = [];
  for (const collection of COLLECTIONS) collectionIds.push(collection.id);
  expect(Object.keys(COLLECTION_THEORY).toSorted()).toStrictEqual(
    collectionIds.toSorted(),
  );
  for (const id of collectionIds) {
    const paragraph = COLLECTION_THEORY[id] ?? '';
    expect(paragraph).not.toMatch(/<|\$/);
    const subject = COLLECTION_SUBJECT[id];
    if (subject === undefined) {
      throw new Error(`no expected subject for collection ${id}`);
    }
    expect(paragraph).toContain(subject);
  }
});

test('the inductive series explains that the ester sits above the ketone', () => {
  const paragraph = COLLECTION_THEORY['inductive-mesomeric-effect'] ?? '';
  expect(paragraph).toContain('above the ketone');
  expect(paragraph).toContain('the amide ends up the lowest of the series');
});
