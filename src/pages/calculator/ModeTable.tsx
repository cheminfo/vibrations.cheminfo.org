import { Classes, Tag, Tooltip } from '@blueprintjs/core';
import { useCallback } from 'react';
import type { VibrationalMode } from 'xtb-wasm';

import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import type { ChartSelection } from '../../state/index.ts';

import { intensityFill, strongestIntensities } from './intensityFill.ts';
import type { ModeColumn } from './modeColumns.ts';
import { COLUMN_GAP, INDEX_WIDTH, columnsWidth } from './modeColumns.ts';
import type { ModeRow, ModeSortKey } from './modeRows.ts';
import { useModeArrowKeys } from './useModeArrowKeys.ts';

export interface ModeTableProps {
  rows: readonly ModeRow[];
  columns: readonly ModeColumn[];
  /** Which layout the columns were built for, used for the empty message. */
  selection: ChartSelection;
  /** Index into the result's modes, or `null`. */
  selected: number | null;
  hovered: number | null;
  sortKey: ModeSortKey;
  /** Whose intensity the current sort reads. */
  sortChart: SpectrumChartKind;
  descending: boolean;
  onSort: (key: ModeSortKey, chart: SpectrumChartKind) => void;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}

/**
 * Every normal mode of the active result, one row each.
 *
 * Pointing at a row publishes the hovered mode, which is what lights up the
 * contributing atoms in the depiction and the 3D view and marks the band on the
 * chart; clicking it selects the mode and starts its animation. ArrowUp and
 * ArrowDown walk the rows in the order they are displayed.
 * @param props - See {@link ModeTableProps}.
 * @returns The table.
 */
export function ModeTable(props: ModeTableProps) {
  const {
    rows,
    columns,
    selection,
    selected,
    hovered,
    sortKey,
    sortChart,
    descending,
    onSort,
    onSelect,
    onHover,
  } = props;
  useModeArrowKeys(rows, selected);

  // Attached to the selected row only, so React runs it exactly when the
  // selection moves — including when the chart or the arrow keys move it.
  const revealSelected = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: 'nearest' });
  }, []);

  if (rows.length === 0) {
    return (
      <span className={Classes.TEXT_MUTED}>
        {selection === 'raman'
          ? 'No Raman activities yet — run a calculation with the Raman output on.'
          : 'No modes yet — run a calculation.'}
      </span>
    );
  }

  const width = columnsWidth(columns);
  const strongest = strongestIntensities(rows);

  return (
    <div style={scrollStyle} onPointerLeave={() => onHover(null)}>
      <div style={{ minWidth: width }}>
        <div style={headerRowStyle}>
          <span style={{ width: INDEX_WIDTH }} />
          {columns.map((column) => (
            <Tooltip
              key={column.id}
              content={column.title}
              hoverOpenDelay={400}
              placement="top"
            >
              <button
                type="button"
                style={{ ...headerCellStyle, width: column.width }}
                disabled={column.sortKey === undefined}
                onClick={() => {
                  if (column.sortKey === undefined) return;
                  onSort(column.sortKey, column.sortChart ?? 'infrared');
                }}
              >
                {column.label}
                {isSortedOn(column, sortKey, sortChart) &&
                  (descending ? ' ▾' : ' ▴')}
              </button>
            </Tooltip>
          ))}
        </div>

        <div style={bodyStyle}>
          {rows.map((row) => (
            <button
              key={row.index}
              ref={selected === row.index ? revealSelected : null}
              type="button"
              data-selected={selected === row.index ? 'true' : undefined}
              style={rowStyleFor(selected === row.index, hovered === row.index)}
              onClick={() => onSelect(row.index)}
              onPointerEnter={() => onHover(row.index)}
              onFocus={() => onHover(row.index)}
            >
              <span style={indexCellStyle}>{row.index + 1}</span>
              {columns.map((column) => (
                <span
                  key={column.id}
                  style={{
                    ...cellStyle,
                    width: column.width,
                    background: intensityFill(row, column, strongest),
                  }}
                >
                  {column.value(row.mode)}
                </span>
              ))}
              {isImaginary(row.mode) && (
                <Tag minimal intent="warning">
                  imaginary
                </Tag>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function isSortedOn(
  column: ModeColumn,
  sortKey: ModeSortKey,
  sortChart: SpectrumChartKind,
): boolean {
  if (column.sortKey !== sortKey) return false;
  return sortKey === 'wavenumber' || column.sortChart === sortChart;
}

function isImaginary(mode: VibrationalMode): boolean {
  return mode.wavenumber < 0;
}

function rowStyleFor(isSelected: boolean, isHovered: boolean) {
  if (isSelected) return { ...rowStyle, ...selectedRowStyle };
  return isHovered ? { ...rowStyle, ...hoveredRowStyle } : rowStyle;
}

const scrollStyle = { overflowX: 'auto', flex: '1 1 auto' } as const;

const headerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: COLUMN_GAP,
  padding: '0 6px 3px',
  borderBottom: '1px solid rgb(217 223 230)',
  position: 'sticky',
  top: 0,
} as const;

const headerCellStyle = {
  border: 'none',
  background: 'none',
  font: 'inherit',
  fontSize: 11,
  fontWeight: 600,
  textAlign: 'right',
  padding: 0,
  cursor: 'pointer',
} as const;

const bodyStyle = { display: 'flex', flexDirection: 'column' } as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: COLUMN_GAP,
  padding: '2px 6px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: 3,
  background: 'none',
  font: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
} as const;

const selectedRowStyle = {
  background: 'rgb(45 114 210 / 12%)',
  borderColor: 'rgb(45 114 210 / 45%)',
} as const;

const hoveredRowStyle = {
  background: 'rgb(45 114 210 / 6%)',
  borderColor: 'rgb(45 114 210 / 25%)',
} as const;

const indexCellStyle = {
  width: INDEX_WIDTH,
  opacity: 0.55,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
} as const;

const cellStyle = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
} as const;
