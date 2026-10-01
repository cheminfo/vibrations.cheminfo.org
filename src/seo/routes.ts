/**
 * Every address the site answers, with the name and the sentence it is indexed
 * under.
 *
 * One table, read by three things: the build, which writes an HTML file per
 * entry and the sitemap listing them; the head of each of those files; and the
 * running app, which retitles the tab after an in-app move. A page missing from
 * here is a page a search engine only ever sees as the home page.
 *
 * The machinery that reads it is `react-cheminfo/core` and
 * `react-cheminfo/vite`. What belongs to this site is the prose: a collection
 * makes one effect on one band visible, and that is what somebody searches for
 * — "ring strain carbonyl frequency", not "collection 5".
 */

import type { NoscriptRoute, RouteMeta } from 'react-cheminfo/core';

/**
 * The three pages of the tool, and the About.
 *
 * `/` **is** the calculator: there is no `/calculator`, because two addresses
 * for one page is the second front door the family forbids. They are also the
 * crawl path, so each carries the label it is known by and a note saying what
 * it is for.
 */
export const FIXED_ROUTES: readonly RouteMeta[] = [
  {
    path: '/',
    title: 'IR and Raman spectra computed in your browser',
    description:
      'Draw a molecule and compute its infrared and Raman spectrum with GFN2-xTB in the browser: vibrational frequencies, intensities and every mode animated in 3D.',
    short: 'Calculator',
    note: 'draw a structure, run it, read the bands',
  },
  {
    path: '/collections',
    title: 'Collections — one effect per set of molecules',
    description:
      'Compare the carbonyl stretch over seven curated sets of molecules, each holding every variable but one fixed, and read the effect off the overlaid spectra.',
    short: 'Collections',
    note: 'seven curated sets, with a guided tour',
    // A collection the data no longer carries reads as the collections page
    // rather than as the home page, so a link from a slide of last year still
    // lands among the sets.
    prefix: true,
  },
  {
    path: '/validation',
    title: 'Validation against reference xtb calculations',
    description:
      'Recompute ten reference xtb calculations in your browser and compare them band by band: frequencies, infrared and Raman intensities, and the thermochemistry.',
    short: 'Validation',
    note: 'ten reference calculations, scored',
  },
  {
    path: '/about',
    title: 'About — what it computes, and what it borrows',
    description:
      'What this tool computes, the GFN2-xTB and bond-polarizability models behind the numbers, where those numbers stop being reliable, and the work it is built on.',
    short: 'About',
    note: 'what it computes, and what it borrows',
  },
];

/**
 * One page per curated collection, so each effect is its own search result.
 *
 * Written out rather than composed from the collection records: a record's
 * `explanation` is the question a student is asked in the page, which is not
 * the sentence somebody types into a search engine.
 */
export const COLLECTION_ROUTES: readonly RouteMeta[] = [
  {
    path: '/collections/directing-groups',
    title: 'Directing groups on the benzaldehyde C=O band',
    description:
      'Compare the carbonyl stretch of benzaldehyde with its ortho, meta and para methoxy and nitro derivatives, and read the directing effect off the shift.',
    short: 'Directing groups',
  },
  {
    path: '/collections/inductive-mesomeric-effect',
    title: 'Induction and conjugation at a carbonyl',
    description:
      'Compare the C=O stretch of acetyl fluoride, acetyl chloride, acetaldehyde, acetone, methyl acetate and an amide, where induction and conjugation disagree.',
    short: 'Inductive / mesomeric effect',
  },
  {
    path: '/collections/mesomeric-effect',
    title: 'Conjugation and the carbonyl stretch',
    description:
      'Watch the carbonyl stretch fall as one and then two vinyl groups conjugate with it, from pentan-3-one through pent-1-en-3-one to penta-1,4-dien-3-one.',
    short: 'Mesomeric effect',
  },
  {
    path: '/collections/gross-selection-rule',
    title: 'Gross selection rule — which modes absorb',
    description:
      'Count the infrared-active modes of carbon dioxide, water, nitrogen and methane, and see why a vibration is only observed when it changes the dipole moment.',
    short: 'Gross selection rule',
  },
  {
    path: '/collections/ring-strain',
    title: 'Ring strain and the carbonyl frequency',
    description:
      'Follow the carbonyl stretch from cyclopropanone to cyclooctanone and watch the wavenumber climb as the shrinking ring pulls the carbon off its sp² geometry.',
    short: 'Ring strain',
  },
  {
    path: '/collections/steric-effect',
    title: 'Steric crowding against conjugation',
    description:
      'See bulky substituents twist an enone out of conjugation: four crowded hex-4-en-3-ones whose carbonyl stretch moves as the groups around it grow.',
    short: 'Steric effect',
  },
  {
    path: '/collections/theory-vs-experiment',
    title: 'Predicted bands against measured spectra',
    description:
      'Compare predicted bands with measurements for benzamide, salicylic acid, methyl 2-methylbenzoate and an amide, and see where a gas-phase harmonic model fails.',
    short: 'Theory vs. experiment',
  },
];

/** Every routed address: the pages, then one per curated collection. */
export const PAGE_ROUTES: readonly RouteMeta[] = [
  ...FIXED_ROUTES,
  ...COLLECTION_ROUTES,
];

/**
 * The pages the crawl path lists, for a visitor or a crawler with no
 * JavaScript. A crawl path is a menu, so the collections are nested under the
 * page that holds them rather than listed beside it.
 */
export const NOSCRIPT_ROUTES: readonly NoscriptRoute[] = FIXED_ROUTES.map(
  (route) =>
    route.path === '/collections'
      ? { ...route, children: COLLECTION_ROUTES }
      : route,
);
