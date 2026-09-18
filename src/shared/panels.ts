import type { IconName } from '@blueprintjs/icons';

import type { PageId, PanelId } from '../state/index.ts';

/** One entry of the right-hand activity bar and of the accordion below it. */
export interface PanelDefinition {
  id: PanelId;
  title: string;
  /** BlueprintJS icon name. */
  icon: IconName;
  /** The pages that offer this panel. */
  pages: readonly PageId[];
}

const CALCULATION_PAGES: readonly PageId[] = ['calculator', 'collections'];

/**
 * Every side panel, in activity-bar order. A panel is offered only on the pages
 * that can fill it, so the bar never shows a control that would open an empty
 * drawer.
 */
export const PANELS: readonly PanelDefinition[] = [
  {
    id: 'molecule',
    title: 'Molecule',
    icon: 'cube',
    pages: ['calculator', 'collections'],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'cog',
    pages: ['calculator', 'collections', 'validation'],
  },
  {
    id: 'series',
    title: 'Spectra',
    icon: 'series-add',
    pages: ['calculator', 'collections'],
  },
  {
    id: 'modes',
    title: 'Vibrational modes',
    icon: 'timeline-bar-chart',
    pages: CALCULATION_PAGES,
  },
  {
    id: 'thermochemistry',
    title: 'Thermochemistry',
    icon: 'temperature',
    pages: CALCULATION_PAGES,
  },
  {
    id: 'experimental',
    title: 'Experimental spectra',
    icon: 'import',
    pages: CALCULATION_PAGES,
  },
];

/**
 * The panels one page offers, in activity-bar order.
 * @param page - The active page.
 * @returns The panel definitions that page shows.
 */
export function panelsForPage(page: PageId): readonly PanelDefinition[] {
  const offered: PanelDefinition[] = [];
  for (const panel of PANELS) {
    if (panel.pages.includes(page)) offered.push(panel);
  }
  return offered;
}
