import { Classes } from '@blueprintjs/core';
import { useMemo } from 'react';
import { PlotController } from 'react-plot';

import { normalizeTraces } from '../spectra/index.ts';
import type { IrVariable } from '../state/index.ts';
import type { NormalizationOptions, SpectrumTrace } from '../types/trace.ts';

import { SpectrumLegend } from './spectra/SpectrumLegend.tsx';
import { SpectrumPlot } from './spectra/SpectrumPlot.tsx';
import type { SpectrumChartKind } from './spectra/chartAxes.ts';
import { chartAxes, traceBelongsToChart } from './spectra/chartAxes.ts';
import type { SpectrumBand } from './spectra/types.ts';

export interface SpectrumChartProps {
  /**
   * Every trace that could appear on this chart — computed and experimental,
   * visible and hidden. The chart keeps the ones whose `kind` belongs here,
   * draws the visible ones and lists all of them in the legend.
   */
  traces: readonly SpectrumTrace[];
  width: number;
  height: number;
  /** Which chart this is. @default 'infrared' */
  kind?: SpectrumChartKind;
  /** Which infrared variable to draw; ignored for Raman. @default 'transmittance' */
  irVariable?: IrVariable;
  /** Lowest wavenumber drawn, cm⁻¹. @default 400 */
  from?: number;
  /** Highest wavenumber drawn, cm⁻¹. @default 4000 */
  to?: number;
  /** Draw high wavenumbers on the left, the IR convention. @default true */
  reverseAxis?: boolean;
  /** Windowed normalization. @default disabled over 500–4000 cm⁻¹ */
  normalization?: NormalizationOptions;
  /** Drawn thicker than the rest. @default null */
  activeTraceId?: string | null;
  /**
   * The clickable band strip, in chart coordinates. Pass them in the order they
   * should be stacked, usually by descending wavenumber.
   * @default []
   */
  bands?: readonly SpectrumBand[];
  /** `modeIndex` of the selected band. @default null */
  selectedMode?: number | null;
  /** `modeIndex` of the hovered band. @default null */
  hoveredMode?: number | null;
  /** Show every series' value at the pointer. @default true */
  tracking?: boolean;
  /** The legend's eye. Omit to hide the eyes. @default undefined */
  onToggleTraceVisible?: (id: string) => void;
  /** A legend label was clicked. @default undefined */
  onSelectTrace?: (id: string) => void;
  /**
   * The plot was clicked, at this wavenumber in chart coordinates. Resolve it
   * with `modeAtWavenumber(modes, wavenumber, { fwhm })`, which weights each
   * mode by the Lorentzian contribution it makes there, so a click picks the
   * mode that produced the band rather than the nearest stick.
   * @default undefined
   */
  onPickWavenumber?: (wavenumber: number) => void;
  /**
   * The pointer moved to this wavenumber, or left the plot. Fires on every
   * pointer move, so resolve it to a mode cheaply.
   * @default undefined
   */
  onHoverWavenumber?: (wavenumber: number | null) => void;
}

/**
 * Overlaid spectra on a shared wavenumber axis.
 *
 * The chart takes built `SpectrumTrace` objects rather than modes, which is
 * what lets a computed spectrum and a dropped experimental file share an axis:
 * by the time anything reaches here, both are a `MeasurementXY`. Everything
 * physical — broadening, absorbance, transmittance, normalization — belongs to
 * `src/spectra`, and this component only draws.
 * @param props - Component props.
 * @returns The legend, the plot, and the cursor readout.
 */
export function SpectrumChart(props: SpectrumChartProps) {
  const {
    traces,
    width,
    height,
    kind = 'infrared',
    irVariable = 'transmittance',
    from = 400,
    to = 4000,
    reverseAxis = true,
    normalization = DEFAULT_NORMALIZATION,
    activeTraceId = null,
    bands = NO_BANDS,
    selectedMode = null,
    hoveredMode = null,
    tracking = true,
    onToggleTraceVisible,
    onSelectTrace,
    onPickWavenumber,
    onHoverWavenumber,
  } = props;

  const own = useMemo(
    () => traces.filter((trace) => traceBelongsToChart(trace, kind)),
    [traces, kind],
  );

  // Spread into the dependency list rather than keyed on the options object,
  // so a caller building it inline does not re-normalize on every render.
  const { enabled, from: windowFrom, to: windowTo } = normalization;
  const drawn = useMemo(() => {
    const visible = own.filter((trace) => trace.visible !== false);
    return normalizeTraces(visible, {
      enabled,
      from: windowFrom,
      to: windowTo,
    });
  }, [own, enabled, windowFrom, windowTo]);

  const axes = chartAxes(kind, irVariable, drawn);
  const plotHeight = Math.max(0, height - LEGEND_HEIGHT);

  return (
    <div style={containerStyle}>
      <SpectrumLegend
        traces={own}
        activeTraceId={activeTraceId}
        onToggleVisible={onToggleTraceVisible}
        onSelect={onSelectTrace}
      />
      {drawn.length === 0 || width <= 0 || plotHeight <= 0 ? (
        <div style={emptyStyle} className={Classes.TEXT_MUTED}>
          {own.length === 0
            ? `No ${kind === 'raman' ? 'Raman' : 'infrared'} spectrum yet`
            : 'Every series is hidden'}
        </div>
      ) : (
        <PlotController>
          <SpectrumPlot
            traces={drawn}
            axes={axes}
            from={from}
            to={to}
            reverseAxis={reverseAxis}
            width={width}
            height={plotHeight}
            activeTraceId={activeTraceId}
            bands={bands}
            selectedMode={selectedMode}
            hoveredMode={hoveredMode}
            tracking={tracking}
            onPickWavenumber={onPickWavenumber}
            onHoverWavenumber={onHoverWavenumber}
          />
        </PlotController>
      )}
    </div>
  );
}

/** Hoisted so a chart with no band strip keeps the same empty array. */
const NO_BANDS: readonly SpectrumBand[] = [];

const DEFAULT_NORMALIZATION: NormalizationOptions = {
  enabled: false,
  from: 500,
  to: 4000,
};

/** Vertical room the legend takes out of the height the caller gave. */
const LEGEND_HEIGHT = 30;

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
} as const;

const emptyStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1 1 auto',
  minHeight: 60,
} as const;
