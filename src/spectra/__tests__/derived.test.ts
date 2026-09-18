import type { MeasurementXY } from 'cheminfo-types';
import { expect, test } from 'vitest';

import { repairDerivedVariables } from '../derived.ts';

test('a percent transmittance scaled to percent twice is divided back down', () => {
  const measurement = spectrum({
    y: [94.883_491_516_113_28, 3.307_3],
    t: [9488.349_151_611_328, 330.73],
    a: [-1.977_18, -0.519_92],
  });
  const warnings = repairDerivedVariables([measurement]);

  expect(warnings).toStrictEqual([
    'Spectrum 1 labels y as "Transmission" without declaring percent, so its values were read as a fraction and scaled by 100 twice; the transmittance and absorbance were divided back down.',
  ]);
  expect(measurement.variables.t?.data).toStrictEqual(
    new Float64Array([94.883_491_516_113_28, 3.307_3]),
  );
  expect(measurement.variables.a?.data).toStrictEqual(
    new Float64Array([0.022_809_342_547_667_46, 1.480_526_409_127_643_8]),
  );
});

test('the repaired absorbance and transmittance satisfy Beer-Lambert', () => {
  const measurement = spectrum({
    y: [50, 1],
    t: [5000, 100],
    a: [-1.698_97, -2],
  });
  repairDerivedVariables([measurement]);

  const absorbance = measurement.variables.a?.data as Float64Array;
  const transmittance = measurement.variables.t?.data as Float64Array;
  expect(transmittance).toStrictEqual(new Float64Array([50, 1]));
  expect(absorbance[0]).toBe(-Math.log10(0.5));
  expect(absorbance[1]).toBe(2);
});

test('a transmittance a little over 100 percent is left alone as baseline drift', () => {
  const measurement = spectrum({
    y: [1.004, 0.5],
    t: [100.4, 50],
    a: [-0.001_733_712_9, 0.301_029_995_663_981_2],
  });
  expect(repairDerivedVariables([measurement])).toStrictEqual([]);
  expect(measurement.variables.t?.data).toStrictEqual(
    new Float64Array([100.4, 50]),
  );
});

test('an absorbance no instrument could measure is reported, never rewritten', () => {
  const measurement = spectrum({
    label: 'Absorbance',
    y: [7, 205],
    a: [7, 205],
    t: [0.000_01, 0],
  });
  expect(repairDerivedVariables([measurement])).toStrictEqual([
    'Spectrum 1 labels y as "Absorbance" but reaches an absorbance of 205.0, which no instrument can measure; the column is probably counts or percent transmittance, and the transmittance derived from it is meaningless.',
  ]);
  expect(measurement.variables.a?.data).toStrictEqual(
    new Float64Array([7, 205]),
  );
});

test('a plausible absorbance spectrum passes untouched', () => {
  const measurement = spectrum({
    label: 'Absorbance',
    y: [0.12, 1.4],
    a: [0.12, 1.4],
    t: [75.858_075, 3.981_071_7],
  });
  expect(repairDerivedVariables([measurement])).toStrictEqual([]);
});

test('a spectrum without derived variables is neither repaired nor reported', () => {
  const measurement = spectrum({ label: 'Raman activity', y: [7, 21_726] });
  expect(repairDerivedVariables([measurement])).toStrictEqual([]);
  expect(measurement.variables.a).toBeUndefined();
});

test('every spectrum of a multi-block file is numbered in its own warning', () => {
  const warnings = repairDerivedVariables([
    spectrum({ y: [50], t: [5000], a: [-1.698_97] }),
    spectrum({ label: 'Absorbance', y: [9], a: [9], t: [0] }),
  ]);
  expect(warnings).toHaveLength(2);
  expect(warnings[0]).toContain('Spectrum 1 labels y as "Transmission"');
  expect(warnings[1]).toContain('Spectrum 2 labels y as "Absorbance"');
});

interface SpectrumParts {
  /** @default 'Transmission' */
  label?: string;
  y: number[];
  /** @default undefined */
  a?: number[];
  /** @default undefined */
  t?: number[];
}

/**
 * A detached measurement holding just the variables the repair pass reads.
 * @param parts - The y label and the y, a and t columns.
 * @returns The measurement, with `Float64Array` data as `detachMeasurement` leaves it.
 */
function spectrum(parts: SpectrumParts): MeasurementXY<Float64Array> {
  const { label = 'Transmission', y, a, t } = parts;
  const measurement: MeasurementXY<Float64Array> = {
    id: 'spectrum',
    variables: {
      x: {
        label: 'Wavenumber',
        units: 'cm-1',
        symbol: 'x',
        data: new Float64Array(y.length),
      },
      y: { label, units: '', symbol: 'y', data: new Float64Array(y) },
    },
  };
  if (a) {
    measurement.variables.a = {
      label: 'Absorbance',
      units: '',
      symbol: 'a',
      data: new Float64Array(a),
    };
  }
  if (t) {
    measurement.variables.t = {
      label: 'Transmittance',
      units: '%',
      symbol: 't',
      data: new Float64Array(t),
    };
  }
  return measurement;
}
