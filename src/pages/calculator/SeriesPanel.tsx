import { Button, Classes } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { MF } from 'react-mf';
import { Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../shared/panelStyles.ts';
import type { ResultEntry } from '../../state/index.ts';
import {
  clearResults,
  clearSelection,
  removeResult,
  selectResult,
  series,
  toggleResultVisible,
} from '../../state/index.ts';

/**
 * Every molecule predicted this session, one row each, in the order they were
 * computed.
 *
 * A row carries the colour its curve is drawn in, an eye that takes it off the
 * charts without giving its colour away, and a trash that drops it. Clicking a
 * row makes it the result the mode table, the depiction and the 3D view describe.
 * @returns The panel.
 */
export function SeriesPanel() {
  useSignals();
  const entries = series.results.value;
  const activeId = series.activeResultId.value;

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="History actions">
          <Toolbar.Item
            icon="trash"
            tooltip="Clear the history"
            aria-label="Clear the history"
            disabled={entries.length === 0}
            onClick={() => {
              clearResults();
              clearSelection();
            }}
          />
        </Toolbar>
      </div>

      <div
        style={panelBodyStyle}
        onKeyDown={(event) => {
          const next = neighbour(entries, activeId, event.key);
          if (next === null) return;
          event.preventDefault();
          // The mode table listens for the same keys on the document; this list
          // has its own selection, so the event stops here.
          event.stopPropagation();
          selectResult(next);
        }}
      >
        {entries.length === 0 ? (
          <span className={Classes.TEXT_MUTED}>
            Nothing computed yet. Every prediction lands here, keeps its colour,
            and stays on the charts until it is removed.
          </span>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={rowStyle}>
              <button
                type="button"
                data-selected={entry.id === activeId ? 'true' : undefined}
                style={selectStyleFor(entry.id === activeId)}
                onClick={() => selectResult(entry.id)}
              >
                <span
                  style={{
                    ...swatchStyle,
                    background: entry.color,
                    opacity: entry.visible ? 1 : 0.3,
                  }}
                />
                <span style={labelStyle}>
                  <span style={titleStyle}>{entry.molecule.label}</span>
                  <span className={Classes.TEXT_SMALL} style={subtitleStyle}>
                    <MF mf={entry.molecule.formula} />
                    {` · ${entry.result.modes.length} modes`}
                  </span>
                </span>
              </button>
              <Button
                variant="minimal"
                size="small"
                icon={entry.visible ? 'eye-open' : 'eye-off'}
                aria-label={
                  entry.visible
                    ? `Hide ${entry.molecule.label}`
                    : `Show ${entry.molecule.label}`
                }
                onClick={() => toggleResultVisible(entry.id)}
              />
              <Button
                variant="minimal"
                size="small"
                icon="trash"
                intent="danger"
                aria-label={`Remove ${entry.molecule.label}`}
                onClick={() => removeResult(entry.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function neighbour(
  entries: readonly ResultEntry[],
  activeId: string | null,
  key: string,
): string | null {
  if (key !== 'ArrowDown' && key !== 'ArrowUp') return null;
  if (entries.length === 0) return null;
  let current = -1;
  for (let index = 0; index < entries.length; index++) {
    if ((entries[index] as ResultEntry).id === activeId) current = index;
  }
  const next =
    key === 'ArrowDown'
      ? Math.min(current + 1, entries.length - 1)
      : Math.max(current - 1, 0);
  if (next === current) return null;
  return (entries[next] as ResultEntry).id;
}

function selectStyleFor(isActive: boolean) {
  return isActive ? { ...selectStyle, ...activeStyle } : selectStyle;
}

const rowStyle = { display: 'flex', alignItems: 'center', gap: 2 } as const;

const selectStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  flex: '1 1 auto',
  minWidth: 0,
  padding: '3px 6px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: 3,
  background: 'none',
  font: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
} as const;

const activeStyle = {
  background: 'rgb(45 114 210 / 10%)',
  borderColor: 'rgb(45 114 210 / 45%)',
} as const;

const swatchStyle = {
  display: 'inline-block',
  width: 11,
  height: 11,
  borderRadius: 3,
  flex: '0 0 auto',
} as const;

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  lineHeight: 1.2,
} as const;

const titleStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const subtitleStyle = { opacity: 0.7 } as const;
