import { Callout, Classes, Tag, Tooltip } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../shared/panelStyles.ts';
import { activeResult, preferences } from '../../state/index.ts';

import { UnitTable } from './UnitTable.tsx';
import { energyRows, entropyRows } from './thermoRows.ts';

/**
 * The RRHO thermochemistry of the active result, in Hartree and in both molar
 * energy units, with the point group and the symmetry number it was built on.
 * @returns The panel.
 */
export function ThermochemistryPanel() {
  useSignals();
  const result = activeResult.value;
  const wanted = preferences.outputs.thermochemistry.value;
  const thermochemistry = result?.thermochemistry ?? null;
  const overridden = result?.request.settings.symmetryNumber ?? null;

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Thermochemistry actions">
          <Toolbar.Item
            icon="temperature"
            tooltip={
              wanted
                ? 'Stop computing thermochemistry'
                : 'Compute thermochemistry on the next run'
            }
            aria-label="Toggle the thermochemistry output"
            active={wanted}
            onClick={() =>
              (preferences.outputs.thermochemistry.value = !wanted)
            }
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        {thermochemistry === null ? (
          <span className={Classes.TEXT_MUTED}>
            {wanted
              ? 'No thermochemistry on the active result — run a calculation, or read the warnings for why it could not be built.'
              : 'The thermochemistry output is off. Turn it on and run again; it is derived from the frequencies and costs nothing extra.'}
          </span>
        ) : (
          <>
            {thermochemistry.skippedImaginaryModes > 0 && (
              <Callout
                intent="danger"
                compact
                title="These numbers describe a saddle point"
              >
                {`${thermochemistry.skippedImaginaryModes} imaginary mode(s) were left out of the sums. A structure with an imaginary frequency is not a minimum, so this free energy is a transition state's, not a molecule's.`}
              </Callout>
            )}

            <div style={tagRowStyle}>
              <Tag minimal intent="primary">
                {`${thermochemistry.temperature.toFixed(2)} K`}
              </Tag>
              <Tag minimal intent="primary">
                {`${(thermochemistry.pressure / 1000).toFixed(3)} kPa`}
              </Tag>
              <Tag minimal intent="success">
                {`point group ${thermochemistry.pointGroup}`}
              </Tag>
              <Tooltip
                content={
                  overridden === null
                    ? 'Taken from the detected point group.'
                    : 'Overridden in the settings, so the detected point group was not used.'
                }
                placement="bottom"
              >
                <Tag
                  minimal
                  intent={overridden === null ? 'success' : 'warning'}
                >
                  {`σ = ${thermochemistry.symmetryNumber}${overridden === null ? '' : ' (overridden)'}`}
                </Tag>
              </Tooltip>
              <Tag minimal intent="success">
                {thermochemistry.isLinear ? 'linear rotor' : 'non-linear rotor'}
              </Tag>
            </div>

            <UnitTable
              caption="Energy"
              units={ENERGY_UNITS}
              rows={energyRows(thermochemistry).map((row) => ({
                label: row.label,
                description: row.description,
                values: [
                  row.hartree.toFixed(6),
                  row.kcalPerMol.toFixed(2),
                  row.kilojoulePerMol.toFixed(2),
                ],
              }))}
            />

            <UnitTable
              caption="Per kelvin"
              units={ENTROPY_UNITS}
              rows={entropyRows(thermochemistry).map((row) => ({
                label: row.label,
                description: row.description,
                values: [
                  row.hartreePerKelvin.toExponential(4),
                  row.caloriePerMoleKelvin.toFixed(3),
                  row.joulePerMoleKelvin.toFixed(3),
                ],
              }))}
            />
          </>
        )}
      </div>
    </div>
  );
}

const tagRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
} as const;

const ENERGY_UNITS = ['Eh', 'kcal/mol', 'kJ/mol'] as const;

const ENTROPY_UNITS = ['Eh/K', 'cal/(mol·K)', 'J/(mol·K)'] as const;
