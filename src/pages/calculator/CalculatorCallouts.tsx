import { Button, Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { INTERACTIVE_ATOM_LIMIT } from '../../data/index.ts';
import {
  activeResult,
  clearRunError,
  data,
  isExpensiveRun,
  isRunning,
  preferences,
  requestRefusals,
  run,
} from '../../state/index.ts';

/**
 * Everything the user has to read before trusting what the charts show: why the
 * engine would refuse the request, what the last run failed on, how long this
 * molecule will take, and what the finished result warns about.
 * @returns The callouts, most blocking first.
 */
export function CalculatorCallouts() {
  useSignals();
  const engineId = preferences.engine.primary.value;
  const refusals = requestRefusals.value;
  const error = run.errors.value[engineId];
  const result = activeResult.value;
  const molecule = data.molecule.value;

  return (
    <>
      {refusals.length > 0 && (
        <Callout
          intent="danger"
          compact
          title="This calculation cannot be run as asked"
          style={calloutStyle}
        >
          <ul style={listStyle}>
            {refusals.map((refusal) => (
              <li key={refusal}>{refusal}</li>
            ))}
          </ul>
        </Callout>
      )}

      {error !== undefined && (
        <Callout intent="danger" compact style={calloutStyle}>
          <div style={rowStyle}>
            <span style={{ flex: '1 1 auto' }}>{error}</span>
            <Button
              variant="minimal"
              size="small"
              icon="cross"
              aria-label="Dismiss the error"
              onClick={() => clearRunError(engineId)}
            />
          </div>
        </Callout>
      )}

      {isExpensiveRun.value && !isRunning.value && molecule !== null && (
        <Callout intent="warning" compact title="This one will take a while">
          {`${molecule.elements.length} atoms is past the ${INTERACTIVE_ATOM_LIMIT}-atom interactive limit. The Hessian sweep grows with the atom count, so expect tens of seconds rather than a couple — the run can be cancelled at any point.`}
        </Callout>
      )}

      {result !== null && result.warnings.length > 0 && (
        <Callout intent="warning" compact style={calloutStyle}>
          <ul style={listStyle}>
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Callout>
      )}
    </>
  );
}

const calloutStyle = { margin: '0 8px 6px' } as const;
const listStyle = { margin: 0, paddingLeft: 18 } as const;
const rowStyle = { display: 'flex', alignItems: 'start', gap: 6 } as const;
