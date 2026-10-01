import { assertRoutes, pageMetaFor } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import {
  COLLECTION_ROUTES,
  FIXED_ROUTES,
  NOSCRIPT_ROUTES,
  PAGE_ROUTES,
} from '../routes.ts';

test('the table names eleven addresses, each written once and as a path', () => {
  expect(PAGE_ROUTES).toHaveLength(11);
  expect(PAGE_ROUTES.map((route) => route.path)).toStrictEqual([
    '/',
    '/collections',
    '/validation',
    '/about',
    '/collections/directing-groups',
    '/collections/inductive-mesomeric-effect',
    '/collections/mesomeric-effect',
    '/collections/gross-selection-rule',
    '/collections/ring-strain',
    '/collections/steric-effect',
    '/collections/theory-vs-experiment',
  ]);
  expect(() => assertRoutes(PAGE_ROUTES)).not.toThrow();
});

test('a title fits a search result, with the site name still to be appended', () => {
  const tooLong = PAGE_ROUTES.filter((route) => route.title.length >= 60);
  expect(tooLong.map((route) => route.path)).toStrictEqual([]);
});

test('a description is one sentence of between 110 and 160 characters', () => {
  const offenders = PAGE_ROUTES.filter(
    (route) => route.description.length < 110 || route.description.length > 160,
  );
  expect(
    offenders.map((route) => `${route.path}: ${route.description.length}`),
  ).toStrictEqual([]);
});

test('no two pages carry the same title or the same description', () => {
  expect(new Set(PAGE_ROUTES.map((route) => route.title)).size).toBe(11);
  expect(new Set(PAGE_ROUTES.map((route) => route.description)).size).toBe(11);
});

test('nothing names a repository, a tracker or a licence, or claims to be open', () => {
  const prose = PAGE_ROUTES.map(
    (route) => `${route.title} ${route.description} ${route.note ?? ''}`,
  ).join('\n');
  expect(prose).not.toMatch(
    /github|gitlab|issue tracker|licen[cs]e|open[- ]source|repositor/i,
  );
});

test('the home page is what an address the site does not know is indexed as', () => {
  expect(pageMetaFor(PAGE_ROUTES, '/nowhere').title).toBe(
    'IR and Raman spectra computed in your browser',
  );
  expect(pageMetaFor(PAGE_ROUTES, '/').description).toBe(
    'Draw a molecule and compute its infrared and Raman spectrum with GFN2-xTB in the browser: vibrational frequencies, intensities and every mode animated in 3D.',
  );
});

test('a page is indexed under its own title, query string and all', () => {
  expect(pageMetaFor(PAGE_ROUTES, '/validation').title).toBe(
    'Validation against reference xtb calculations',
  );
  expect(pageMetaFor(PAGE_ROUTES, '/about?embed=1').title).toBe(
    'About — what it computes, and what it borrows',
  );
  expect(pageMetaFor(PAGE_ROUTES, '/collections/ring-strain').description).toBe(
    'Follow the carbonyl stretch from cyclopropanone to cyclooctanone and watch the wavenumber climb as the shrinking ring pulls the carbon off its sp² geometry.',
  );
});

test('a collection the data no longer carries is indexed under the collections', () => {
  expect(pageMetaFor(PAGE_ROUTES, '/collections/retired-set').title).toBe(
    'Collections — one effect per set of molecules',
  );
});

test('the crawl path is a menu of four pages, the collections nested under one', () => {
  expect(NOSCRIPT_ROUTES.map((route) => route.short)).toStrictEqual([
    'Calculator',
    'Collections',
    'Validation',
    'About',
  ]);
  expect(NOSCRIPT_ROUTES).toHaveLength(FIXED_ROUTES.length);
  const collections = NOSCRIPT_ROUTES[1];
  expect(collections?.children).toStrictEqual(COLLECTION_ROUTES);
});
