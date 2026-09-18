import { expect, test } from 'vitest';

import {
  formatFromFileName,
  parseJcamp,
  parseSpc,
  parseWdf,
  parseXyText,
} from '../parsers.ts';

import { readBytes } from './loadFixture.ts';

test('extensions route to the reader that can read them', () => {
  expect(formatFromFileName('a.jdx')).toBe('jcamp');
  expect(formatFromFileName('a.DX')).toBe('jcamp');
  expect(formatFromFileName('a.jcamp')).toBe('jcamp');
  expect(formatFromFileName('a.spc')).toBe('spc');
  expect(formatFromFileName('6x6.wdf')).toBe('wdf');
  expect(formatFromFileName('a.csv')).toBe('text');
  expect(formatFromFileName('/some/path/b.TXT')).toBe('text');
  expect(formatFromFileName('unknown.bin')).toBe('text');
  expect(formatFromFileName('noextension')).toBe('text');
});

test('an absorbance JCAMP keeps its absorbance and gains a transmittance', () => {
  const { kind, parser, measurements, warnings } = parseJcamp(
    readBytes('absorbance.jdx'),
  );
  expect(kind).toBe('ir-absorbance');
  expect(parser).toBe('ir-spectrum');
  expect(warnings).toStrictEqual([]);
  expect(measurements).toHaveLength(1);

  const { variables, title } = measurements[0] as (typeof measurements)[number];
  expect(title).toBe('01_3');
  expect(Object.keys(variables)).toStrictEqual(['x', 'y', 'a', 't']);
  expect(variables.x.data).toHaveLength(1738);
  expect(variables.x.data[0]).toBe(649.903_687);
  expect(variables.x.data[1737]).toBe(3999.703_857_000_168_7);
  expect(variables.x.units).toBe('cm-1');
  expect(variables.y.data[0]).toBe(0.120_650_57);
  expect(variables.a?.data[0]).toBe(0.120_650_57);
  expect(variables.t?.data[0]).toBe(75.744_208_198_825_06);
  expect(variables.t?.units).toBe('%');
});

test('a fractional transmittance JCAMP is converted to percent and to absorbance', () => {
  const { kind, measurements } = parseJcamp(readBytes('transmittance.jdx'));
  expect(kind).toBe('ir-transmittance');

  const { variables, title } = measurements[0] as (typeof measurements)[number];
  expect(title).toBe('ETHYL BENZENE');
  expect(variables.x.data).toHaveLength(1991);
  expect(variables.x.data[0]).toBe(589.426);
  expect(variables.y.data[0]).toBe(0.62);
  expect(variables.t?.data[0]).toBe(62);
  expect(variables.a?.data[0]).toBe(0.207_608_310_501_746_1);
});

test('a percent transmittance JCAMP is not rescaled a second time', () => {
  const { kind, measurements } = parseJcamp(
    readBytes('transmittance_percent.jdx'),
  );
  expect(kind).toBe('ir-transmittance');

  const { variables } = measurements[0] as (typeof measurements)[number];
  expect(variables.x.data).toHaveLength(935);
  expect(variables.x.data[0]).toBe(597.931_553);
  expect(variables.x.data[934]).toBe(4200.951_365);
  expect(variables.y.data[0]).toBe(98.616_493);
  expect(variables.t?.data[0]).toBe(98.616_493);
  expect(variables.a?.data[0]).toBe(0.006_050_445_911_851_611);
});

test('a Raman JCAMP is never pushed through Beer-Lambert', () => {
  const { kind, measurements, warnings } = parseJcamp(
    readBytes('adamantan.jdx'),
  );
  expect(kind).toBe('raman');
  expect(warnings).toStrictEqual([]);

  const { variables, title, dataType } = measurements[0] as {
    variables: { x: { data: Float64Array }; y: { data: Float64Array } };
    title?: string;
    dataType?: string;
  };
  expect(title).toBe('Adamantane');
  expect(dataType).toBe('Raman SPECTRUM');
  expect(Object.keys(variables)).toStrictEqual(['x', 'y']);
  expect(variables.x.data).toHaveLength(1791);
  expect(variables.x.data[0]).toBe(101.348_824_000_080_04);
  expect(variables.x.data[1790]).toBe(3101.440_43);
  expect(variables.y.data[0]).toBe(7);
  expect(variables.y.data[1790]).toBe(38);

  let maximum = 0;
  for (const value of variables.y.data) {
    if (value > maximum) maximum = value;
  }
  expect(maximum).toBe(21_726);
});

