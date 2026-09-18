// tokens-ok: file — the site's own record writes its two colours.
import type { SiteRecord } from 'react-cheminfo/core';

/**
 * The site as the chrome draws it. It is deliberately not one of the cheminfo
 * family: no other site links to it and it links to none of them, so it keeps
 * its own record instead of an entry in `ECOSYSTEM_SITES`.
 */
export const SITE: SiteRecord = {
  id: 'vibrations',
  name: { lead: 'vibrations', alt: 'cheminfo', dot: true },
  host: 'vibrations.cheminfo.org',
  repository: 'https://github.com/cheminfo/vibrations.cheminfo.org',
  tagline: 'IR and Raman spectra computed in the browser.',
  brand: '#0072b2',
  brandAlt: '#a16207',
  mark: { plate: '#0072b2', accent: '#e69f00' },
};
