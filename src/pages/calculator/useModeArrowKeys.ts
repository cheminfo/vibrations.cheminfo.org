import { useEffect, useLayoutEffect, useRef } from 'react';

import { selectMode } from '../../state/index.ts';

import type { ModeRow } from './modeRows.ts';

/**
 * ArrowUp and ArrowDown move the mode selection, without the user having to
 * click the list first.
 *
 * The movement follows the order the table is displaying, not the order the
 * result stores, so sorting by intensity and then pressing Down walks down the
 * strongest bands. Keys are ignored while a text field has focus.
 * @param rows - The rows as displayed, in display order.
 * @param selected - Index into the result's modes of the selected row, or `null`.
 */
export function useModeArrowKeys(
  rows: readonly ModeRow[],
  selected: number | null,
): void {
  const rowsRef = useRef<readonly ModeRow[]>(rows);
  const selectedRef = useRef(selected);

  useLayoutEffect(() => {
    rowsRef.current = rows;
    selectedRef.current = selected;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return;
      }
      const list = rowsRef.current;
      if (list.length === 0) return;
      event.preventDefault();

      const current = positionOf(list, selectedRef.current);
      const next =
        event.key === 'ArrowDown'
          ? Math.min(current + 1, list.length - 1)
          : Math.max(current - 1, 0);
      if (next === current) return;
      const row = list[next];
      if (row !== undefined) selectMode(row.index);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

function positionOf(rows: readonly ModeRow[], selected: number | null): number {
  if (selected === null) return -1;
  for (let position = 0; position < rows.length; position++) {
    if ((rows[position] as ModeRow).index === selected) return position;
  }
  return -1;
}
