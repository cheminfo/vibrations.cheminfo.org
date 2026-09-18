import { expect, test } from 'vitest';

import { detachMeasurement, toFloat64Array } from '../measurement.ts';

test('a parser spectrum is copied into Float64Arrays that share no memory with it', () => {
  const y = [1, 2, 3];
  const detached = detachMeasurement({
    variables: {
      x: { label: 'Wavenumber', units: 'cm-1', data: [1000, 1100, 1200] },
      y: { label: 'Absorbance', data: y },
    },
    title: 'benzene',
    dataType: 'INFRARED SPECTRUM',
  });

  expect(detached.variables.x.data).toStrictEqual(
    new Float64Array([1000, 1100, 1200]),
  );
  expect(detached.variables.y.data).toStrictEqual(new Float64Array([1, 2, 3]));
  expect(detached.variables.y.symbol).toBe('y');
  expect(detached.title).toBe('benzene');
  expect(detached.dataType).toBe('INFRARED SPECTRUM');
  expect(detached.variables.a).toBeUndefined();
  expect(detached.variables.t).toBeUndefined();

  y[0] = 99;
  expect(detached.variables.y.data[0]).toBe(1);
});

test('a descending wavenumber axis comes out ascending, with every variable turned with it', () => {
  const detached = detachMeasurement({
    variables: {
      x: { label: 'Wavenumber', data: [4000, 3000, 2000, 1000] },
      y: { label: 'Absorbance', data: [0.1, 0.2, 0.3, 0.4] },
      a: { label: 'Absorbance', data: [0.1, 0.2, 0.3, 0.4] },
      t: { label: 'Transmittance', units: '%', data: [79.4, 63.1, 50.1, 39.8] },
    },
  });

  expect(detached.variables.x.data).toStrictEqual(
    new Float64Array([1000, 2000, 3000, 4000]),
  );
  expect(detached.variables.y.data).toStrictEqual(
    new Float64Array([0.4, 0.3, 0.2, 0.1]),
  );
  expect(detached.variables.a?.data).toStrictEqual(
    new Float64Array([0.4, 0.3, 0.2, 0.1]),
  );
  expect(detached.variables.t?.data).toStrictEqual(
    new Float64Array([39.8, 50.1, 63.1, 79.4]),
  );
  expect(detached.variables.a?.symbol).toBe('a');
  expect(detached.variables.t?.symbol).toBe('t');
});

test('missing x units are filled in and declared units are kept', () => {
  const withoutUnits = detachMeasurement(
    {
      variables: {
        x: { label: 'Wavenumber / cm-1', data: [1, 2] },
        y: { label: 'Intensity', data: [3, 4] },
      },
    },
    { xUnits: 'cm-1' },
  );
  expect(withoutUnits.variables.x.units).toBe('cm-1');

  const withUnits = detachMeasurement(
    {
      variables: {
        x: { label: 'Wavelength', units: 'nm', data: [1, 2] },
        y: { label: 'Intensity', data: [3, 4] },
      },
    },
    { xUnits: 'cm-1' },
  );
  expect(withUnits.variables.x.units).toBe('nm');
});

test('the title and data type can be overridden by the caller', () => {
  const detached = detachMeasurement(
    {
      variables: {
        x: { label: 'x', data: [1, 2] },
        y: { label: 'y', data: [3, 4] },
      },
      title: 'from the file',
      dataType: 'Raman',
    },
    { title: 'adamantane', dataType: 'RAMAN SPECTRUM' },
  );
  expect(detached.title).toBe('adamantane');
  expect(detached.dataType).toBe('RAMAN SPECTRUM');
});

test('a single-point spectrum is not mistaken for a descending axis', () => {
  const detached = detachMeasurement({
    variables: {
      x: { label: 'x', data: [1700] },
      y: { label: 'y', data: [42] },
    },
  });
  expect(detached.variables.x.data).toStrictEqual(new Float64Array([1700]));
  expect(detached.variables.y.data).toStrictEqual(new Float64Array([42]));
});

test('every detached measurement gets its own id', () => {
  const spectrum = {
    variables: {
      x: { label: 'x', data: [1, 2] },
      y: { label: 'y', data: [3, 4] },
    },
  };
  const first = detachMeasurement(spectrum);
  const second = detachMeasurement(spectrum);
  expect(first.id).toHaveLength(36);
  expect(first.id).not.toBe(second.id);
});

test('toFloat64Array widens a Float32Array without changing its values', () => {
  expect(toFloat64Array(new Float32Array([1.5, 2.25]))).toStrictEqual(
    new Float64Array([1.5, 2.25]),
  );
});
