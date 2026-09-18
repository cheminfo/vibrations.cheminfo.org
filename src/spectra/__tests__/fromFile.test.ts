import { expect, test } from 'vitest';

import { spectraFromFile } from '../fromFile.ts';
import { SPECTRUM_PALETTE } from '../palette.ts';

import { loadFixture } from './loadFixture.ts';

test('an IR JCAMP becomes one trace carrying its provenance', async () => {
  const { traces, warnings } = await spectraFromFile(
    loadFixture('absorbance.jdx'),
  );
  expect(warnings).toStrictEqual([]);
  expect(traces).toHaveLength(1);

  const trace = traces[0] as (typeof traces)[number];
  expect(trace.kind).toBe('ir-absorbance');
  expect(trace.label).toBe('01_3 (absorbance)');
  expect(trace.color).toBe('#C10020');
  expect(trace.origin).toStrictEqual({
    kind: 'experimental',
    fileName: 'absorbance.jdx',
    parser: 'ir-spectrum',
  });
  expect(trace.measurement.variables.x.data).toHaveLength(1738);
  expect(trace.measurement.variables.t?.data[0]).toBe(75.744_208_198_825_06);
});

test('a Raman JCAMP is routed away from the absorbance transform', async () => {
  const { traces } = await spectraFromFile(loadFixture('adamantan.jdx'));
  const trace = traces[0] as (typeof traces)[number];
  expect(trace.kind).toBe('raman');
  expect(trace.label).toBe('Adamantane (adamantan)');
  expect(Object.keys(trace.measurement.variables)).toStrictEqual(['x', 'y']);
  expect(trace.measurement.variables.y.data[0]).toBe(7);
});

test('a Raman SPC is credited to spc-parser, an IR SPC to ir-spectrum', async () => {
  const raman = await spectraFromFile(loadFixture('raman.spc'));
  expect(raman.traces[0]?.kind).toBe('raman');
  expect(raman.traces[0]?.label).toBe('raman');
  expect(raman.traces[0]?.origin).toStrictEqual({
    kind: 'experimental',
    fileName: 'raman.spc',
    parser: 'spc-parser',
  });

  const infrared = await spectraFromFile(loadFixture('resolutionPro.spc'));
  expect(infrared.warnings).toHaveLength(1);
  expect(infrared.traces[0]?.kind).toBe('ir-absorbance');
  expect(infrared.traces[0]?.label).toBe('resolutionPro');
  expect(infrared.traces[0]?.origin).toStrictEqual({
    kind: 'experimental',
    fileName: 'resolutionPro.spc',
    parser: 'ir-spectrum',
  });
});

test('an SPC in percent transmittance loads clean, with no correction to report', async () => {
  const { traces, warnings } = await spectraFromFile(
    loadFixture('absorbance.spc'),
  );
  expect(traces).toHaveLength(1);
  expect(warnings).toStrictEqual([]);
  expect(traces[0]?.measurement.variables.t?.data[0]).toBe(
    94.883_491_516_113_28,
  );
});

test('a WDF map yields one numbered trace per point, each with its own colour', async () => {
  const { traces, warnings } = await spectraFromFile(loadFixture('6x6.wdf'));
  expect(traces).toHaveLength(36);
  expect(warnings).toStrictEqual([
    'WDF map with 36 points; every point is loaded.',
  ]);

  expect(traces[0]?.label).toBe('Simple mapping measurement 1 (6x6) #1');
  expect(traces[35]?.label).toBe('Simple mapping measurement 1 (6x6) #36');
  expect(traces[0]?.color).toBe('#C10020');
  expect(traces[19]?.color).toBe('#F13A13');
  expect(traces[20]?.color).toBe('#C10020');

  const firstTwenty = new Set(
    traces.slice(0, 20).map((trace) => trace.color.toUpperCase()),
  );
  expect(firstTwenty).toStrictEqual(new Set(SPECTRUM_PALETTE));
  expect(traces[35]?.measurement.variables.y.data[0]).toBe(
    2475.927_978_515_625,
  );
});

test('colours already on the chart are avoided', async () => {
  const { traces } = await spectraFromFile(loadFixture('absorbance.jdx'), {
    usedColors: ['#C10020', '#007D34'],
  });
  expect(traces[0]?.color).toBe('#803E75');
});

test('a forced kind wins over the file declaration', async () => {
  const { traces } = await spectraFromFile(loadFixture('adamantan.jdx'), {
    kind: 'ir-absorbance',
  });
  expect(traces[0]?.kind).toBe('ir-absorbance');
  expect(Object.keys(traces[0]?.measurement.variables ?? {})).toStrictEqual([
    'x',
    'y',
    'a',
    't',
  ]);
});

test('an unknown extension falls back to the text reader and says so', async () => {
  const file = new File(['1000 0.1\n1100 0.4\n'], 'mystery.bin');
  const { traces, warnings } = await spectraFromFile(file);
  expect(traces).toHaveLength(1);
  expect(traces[0]?.kind).toBe('ir-absorbance');
  expect(traces[0]?.label).toBe('mystery');
  expect(traces[0]?.origin).toStrictEqual({
    kind: 'experimental',
    fileName: 'mystery.bin',
    parser: 'xy-parser',
  });
  expect(warnings).toStrictEqual([
    'A text file declares no units, so absorbance and transmittance were not derived; only the raw y values are available.',
  ]);
  expect(traces[0]?.measurement.variables.y.data).toStrictEqual(
    new Float64Array([0.1, 0.4]),
  );
});

test('two traces from the same file get different ids', async () => {
  const { traces } = await spectraFromFile(loadFixture('6x6.wdf'));
  const ids = new Set(traces.map((trace) => trace.id));
  expect(ids.size).toBe(36);
});
