import { toDelimited } from 'react-cheminfo/core';

import type { ModeColumn } from './modeColumns.ts';
import { MISSING_VALUE } from './modeColumns.ts';
import type { ModeRow } from './modeRows.ts';

/**
 * The mode table as tab-separated text, ready for a spreadsheet.
 *
 * Every row of the table is a button that selects and animates its mode, so a
 * single number cannot be clicked to copy it; the whole table is taken at once
 * instead. It is written in the order the table is displayed, so what is pasted
 * is what was on screen, and the heading of a column carries its unit, which the
 * narrow on-screen heading has no room for. A cell the engine produced no
 * number for is written empty rather than as the dash the table draws.
 * @param rows - The rows, in display order.
 * @param columns - The columns of the current layout, left to right.
 * @returns The text, its heading line first.
 */
export function modeTableText(
  rows: readonly ModeRow[],
  columns: readonly ModeColumn[],
): string {
  const header = new Array<string>(columns.length + 1);
  header[0] = 'mode';
  for (let column = 0; column < columns.length; column++) {
    header[column + 1] = (columns[column] as ModeColumn).heading;
  }

  const lines = new Array<string[]>(rows.length);
  for (let line = 0; line < rows.length; line++) {
    const row = rows[line] as ModeRow;
    const cells = new Array<string>(columns.length + 1);
    cells[0] = String(row.index + 1);
    for (let column = 0; column < columns.length; column++) {
      const value = (columns[column] as ModeColumn).value(row.mode);
      cells[column + 1] = value === MISSING_VALUE ? '' : value;
    }
    lines[line] = cells;
  }

  return toDelimited(lines, { header });
}
