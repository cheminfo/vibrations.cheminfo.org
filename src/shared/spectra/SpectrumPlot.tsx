import { Button } from '@blueprintjs/core';
import { useMemo, useRef, useState } from 'react';
import {
  Annotations,
  Axis,
  LineSeries,
  Plot,
  useAxisZoom,
  usePlotControllerAxes,
  usePlotControls,
  usePlotEvents,
} from 'react-plot';

import type { SpectrumTrace } from '../../types/trace.ts';

import { CursorReadout } from './CursorReadout.tsx';
import { SpectrumBands } from './SpectrumBands.tsx';
import type { ChartAxes } from './chartAxes.ts';
import { cursorReadout } from './cursorReadout.ts';
import { tracePoints } from './tracePoints.ts';
import type { SpectrumBand } from './types.ts';

interface SpectrumPlotProps {
  traces: readonly SpectrumTrace[];
  axes: ChartAxes;
  from: number;
  to: number;
  reverseAxis: boolean;
  width: number;
  height: number;
  activeTraceId: string | null;
  bands: readonly SpectrumBand[];
  selectedMode: number | null;
  hoveredMode: number | null;
  tracking: boolean;
  onPickWavenumber?: (wavenumber: number) => void;
  onHoverWavenumber?: (wavenumber: number | null) => void;
}

/**
 * The plot itself. It lives inside a `PlotController` so it can read pointer
 * events and drive the zoom, which is why it is separate from `SpectrumChart`.
 * @param props - Component props; see `SpectrumChart` for what they mean.
 * @returns The plot, its zoom reset and the cursor readout.
 */
export function SpectrumPlot(props: SpectrumPlotProps) {
  const {
    traces,
    axes,
    from,
    to,
    reverseAxis,
    width,
    height,
    activeTraceId,
    bands,
    selectedMode,
    hoveredMode,
    tracking,
    onPickWavenumber,
    onHoverWavenumber,
  } = props;

  const zoom = useAxisZoom({ direction: 'horizontal' });
  const controls = usePlotControls();
  const overrides = usePlotControllerAxes();
  const [pointer, setPointer] = useState<number | null>(null);
  const pressedAt = useRef<{ x: number; y: number } | null>(null);

  usePlotEvents({
    onPointerMove({ coordinates }) {
      const x = coordinates.x ?? null;
      setPointer(x);
      onHoverWavenumber?.(x);
    },
    onPointerLeave() {
      setPointer(null);
      onHoverWavenumber?.(null);
    },
    onPointerDown({ event }) {
      pressedAt.current = { x: event.clientX, y: event.clientY };
    },
    onClick({ event, coordinates }) {
      const pressed = pressedAt.current;
      pressedAt.current = null;
      // A zoom drag ends with a click too; only a click that did not travel is
      // a band pick.
      if (
        pressed !== null &&
        Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) >
          DRAG_SLOP
      ) {
        return;
      }
      const x = coordinates.x;
      if (x !== undefined) onPickWavenumber?.(x);
    },
  });

  const { variable, baseline, xLabel, yLabel } = axes;
  const mirrored = traces.some((trace) => trace.mirrored === true);

  const curves = useMemo(
    () =>
      traces.map((trace) => (
        <LineSeries
          key={trace.id}
          id={trace.id}
          label={trace.label}
          data={tracePoints(trace, { variable, from, to, baseline })}
          displayMarkers={false}
          lineStyle={{
            stroke: trace.color,
            strokeWidth: trace.id === activeTraceId ? 2.2 : 1.2,
          }}
        />
      )),
    [traces, variable, from, to, baseline, activeTraceId],
  );

  const readout =
    tracking && pointer !== null
      ? cursorReadout(traces, pointer, variable)
      : [];
  const zoomed = overrides.x?.min !== undefined && overrides.x.min !== null;

  return (
    <div style={{ position: 'relative', width, height }}>
      <Plot
        width={width}
        height={height}
        margin={PLOT_MARGIN}
        svgStyle={onPickWavenumber === undefined ? undefined : CROSSHAIR}
      >
        {curves}
        <Axis
          id="x"
          position="bottom"
          min={from}
          max={to}
          flip={reverseAxis}
          label={xLabel}
          displayPrimaryGridLines
        />
        <Axis
          id="y"
          position="left"
          min={mirrored ? undefined : 0}
          paddingStart={mirrored ? '5%' : undefined}
          paddingEnd="5%"
          label={yLabel}
          tickLabelFormat={
            mirrored
              ? (value: number) => String(Math.abs(value - baseline))
              : undefined
          }
        />
        <Annotations>
          {zoom.annotations}
          <SpectrumBands
            bands={bands}
            selectedMode={selectedMode}
            hoveredMode={hoveredMode}
          />
        </Annotations>
      </Plot>
      {pointer !== null && (
        <CursorReadout
          wavenumber={pointer}
          rows={readout}
          unit={variable === 't' ? ' %' : ''}
        />
      )}
      {zoomed && (
        <span style={resetStyle}>
          <Button
            variant="outlined"
            size="small"
            icon="zoom-to-fit"
            onClick={() => controls.resetAxes(['x'])}
          >
            Reset zoom
          </Button>
        </span>
      )}
    </div>
  );
}

/** Pixels a pointer may travel between press and release and still be a click. */
const DRAG_SLOP = 4;

const PLOT_MARGIN = { top: 12, right: 20, bottom: 45, left: 62 } as const;
const CROSSHAIR = { cursor: 'crosshair' } as const;
const resetStyle = { position: 'absolute', top: 8, right: 24 } as const;
