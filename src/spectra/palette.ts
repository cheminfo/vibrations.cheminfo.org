/** The colour a first trace takes, and the answer when the palette is exhausted. */
const FIRST_COLOR = '#C10020';

/**
 * A twenty-colour qualitative palette, for overlays that run past the eight
 * hues of the house palette.
 *
 * The twenty values are Kelly's colours of maximum contrast minus his white
 * and black, but in that site's own order rather than Kelly's, so his
 * property that the leading entries survive dichromacy does not carry over
 * and had to be measured instead. Simulated with Viénot–Brettel–Mollon and
 * compared in CIELAB, the closest pair among the first six is ΔE 9.7
 * (`#803E75` against `#00538A`, protanopia) and among all twenty ΔE 2.8
 * (`#FF6800` against `#93AA00`, deuteranopia): safe for the two- and
 * three-trace overlays the app is built around, tight past six, and not
 * separable for a twenty-trace map. The leading `#C10020` is also the entry
 * that reads best as a thin line, at 6.4:1 against white where Kelly's
 * leading `#FFB300` gives 1.8:1.
 *
 * `react-cheminfo`'s `chartSeriesColor` is a different, eight-entry Okabe–Ito
 * palette, so it is not a drop-in replacement: a spectrum overlay routinely
 * carries more than eight traces.
 */
export const SPECTRUM_PALETTE: readonly string[] = [
  FIRST_COLOR,
  '#007D34',
  '#803E75',
  '#232C16',
  '#F4C800',
  '#00538A',
  '#B32851',
  '#7F180D',
  '#A6BDD7',
  '#CEA262',
  '#817066',
  '#FF6800',
  '#F6768E',
  '#FF7A5C',
  '#53377A',
  '#FFB300',
  '#FF8E00',
  '#93AA00',
  '#593315',
  '#F13A13',
];

/**
 * The first palette colour that is not already on the chart, so appending a
 * trace never repeats a colour while one is still free.
 *
 * Once every palette entry is taken the sequence wraps on the number of
 * colours already in use, which is deterministic: the twenty-first trace gets
 * the first colour again, the twenty-second the second, and so on.
 * @param used - Colours already drawn, in any order. Entries from outside the palette are ignored.
 * @returns A six-digit hex colour from `SPECTRUM_PALETTE`.
 */
export function nextColor(used: readonly string[]): string {
  const taken = new Set<string>();
  for (const color of used) {
    taken.add(color.toUpperCase());
  }

  for (const color of SPECTRUM_PALETTE) {
    if (!taken.has(color)) return color;
  }

  return SPECTRUM_PALETTE[used.length % SPECTRUM_PALETTE.length] ?? FIRST_COLOR;
}
