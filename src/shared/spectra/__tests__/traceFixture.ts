import type { MeasurementVariable } from 'cheminfo-types';

import type { SpectrumKind, SpectrumTrace } from '../../../types/trace.ts';

/** Overrides a test applies to the trace `makeTrace` builds. */
export interface TraceFixtureOptions {
  /** @default 'trace' */
  id?: string;
  /** @default 'Trace' */
  label?: string;
  /** @default '#C10020' */
  color?: string;
  /** @default 'ir-absorbance' */
  kind?: SpectrumKind;
  /** @default [400, 450, 500, 550, 600] */
  x?: number[];
  /** @default [1, 2, 3, 4, 5] */
  y?: number[];
  /** @default undefined */
  a?: number[];
  /** @default undefined */
  t?: number[];
  /** @default undefined */
  mirrored?: boolean;
  /** @default undefined */
  wavenumberScale?: number;
  /** @default undefined */
  visible?: boolean;
}

/**
 * A `SpectrumTrace` with just enough in it for the chart helpers, so a test
 * states only the numbers it is about.
 * @param options - What to override.
 * @returns The trace.
 */
export function makeTrace(options: TraceFixtureOptions = {}): SpectrumTrace {
  const {
    id = 'trace',
    label = 'Trace',
    color = '#C10020',
    kind = 'ir-absorbance',
    x = [400, 450, 500, 550, 600],
    y = [1, 2, 3, 4, 5],
    a,
    t,
    mirrored,
    wavenumberScale,
    visible,
  } = options;

  const variables: Record<string, MeasurementVariable> = {
    x: { label: 'Wavenumber', units: 'cm-1', symbol: 'x', data: x },
    y: { label: 'IR intensity', units: 'km/mol', symbol: 'y', data: y },
  };
  if (a) variables.a = { label: 'Absorbance', units: '', symbol: 'a', data: a };
  if (t) {
    variables.t = { label: 'Transmittance', units: '%', symbol: 't', data: t };
  }

  return {
    id,
    label,
    color,
    kind,
    origin: { kind: 'computed', resultId: 'result', engineId: 'occjs' },
    measurement: {
      id: `measurement-${id}`,
      variables:
        variables as unknown as SpectrumTrace['measurement']['variables'],
    },
    mirrored,
    wavenumberScale,
    visible,
  };
}
