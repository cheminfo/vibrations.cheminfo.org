import type { IrVariable } from '../../state/index.ts';
import type { SpectrumTrace } from '../../types/trace.ts';

/**
 * Which of the two spectra charts is being drawn. Infrared and Raman never
 * share an intensity axis, so they are separate charts even when stacked.
 */
export type SpectrumChartKind = 'infrared' | 'raman';

/** Which y variable of a measurement a chart draws. */
export type SpectrumVariable = 'y' | 'a' | 't';

/** Everything the two axes of one chart need to be drawn and read. */
export interface ChartAxes {
  /** The measurement variable every trace on this chart is read from. */
  variable: SpectrumVariable;
  xLabel: string;
  yLabel: string;
  /**
   * The value a mirrored trace is reflected about, and the bottom of the y
   * axis. Transmittance hangs from 100 %, everything else grows from 0.
   */
  baseline: number;
}

/**
 * The axes of one chart, including which variable its traces are read from.
 *
 * The y label is taken from the first trace that actually carries the variable,
 * so a normalized absorbance says what it is rather than what it was, and a
 * dropped file keeps the units its own parser reported.
 * @param kind - Infrared or Raman.
 * @param irVariable - Which infrared variable to draw; ignored for Raman.
 * @param traces - The traces this chart will draw, used only for the y label.
 * @returns The axis description.
 */
export function chartAxes(
  kind: SpectrumChartKind,
  irVariable: IrVariable,
  traces: readonly SpectrumTrace[] = [],
): ChartAxes {
  if (kind === 'raman') {
    return {
      variable: 'y',
      xLabel: 'Raman shift / cm⁻¹',
      yLabel: labelFor(traces, 'y', 'Raman activity'),
      baseline: 0,
    };
  }

  const variable = irVariable === 'transmittance' ? 't' : 'a';
  return {
    variable,
    xLabel: 'Wavenumber / cm⁻¹',
    yLabel: labelFor(
      traces,
      variable,
      variable === 't' ? 'Transmittance / %' : 'Absorbance',
    ),
    baseline: variable === 't' ? 100 : 0,
  };
}

/**
 * Whether a trace belongs on a chart. Both infrared kinds share the infrared
 * chart: a file stored as transmittance and one stored as absorbance carry the
 * same two derived variables, so which one the chart draws is the user's
 * choice, not the file's.
 * @param trace - The trace.
 * @param kind - The chart.
 * @returns True when the trace should be drawn there.
 */
export function traceBelongsToChart(
  trace: SpectrumTrace,
  kind: SpectrumChartKind,
): boolean {
  return kind === 'raman'
    ? trace.kind === 'raman'
    : trace.kind === 'ir-absorbance' || trace.kind === 'ir-transmittance';
}

/**
 * A unit as an axis should show it. The parsers and the broadening layer store
 * units in ASCII (`cm-1`, `A^4/amu`) because they travel through JCAMP and
 * JSON; an axis is the one place they are read by a person.
 * @param units - The stored unit string.
 * @returns The typeset unit, or the input when it is not one of ours.
 */
export function formatUnits(units: string): string {
  return UNIT_LABELS[units] ?? units;
}

const UNIT_LABELS: Record<string, string> = {
  'cm-1': 'cm⁻¹',
  'km/mol': 'km mol⁻¹',
  'A^4/amu': 'Å⁴ amu⁻¹',
};

function labelFor(
  traces: readonly SpectrumTrace[],
  variable: SpectrumVariable,
  fallback: string,
): string {
  for (const trace of traces) {
    const measured = trace.measurement.variables[variable];
    if (!measured?.label) continue;
    const units = measured.units;
    return units ? `${measured.label} / ${formatUnits(units)}` : measured.label;
  }
  return fallback;
}
