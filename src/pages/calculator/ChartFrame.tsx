import { useSignals } from '@preact/signals-react/runtime';
import { useMemo } from 'react';

import { SpectrumChart } from '../../shared/SpectrumChart.tsx';
import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import { useElementSize } from '../../shared/useElementSize.ts';
import {
  activeModes,
  normalization,
  preferences,
  selectMode,
  selectResult,
  series,
  toggleResultVisible,
  toggleTraceVisible,
  view,
} from '../../state/index.ts';

import { modeAtWavenumber } from './modePicking.ts';
import {
  computedTraces,
  resultIdFromTraceId,
  spectrumBands,
  traceId,
} from './traces.ts';

/**
 * One chart of the calculator, sized to the space it is given.
 *
 * Everything on it is shared state: the history supplies the computed curves,
 * the dropped files supply the experimental ones, and a click resolves to the
 * mode that produced the band under it.
 * @param props - Component props.
 * @param props.kind - Which spectrum this chart draws.
 * @returns The chart.
 */
export function ChartFrame(props: { kind: SpectrumChartKind }) {
  const { kind } = props;
  useSignals();
  const display = preferences.display;
  const results = series.results.value;
  const experimental = series.experimental.value;
  const modes = activeModes.value;
  const activeResultId = series.activeResultId.value;
  const scale = display.wavenumberScale.value;
  const fwhm = display.fwhm.value;
  const from = display.from.value;
  const to = display.to.value;
  const irVariable = display.irVariable.value;
  const window = normalization.value;
  const [frameRef, size] = useElementSize();

  const traces = useMemo(
    () => [
      ...computedTraces(results, kind, {
        fwhm,
        from,
        to,
        irVariable,
        normalization: window,
        wavenumberScale: scale,
      }),
      ...experimental,
    ],
    [results, experimental, kind, fwhm, from, to, irVariable, window, scale],
  );

  const bands = useMemo(
    () => spectrumBands(modes, kind, scale),
    [modes, kind, scale],
  );

  return (
    <div ref={frameRef} style={frameStyle}>
      {size.width > 0 && (
        <SpectrumChart
          traces={traces}
          kind={kind}
          width={size.width}
          height={Math.max(MINIMUM_HEIGHT, size.height)}
          irVariable={irVariable}
          from={from}
          to={to}
          reverseAxis={display.reverseAxis.value}
          normalization={window}
          activeTraceId={
            activeResultId === null ? null : traceId(kind, activeResultId)
          }
          bands={bands}
          selectedMode={view.selectedMode.value}
          hoveredMode={view.hoveredMode.value}
          tracking={display.tracking.value}
          onToggleTraceVisible={(id) => {
            const resultId = resultIdFromTraceId(id, kind);
            if (resultId === null) toggleTraceVisible(id);
            else toggleResultVisible(resultId);
          }}
          onSelectTrace={(id) => {
            const resultId = resultIdFromTraceId(id, kind);
            if (resultId !== null) selectResult(resultId);
          }}
          onHoverWavenumber={(wavenumber) => {
            view.hoveredMode.value =
              wavenumber === null
                ? null
                : modeAtWavenumber(modes, wavenumber, {
                    fwhm,
                    chart: kind,
                    wavenumberScale: scale,
                  });
          }}
          onPickWavenumber={(wavenumber) => {
            const picked = modeAtWavenumber(modes, wavenumber, {
              fwhm,
              chart: kind,
              wavenumberScale: scale,
            });
            if (picked === null) return;
            selectMode(picked);
            view.animating.value = true;
          }}
        />
      )}
    </div>
  );
}

/** Below this a spectrum is unreadable, so a cramped stack scrolls instead. */
const MINIMUM_HEIGHT = 180;

const frameStyle = {
  display: 'flex',
  flex: '1 1 1px',
  minHeight: MINIMUM_HEIGHT,
  minWidth: 0,
  overflow: 'hidden',
} as const;
