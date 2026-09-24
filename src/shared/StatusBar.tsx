import { Classes, ProgressBar, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { ClickToCopy } from 'react-cheminfo/ui';
import { MF } from 'react-mf';
import { occPoolWorkerCount } from 'xtb-wasm';

import { activeEngine, activeResult, state } from '../state/index.ts';

/**
 * One honest line about what is loaded, what is running and where it runs.
 *
 * The worker count is read on every render rather than stored, because the pool
 * is created lazily on the first run: showing a number before it exists would be
 * a guess.
 */
export function StatusBar() {
  useSignals();
  const molecule = state.data.molecule.value;
  const result = activeResult.value;
  const running = Object.values(state.run.active.value);
  const engine = activeEngine.value;
  const workers = occPoolWorkerCount();

  return (
    <div style={barStyle} className={Classes.TEXT_SMALL}>
      {molecule === null ? (
        <span className={Classes.TEXT_MUTED}>No molecule loaded</span>
      ) : (
        <>
          <ClickToCopy value={molecule.formula} label="molecular formula">
            <MF mf={molecule.formula} />
          </ClickToCopy>
          <Separator />
          <span>{molecule.elements.length} atoms</span>
        </>
      )}

      {result !== null && (
        <>
          <Separator />
          <span>{result.modes.length} modes</span>
          <Separator />
          <ClickToCopy
            value={result.energy.total.toFixed(8)}
            label="total energy in Eh"
          >
            {result.energy.total.toFixed(8)} Eh
          </ClickToCopy>
          <Separator />
          <span>{(result.timings.total / 1000).toFixed(2)} s</span>
          {result.imaginaryCount > 0 && (
            <Tag minimal intent="warning">
              {result.imaginaryCount} imaginary
            </Tag>
          )}
        </>
      )}

      <span style={{ flex: '1 1 1px' }} />

      {running.map((status) => (
        <span key={status.engineId} style={runningStyle}>
          <Tag minimal intent="primary">
            {status.progress?.message ?? status.engineId}
          </Tag>
          <span style={{ width: 90 }}>
            <ProgressBar
              intent="primary"
              value={status.progress?.fraction ?? undefined}
              stripes={status.progress?.fraction === null}
            />
          </span>
        </span>
      ))}

      {workers > 0 && (
        <>
          <Separator />
          <span>
            {workers} worker{workers === 1 ? '' : 's'}
          </span>
        </>
      )}
      <Separator />
      <span className={Classes.TEXT_MUTED}>
        {engine === undefined ? 'no engine' : engine.label}
      </span>
    </div>
  );
}

function Separator() {
  return <span style={{ opacity: 0.35 }}>│</span>;
}

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 10px',
  borderTop: '1px solid rgb(217 223 230)',
  minHeight: 28,
  flexShrink: 0,
} as const;

const runningStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
} as const;
