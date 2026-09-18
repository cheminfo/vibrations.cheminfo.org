import { Button, Classes } from '@blueprintjs/core';

import type { SpectrumTrace } from '../../types/trace.ts';

interface SpectrumLegendProps {
  traces: readonly SpectrumTrace[];
  /** Drawn thicker on the chart and shown pressed here. @default null */
  activeTraceId?: string | null;
  /** The eye. Omit to hide the eye buttons. @default undefined */
  onToggleVisible?: (id: string) => void;
  /** Clicking a label. Omit to make the labels inert. @default undefined */
  onSelect?: (id: string) => void;
}

/**
 * The chart's own legend: one chip per trace, carrying its colour, an eye that
 * hides it, and a label that makes it the active series.
 *
 * It is HTML rather than react-plot's SVG `Legend` because a hidden trace is
 * not passed to the plot at all — the legend has to list traces the plot has
 * never seen, which an in-plot legend cannot do.
 * @param props - Component props.
 * @param props.traces - Every trace belonging to this chart, hidden ones included.
 * @param props.activeTraceId - The active trace.
 * @param props.onToggleVisible - Called with a trace id when its eye is clicked.
 * @param props.onSelect - Called with a trace id when its label is clicked.
 * @returns The legend, or nothing when there is no trace.
 */
export function SpectrumLegend(props: SpectrumLegendProps) {
  const { traces, activeTraceId = null, onToggleVisible, onSelect } = props;
  if (traces.length === 0) return null;

  return (
    <div style={legendStyle}>
      {traces.map((trace) => {
        const visible = trace.visible !== false;
        return (
          <span key={trace.id} style={chipStyle}>
            {onToggleVisible !== undefined && (
              <Button
                variant="minimal"
                size="small"
                icon={visible ? 'eye-open' : 'eye-off'}
                aria-label={`${visible ? 'Hide' : 'Show'} ${trace.label}`}
                onClick={() => onToggleVisible(trace.id)}
              />
            )}
            <Button
              variant="minimal"
              size="small"
              active={trace.id === activeTraceId}
              disabled={onSelect === undefined}
              onClick={
                onSelect === undefined ? undefined : () => onSelect(trace.id)
              }
              icon={<Swatch color={trace.color} faded={!visible} />}
              className={visible ? undefined : Classes.TEXT_MUTED}
            >
              {trace.label}
              {trace.mirrored === true ? ' ▾' : ''}
            </Button>
          </span>
        );
      })}
    </div>
  );
}

function Swatch(props: { color: string; faded: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: 2,
        background: props.color,
        opacity: props.faded ? 0.3 : 1,
      }}
    />
  );
}

const legendStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 2,
  padding: '2px 4px',
} as const;

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
} as const;
