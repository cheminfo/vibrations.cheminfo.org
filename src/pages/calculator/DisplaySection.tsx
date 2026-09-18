import { Button, ButtonGroup, FormGroup, Switch } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import { preferences } from '../../state/index.ts';

import { NumberField } from './NumberField.tsx';

/**
 * How the spectra are drawn: the line width, the window, the reading, and the
 * bond list the Raman model and the band→mode mapping use.
 * @returns The display section.
 */
export function DisplaySection() {
  useSignals();
  const display = preferences.display;
  const variable = display.irVariable.value;
  const connectivity = display.connectivity.value;
  const normalization = display.normalization;

  return (
    <>
      <FormGroup label="Infrared reading" style={groupStyle}>
        <ButtonGroup aria-label="Infrared reading">
          <Button
            size="small"
            active={variable === 'transmittance'}
            intent={variable === 'transmittance' ? 'primary' : undefined}
            onClick={() => (display.irVariable.value = 'transmittance')}
          >
            Transmittance
          </Button>
          <Button
            size="small"
            active={variable === 'absorbance'}
            intent={variable === 'absorbance' ? 'primary' : undefined}
            onClick={() => (display.irVariable.value = 'absorbance')}
          >
            Absorbance
          </Button>
        </ButtonGroup>
      </FormGroup>

      <NumberField
        label="Band width (FWHM) / cm⁻¹"
        value={display.fwhm.value}
        min={0.5}
        stepSize={5}
        minorStepSize={0.5}
        onChange={(value) => (display.fwhm.value = value)}
      />
      <NumberField
        label="From / cm⁻¹"
        value={display.from.value}
        min={0}
        stepSize={100}
        onChange={(value) => (display.from.value = value)}
      />
      <NumberField
        label="To / cm⁻¹"
        value={display.to.value}
        min={0}
        stepSize={100}
        onChange={(value) => (display.to.value = value)}
      />
      <NumberField
        label="Wavenumber scaling factor"
        value={display.wavenumberScale.value}
        min={0.5}
        max={1.5}
        stepSize={0.01}
        minorStepSize={0.001}
        helperText="Harmonic frequencies come out systematically high; scaling is the conventional fix, so it is applied only when asked for."
        onChange={(value) => (display.wavenumberScale.value = value)}
      />

      <FormGroup style={groupStyle}>
        <Switch
          checked={display.reverseAxis.value}
          label="High wavenumbers on the left"
          onChange={() =>
            (display.reverseAxis.value = !display.reverseAxis.value)
          }
        />
        <Switch
          checked={display.tracking.value}
          label="Show every series at the pointer"
          onChange={() => (display.tracking.value = !display.tracking.value)}
        />
        <Switch
          checked={normalization.enabled.value}
          label="Scale each spectrum inside a window"
          onChange={() =>
            (normalization.enabled.value = !normalization.enabled.value)
          }
        />
      </FormGroup>

      {normalization.enabled.value && (
        <>
          <NumberField
            label="Window from / cm⁻¹"
            value={normalization.from.value}
            min={0}
            stepSize={100}
            onChange={(value) => (normalization.from.value = value)}
          />
          <NumberField
            label="Window to / cm⁻¹"
            value={normalization.to.value}
            min={0}
            stepSize={100}
            onChange={(value) => (normalization.to.value = value)}
          />
        </>
      )}

      <FormGroup
        label="Raman connectivity"
        helperText="The legacy rule counts close non-bonded contacts as bonds, and disagrees with the molecular graph on three of the thirty-six collection molecules."
        style={groupStyle}
      >
        <ButtonGroup aria-label="Raman connectivity">
          <Button
            size="small"
            active={connectivity === 'graph'}
            intent={connectivity === 'graph' ? 'primary' : undefined}
            onClick={() => (display.connectivity.value = 'graph')}
          >
            Molecular graph
          </Button>
          <Button
            size="small"
            active={connectivity === 'distance'}
            intent={connectivity === 'distance' ? 'primary' : undefined}
            onClick={() => (display.connectivity.value = 'distance')}
          >
            Legacy distance
          </Button>
        </ButtonGroup>
      </FormGroup>
    </>
  );
}

const groupStyle = { marginBottom: 6 } as const;
