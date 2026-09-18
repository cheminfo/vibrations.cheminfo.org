import { Classes, NonIdealState, ProgressBar } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { Toolbar } from 'react-science/ui';

import {
  cancelRun,
  data,
  predict,
  preferences,
  requestRefusals,
  run,
} from '../../state/index.ts';

import { CalculatorCallouts } from './CalculatorCallouts.tsx';
import { ChartFrame } from './ChartFrame.tsx';
import { LayoutSwitch } from './LayoutSwitch.tsx';
import { RamanNotes } from './RamanNotes.tsx';
import { chartsFor, showsRaman } from './layouts.ts';

/**
 * The calculator: compute a spectrum in this browser and read it.
 *
 * The page owns the charts and the run; the mode table, the history, the
 * thermochemistry and the settings live in the side panels beside it, so they
 * stay visible while the layout changes underneath.
 * @returns The page.
 */
export function CalculatorPage() {
  useSignals();
  const molecule = data.molecule.value;
  const engineId = preferences.engine.primary.value;
  const status = run.active.value[engineId];
  const running = status !== undefined;
  const selection = preferences.display.charts.value;
  const refused = requestRefusals.value.length > 0;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <Toolbar aria-label="Calculator actions">
          <Toolbar.Item
            icon="play"
            tooltip="Compute the spectrum in this browser"
            aria-label="Predict"
            disabled={molecule === null || running || refused}
            onClick={() => void predict()}
          />
          <Toolbar.Item
            icon="stop"
            tooltip="Cancel the running calculation"
            aria-label="Cancel"
            disabled={!running}
            onClick={() => cancelRun(engineId)}
          />
        </Toolbar>
        <LayoutSwitch />
      </div>

      {running && (
        <div style={progressStyle}>
          <ProgressBar
            intent="primary"
            value={status.progress?.fraction ?? undefined}
            stripes={status.progress?.fraction == null}
          />
          <span className={Classes.TEXT_SMALL}>
            {status.progress?.message ?? 'Starting…'}
          </span>
        </div>
      )}

      <CalculatorCallouts />
      {showsRaman(selection) && <RamanNotes />}

      {molecule === null ? (
        <NonIdealState
          icon="cube"
          title="No molecule"
          description="Draw one, paste a SMILES or drop a file in the Molecule panel, then press play."
        />
      ) : (
        <div style={chartsStyle}>
          {chartsFor(selection).map((kind) => (
            <ChartFrame key={kind} kind={kind} />
          ))}
        </div>
      )}
    </div>
  );
}

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
  overflow: 'auto',
} as const;

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '4px 8px',
  flexWrap: 'wrap',
} as const;

const progressStyle = { padding: '2px 10px 6px' } as const;

const chartsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: '1 1 1px',
  minHeight: 0,
  padding: '0 4px 4px',
} as const;
