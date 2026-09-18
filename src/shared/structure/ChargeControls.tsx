import { Button, FormGroup, NumericInput, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { CSSProperties, ReactElement } from 'react';
import type { Molecule } from 'xtb-wasm';

import { preferences, resetStructureOverrides } from '../../state/index.ts';

import { moleculeGuards } from './electrons.ts';

/** What {@link ChargeControls} describes. */
export interface ChargeControlsProps {
  /** The molecule in the editor. */
  molecule: Molecule;
}

/**
 * The charge and the unpaired electrons the next run will use.
 *
 * Both are read off the structure — an ammonium drawn with a plus really is
 * +1 — and both can be overridden, because a drawing does not always say what
 * the chemist means. An override survives until another molecule is loaded.
 * @param props - The molecule whose structure supplies the defaults.
 * @returns The two inputs plus the electron count.
 */
export function ChargeControls(props: ChargeControlsProps): ReactElement {
  useSignals();
  const { molecule } = props;
  const settings = preferences.settings;
  const chargeOverride = settings.chargeOverride.value;
  const spinOverride = settings.unpairedElectronsOverride.value;
  const overridden = chargeOverride !== null || spinOverride !== null;
  const { electrons } = moleculeGuards({
    ...molecule,
    charge: chargeOverride ?? molecule.charge,
  });

  return (
    <div style={rootStyle}>
      <FormGroup label="Charge" style={fieldStyle}>
        <NumericInput
          fill
          min={CHARGE_LIMIT * -1}
          max={CHARGE_LIMIT}
          value={chargeOverride ?? molecule.charge}
          onValueChange={(value: number) => {
            settings.chargeOverride.value = Number.isFinite(value) ? value : 0;
          }}
        />
      </FormGroup>
      <FormGroup label="Unpaired electrons" style={fieldStyle}>
        <NumericInput
          fill
          min={0}
          max={SPIN_LIMIT}
          value={spinOverride ?? molecule.unpairedElectrons}
          onValueChange={(value: number) => {
            settings.unpairedElectronsOverride.value = Number.isFinite(value)
              ? Math.max(0, value)
              : 0;
          }}
        />
      </FormGroup>
      <div style={footerStyle}>
        <Tag minimal intent={overridden ? 'warning' : 'primary'}>
          {`${electrons} electrons`}
        </Tag>
        {overridden && (
          <Button
            variant="minimal"
            icon="reset"
            onClick={resetStructureOverrides}
          >
            Use the structure&apos;s own
          </Button>
        )}
      </div>
    </div>
  );
}

/** Past this a charge is a typing mistake, not a chemical species. */
const CHARGE_LIMIT = 10;
/** Past this an open-shell request is a typing mistake. */
const SPIN_LIMIT = 10;

const rootStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 8,
} as const satisfies CSSProperties;

const fieldStyle = {
  flex: '1 1 120px',
  margin: 0,
} as const satisfies CSSProperties;

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flex: '1 1 100%',
} as const satisfies CSSProperties;
