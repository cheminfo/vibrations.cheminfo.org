import type { MeasurementXY } from 'cheminfo-types';
import { expect, test } from 'vitest';

import type { SpectrumKind, SpectrumTrace } from '../../types/trace.ts';
import { HALF_TRANSMITTANCE_ABSORBANCE } from '../absorbance.ts';
import { RELATIVE_INTENSITY_REFERENCE, normalizeTraces } from '../normalize.ts';

test('a disabled normalization returns the very same measurements', () => {
  const trace = absorbanceTrace();
  const [normalized] = normalizeTraces([trace], {
    enabled: false,
    from: 500,
    to: 4000,
  });
  expect(normalized?.measurement).toBe(trace.measurement);
});

test('an absorbance trace is scaled so its strongest band reads 50 % transmittance', () => {
  const [normalized] = normalizeTraces([absorbanceTrace()], {
    enabled: true,
    from: 500,
    to: 4000,
  });
  const variables = normalized?.measurement.variables;
  expect(variables?.a?.data).toStrictEqual(
    new Float64Array([
      0.075_257_498_915_995_3,
      HALF_TRANSMITTANCE_ABSORBANCE,
      0.150_514_997_831_990_6,
    ]),
  );
  // T = 100 · 10^(−A) is left to the engine's pow, which Node 22 rounds one ulp
  // away from Node 24, so it is compared to 12 digits rather than bit for bit.
  expect(variables?.t?.data).toBeInstanceOf(Float64Array);
  expect(Array.from(variables?.t?.data ?? [])).toStrictEqual([
    expect.closeTo(84.089_641_525_371_45, 12),
    expect.closeTo(50, 12),
    expect.closeTo(70.710_678_118_654_76, 12),
  ]);
});

test('the window decides which band is driven to 50 % transmittance', () => {
  const [normalized] = normalizeTraces([absorbanceTrace()], {
    enabled: true,
    from: 2500,
    to: 4000,
  });
  const variables = normalized?.measurement.variables;
  expect(variables?.a?.data[2]).toBe(HALF_TRANSMITTANCE_ABSORBANCE);
  expect(variables?.t?.data[2]).toBe(50);
  expect(variables?.a?.data[1]).toBe(0.602_059_991_327_962_4);
});

test('the km/mol intensity of a computed trace is never rescaled', () => {
  const trace = absorbanceTrace();
  const [normalized] = normalizeTraces([trace], {
    enabled: true,
    from: 500,
    to: 4000,
  });
  expect(normalized?.measurement.variables.y.data).toStrictEqual([
    75, 300, 150,
  ]);
  expect(normalized?.measurement.variables.y.units).toBe('km/mol');
});

test('a trace without absorbance is scaled on y to a relative intensity of 100', () => {
  const [normalized] = normalizeTraces([ramanTrace()], {
    enabled: true,
    from: 0,
    to: 4000,
  });
  expect(RELATIVE_INTENSITY_REFERENCE).toBe(100);
  expect(normalized?.measurement.variables.y.data).toStrictEqual(
    new Float64Array([10, 100, 4]),
  );
  expect(normalized?.measurement.variables.a).toBeUndefined();
});

test('every identity field of a trace survives normalization untouched', () => {
  const trace = absorbanceTrace();
  const [normalized] = normalizeTraces([trace], {
    enabled: true,
    from: 500,
    to: 4000,
  });
  expect(normalized?.id).toBe('trace-1');
  expect(normalized?.label).toBe('acetone');
  expect(normalized?.color).toBe('#C10020');
  expect(normalized?.kind).toBe('ir-absorbance');
  expect(normalized?.origin).toStrictEqual({
    kind: 'computed',
    resultId: 'result-1',
    engineId: 'occ',
  });
  expect(trace.measurement.variables.a?.data).toStrictEqual([0.25, 1, 0.5]);
});

test('a transmittance-only source gets its absorbance recomputed from the scaled copy', () => {
  const [normalized] = normalizeTraces(
    [
      trace('ir-transmittance', {
        id: 'm',
        variables: {
          x: { label: 'Wavenumber', units: 'cm-1', data: [1000, 1700] },
          y: { label: 'Transmittance', units: '%', data: [56.2, 10] },
          a: { label: 'Absorbance', units: '', data: [0.25, 1] },
        },
      }),
    ],
    { enabled: true, from: 500, to: 4000 },
  );
  const variables = normalized?.measurement.variables;
  expect(variables?.a?.data).toStrictEqual(
    new Float64Array([0.075_257_498_915_995_3, HALF_TRANSMITTANCE_ABSORBANCE]),
  );
  expect(variables?.t?.label).toBe('Transmittance');
  expect(variables?.t?.units).toBe('%');
  expect(variables?.t?.data).toBeInstanceOf(Float64Array);
  expect(Array.from(variables?.t?.data ?? [])).toStrictEqual([
    expect.closeTo(84.089_641_525_371_45, 12),
    expect.closeTo(50, 12),
  ]);
});

function absorbanceTrace(): SpectrumTrace {
  return trace('ir-absorbance', {
    id: 'measurement-1',
    variables: {
      x: { label: 'Wavenumber', units: 'cm-1', data: [1000, 1700, 3000] },
      y: { label: 'IR intensity', units: 'km/mol', data: [75, 300, 150] },
      a: { label: 'Absorbance', units: '', data: [0.25, 1, 0.5] },
      t: { label: 'Transmittance', units: '%', data: [56.2, 10, 31.6] },
    },
  });
}

function ramanTrace(): SpectrumTrace {
  return trace('raman', {
    id: 'measurement-2',
    variables: {
      x: { label: 'Raman shift', units: 'cm-1', data: [1000, 1700, 3000] },
      y: { label: 'Raman activity', units: 'A^4/amu', data: [5, 50, 2] },
    },
  });
}

function trace(kind: SpectrumKind, measurement: MeasurementXY): SpectrumTrace {
  return {
    id: 'trace-1',
    label: 'acetone',
    color: '#C10020',
    kind,
    origin: { kind: 'computed', resultId: 'result-1', engineId: 'occ' },
    measurement,
  };
}
