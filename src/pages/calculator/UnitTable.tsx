import { Tooltip } from '@blueprintjs/core';
import { ClickToCopy } from 'react-cheminfo/ui';

/** One row: a named quantity, already formatted once per unit column. */
export interface UnitTableRow {
  label: string;
  /** What the quantity means, shown as the row's tooltip. */
  description: string;
  /** Pre-formatted values, one per entry of `units`. */
  values: readonly string[];
}

/**
 * A quantity table: one labelled row per quantity, one column per unit.
 *
 * Every thermochemistry number in the app is read this way — the chemist
 * decides which unit to trust, so the same value is always shown in all of them
 * rather than in one the panel happened to pick.
 * @param props - The row heading, the unit column headings and the rows.
 * @returns The table.
 */
export function UnitTable(props: {
  caption: string;
  units: readonly string[];
  rows: readonly UnitTableRow[];
}) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={headStyle}>{props.caption}</th>
          {props.units.map((unit) => (
            <th key={unit} style={numberHeadStyle}>
              {unit}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row) => (
          <tr key={row.label}>
            <td style={labelCellStyle}>
              <Tooltip content={row.description} placement="right">
                <span>{row.label}</span>
              </Tooltip>
            </td>
            {props.units.map((unit, index) => {
              const value = row.values[index] ?? '';
              return (
                <ClickToCopy
                  key={unit}
                  as="td"
                  value={value}
                  label={`${row.label} in ${unit}`}
                  disabled={value === ''}
                  style={numberCellStyle}
                >
                  {value}
                </ClickToCopy>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Room the copy glyph needs inside the right edge of a cell, in pixels. */
const GLYPH_ROOM = 22;

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
} as const;

const headStyle = {
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '1px solid rgb(217 223 230)',
  padding: '2px 4px',
} as const;

const numberHeadStyle = {
  ...headStyle,
  textAlign: 'right',
  paddingRight: GLYPH_ROOM,
} as const;

const labelCellStyle = { padding: '2px 4px' } as const;

/* The inline padding of a number cell beats the library's block padding, so
   the room the copy glyph needs is kept here, on the cells and their heads
   alike, and the column stays aligned when a cell has nothing to copy. */
const numberCellStyle = {
  padding: '2px 4px',
  paddingRight: GLYPH_ROOM,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const;
