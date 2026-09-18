import { expect, test } from 'vitest';

import {
  HALF_TRANSMITTANCE_ABSORBANCE,
  absorbanceAndTransmittance,
  scaleToWindowMax,
  transmittanceFromAbsorbance,
} from '../absorbance.ts';

test('the reference absorbance puts the strongest band at 50 % transmittance', () => {
  expect(HALF_TRANSMITTANCE_ABSORBANCE).toBe(0.301_029_995_663_981_2);
  expect(transmittanceFromAbsorbance([HALF_TRANSMITTANCE_ABSORBANCE])[0]).toBe(
    50,
  );
});

test('Beer-Lambert turns an absorbance of 0.9 into 12.589254 % transmittance', () => {
  expect(transmittanceFromAbsorbance([0.9])[0]).toBe(12.589_254_117_941_673);
});

test('absorbance and transmittance round-trip through Beer-Lambert', () => {
  const a = [0, 0.1, 0.301_029_995_663_981_2, 1, 2.5];
  const t = transmittanceFromAbsorbance(a);
  for (let index = 0; index < a.length; index++) {
    expect(-Math.log10((t[index] as number) / 100)).toBeCloseTo(
      a[index] as number,
      12,
    );
  }
});

test('a 300 km/mol band is normalized instead of underflowing to zero transmittance', () => {
  const x = [1000, 1700, 3000];
  const intensity = [0, 300, 30];
  const { a, t } = absorbanceAndTransmittance(x, intensity);
  expect(a[1]).toBe(HALF_TRANSMITTANCE_ABSORBANCE);
  expect(t[1]).toBe(50);
  expect(t[2]).toBe(93.303_299_153_680_74);
  expect(t[0]).toBe(100);
});

test('the normalization window picks the strongest band inside it, not overall', () => {
  const x = [1000, 1700, 3000];
  const intensity = [0, 300, 30];
  const { a, t } = absorbanceAndTransmittance(x, intensity, {
    from: 2500,
    to: 3500,
  });
  expect(a[2]).toBe(HALF_TRANSMITTANCE_ABSORBANCE);
  expect(t[2]).toBe(50);
  expect(a[1]).toBe(3.010_299_956_639_812);
});

test('a custom reference absorbance changes the depth of the strongest band', () => {
  const { a, t } = absorbanceAndTransmittance([10, 20], [1, 4], {
    reference: 1,
  });
  expect(a).toStrictEqual(new Float64Array([0.25, 1]));
  expect(t[1]).toBe(10);
});

test('an all-zero curve is left alone rather than divided by zero', () => {
  const { a, t } = absorbanceAndTransmittance([10, 20, 30], [0, 0, 0]);
  expect(a).toStrictEqual(new Float64Array([0, 0, 0]));
  expect(t).toStrictEqual(new Float64Array([100, 100, 100]));
});

test('scaleToWindowMax rescales to the requested height', () => {
  const scaled = scaleToWindowMax([1, 2, 3, 4], [1, 2, 8, 4], {
    from: 1,
    to: 2,
    reference: 100,
  });
  expect(scaled).toStrictEqual(new Float64Array([50, 100, 400, 200]));
});
