import { FormGroup, NumericInput } from '@blueprintjs/core';
import type { ReactNode } from 'react';

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** @default undefined */
  min?: number;
  /** @default undefined */
  max?: number;
  /** @default 1 */
  stepSize?: number;
  /** @default undefined */
  minorStepSize?: number | null;
  /** Shown under the input. @default undefined */
  helperText?: ReactNode;
  /** @default false */
  disabled?: boolean;
  /** Put beside the input, e.g. a button that drops an override. @default undefined */
  action?: ReactNode;
}

/**
 * One labelled numeric setting.
 *
 * A non-finite entry — an emptied box, a half-typed minus sign — is ignored
 * rather than written, so a setting is never left as `NaN` and silently carried
 * into a calculation.
 * @param props - See {@link NumberFieldProps}.
 * @returns The field.
 */
export function NumberField(props: NumberFieldProps) {
  const {
    label,
    value,
    onChange,
    min,
    max,
    stepSize = 1,
    minorStepSize,
    helperText,
    disabled = false,
    action,
  } = props;

  return (
    <FormGroup label={label} helperText={helperText} style={groupStyle}>
      <div style={rowStyle}>
        <NumericInput
          value={value}
          min={min}
          max={max}
          stepSize={stepSize}
          // BlueprintJS requires minor ≤ step ≤ major and defaults major to 10,
          // which a field stepping in hundreds would violate.
          majorStepSize={stepSize * 10}
          minorStepSize={minorStepSize}
          disabled={disabled}
          fill
          size="small"
          onValueChange={(next) => {
            if (Number.isFinite(next)) onChange(next);
          }}
        />
        {action}
      </div>
    </FormGroup>
  );
}

const groupStyle = { marginBottom: 6 } as const;
const rowStyle = { display: 'flex', alignItems: 'center', gap: 4 } as const;
