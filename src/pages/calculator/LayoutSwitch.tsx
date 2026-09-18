import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { preferences } from '../../state/index.ts';

import { CHART_LAYOUTS } from './layouts.ts';

/**
 * The three-button bar that switches between the infrared, the Raman and the
 * stacked layout, above the charts.
 * @returns The layout bar.
 */
export function LayoutSwitch() {
  useSignals();
  const selection = preferences.display.charts.value;

  return (
    <ButtonGroup aria-label="Spectrum layout">
      {CHART_LAYOUTS.map((layout) => (
        <Tooltip
          key={layout.id}
          content={layout.description}
          hoverOpenDelay={400}
          placement="bottom"
        >
          <Button
            icon={layout.icon}
            size="small"
            active={selection === layout.id}
            intent={selection === layout.id ? 'primary' : undefined}
            onClick={() => (preferences.display.charts.value = layout.id)}
          >
            {layout.label}
          </Button>
        </Tooltip>
      ))}
    </ButtonGroup>
  );
}
