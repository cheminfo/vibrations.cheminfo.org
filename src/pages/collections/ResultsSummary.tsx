import { Callout, Classes } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { ClickToCopy } from 'react-cheminfo/ui';

import type { CollectionEntry, MoleculeCollection } from '../../data/index.ts';
import type { ResultEntry } from '../../state/index.ts';

import { findEntryResult } from './entryStatus.ts';
import type { BandProbe } from './keyBand.ts';
import {
  COLLECTION_PROBES,
  countInfraredBands,
  strongestBand,
} from './keyBand.ts';

interface ResultsSummaryProps {
  collection: MoleculeCollection;
  results: readonly ResultEntry[];
}

/**
 * The trend a collection teaches, as one row per molecule.
 *
 * Without the probe band written next to every entry the overlaid spectra are
 * a picture; with it the shift the collection was built to show is a number
 * you can read down a column.
 * @param props - Component props.
 * @param props.collection - The open collection.
 * @param props.results - The calculation history.
 * @returns The table, or a hint when nothing has been computed yet.
 */
export function ResultsSummary(props: ResultsSummaryProps) {
  const { collection, results } = props;
  const probe = COLLECTION_PROBES[collection.id];
  const rows = summaryRows(collection, results, probe);
  if (rows.length === 0) {
    return (
      <Callout intent="primary" compact icon="info-sign">
        Run the collection to fill this table.
      </Callout>
    );
  }

  const first = rows[0] as SummaryRow;
  return (
    <table
      className={`${Classes.HTML_TABLE} ${Classes.HTML_TABLE_STRIPED}`}
      style={{ width: '100%' }}
    >
      <thead>
        <tr>
          <th>Molecule</th>
          {probe === undefined ? (
            <>
              <th>IR bands</th>
              <th>Strongest band</th>
            </>
          ) : (
            <>
              <th>{probe.label}</th>
              <th>IR intensity</th>
              <th>Shift vs. {first.name}</th>
              <th>Experiment</th>
              <th>Computed − experiment</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            {probe === undefined ? (
              <>
                <td>{row.bands}</td>
                <CopyCell
                  value={fixed(row.wavenumber, 0)}
                  label="strongest band in cm⁻¹"
                >
                  {format(row.wavenumber)}
                </CopyCell>
              </>
            ) : (
              <>
                <CopyCell
                  value={fixed(row.wavenumber, 0)}
                  label={`${probe.label} in cm⁻¹`}
                >
                  {format(row.wavenumber)}
                </CopyCell>
                <CopyCell
                  value={fixed(row.intensity, 1)}
                  label="IR intensity in km/mol"
                >
                  {row.intensity === null ? '—' : row.intensity.toFixed(1)}
                </CopyCell>
                <CopyCell
                  value={rounded(shift(row, first))}
                  label={`shift vs. ${first.name} in cm⁻¹`}
                >
                  {signed(shift(row, first))}
                </CopyCell>
                <CopyCell
                  value={
                    row.experimental === undefined
                      ? ''
                      : String(row.experimental)
                  }
                  label="experimental wavenumber in cm⁻¹"
                >
                  {row.experimental === undefined ? '—' : row.experimental}
                </CopyCell>
                <CopyCell
                  value={rounded(row.deviation)}
                  label="computed − experiment in cm⁻¹"
                  className={row.deviation === null ? Classes.TEXT_MUTED : ''}
                >
                  {signed(row.deviation)}
                </CopyCell>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A cell whose number a reader takes away, without the unit the cell shows.
 * @param props - Component props.
 * @param props.value - What goes on the clipboard, or `''` when the cell is a dash.
 * @param props.label - What the value is, named in the hover title.
 * @param props.className - Class the cell carries, in addition to its own.
 * @param props.children - What the cell shows, unit and sign included.
 * @returns The cell.
 */
function CopyCell(props: {
  value: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ClickToCopy
      as="td"
      value={props.value}
      label={props.label}
      disabled={props.value === ''}
      className={props.className}
    >
      {props.children}
    </ClickToCopy>
  );
}

interface SummaryRow {
  id: string;
  name: string;
  /** Probe band position in cm⁻¹, or `null` when no mode fell in the window. */
  wavenumber: number | null;
  /** IR intensity of the probe band in km/mol, or `null`. */
  intensity: number | null;
  /** How many distinct IR bands the spectrum shows. */
  bands: number;
  experimental: number | undefined;
  /** Computed minus measured, in cm⁻¹, or `null` without a measured value. */
  deviation: number | null;
}

function summaryRows(
  collection: MoleculeCollection,
  results: readonly ResultEntry[],
  probe: BandProbe | undefined,
): SummaryRow[] {
  const rows: SummaryRow[] = [];
  for (const entry of collection.entries) {
    const stored = findEntryResult(results, collection.id, entry.id);
    if (stored === null) continue;
    rows.push(summaryRow(entry, stored, probe));
  }
  return rows;
}

function summaryRow(
  entry: CollectionEntry,
  stored: ResultEntry,
  probe: BandProbe | undefined,
): SummaryRow {
  const { modes } = stored.result;
  const band = probe === undefined ? null : strongestBand(modes, probe);
  const wavenumber = band?.wavenumber ?? null;
  const experimental = entry.experimentalWavenumber;
  return {
    id: entry.id,
    name: entry.name,
    wavenumber,
    intensity: band?.irIntensity ?? null,
    bands: countInfraredBands(modes),
    experimental,
    deviation:
      wavenumber === null || experimental === undefined
        ? null
        : wavenumber - experimental,
  };
}

function shift(row: SummaryRow, first: SummaryRow): number | null {
  if (row.wavenumber === null || first.wavenumber === null) return null;
  return row.wavenumber - first.wavenumber;
}

function format(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(0)} cm⁻¹`;
}

/** The number on its own, as a reader would paste it. */
function fixed(value: number | null, digits: number): string {
  return value === null ? '' : value.toFixed(digits);
}

/** A difference on its own, rounded the way {@link signed} rounds it. */
function rounded(value: number | null): string {
  return value === null ? '' : String(Math.round(value));
}

function signed(value: number | null): string {
  if (value === null) return '—';
  const whole = Math.round(value);
  return `${whole > 0 ? '+' : ''}${whole} cm⁻¹`;
}
