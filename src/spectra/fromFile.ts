import type { MeasurementXY } from 'cheminfo-types';

import type { SpectrumKind, SpectrumTrace } from '../types/trace.ts';

import { nextColor } from './palette.ts';
import type { ParsedSpectra } from './parsers.ts';
import {
  formatFromFileName,
  parseJcamp,
  parseSpc,
  parseWdf,
  parseXyText,
} from './parsers.ts';

/** Everything one dropped file produced. */
export interface LoadedSpectra {
  traces: SpectrumTrace[];
  /** Caveats the user should see: derived quantities skipped, maps expanded. */
  warnings: string[];
}

/** How a file is read and how its traces join a chart. */
export interface SpectraFromFileOptions {
  /**
   * Force the spectrum kind. Leave it out to take it from the file: a JCAMP's
   * `##DATA TYPE`, an SPC's axis labels, and always Raman for WDF.
   * @default inferred from the file
   */
  kind?: SpectrumKind;
  /**
   * Colours already drawn on the chart the traces are about to join, so the new
   * ones never repeat a colour that is in use.
   * @default []
   */
  usedColors?: readonly string[];
}

/**
 * Load an experimental IR or Raman file into chart-ready traces.
 *
 * Routing is by extension: `.jdx`/`.dx`/`.jcamp` to JCAMP-DX, `.spc` to
 * Thermo Galactic / Shimadzu SPC, `.wdf` to Renishaw WDF, and everything else
 * to the two-column text reader. IR and Raman take different readers within a
 * format, because the IR reader derives absorbance from `y` unconditionally and
 * would flatten a Raman count spectrum to zero transmittance.
 *
 * Files holding several spectra — a WDF map, a multi-block SPC — return one
 * trace per spectrum, the same way a multi-record SDF returns every record, and
 * a warning names the count.
 * @param file - The dropped file. Read as bytes, never as text, so the parsers can sniff the encoding themselves.
 * @param options - Forced kind and the colours already on the chart.
 * @returns The traces and the warnings that came with them.
 */
export async function spectraFromFile(
  file: File,
  options: SpectraFromFileOptions = {},
): Promise<LoadedSpectra> {
  const { kind, usedColors = [] } = options;
  const data = await file.arrayBuffer();
  const parsed = parseByFormat(data, file.name, kind);

  const used = [...usedColors];
  const traces: SpectrumTrace[] = [];
  const { measurements, kind: parsedKind, parser, warnings } = parsed;
  let index = 0;
  for (const measurement of measurements) {
    const color = nextColor(used);
    used.push(color);
    traces.push({
      id: crypto.randomUUID(),
      label: traceLabel(file.name, measurement, index, measurements.length),
      color,
      kind: parsedKind,
      origin: { kind: 'experimental', fileName: file.name, parser },
      measurement,
    });
    index++;
  }

  const notes = [...warnings];
  if (traces.length === 0) {
    notes.push(`No spectrum found in ${file.name}.`);
  }
  return { traces, warnings: notes };
}

function parseByFormat(
  data: ArrayBuffer,
  fileName: string,
  kind: SpectrumKind | undefined,
): ParsedSpectra {
  const format = formatFromFileName(fileName);
  if (format === 'jcamp') return parseJcamp(data, kind);
  if (format === 'spc') return parseSpc(data, kind);
  if (format === 'wdf') return parseWdf(data);
  return parseXyText(data, kind);
}

function traceLabel(
  fileName: string,
  measurement: MeasurementXY<Float64Array>,
  index: number,
  count: number,
): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const title = measurement.title?.trim();
  const name = title ? `${title} (${base})` : base;
  return count > 1 ? `${name} #${index + 1}` : name;
}
