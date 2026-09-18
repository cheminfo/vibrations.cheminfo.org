import { Classes } from '@blueprintjs/core';

import type { ReadoutRow } from './cursorReadout.ts';

interface CursorReadoutProps {
  wavenumber: number;
  rows: readonly ReadoutRow[];
  /** Appended to every value, e.g. `%`. @default '' */
  unit?: string;
}

/**
 * The value of every visible series at the pointer, strongest first, each in
 * its own colour.
 *
 * It floats over the plot and never takes the pointer, so moving onto it cannot
 * make it disappear.
 * @param props - Component props.
 * @param props.wavenumber - The pointer's wavenumber, cm⁻¹.
 * @param props.rows - One row per covering series, already sorted.
 * @param props.unit - Unit shown after each value.
 * @returns The readout, or nothing when no series covers the pointer.
 */
export function CursorReadout(props: CursorReadoutProps) {
  const { wavenumber, rows, unit = '' } = props;
  if (rows.length === 0) return null;

  return (
    <div style={boxStyle} className={Classes.TEXT_SMALL}>
      <div style={headerStyle}>{wavenumber.toPrecision(6)} cm⁻¹</div>
      {rows.map((row) => (
        <div key={row.id} style={rowStyle}>
          <span style={{ ...barStyle, background: row.color }} />
          <span style={valueStyle}>
            {row.value.toPrecision(4)}
            {unit}
          </span>
          <span style={labelStyle}>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

const boxStyle = {
  position: 'absolute',
  top: 14,
  left: 70,
  pointerEvents: 'none',
  background: 'rgb(255 255 255 / 0.88)',
  border: '1px solid rgb(217 223 230)',
  borderRadius: 3,
  padding: '3px 6px',
  maxWidth: 260,
} as const;

const headerStyle = { fontWeight: 600, marginBottom: 2 } as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  lineHeight: '15px',
} as const;

const barStyle = {
  display: 'inline-block',
  width: 14,
  height: 3,
  borderRadius: 2,
  flexShrink: 0,
} as const;

const valueStyle = {
  fontVariantNumeric: 'tabular-nums',
  minWidth: 56,
  textAlign: 'right',
} as const;

const labelStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
