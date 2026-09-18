import type { MeasurementXY, MeasurementXYVariables } from 'cheminfo-types';

/** One variable of a spectrum exactly as a parser hands it over. */
export interface RawVariable {
  label: string;
  /** @default undefined */
  units?: string;
  /**
   * The values. Declared as `ArrayLike` because the parsers disagree: JCAMP
   * yields `number[]`, SPC `Float64Array` and WDF `Float32Array`.
   */
  data: ArrayLike<number>;
}

/**
 * A spectrum as it leaves a parser, before this module takes ownership of it.
 * Only `x`, `y`, `a` and `t` are described, which is the whole of what the IR
 * and Raman parsers produce and exactly what `SpectrumTrace` documents.
 */
export interface RawSpectrum {
  variables: {
    x: RawVariable;
    y: RawVariable;
    /** @default undefined */
    a?: RawVariable;
    /** @default undefined */
    t?: RawVariable;
  };
  /** @default undefined */
  title?: string;
  /** @default undefined */
  dataType?: string;
  /** @default undefined */
  meta?: Record<string, unknown>;
}

/** Overrides applied while detaching, for parsers that leave a field blank. */
export interface DetachOptions {
  /** @default the parser's own `dataType` */
  dataType?: string;
  /** @default the parser's own `title` */
  title?: string;
  /**
   * Units to give `x` when the parser left them undefined. JCAMP puts the unit
   * inside the label (`Wavenumber / cm-1`) and leaves `units` empty, so the
   * chart axis would otherwise have nothing to show.
   * @default undefined
   */
  xUnits?: string;
}

/**
 * Copy a parser's spectrum into a `MeasurementXY` this module owns.
 *
 * Two of the packages involved ship their own nested copy of
 * `common-spectrum`, so their `Analysis` classes are not interchangeable and no
 * `Analysis` instance may escape this module. Detaching at the parse boundary
 * is what enforces that: the result shares no memory with the parser, and every
 * variable's data is a `Float64Array` whatever the parser used.
 *
 * `x` always comes out ascending. Half the IR files in circulation are stored
 * high-wavenumber-first, and a descending axis silently breaks every
 * index-based window (`xGetFromToIndex`) and every line plot downstream.
 * @param spectrum - The parser's spectrum. Only `x`, `y`, `a` and `t` are carried over.
 * @param options - Fields to override on the way out.
 * @returns An owned measurement with a fresh id and an ascending `x`.
 */
export function detachMeasurement(
  spectrum: RawSpectrum,
  options: DetachOptions = {},
): MeasurementXY<Float64Array> {
  const {
    variables,
    title: parsedTitle,
    dataType: parsedDataType,
    meta,
  } = spectrum;
  const { x, y, a, t } = variables;
  const { title, dataType, xUnits } = options;
  const { data: xData, units: parsedXUnits } = x;
  const lastIndex = xData.length - 1;
  const reversed =
    lastIndex > 0 && (xData[0] as number) > (xData[lastIndex] as number);

  const detached: MeasurementXYVariables<Float64Array> = {
    x: {
      ...x,
      symbol: 'x',
      units: parsedXUnits || xUnits,
      data: copy(xData, reversed),
    },
    y: { ...y, symbol: 'y', data: copy(y.data, reversed) },
  };
  if (a) {
    detached.a = { ...a, symbol: 'a', data: copy(a.data, reversed) };
  }
  if (t) {
    detached.t = { ...t, symbol: 't', data: copy(t.data, reversed) };
  }

  return {
    id: crypto.randomUUID(),
    variables: detached,
    title: title ?? parsedTitle,
    dataType: dataType ?? parsedDataType,
    meta,
  };
}

/**
 * A copy of `data` as a `Float64Array`.
 * @param data - Values from any array-like the parsers use.
 * @returns A new `Float64Array` of the same length.
 */
export function toFloat64Array(data: ArrayLike<number>): Float64Array {
  const out = new Float64Array(data.length);
  out.set(data);
  return out;
}

function copy(data: ArrayLike<number>, reversed: boolean): Float64Array {
  if (!reversed) return toFloat64Array(data);
  const { length } = data;
  const out = new Float64Array(length);
  for (let index = 0; index < length; index++) {
    out[index] = data[length - 1 - index] as number;
  }
  return out;
}
