/**
 * The addresses the site answers, and the two directions between one of them
 * and the page it names.
 *
 * ```
 * /                  /collections      /collections/ring-strain
 * /validation        /about
 * ```
 *
 * `/` **is** the calculator: there is no `/calculator`, because two addresses
 * for one page is the second front door the family forbids. A link that names
 * it anyway still opens, and the bar is rewritten to `/`.
 *
 * The route lives in the **path**, through the History API. A fragment never
 * reaches the server, so a hash-routed site is one address to every crawler and
 * its pages are folded into a single search result; a `#` is also dropped by
 * half the tools that pass links around — LMS editors, chat clients, QR
 * generators. Links written while this site routed that way still open:
 * `#/collections/ring-strain` is read as the path it means and replaced in the
 * bar, once.
 *
 * The parsing and the serialising are `react-cheminfo`'s; what is written here
 * is which pages exist and which of them addresses an item of its own.
 */

import { createTabRouter } from 'react-cheminfo/core';

/** Every page the site routes to: the three of the toolbar, and the About. */
export const PAGES = [
  'calculator',
  'collections',
  'validation',
  'about',
] as const;
export type PageId = (typeof PAGES)[number];

/** A page and the one thing it can deep-link to, e.g. the open collection. */
export interface Route {
  page: PageId;
  /** The second path segment, decoded, or `null` when there is none. */
  param: string | null;
}

/** The site's string ↔ route mapping, pure and unit-testable without a DOM. */
export const router = createTabRouter<PageId>({
  tabs: [
    { id: 'calculator', path: '/' },
    { id: 'collections', takesId: true },
    'validation',
    'about',
  ],
  home: 'calculator',
  mode: 'path',
  adoptLegacyHash: true,
});

/**
 * Read an address as the page it opens.
 *
 * Forgiving by design: an empty address, an unknown page, a trailing slash, a
 * legacy `#/page` fragment and a lone `%` in an escape all resolve to something
 * sensible rather than throwing, because the address is hand-editable and
 * arrives from bookmarks, lecture slides and course pages.
 * @param address - Path and query, or an old hash address.
 * @returns The page it names, falling back to the calculator.
 */
export function routeFromAddress(address: string): Route {
  const route = router.parse(address);
  return { page: route.tab, param: route.id };
}

/**
 * The address a page is reachable at.
 * @param route - The page, and the item it has open.
 * @returns An absolute path from the site's own root.
 */
export function addressOf(route: Route): string {
  return router.format({ tab: route.page, id: route.param });
}
