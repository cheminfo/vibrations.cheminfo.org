import { signal } from '@preact/signals-react';

import { TOUR_STEPS } from '../data/index.ts';

/** The pages the left toolbar switches between, in toolbar order. */
export const PAGES = ['calculator', 'collections', 'validation'] as const;
export type PageId = (typeof PAGES)[number];

/** The side panels, in the order the activity bar lists them. */
export const PANEL_IDS = [
  'molecule',
  'settings',
  'series',
  'modes',
  'thermochemistry',
  'experimental',
] as const;
export type PanelId = (typeof PANEL_IDS)[number];

/** A page and the one thing it can deep-link to, e.g. a collection or a fixture. */
export interface Route {
  page: PageId;
  /** The second hash segment, decoded, or `null` when there is none. */
  param: string | null;
}

export const view = {
  /** Active page, mirrored into `window.location.hash`. */
  page: signal<PageId>('calculator'),
  /** The page's deep-link parameter, e.g. the open collection's id. */
  param: signal<string | null>(null),
  /** Ids of the side panels currently open. */
  openPanels: signal<ReadonlySet<PanelId>>(
    new Set<PanelId>(['molecule', 'series', 'modes']),
  ),
  aboutOpen: signal(false),
  tourOpen: signal(false),
  /** Index into `TOUR_STEPS`. */
  tourStep: signal(0),
  /** Index into the active result's modes, or `null` when nothing is selected. */
  selectedMode: signal<number | null>(null),
  /**
   * Index of the mode the pointer is over, in the mode table or on the chart, or
   * `null`. Both views set it, so pointing at either one lights up the other.
   */
  hoveredMode: signal<number | null>(null),
  /** Atom index in the active molecule, or `null`. */
  selectedAtom: signal<number | null>(null),
  hoveredAtom: signal<number | null>(null),
  /** Bond index in the active molecule's molfile bond order, or `null`. */
  selectedBond: signal<number | null>(null),
  hoveredBond: signal<number | null>(null),
  /** Whether the 3D viewer is animating the selected mode. */
  animating: signal(true),
};

/**
 * Switch page and record it in the URL hash so a reload comes back here.
 * @param page - The page to activate.
 * @param param - Deep-link parameter, e.g. a collection id.
 * @default param null
 */
export function setPage(page: PageId, param: string | null = null): void {
  view.page.value = page;
  view.param.value = param;
  const hash =
    param === null ? `#/${page}` : `#/${page}/${encodeURIComponent(param)}`;
  if (globalThis.location.hash !== hash) globalThis.location.hash = hash;
}

/**
 * Read the route out of a hash, falling back to the calculator.
 * @param hash - The hash to parse, including its leading `#`.
 * @returns The page and its parameter.
 */
export function routeFromHash(hash: string): Route {
  const [rawPage = '', rawParam] = hash.replace(/^#\/?/, '').split('/');
  const page = (PAGES as readonly string[]).includes(rawPage)
    ? (rawPage as PageId)
    : 'calculator';
  return {
    page,
    param:
      rawParam === undefined || rawParam === ''
        ? null
        : decodeURIComponent(rawParam),
  };
}

/** Copy the current URL hash into the view signals, without writing it back. */
export function applyHash(): void {
  const route = routeFromHash(globalThis.location.hash);
  view.page.value = route.page;
  view.param.value = route.param;
}

/**
 * Toggle a side panel open or closed.
 * @param id - Panel id.
 */
export function togglePanel(id: PanelId): void {
  const next = new Set(view.openPanels.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  view.openPanels.value = next;
}

/**
 * Open a side panel, whether or not it was open.
 * @param id - Panel id.
 */
export function openPanel(id: PanelId): void {
  if (view.openPanels.value.has(id)) return;
  view.openPanels.value = new Set(view.openPanels.value).add(id);
}

/**
 * Close a side panel, whether or not it was open.
 * @param id - Panel id.
 */
export function closePanel(id: PanelId): void {
  if (!view.openPanels.value.has(id)) return;
  const next = new Set(view.openPanels.value);
  next.delete(id);
  view.openPanels.value = next;
}

/**
 * Select a normal mode, which is what the chart annotation, the mode table and
 * the 3D animation all agree on.
 * @param index - Index into the active result's modes, or `null` to select none.
 */
export function selectMode(index: number | null): void {
  view.selectedMode.value = index;
}

/** Drop the mode, atom and bond selections, e.g. when another result is chosen. */
export function clearSelection(): void {
  view.selectedMode.value = null;
  view.hoveredMode.value = null;
  view.selectedAtom.value = null;
  view.hoveredAtom.value = null;
  view.selectedBond.value = null;
  view.hoveredBond.value = null;
}

/** Open the guided tour at its first step. */
export function startTour(): void {
  view.tourStep.value = 0;
  view.tourOpen.value = true;
}

/** Close the guided tour, keeping the step it was on. */
export function closeTour(): void {
  view.tourOpen.value = false;
}

/**
 * Move the guided tour, clamped to the steps that exist.
 * @param step - Index into `TOUR_STEPS`.
 */
export function setTourStep(step: number): void {
  const last = TOUR_STEPS.length - 1;
  view.tourStep.value = Math.min(Math.max(step, 0), last);
}
