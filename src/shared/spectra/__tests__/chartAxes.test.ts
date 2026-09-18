import { expect, test } from 'vitest';

import { chartAxes, formatUnits, traceBelongsToChart } from '../chartAxes.ts';

import { makeTrace } from './traceFixture.ts';

test('the infrared chart defaults to transmittance, which hangs from 100 %', () => {
  const trace = makeTrace({ a: [1, 2, 3, 4, 5], t: [50, 40, 30, 20, 10] });
  expect(chartAxes('infrared', 'transmittance', [trace])).toStrictEqual({
    variable: 't',
    xLabel: 'Wavenumber / cm⁻¹',
    yLabel: 'Transmittance / %',
    baseline: 100,
  });
});

test('absorbance grows from zero and takes its label from the trace', () => {
  const trace = makeTrace({ a: [1, 2, 3, 4, 5] });
  expect(chartAxes('infrared', 'absorbance', [trace])).toStrictEqual({
    variable: 'a',
    xLabel: 'Wavenumber / cm⁻¹',
    yLabel: 'Absorbance',
    baseline: 0,
  });
});

test('the Raman chart labels its x axis a shift', () => {
  const trace = makeTrace({ kind: 'raman' });
  trace.measurement.variables.y.label = 'Raman activity';
  trace.measurement.variables.y.units = 'A^4/amu';
  expect(chartAxes('raman', 'transmittance', [trace])).toStrictEqual({
    variable: 'y',
    xLabel: 'Raman shift / cm⁻¹',
    yLabel: 'Raman activity / Å⁴ amu⁻¹',
    baseline: 0,
  });
});

test('a chart with no trace still names its axes', () => {
  expect(chartAxes('infrared', 'absorbance').yLabel).toBe('Absorbance');
  expect(chartAxes('infrared', 'transmittance').yLabel).toBe(
    'Transmittance / %',
  );
  expect(chartAxes('raman', 'absorbance').yLabel).toBe('Raman activity');
});

test('both infrared kinds share the infrared chart', () => {
  const absorbance = makeTrace({ kind: 'ir-absorbance' });
  const transmittance = makeTrace({ kind: 'ir-transmittance' });
  const raman = makeTrace({ kind: 'raman' });

  expect(traceBelongsToChart(absorbance, 'infrared')).toBe(true);
  expect(traceBelongsToChart(transmittance, 'infrared')).toBe(true);
  expect(traceBelongsToChart(raman, 'infrared')).toBe(false);

  expect(traceBelongsToChart(absorbance, 'raman')).toBe(false);
  expect(traceBelongsToChart(raman, 'raman')).toBe(true);
});

test('stored units are typeset for the axis, and unknown ones pass through', () => {
  expect(formatUnits('cm-1')).toBe('cm⁻¹');
  expect(formatUnits('km/mol')).toBe('km mol⁻¹');
  expect(formatUnits('A^4/amu')).toBe('Å⁴ amu⁻¹');
  expect(formatUnits('%')).toBe('%');
});
