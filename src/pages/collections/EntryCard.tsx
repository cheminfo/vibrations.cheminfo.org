import { Button, Classes, Tag, Tooltip } from '@blueprintjs/core';
import { Structure } from 'react-cheminfo/structure';
import { ClickToCopy } from 'react-cheminfo/ui';
import { MF } from 'react-mf';

import type { CollectionEntry } from '../../data/index.ts';
import { INTERACTIVE_ATOM_LIMIT, isExpensiveEntry } from '../../data/index.ts';
import type { ResultEntry } from '../../state/index.ts';

import { estimateSeconds, formatDuration } from './cost.ts';
import type { EntryStatus } from './entryStatus.ts';
import type { BandProbe } from './keyBand.ts';
import { strongestBand } from './keyBand.ts';

interface EntryCardProps {
  entry: CollectionEntry;
  status: EntryStatus;
  /** The finished calculation for this entry, when the history holds one. */
  result: ResultEntry | null;
  /** Why this entry did not produce a result, when it failed. */
  failure: string | null;
  /**
   * The band this collection is read on, or `undefined` for a collection that
   * probes no particular band and so shows none on its cards.
   */
  probe: BandProbe | undefined;
  onRun: () => void;
  onInspect: () => void;
  onToggleVisible: () => void;
}

/**
 * One molecule of a collection: what it is, what it costs, and what its
 * calculation produced.
 * @param props - Component props.
 * @param props.entry - The collection entry.
 * @param props.status - How far this entry has got.
 * @param props.result - Its stored calculation, or `null`.
 * @param props.failure - Its failure message, or `null`.
 * @param props.probe - The collection's probe band, or `undefined`.
 * @param props.onRun - Compute this one molecule.
 * @param props.onInspect - Make it the active molecule.
 * @param props.onToggleVisible - Show or hide its spectrum.
 * @returns The card.
 */
export function EntryCard(props: EntryCardProps) {
  const {
    entry,
    status,
    result,
    failure,
    probe,
    onRun,
    onInspect,
    onToggleVisible,
  } = props;
  const band =
    result === null || probe === undefined
      ? null
      : strongestBand(result.result.modes, probe);

  return (
    <div style={status === 'running' ? runningCardStyle : cardStyle}>
      <ClickToCopy
        as="div"
        value={entry.smiles}
        label="SMILES"
        style={depictionStyle}
      >
        <Structure idCode={entry.idCode} width={150} height={100} />
      </ClickToCopy>

      <div style={titleStyle}>
        {result !== null && (
          <span style={{ ...swatchStyle, background: result.color }} />
        )}
        <ClickToCopy value={entry.name} label="name">
          <span style={{ fontWeight: 600 }}>{entry.name}</span>
        </ClickToCopy>
      </div>

      <div className={Classes.TEXT_MUTED} style={metaStyle}>
        <ClickToCopy value={entry.formula} label="molecular formula">
          <MF mf={entry.formula} />
        </ClickToCopy>{' '}
        · {entry.atoms} atoms · {formatDuration(estimateSeconds(entry.atoms))}
      </div>

      <div style={tagRowStyle}>
        {isExpensiveEntry(entry) && (
          <Tooltip
            content={`Past the ${INTERACTIVE_ATOM_LIMIT}-atom interactive limit — this one takes a while.`}
          >
            <Tag minimal intent="warning" icon="time">
              slow
            </Tag>
          </Tooltip>
        )}
        {entry.experimentalWavenumber !== undefined && (
          <Tag minimal intent="primary">
            exp. {entry.experimentalWavenumber} cm⁻¹
          </Tag>
        )}
        {status === 'running' && (
          <Tag minimal intent="primary" icon="refresh">
            computing
          </Tag>
        )}
        {status === 'queued' && (
          <Tag minimal intent="primary" icon="time">
            queued
          </Tag>
        )}
        {band !== null && probe !== undefined && (
          <ClickToCopy
            value={band.wavenumber.toFixed(0)}
            label={`${probe.label} wavenumber in cm⁻¹`}
          >
            <Tag minimal intent="success">
              {band.wavenumber.toFixed(0)} cm⁻¹
            </Tag>
          </ClickToCopy>
        )}
        {failure !== null && (
          <Tooltip content={failure}>
            <Tag minimal intent="danger" icon="error">
              failed
            </Tag>
          </Tooltip>
        )}
      </div>

      <div style={buttonRowStyle}>
        <Button
          variant="minimal"
          size="small"
          icon="play"
          text={result === null ? 'Compute' : 'Recompute'}
          disabled={status === 'running' || status === 'queued'}
          onClick={onRun}
        />
        <Button
          variant="minimal"
          size="small"
          icon="cube"
          text="Inspect"
          disabled={result === null}
          onClick={onInspect}
        />
        <Button
          variant="minimal"
          size="small"
          icon={result?.visible === false ? 'eye-off' : 'eye-open'}
          aria-label="Show or hide this spectrum"
          disabled={result === null}
          onClick={onToggleVisible}
        />
      </div>
    </div>
  );
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 8,
  border: '1px solid rgb(217 223 230)',
  borderRadius: 3,
  width: 190,
} as const;

const runningCardStyle = {
  ...cardStyle,
  border: '1px solid var(--accent)',
} as const;

const depictionStyle = {
  display: 'flex',
  justifyContent: 'center',
  minHeight: 100,
} as const;

const titleStyle = { display: 'flex', alignItems: 'center', gap: 6 } as const;
const swatchStyle = {
  width: 10,
  height: 10,
  borderRadius: 2,
  flex: '0 0 auto',
} as const;
const metaStyle = { fontSize: 11 } as const;
const tagRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 4 } as const;
const buttonRowStyle = { display: 'flex', gap: 2, marginTop: 2 } as const;
