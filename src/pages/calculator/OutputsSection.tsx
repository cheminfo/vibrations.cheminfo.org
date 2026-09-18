import { FormGroup, Switch } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { activeEngine, preferences } from '../../state/index.ts';

/**
 * Which derived quantities the next run computes. Each one is opt-in because
 * each one costs something, and one that the engine cannot produce at all is
 * disabled rather than silently ignored.
 * @returns The outputs section.
 */
export function OutputsSection() {
  useSignals();
  const capabilities = activeEngine.value?.capabilities;
  const outputs = preferences.outputs;

  return (
    <FormGroup label="Outputs" style={groupStyle}>
      <Switch
        checked={outputs.ir.value}
        disabled={capabilities?.ir === false}
        label="Infrared intensities"
        onChange={() => (outputs.ir.value = !outputs.ir.value)}
      />
      <Switch
        checked={outputs.raman.value}
        disabled={capabilities?.raman == null}
        label="Raman activities"
        onChange={() => (outputs.raman.value = !outputs.raman.value)}
      />
      <Switch
        checked={outputs.thermochemistry.value}
        disabled={capabilities?.thermochemistry === false}
        label="Thermochemistry"
        onChange={() =>
          (outputs.thermochemistry.value = !outputs.thermochemistry.value)
        }
      />
    </FormGroup>
  );
}

const groupStyle = { marginBottom: 6 } as const;
