import type { VibrationalMode } from 'xtb-wasm';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import type { ChartSelection } from '../../state/index.ts';

import { showsInfrared, showsRaman } from './layouts.ts';
import type { ModeSortKey } from './modeRows.ts';

/** One column of the mode table. */
export interface ModeColumn {
  id: string;
  /** Column heading, short enough for a side panel. */
  label: string;
  /** What the heading means, shown as its tooltip. */
  title: string;
  /** Column width in pixels. */
  width: number;
  /** The column this heading sorts on, when it sorts at all. @default undefined */
  sortKey?: ModeSortKey;
  /**
   * Whose intensity `sortKey: 'intensity'` reads, so the two intensity columns
   * of the stacked layout sort on their own numbers.
   * @default undefined
   */
  sortChart?: SpectrumChartKind;
  /** The cell's text. */
  value: (mode: VibrationalMode) => string;
}

/**
 * The mode table's columns for one layout.
 *
 * The stacked layout shows the infrared intensity and the Raman activity side
 * by side, which is what that layout is for; the two
 * single-spectrum layouts drop the column they do not describe so the table
 * stays readable in a side panel.
 * @param selection - The layout the user picked.
 * @returns The columns, left to right.
 */
export function modeColumns(selection: ChartSelection): ModeColumn[] {
  const columns: ModeColumn[] = [
    {
      id: 'wavenumber',
      label: 'ν̃',
      title:
        'Harmonic wavenumber in cm⁻¹. A negative value is an imaginary mode.',
      width: 62,
      sortKey: 'wavenumber',
      sortChart: 'infrared',
      value: (mode) => mode.wavenumber.toFixed(1),
    },
  ];

  if (showsInfrared(selection)) {
    columns.push({
      id: 'ir',
      label: 'IR',
      title: 'Infrared intensity in km/mol, from the dipole derivatives.',
      width: 54,
      sortKey: 'intensity',
      sortChart: 'infrared',
      value: (mode) => optional(mode.irIntensity, 1),
    });
  }

  if (showsRaman(selection)) {
    columns.push(
      {
        id: 'raman',
        label: 'Raman',
        title:
          'Raman scattering activity in Å⁴/amu, from the bond-polarizability model.',
        width: 60,
        sortKey: 'intensity',
        sortChart: 'raman',
        value: (mode) => optional(mode.ramanActivity, 2),
      },
      {
        id: 'depolarization',
        label: 'ρ',
        title:
          'Depolarization ratio for natural incident light, between 0 and 0.75.',
        width: 44,
        value: (mode) => optional(mode.depolarizationRatio, 3),
      },
    );
  }

  columns.push(
    {
      id: 'reducedMass',
      label: 'μ',
      title: 'Reduced mass of the mode, in amu.',
      width: 48,
      value: (mode) => mode.reducedMass.toFixed(2),
    },
    {
      id: 'forceConstant',
      label: 'k',
      title: 'Force constant of the mode, in mDyn/Å.',
      width: 48,
      value: (mode) => mode.forceConstant.toFixed(3),
    },
  );

  return columns;
}

/**
 * The total width the columns need, so the table can scroll sideways rather
 * than squeeze a number into an ellipsis.
 * @param columns - The columns being drawn.
 * @returns The width in pixels, the leading index column included.
 */
export function columnsWidth(columns: readonly ModeColumn[]): number {
  let width = INDEX_WIDTH;
  for (const column of columns) {
    width += column.width + COLUMN_GAP;
  }
  return width;
}

/** Width of the leading mode-number column, in pixels. */
export const INDEX_WIDTH = 30;
/** Horizontal gap between two columns, in pixels. */
export const COLUMN_GAP = 6;

function optional(value: number | null, digits: number): string {
  return value === null ? '—' : value.toFixed(digits);
}
