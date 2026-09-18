import { SiteMark } from 'react-cheminfo/ui';

import { SITE } from '../site.ts';

import { siteGlyph } from './siteGlyph.tsx';

interface AppLogoProps {
  /**
   * Edge length in pixels.
   * @default 16
   */
  size?: number;
}

/**
 * The site's mark, on the family's plate and in the page's own tokens.
 * @param props - Component props.
 * @returns The mark.
 */
export function AppLogo(props: AppLogoProps) {
  const { size = 16 } = props;
  return <SiteMark site={SITE} glyph={siteGlyph} size={size} colors="tokens" />;
}
