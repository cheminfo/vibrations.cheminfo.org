import { Button, ButtonGroup, Callout, FormGroup } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { activeEngine, preferences } from '../../state/index.ts';

/**
 * The Hamiltonian picker.
 *
 * Only the methods the loaded build really runs are offered. This WebAssembly
 * build exposes a single one, so there is one button and a line saying why —
 * never a picker with entries that would be refused.
 * @returns The method section.
 */
export function MethodSection() {
  useSignals();
  const engine = activeEngine.value;
  const methods = engine?.capabilities.methods ?? [];
  const selected = preferences.settings.method.value;

  return (
    <>
      <FormGroup label="Method" style={groupStyle}>
        <ButtonGroup aria-label="Method">
          {methods.map((method) => (
            <Button
              key={method}
              size="small"
              active={method === selected}
              intent={method === selected ? 'primary' : undefined}
              onClick={() => (preferences.settings.method.value = method)}
            >
              {method}
            </Button>
          ))}
        </ButtonGroup>
      </FormGroup>

      {methods.length <= 1 && (
        <Callout intent="primary" compact title="GFN2 is the only method here">
          GFN-FF and GFN1 need the tblite library, which this WebAssembly build
          of OCC does not include. It exposes a single Hamiltonian, so the other
          methods are absent rather than offered and broken.
        </Callout>
      )}
    </>
  );
}

const groupStyle = { marginBottom: 6 } as const;
