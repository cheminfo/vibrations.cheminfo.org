// tokens-ok: file — the mark is drawn in literal white, as the family's are.
import type { ReactNode } from 'react';

/**
 * The drawing on the site's plate, in the family's 32×32 box: two atoms on a
 * bond, caught mid-stretch, over the baseline of a spectrum. The lighter atom
 * takes the answering colour.
 * @param accent - The colour of the one answering element.
 * @returns The glyph.
 */
export function siteGlyph(accent: string): ReactNode {
  return (
    <g>
      <line
        x1="10"
        y1="11"
        x2="23"
        y2="11"
        stroke="#ffffff"
        strokeWidth="2.5"
      />
      <circle cx="10" cy="11" r="5" fill="#ffffff" />
      <circle cx="23" cy="11" r="3.5" fill={accent} />
      <path
        d="M4 26h4.5l2-5 2 5h4l2-8 2 8H28"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
