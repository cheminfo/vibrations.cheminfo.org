import { Button, Callout, Classes, FormGroup, Switch } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { data, preferences } from '../../state/index.ts';

import { NumberField } from './NumberField.tsx';

/**
 * Charge, unpaired electrons and the geometry relaxation.
 *
 * Charge and spin are properties of the structure, so they follow the loaded
 * molecule until the user overrides them; the override sticks only until the
 * next molecule is loaded, which is what makes drawing an anion and pressing
 * play do the right thing without any setting at all.
 * @returns The structure section.
 */
export function StructureSection() {
  useSignals();
  const molecule = data.molecule.value;
  const settings = preferences.settings;
  const chargeOverride = settings.chargeOverride.value;
  const spinOverride = settings.unpairedElectronsOverride.value;
  const optimize = settings.optimize.value;

  return (
    <>
      <NumberField
        label="Charge"
        value={chargeOverride ?? molecule?.charge ?? 0}
        stepSize={1}
        onChange={(value) => (settings.chargeOverride.value = value)}
        helperText={
          chargeOverride === null ? (
            <span className={Classes.TEXT_MUTED}>
              From the structure itself.
            </span>
          ) : undefined
        }
        action={
          <Button
            variant="minimal"
            size="small"
            icon="reset"
            aria-label="Take the charge from the structure"
            disabled={chargeOverride === null}
            onClick={() => (settings.chargeOverride.value = null)}
          />
        }
      />

      <NumberField
        label="Unpaired electrons"
        value={spinOverride ?? molecule?.unpairedElectrons ?? 0}
        min={0}
        stepSize={1}
        onChange={(value) => (settings.unpairedElectronsOverride.value = value)}
        helperText={
          spinOverride === null ? (
            <span className={Classes.TEXT_MUTED}>
              From the structure itself; 1 is a doublet radical.
            </span>
          ) : undefined
        }
        action={
          <Button
            variant="minimal"
            size="small"
            icon="reset"
            aria-label="Take the spin from the structure"
            disabled={spinOverride === null}
            onClick={() => (settings.unpairedElectronsOverride.value = null)}
          />
        }
      />

      <FormGroup style={groupStyle}>
        <Switch
          checked={optimize}
          label="Relax the geometry before the Hessian"
          onChange={() => (settings.optimize.value = !optimize)}
        />
      </FormGroup>

      {!optimize && (
        <Callout intent="warning" compact>
          A Hessian at an unrelaxed geometry is not a harmonic expansion about a
          minimum: expect imaginary modes and wavenumbers that mean little.
        </Callout>
      )}

      <NumberField
        label="Maximum optimizer cycles"
        value={settings.maxCycles.value}
        min={1}
        stepSize={10}
        disabled={!optimize}
        onChange={(value) => (settings.maxCycles.value = Math.round(value))}
      />
    </>
  );
}

const groupStyle = { marginBottom: 6 } as const;
