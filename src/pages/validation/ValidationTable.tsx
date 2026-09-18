import { Button, Classes, HTMLTable, Tag } from '@blueprintjs/core';
import { useEffect, useLayoutEffect, useRef } from 'react';

import type { ValidationRow } from '../../state/index.ts';

interface ValidationTableProps {
  rows: readonly ValidationRow[];
  /** Fixture whose assertions are shown below the table. */
  selectedId: string | null;
  onSelect: (fixtureId: string) => void;
  onRun: (fixtureId: string) => void;
  /** True while a run is in flight, so a second one cannot be started. */
  busy: boolean;
}

/**
 * One row per fixture, carrying the deviations the run measured. ArrowUp and
 * ArrowDown move the selection from anywhere on the page, so the assertions
 * below the table can be walked without the mouse.
 * @param props - Component props.
 * @param props.rows - The fixtures, smallest molecule first.
 * @param props.selectedId - Which fixture's assertions are on screen.
 * @param props.onSelect - A row was chosen.
 * @param props.onRun - A row's run button was pressed.
 * @param props.busy - Whether a run is already in flight.
 */
export function ValidationTable(props: ValidationTableProps) {
  const { rows, selectedId, onSelect, onRun, busy } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef(rows);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useLayoutEffect(() => {
    rowsRef.current = rows;
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const focused = document.activeElement;
      if (
        focused instanceof HTMLInputElement ||
        focused instanceof HTMLTextAreaElement ||
        focused instanceof HTMLSelectElement
      ) {
        return;
      }
      const list = rowsRef.current;
      if (list.length === 0) return;
      event.preventDefault();
      const current = list.findIndex(
        (row) => row.fixtureId === selectedIdRef.current,
      );
      const next =
        event.key === 'ArrowDown'
          ? Math.min(current + 1, list.length - 1)
          : Math.max(current - 1, 0);
      if (next === current) return;
      const fixtureId = (list[next] as ValidationRow).fixtureId;
      onSelectRef.current(fixtureId);
      // The row only carries its new state after React has painted it.
      requestAnimationFrame(() => {
        containerRef.current
          ?.querySelector(`[data-fixture-id="${CSS.escape(fixtureId)}"]`)
          ?.scrollIntoView({ block: 'nearest' });
      });
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div ref={containerRef}>
      <HTMLTable compact striped interactive style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Molecule</th>
            <th>Atoms</th>
            <th>max |Δν|</th>
            <th>IR cosine</th>
            <th>ΔE</th>
            <th>Time</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.fixtureId}
              data-fixture-id={row.fixtureId}
              aria-selected={row.fixtureId === selectedId}
              onClick={() => onSelect(row.fixtureId)}
              style={
                row.fixtureId === selectedId
                  ? { background: 'rgb(219 234 254)' }
                  : undefined
              }
            >
              <td>{row.label}</td>
              <td>{row.atoms}</td>
              <td>{formatNumber(row.maxFrequencyDelta, 3, 'cm⁻¹')}</td>
              <td>{formatNumber(row.cosineSimilarity, 4, '')}</td>
              <td>
                {row.energyDelta === null
                  ? '—'
                  : row.energyDelta.toExponential(2)}
              </td>
              <td>
                {row.durationMs === null
                  ? '—'
                  : `${(row.durationMs / 1000).toFixed(1)} s`}
              </td>
              <td>
                <Tag minimal intent={STATUS_INTENT[row.status]}>
                  {row.status}
                </Tag>
                {row.message !== null && (
                  <div
                    className={`${Classes.TEXT_SMALL} ${Classes.TEXT_MUTED}`}
                  >
                    {row.message}
                  </div>
                )}
              </td>
              <td>
                <Button
                  variant="minimal"
                  icon="play"
                  aria-label={`Run ${row.label}`}
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRun(row.fixtureId);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </div>
  );
}

/**
 * Render an optional measurement.
 * @param value - The number, or `null` when the fixture has not been run.
 * @param digits - Decimals to keep.
 * @param unit - Unit to append, empty for none.
 * @returns The formatted cell content.
 */
function formatNumber(
  value: number | null,
  digits: number,
  unit: string,
): string {
  if (value === null) return '—';
  const text = value.toFixed(digits);
  return unit === '' ? text : `${text} ${unit}`;
}

/**
 * Semantic colour per status. `pending` carries no intent at all rather than an
 * explicit neutral one, so it stays the only colourless state in the table.
 */
const STATUS_INTENT: Record<
  ValidationRow['status'],
  'primary' | 'success' | 'danger' | undefined
> = {
  pending: undefined,
  running: 'primary',
  pass: 'success',
  fail: 'danger',
  error: 'danger',
};
