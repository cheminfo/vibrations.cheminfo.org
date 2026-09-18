import type { IconName } from '@blueprintjs/icons';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import type { ChartSelection } from '../../state/index.ts';

/** One entry of the three-button layout bar. */
export interface LayoutOption {
  id: ChartSelection;
  label: string;
  icon: IconName;
  /** What this layout adds, shown as the button's tooltip. */
  description: string;
}

/**
 * The three layouts the spectrum view switches between, in the order offered.
 * The third stacks both charts and puts the two intensities side by side in the
 * mode table.
 */
export const CHART_LAYOUTS: readonly LayoutOption[] = [
  {
    id: 'infrared',
    label: 'Infrared',
    icon: 'timeline-line-chart',
    description: 'The infrared spectrum alone.',
  },
  {
    id: 'raman',
    label: 'Raman',
    icon: 'timeline-bar-chart',
    description: 'The Raman spectrum alone.',
  },
  {
    id: 'both',
    label: 'Infrared + Raman',
    icon: 'stacked-chart',
    description:
      'Both spectra stacked, with IR intensity and Raman activity side by side in the mode table.',
  },
];

/**
 * The charts a layout draws, top to bottom.
 * @param selection - The layout the user picked.
 * @returns One or two chart kinds.
 */
export function chartsFor(
  selection: ChartSelection,
): readonly SpectrumChartKind[] {
  if (selection === 'infrared') return INFRARED_ONLY;
  if (selection === 'raman') return RAMAN_ONLY;
  return BOTH;
}

/**
 * Whether the mode table should show a Raman column under this layout.
 * @param selection - The layout the user picked.
 * @returns True for the Raman and the stacked layouts.
 */
export function showsRaman(selection: ChartSelection): boolean {
  return selection !== 'infrared';
}

/**
 * Whether the mode table should show an infrared column under this layout.
 * @param selection - The layout the user picked.
 * @returns True for the infrared and the stacked layouts.
 */
export function showsInfrared(selection: ChartSelection): boolean {
  return selection !== 'raman';
}

const INFRARED_ONLY: readonly SpectrumChartKind[] = ['infrared'];
const RAMAN_ONLY: readonly SpectrumChartKind[] = ['raman'];
const BOTH: readonly SpectrumChartKind[] = ['infrared', 'raman'];
