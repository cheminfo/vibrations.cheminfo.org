import { expect, test } from 'vitest';

import { HALF_TRANSMITTANCE_ABSORBANCE } from '../absorbance.ts';
import {
  ASE_FOLD_BROADENING,
  irTraceFromModes,
  ramanTraceFromModes,
} from '../broaden.ts';

import { makeMode } from './makeMode.ts';

const MODES = [
  makeMode(-120, 500, 500),
  makeMode(1700, 300, 5),
  makeMode(3000, 30, 50),
];

test('an IR trace carries the raw km/mol intensity alongside absorbance and transmittance', () => {
  const { dataType, variables } = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 500,
    to: 4000,
    points: 3501,
  });
  expect(dataType).toBe('INFRARED SPECTRUM');
  expect(Object.keys(variables)).toStrictEqual(['x', 'y', 'a', 't']);
  expect(variables.y.label).toBe('IR intensity');
  expect(variables.y.units).toBe('km/mol');
  expect(variables.a?.units).toBe('');
  expect(variables.t?.units).toBe('%');

  expect(variables.x.data).toHaveLength(3501);
  expect(variables.x.data[0]).toBe(500);
  expect(variables.x.data[3500]).toBe(4000);
  expect(variables.y.data[1200]).toBe(300.000_443_780_417_47);
  expect(variables.y.data[2500]).toBe(30.004_437_804_174_493);
});

test('a 300 km/mol band reads 50 % transmittance, never 0', () => {
  const { variables } = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 500,
    to: 4000,
    points: 3501,
  });
  const a = variables.a?.data as Float64Array;
  const t = variables.t?.data as Float64Array;

  expect(a[1200]).toBe(HALF_TRANSMITTANCE_ABSORBANCE);
  expect(t[1200]).toBe(50);

  let minimum = Number.POSITIVE_INFINITY;
  for (const value of t) {
    if (value < minimum) minimum = value;
  }
  expect(minimum).toBe(50);
  expect(a[0]).toBe(0.000_005_346_528_078_843_365);
  expect(t[0]).toBe(99.998_768_923_992_44);
});

test('absorbance is a rescaled copy, never an alias of the km/mol curve', () => {
  const { variables } = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 500,
    to: 4000,
    points: 3501,
  });
  expect(variables.a?.data).not.toBe(variables.y.data);
  expect(variables.y.data[1200]).toBe(300.000_443_780_417_47);
});

test('the normalization window decides which band reaches 50 % transmittance', () => {
  const { variables } = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 500,
    to: 4000,
    points: 3501,
    normalization: { enabled: true, from: 2500, to: 4000 },
  });
  expect(variables.t?.data[2500]).toBe(50);
  expect(variables.a?.data[1200]).toBe(3.009_859_170_827_285_7);
});

test('a disabled normalization window falls back to the whole grid', () => {
  const { variables } = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 500,
    to: 4000,
    points: 3501,
    normalization: { enabled: false, from: 2500, to: 4000 },
  });
  expect(variables.t?.data[1200]).toBe(50);
});

test('imaginary modes are dropped from both spectra', () => {
  const ir = irTraceFromModes(MODES, {
    fwhm: 10,
    from: 0,
    to: 4000,
    points: 4001,
  });
  expect(ir.variables.y.data[120]).toBe(0.003_094_718_324_649_038);

  const raman = ramanTraceFromModes(MODES, ASE_FOLD_BROADENING);
  expect(raman.variables.y.data[300]).toBe(0);
  expect(raman.variables.x.data[300]).toBe(120);
});

test('a mode whose intensity was not computed contributes nothing', () => {
  const { variables } = irTraceFromModes(
    [makeMode(1700, null, 5), makeMode(3000, 30, null)],
    { fwhm: 10, from: 500, to: 4000, points: 3501 },
  );
  expect(variables.y.data[1200]).toBe(0.000_443_780_417_449_446);
  expect(variables.y.data[2500]).toBe(30);
});

test('the default IR line shape is Lorentzian, with the far wings a Gaussian would not have', () => {
  const lorentzian = irTraceFromModes([makeMode(1700, 100, 1)], {
    fwhm: 10,
    from: 1500,
    to: 1900,
    points: 401,
  });
  expect(lorentzian.variables.y.data[200]).toBe(100);
  expect(lorentzian.variables.y.data[205]).toBe(50);
  expect(lorentzian.variables.y.data[250]).toBe(0.990_099_009_900_990_1);

  const gaussian = irTraceFromModes([makeMode(1700, 100, 1)], {
    fwhm: 10,
    from: 1500,
    to: 1900,
    points: 401,
    shape: 'gaussian',
  });
  expect(gaussian.variables.y.data[200]).toBe(100);
  expect(gaussian.variables.y.data[205]).toBe(50);
  expect(gaussian.variables.y.data[250]).toBe(0);
});

test('a Raman trace is an activity curve with no Beer-Lambert variables', () => {
  const { dataType, variables } = ramanTraceFromModes(
    MODES,
    ASE_FOLD_BROADENING,
  );
  expect(dataType).toBe('RAMAN SPECTRUM');
  expect(Object.keys(variables)).toStrictEqual(['x', 'y']);
  expect(variables.y.label).toBe('Raman activity');
  expect(variables.y.units).toBe('A^4/amu');
  expect(variables.x.data).toHaveLength(10_001);
  expect(variables.x.data[1]).toBe(0.4);
  expect(variables.y.data[4250]).toBe(5);
  expect(variables.y.data[7500]).toBe(50);
});

test('the ASE fold grid is 4 cm-1 Gaussians over 0-4000 at ten points per width', () => {
  expect(ASE_FOLD_BROADENING).toStrictEqual({
    fwhm: 4,
    from: 0,
    to: 4000,
    points: 10_001,
    shape: 'gaussian',
  });
});

test('a mode below the grid still contributes the wing that reaches into it', () => {
  const { variables } = irTraceFromModes([makeMode(485, 100, 1)], {
    fwhm: 20,
    from: 500,
    to: 600,
    points: 1001,
  });
  expect(variables.y.data[0]).toBe(30.769_230_769_230_77);
  expect(variables.y.data[0]).toBe(100 / (1 + (4 * 15 * 15) / (20 * 20)));
  expect(variables.t?.data[0]).toBe(50);
});

test('a mode above the grid contributes its wing without doubling the last point', () => {
  const { variables } = irTraceFromModes([makeMode(4100, 100, 1)], {
    fwhm: 20,
    from: 3900,
    to: 4000,
    points: 1001,
  });
  expect(variables.x.data).toHaveLength(1001);
  expect(variables.x.data[1000]).toBe(4000);
  expect(variables.y.data[1000]).toBe(0.990_099_009_900_990_1);
  expect(variables.y.data[1000]).toBe(100 / (1 + (4 * 100 * 100) / (20 * 20)));

  const offset = 4100 - (variables.x.data[999] as number);
  expect(variables.y.data[999]).toBe(
    100 / (1 + (4 * offset * offset) / (20 * 20)),
  );
});
