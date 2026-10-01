import { FormGroup } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { NumberInput } from 'react-cheminfo/ui';

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** @default undefined */
  min?: number;
  /** @default undefined */
  max?: number;
  /** What one arrow press adds; Shift multiplies it by ten. @default 1 */
  step?: number;
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
 * A half-typed entry — a lone minus sign, a trailing decimal point — is kept in
 * the box and not written, so a setting is never left as `NaN` and silently
 * carried into a calculation.
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
    step = 1,
    helperText,
    disabled = false,
    action,
  } = props;

  return (
    <FormGroup label={label} helperText={helperText} style={groupStyle}>
      <div style={rowStyle}>
        <NumberInput
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          fill
          size="small"
          ariaLabel={label}
          onChange={onChange}
        />
        {action}
      </div>
    </FormGroup>
  );
}

const groupStyle = { marginBottom: 6 } as const;
const rowStyle = { display: 'flex', alignItems: 'center', gap: 4 } as const;
