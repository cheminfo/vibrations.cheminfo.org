import type { VibrationalMode } from 'xtb-wasm';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import { irTraceFromModes, ramanTraceFromModes } from '../../spectra/index.ts';
import type { IrVariable, ResultEntry } from '../../state/index.ts';
import type {
  NormalizationOptions,
  SpectrumKind,
  SpectrumTrace,
} from '../../types/trace.ts';

/**
 * Grid points every computed curve is folded onto. At the default 20 cm⁻¹ width
 * over 400–4000 cm⁻¹ this is about eleven samples per width, the sampling ASE's
 * own fold used, so no band is drawn narrower than it is.
 */
export const SPECTRUM_POINTS = 2048;

/** How the history is broadened into curves for one chart. */
export interface TraceOptions {
  /** Full width at half maximum of every band, cm⁻¹. */
  fwhm: number;
  /** Lower bound of the grid, cm⁻¹. */
  from: number;
  /** Upper bound of the grid, cm⁻¹. */
  to: number;
  /** Which infrared reading the chart draws. */
  irVariable: IrVariable;
  /** The window an infrared curve's strongest band is scaled inside. */
  normalization: NormalizationOptions;
  /** Multiplies every computed wavenumber before drawing. @default 1 */
  wavenumberScale?: number;
}

/**
 * Broaden every calculation in the history into a trace for one chart.
 *
 * Hidden entries are included and carry `visible: false`: the chart's legend
 * lists them so the eye can bring them back. A result whose modes carry no intensity for this chart is
 * left out rather than drawn as a flat line, so an empty Raman chart says
 * nothing was computed instead of showing a silent zero.
 * @param entries - Every history entry, oldest first.
 * @param chart - Which chart the traces are for.
 * @param options - Grid, reading and normalization window.
 * @returns One trace per entry that has something to show.
 */
export function computedTraces(
  entries: readonly ResultEntry[],
  chart: SpectrumChartKind,
  options: TraceOptions,
): SpectrumTrace[] {
  const {
    fwhm,
    from,
    to,
    irVariable,
    normalization,
    wavenumberScale = 1,
  } = options;
  const kind = computedKind(chart, irVariable);
  const traces: SpectrumTrace[] = [];

  for (const entry of entries) {
    const { modes, engineId } = entry.result;
    if (!hasIntensity(modes, chart)) continue;
    const measurement =
      chart === 'raman'
        ? ramanTraceFromModes(modes, {
            fwhm,
            from,
            to,
            points: SPECTRUM_POINTS,
          })
        : irTraceFromModes(modes, {
            fwhm,
            from,
            to,
            points: SPECTRUM_POINTS,
            normalization,
          });
    traces.push({
      id: traceId(chart, entry.id),
      label: entry.molecule.label,
      color: entry.color,
      kind,
      origin: {
        kind: 'computed',
        resultId: entry.id,
        engineId,
      },
      measurement,
      wavenumberScale,
      visible: entry.visible,
    });
  }

  return traces;
}

/**
 * The clickable band strip of the active result, in descending wavenumber.
 *
 * Imaginary modes are left out — a negative wavenumber is not a band — and so
 * are modes with no intensity on this chart, because a marker over a silent
 * mode would promise absorption the spectrum does not show.
 * @param modes - The active result's modes.
 * @param chart - Which chart the strip belongs to.
 * @param wavenumberScale - The scaling the chart was drawn with.
 * @returns The bands, in descending wavenumber.
 */
export function spectrumBands(
  modes: readonly VibrationalMode[],
  chart: SpectrumChartKind,
  wavenumberScale = 1,
): Array<{ modeIndex: number; wavenumber: number; title: string }> {
  const bands: Array<{
    modeIndex: number;
    wavenumber: number;
    title: string;
  }> = [];
  for (let index = 0; index < modes.length; index++) {
    const mode = modes[index] as VibrationalMode;
    if (mode.wavenumber <= 0) continue;
    const intensity = chart === 'raman' ? mode.ramanActivity : mode.irIntensity;
    if (intensity === null || intensity <= 0) continue;
    bands.push({
      modeIndex: index,
      wavenumber: mode.wavenumber * wavenumberScale,
      title: `${mode.wavenumber.toFixed(1)} cm⁻¹ · ${intensity.toPrecision(3)} ${
        chart === 'raman' ? 'Å⁴ amu⁻¹' : 'km mol⁻¹'
      }`,
    });
  }
  return bands.toSorted(
    (first, second) => second.wavenumber - first.wavenumber,
  );
}

/**
 * The trace id a history entry takes on one chart. A result is drawn on both
 * charts at once in the stacked layout, so the chart has to be part of the id
 * for the two curves to stay distinct.
 * @param chart - Which chart the trace is on.
 * @param resultId - The history entry's id.
 * @returns The trace id.
 */
export function traceId(chart: SpectrumChartKind, resultId: string): string {
  return `${chart}:${resultId}`;
}

/**
 * The history entry a trace id refers to, so the chart's legend can drive the
 * same eye and selection the history table does.
 * @param id - A trace id, computed or experimental.
 * @param chart - Which chart the trace is on.
 * @returns The result id, or `null` when the trace is an experimental one.
 */
export function resultIdFromTraceId(
  id: string,
  chart: SpectrumChartKind,
): string | null {
  const prefix = `${chart}:`;
  return id.startsWith(prefix) ? id.slice(prefix.length) : null;
}

function computedKind(
  chart: SpectrumChartKind,
  variable: IrVariable,
): SpectrumKind {
  if (chart === 'raman') return 'raman';
  return variable === 'absorbance' ? 'ir-absorbance' : 'ir-transmittance';
}

function hasIntensity(
  modes: readonly VibrationalMode[],
  chart: SpectrumChartKind,
): boolean {
  for (const mode of modes) {
    const intensity = chart === 'raman' ? mode.ramanActivity : mode.irIntensity;
    if (intensity !== null && intensity > 0) return true;
  }
  return false;
}
