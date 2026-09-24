import { Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { CollectionEntry, MoleculeCollection } from '../../data/index.ts';
import {
  selectResult,
  series,
  setMolecule,
  toggleResultVisible,
} from '../../state/index.ts';

import { CollectionHeader } from './CollectionHeader.tsx';
import { EntryCard } from './EntryCard.tsx';
import { QueueProgress } from './QueueProgress.tsx';
import { ResultsSummary } from './ResultsSummary.tsx';
import type { EntryStatus } from './entryStatus.ts';
import { findEntryResult } from './entryStatus.ts';
import { COLLECTION_PROBES } from './keyBand.ts';
import type { QueueState } from './useCollectionQueue.ts';

interface CollectionDetailProps {
  collection: MoleculeCollection;
  queue: QueueState;
  onRunEntry: (entry: CollectionEntry) => void;
}

/**
 * Everything about one collection: what it teaches, its molecules, and the
 * trend its finished calculations spell out.
 * @param props - Component props.
 * @param props.collection - The open collection.
 * @param props.queue - The queue state, so the cards show what is in flight.
 * @param props.onRunEntry - Compute one entry on its own.
 * @returns The detail pane.
 */
export function CollectionDetail(props: CollectionDetailProps) {
  useSignals();
  const { collection, queue, onRunEntry } = props;
  const results = series.results.value;
  const failures = queue.collectionId === collection.id ? queue.failures : {};
  const probe = COLLECTION_PROBES[collection.id];

  return (
    <div style={detailStyle}>
      <CollectionHeader collection={collection} />
      <QueueProgress collection={collection} queue={queue} />

      <div style={gridStyle}>
        {collection.entries.map((entry) => {
          const stored = findEntryResult(results, collection.id, entry.id);
          return (
            <EntryCard
              key={entry.id}
              entry={entry}
              status={entryStatus(entry, queue, collection.id, stored !== null)}
              result={stored}
              failure={failures[entry.id] ?? null}
              probe={probe}
              onRun={() => onRunEntry(entry)}
              onInspect={() => {
                if (stored === null) return;
                selectResult(stored.id);
                setMolecule(stored.molecule);
              }}
              onToggleVisible={() => {
                if (stored !== null) toggleResultVisible(stored.id);
              }}
            />
          );
        })}
      </div>

      <h4 style={{ margin: '4px 0 0' }}>Trend across the set</h4>
      <ResultsSummary collection={collection} results={results} />

      <Callout compact icon="chart" intent="primary">
        Every finished calculation is on the shared chart. Open the Calculator
        page to see the collection overlaid, and the Spectra panel on the right
        to hide or remove a series.
      </Callout>
    </div>
  );
}

function entryStatus(
  entry: CollectionEntry,
  queue: QueueState,
  collectionId: string,
  computed: boolean,
): EntryStatus {
  if (queue.collectionId === collectionId) {
    if (queue.running && queue.currentEntryId === entry.id) return 'running';
    if (queue.running && !computed && queue.entryIds.includes(entry.id)) {
      return 'queued';
    }
    if (queue.failures[entry.id] !== undefined) return 'failed';
  }
  return computed ? 'done' : 'idle';
}

const detailStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 12,
  flex: '1 1 1px',
  minWidth: 0,
  overflow: 'auto',
} as const;

const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} as const;
