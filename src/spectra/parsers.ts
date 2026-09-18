import type { MeasurementXY, MeasurementXYVariables } from 'cheminfo-types';
import { fromJcamp, fromSPC, fromText } from 'ir-spectrum';
import { fromWDF } from 'raman-spectrum';
import { parse as parseSpcFile } from 'spc-parser';

import type { SpectrumKind, TraceOrigin } from '../types/trace.ts';

import { repairDerivedVariables } from './derived.ts';
import { detachMeasurement } from './measurement.ts';

/** Which reader a file goes through, decided by its extension. */
export type SpectrumFormat = 'jcamp' | 'spc' | 'text' | 'wdf';

/** The package credited on the trace, as `TraceOrigin` spells the names. */
export type SpectrumParserName = Extract<
  TraceOrigin,
  { kind: 'experimental' }
>['parser'];

/** Everything one file yielded, already detached from its parser. */
export interface ParsedSpectra {
  kind: SpectrumKind;
  parser: SpectrumParserName;
  /** One entry per spectrum in the file; a WDF map has one per map point. */
  measurements: Array<MeasurementXY<Float64Array>>;
  warnings: string[];
}

/** Extensions routed to each reader, lower case and without the dot. */
const FORMAT_BY_EXTENSION = new Map<string, SpectrumFormat>([
  ['jdx', 'jcamp'],
  ['dx', 'jcamp'],
  ['jcamp', 'jcamp'],
  ['spc', 'spc'],
  ['wdf', 'wdf'],
  ['txt', 'text'],
  ['csv', 'text'],
  ['tsv', 'text'],
  ['dat', 'text'],
  ['asc', 'text'],
]);

/**
 * The reader a file name routes to, `'text'` for anything unrecognised.
 * @param fileName - The file name, with or without a path.
 * @returns The format to parse it as.
 */
export function formatFromFileName(fileName: string): SpectrumFormat {
  const dot = fileName.lastIndexOf('.');
  if (dot === -1) return 'text';
  const extension = fileName.slice(dot + 1).toLowerCase();
  return FORMAT_BY_EXTENSION.get(extension) ?? 'text';
}

/**
 * Parse a JCAMP-DX file.
 *
 * The file is read twice on purpose. `ir-spectrum`'s absorbance callback
 * applies Beer–Lambert to whatever `y` holds, so on a Raman spectrum a 21726
 * count band becomes `t = 10^-21726 = 0`; the file's own `##DATA TYPE` is the
 * only reliable discriminator, and it is not known until after a parse. The
 * first pass therefore runs with an identity callback purely to read the data
 * type, and only an IR file is parsed again with the callback that derives
 * `a` and `t`.
 * @param data - The raw file bytes.
 * @param kind - Force the spectrum kind instead of taking it from `##DATA TYPE`.
 * @returns The detached spectra and any caveats found.
 */
export function parseJcamp(
  data: ArrayBuffer,
  kind?: SpectrumKind,
): ParsedSpectra {
  const probed = fromJcamp(data, { spectrumCallback: identity });
  const resolved = kind ?? kindFromSpectra(probed.spectra);

  const analysis = resolved === 'raman' ? probed : fromJcamp(data);
  const measurements = detachAll(analysis.spectra, 'cm-1');
  return {
    kind: resolved,
    parser: 'ir-spectrum',
    measurements,
    warnings: repairDerivedVariables(measurements),
  };
}

/**
 * Parse a Thermo Galactic / Shimadzu SPC file.
 *
 * `ir-spectrum`'s `fromSPC` hard-codes `dataType: 'IR SPECTRUM'` and always
 * runs the absorbance callback, so a Raman SPC cannot go through it. Raman
 * files are read with `spc-parser` directly and keep only `x` and `y`.
 * @param data - The raw file bytes.
 * @param kind - Force the spectrum kind instead of taking it from the x-axis label.
 * @returns The detached spectra and any caveats found.
 */
export function parseSpc(
  data: ArrayBuffer,
  kind?: SpectrumKind,
): ParsedSpectra {
  const probed = parseSpcFile(data);
  const resolved = kind ?? kindFromSpectra(probed.spectra);

  if (resolved === 'raman') {
    return {
      kind: resolved,
      parser: 'spc-parser',
      measurements: detachAll(probed.spectra, 'cm-1'),
      warnings: [],
    };
  }

  const analysis = fromSPC(data);
  const measurements = detachAll(analysis.spectra, 'cm-1');
  return {
    kind: resolved,
    parser: 'ir-spectrum',
    measurements,
    warnings: repairDerivedVariables(measurements),
  };
}

/**
 * Parse a Renishaw WDF file, always as Raman.
 *
 * A mapping measurement holds one spectrum per map point, so every point is
 * surfaced and the caller picks; the WDF test fixture is a 6×6 map and yields
 * 36 spectra.
 * @param data - The raw file bytes.
 * @returns The detached spectra and a note when the file is a map.
 */
export function parseWdf(data: ArrayBuffer): ParsedSpectra {
  const { spectra } = fromWDF(data);
  const warnings =
    spectra.length > 1
      ? [`WDF map with ${spectra.length} points; every point is loaded.`]
      : [];
  return {
    kind: 'raman',
    parser: 'raman-spectrum',
    measurements: detachAll(spectra, 'cm-1'),
    warnings,
  };
}

/**
 * Parse a two-column text or CSV file through `xy-parser`.
 *
 * No absorbance or transmittance is derived: a bare number column declares
 * neither a unit nor whether it is absorbance, transmittance or transmittance
 * in percent, and guessing is how a spectrum ends up plotted upside down.
 * `normalizeTraces` falls back to `y` for exactly this case.
 * @param data - The raw file bytes.
 * @param kind - The spectrum kind; a text file carries nothing to infer it from.
 * @returns The detached spectrum and the note that `a`/`t` are absent.
 */
export function parseXyText(
  data: ArrayBuffer,
  kind: SpectrumKind = 'ir-absorbance',
): ParsedSpectra {
  const analysis = fromText(data);
  return {
    kind,
    parser: 'xy-parser',
    measurements: detachAll(analysis.spectra, 'cm-1'),
    warnings: [
      'A text file declares no units, so absorbance and transmittance were not derived; only the raw y values are available.',
    ],
  };
}

function identity(variables: MeasurementXYVariables): MeasurementXYVariables {
  return variables;
}

function detachAll(
  spectra: readonly MeasurementXY[],
  xUnits: string,
): Array<MeasurementXY<Float64Array>> {
  const detached: Array<MeasurementXY<Float64Array>> = [];
  for (const spectrum of spectra) {
    detached.push(detachMeasurement(spectrum, { xUnits }));
  }
  return detached;
}

function kindFromSpectra(spectra: readonly MeasurementXY[]): SpectrumKind {
  const first = spectra[0];
  if (!first) return 'ir-absorbance';
  const haystack = `${first.dataType ?? ''} ${first.variables.x.label} ${first.variables.y.label}`;
  if (/raman/i.test(haystack)) return 'raman';
  return /trans/i.test(first.variables.y.label)
    ? 'ir-transmittance'
    : 'ir-absorbance';
}
