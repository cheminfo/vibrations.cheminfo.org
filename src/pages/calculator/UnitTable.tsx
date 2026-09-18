import { Tooltip } from '@blueprintjs/core';

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
            {props.units.map((unit, index) => (
              <td key={unit} style={numberCellStyle}>
                {row.values[index] ?? ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

const numberHeadStyle = { ...headStyle, textAlign: 'right' } as const;

const labelCellStyle = { padding: '2px 4px' } as const;

const numberCellStyle = {
  padding: '2px 4px',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const;
