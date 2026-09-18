import { useSignals } from '@preact/signals-react/runtime';
import { useMemo, useState } from 'react';
import { Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../shared/panelStyles.ts';
import type { SpectrumChartKind } from '../../shared/spectra/index.ts';
import {
  activeModes,
  clearSelection,
  preferences,
  selectMode,
  view,
} from '../../state/index.ts';

import { ModeTable } from './ModeTable.tsx';
import { modeColumns } from './modeColumns.ts';
import type { ModeSortKey } from './modeRows.ts';
import { sortedModeRows } from './modeRows.ts';

/**
 * The normal-mode table of the active result.
 *
 * Its columns follow the layout: the stacked one carries the infrared intensity
 * and the Raman activity side by side, each sorting on its own numbers.
 * @returns The panel.
 */
export function ModesPanel() {
  useSignals();
  const modes = activeModes.value;
  const selection = preferences.display.charts.value;
  const selected = view.selectedMode.value;
  const animating = view.animating.value;
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);

  const columns = useMemo(() => modeColumns(selection), [selection]);
  const rows = useMemo(
    () =>
      sortedModeRows(modes, {
        key: sort.key,
        descending: sort.descending,
        chart: sort.chart,
      }),
    [modes, sort],
  );

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Mode actions">
          <Toolbar.Item
            icon={animating ? 'pause' : 'play'}
            tooltip={
              animating ? 'Pause the animation' : 'Animate the selected mode'
            }
            aria-label="Toggle animation"
            active={animating}
            disabled={selected === null}
            onClick={() => (view.animating.value = !animating)}
          />
          <Toolbar.Item
            icon="sort"
            tooltip={sort.descending ? 'Sort ascending' : 'Sort descending'}
            aria-label="Reverse the sort order"
            onClick={() =>
              setSort((previous) => ({
                ...previous,
                descending: !previous.descending,
              }))
            }
          />
          <Toolbar.Item
            icon="cross"
            tooltip="Clear the selection"
            aria-label="Clear the selection"
            disabled={selected === null}
            onClick={() => clearSelection()}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        <ModeTable
          rows={rows}
          columns={columns}
          selection={selection}
          selected={selected}
          hovered={view.hoveredMode.value}
          sortKey={sort.key}
          sortChart={sort.chart}
          descending={sort.descending}
          onSort={(key, chart) =>
            setSort((previous) =>
              previous.key === key && previous.chart === chart
                ? { ...previous, descending: !previous.descending }
                : { key, chart, descending: key === 'intensity' },
            )
          }
          onSelect={(index) => {
            selectMode(index);
            view.animating.value = true;
          }}
          onHover={(index) => (view.hoveredMode.value = index)}
        />
      </div>
    </div>
  );
}

interface Sort {
  key: ModeSortKey;
  chart: SpectrumChartKind;
  descending: boolean;
}

/** Ascending wavenumber, which is the order the engine reports the modes in. */
const DEFAULT_SORT: Sort = {
  key: 'wavenumber',
  chart: 'infrared',
  descending: false,
};
