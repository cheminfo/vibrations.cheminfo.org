import { Callout, Divider } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../shared/panelStyles.ts';
import {
  cancelAllRuns,
  isRunning,
  predict,
  requestRefusals,
  resetStructureOverrides,
} from '../../state/index.ts';

import { ConditionsSection } from './ConditionsSection.tsx';
import { DisplaySection } from './DisplaySection.tsx';
import { MethodSection } from './MethodSection.tsx';
import { OutputsSection } from './OutputsSection.tsx';
import { StructureSection } from './StructureSection.tsx';

/**
 * Everything that changes what the next run computes, and how the result is
 * drawn.
 *
 * The engine is asked to validate the current request on every change, so a
 * setting it would refuse says so here instead of failing once the calculation
 * has started.
 * @returns The panel.
 */
export function SettingsPanel() {
  useSignals();
  const refusals = requestRefusals.value;
  const running = isRunning.value;

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Settings actions">
          <Toolbar.Item
            icon="play"
            tooltip="Run with these settings"
            aria-label="Predict"
            disabled={running || refusals.length > 0}
            onClick={() => void predict()}
          />
          <Toolbar.Item
            icon="stop"
            tooltip="Cancel every running calculation"
            aria-label="Cancel"
            disabled={!running}
            onClick={() => cancelAllRuns()}
          />
          <Toolbar.Item
            icon="reset"
            tooltip="Take charge and spin from the structure again"
            aria-label="Reset the structure overrides"
            onClick={() => resetStructureOverrides()}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        {refusals.length > 0 && (
          <Callout intent="danger" compact title="The engine would refuse this">
            <ul style={listStyle}>
              {refusals.map((refusal) => (
                <li key={refusal}>{refusal}</li>
              ))}
            </ul>
          </Callout>
        )}

        <MethodSection />
        <StructureSection />
        <Divider />
        <ConditionsSection />
        <Divider />
        <OutputsSection />
        <Divider />
        <DisplaySection />
      </div>
    </div>
  );
}

const listStyle = { margin: 0, paddingLeft: 18 } as const;