test('an SPC labelled Transmission arrives as percent, needing no repair', () => {
  const { kind, parser, measurements, warnings } = parseSpc(
    readBytes('absorbance.spc'),
  );
  expect(kind).toBe('ir-transmittance');
  expect(parser).toBe('ir-spectrum');
  // ir-spectrum scales this file correctly, so the double-scaling guard has
  // nothing to do. It is exercised directly in derived.test.ts instead, on a
  // measurement built to be wrong, rather than through a dependency.
  expect(warnings).toStrictEqual([]);

  const { variables } = measurements[0] as (typeof measurements)[number];
  expect(variables.x.data).toHaveLength(1776);
  expect(variables.x.data[0]).toBe(450);
  expect(variables.x.data[1775]).toBe(4000);
  expect(variables.y.label).toBe('Transmission');
  expect(variables.y.data[0]).toBe(94.883_491_516_113_28);
  expect(variables.t?.data[0]).toBe(94.883_491_516_113_28);
  // Beer-Lambert on the same point: -log10(94.8834915/100).
  expect(variables.a?.data[0]).toBeCloseTo(0.022_809_342_547_667_46, 12);
});

test('an SPC claiming an unmeasurable absorbance is loaded but reported', () => {
  const { kind, measurements, warnings } = parseSpc(
    readBytes('resolutionPro.spc'),
  );
  expect(kind).toBe('ir-absorbance');
  expect(warnings).toStrictEqual([
    'Spectrum 1 labels y as "Absorbance" but reaches an absorbance of 205.0, which no instrument can measure; the column is probably counts or percent transmittance, and the transmittance derived from it is meaningless.',
  ]);

  const { variables } = measurements[0] as (typeof measurements)[number];
  expect(variables.x.data).toHaveLength(1557);
  expect(variables.x.data[0]).toBe(499.562_168_140_000_1);
  expect(variables.x.data[1556]).toBe(3500.792_799_900_001);
  expect(variables.y.data[0]).toBe(7);
});

test('a Raman SPC bypasses ir-spectrum and keeps only x and y', () => {
  const { kind, parser, measurements, warnings } = parseSpc(
    readBytes('raman.spc'),
  );
  expect(kind).toBe('raman');
  expect(parser).toBe('spc-parser');
  expect(warnings).toStrictEqual([]);

  const { variables } = measurements[0] as (typeof measurements)[number];
  expect(Object.keys(variables)).toStrictEqual(['x', 'y']);
  expect(variables.x.label).toBe('Raman Shift');
  expect(variables.x.data).toHaveLength(3632);
  expect(variables.x.data[0]).toBe(-3005.956_054_687_5);
  expect(variables.x.data[3631]).toBe(3996.823_242_187_5);
  expect(variables.y.data[0]).toBe(0.032_076_954_841_613_77);
  expect(variables.y.data[3631]).toBe(0.017_102_122_306_823_73);
});

test('a WDF map surfaces every map point as its own spectrum', () => {
  const { kind, parser, measurements, warnings } = parseWdf(
    readBytes('6x6.wdf'),
  );
  expect(kind).toBe('raman');
  expect(parser).toBe('raman-spectrum');
  expect(measurements).toHaveLength(36);
  expect(warnings).toStrictEqual([
    'WDF map with 36 points; every point is loaded.',
  ]);

  const first = measurements[0] as (typeof measurements)[number];
  expect(first.title).toBe('Simple mapping measurement 1');
  expect(first.variables.x.label).toBe('Raman shift');
  expect(first.variables.x.units).toBe('cm-1');
  expect(first.variables.x.data).toHaveLength(1015);
  expect(first.variables.x.data[0]).toBe(1218.433_593_75);
  expect(first.variables.x.data[1014]).toBe(2801.458_984_375);
  expect(first.variables.y.data[0]).toBe(1870.669_067_382_812_5);

  const last = measurements[35] as (typeof measurements)[number];
  expect(last.variables.y.data[0]).toBe(2475.927_978_515_625);
  expect(last.variables.y.data[1014]).toBe(6284.426_269_531_25);
});

test('a two-column text file parses without inventing absorbance', () => {
  const text = '1000 0.1\n1100 0.4\n1200 0.2\n';
  const { kind, parser, measurements, warnings } = parseXyText(
    new TextEncoder().encode(text).buffer,
  );
  expect(kind).toBe('ir-absorbance');
  expect(parser).toBe('xy-parser');
  expect(warnings).toStrictEqual([
    'A text file declares no units, so absorbance and transmittance were not derived; only the raw y values are available.',
  ]);

  const { variables } = measurements[0] as (typeof measurements)[number];
  expect(Object.keys(variables)).toStrictEqual(['x', 'y']);
  expect(variables.x.data).toStrictEqual(new Float64Array([1000, 1100, 1200]));
  expect(variables.y.data).toStrictEqual(new Float64Array([0.1, 0.4, 0.2]));
});

test('a forced kind overrides what the file declares', () => {
  const { kind, measurements } = parseJcamp(
    readBytes('absorbance.jdx'),
    'raman',
  );
  expect(kind).toBe('raman');
  expect(Object.keys(measurements[0]?.variables ?? {})).toStrictEqual([
    'x',
    'y',
  ]);
});
