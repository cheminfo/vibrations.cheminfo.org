import { Button, Classes } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { preferences } from '../../state/index.ts';

import { NumberField } from './NumberField.tsx';

/**
 * The conditions the thermochemistry block is evaluated at, and the rotational
 * symmetry number it uses.
 *
 * σ enters the rotational entropy as −R·ln σ, so a wrong value is a silent
 * error in ΔG — benzene at σ = 1 instead of 12 is about 1.5 kcal/mol out. It is
 * therefore left to the detected point group unless the user takes it over.
 * @returns The conditions section.
 */
export function ConditionsSection() {
  useSignals();
  const settings = preferences.settings;
  const symmetry = settings.symmetryNumber.value;

  return (
    <>
      <NumberField
        label="Temperature / K"
        value={settings.temperature.value}
        min={0}
        stepSize={10}
        minorStepSize={0.01}
        onChange={(value) => (settings.temperature.value = value)}
      />
      <NumberField
        label="Pressure / Pa"
        value={settings.pressure.value}
        min={0}
        stepSize={1000}
        onChange={(value) => (settings.pressure.value = value)}
      />
      <NumberField
        label="Symmetry number σ"
        value={symmetry ?? 1}
        min={1}
        stepSize={1}
        onChange={(value) =>
          (settings.symmetryNumber.value = Math.round(value))
        }
        helperText={
          symmetry === null ? (
            <span className={Classes.TEXT_MUTED}>
              From the detected point group.
            </span>
          ) : undefined
        }
        action={
          <Button
            variant="minimal"
            size="small"
            icon="reset"
            aria-label="Take σ from the point group"
            disabled={symmetry === null}
            onClick={() => (settings.symmetryNumber.value = null)}
          />
        }
      />
    </>
  );
}
