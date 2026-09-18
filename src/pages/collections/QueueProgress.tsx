import { Callout, Classes, ProgressBar } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { MoleculeCollection } from '../../data/index.ts';
import { preferences, run } from '../../state/index.ts';

import type { QueueState } from './useCollectionQueue.ts';

interface QueueProgressProps {
  collection: MoleculeCollection;
  queue: QueueState;
}

/**
 * How far the queue has got, across the set and inside the molecule in flight.
 * @param props - Component props.
 * @param props.collection - The open collection, for the entry names.
 * @param props.queue - The queue state.
 * @returns The progress block, or nothing when this collection is not running.
 */
export function QueueProgress(props: QueueProgressProps) {
  useSignals();
  const { collection, queue } = props;
  if (!queue.running || queue.collectionId !== collection.id) return null;

  const status = run.active.value[preferences.engine.primary.value];
  const current = collection.entries.find(
    (entry) => entry.id === queue.currentEntryId,
  );
  const inside = status?.progress?.fraction ?? 0;
  const fraction =
    queue.total === 0 ? 0 : (queue.completed + inside) / queue.total;

  return (
    <Callout intent="primary" compact icon="refresh">
      <div style={{ marginBottom: 4 }}>
        Computing {Math.min(queue.completed + 1, queue.total)} of {queue.total}
        {current === undefined ? '' : ` — ${current.name}`}
      </div>
      <ProgressBar intent="primary" value={fraction} stripes={false} />
      <span className={Classes.TEXT_MUTED} style={{ fontSize: 11 }}>
        {status?.progress?.message ?? 'Building the molecule…'}
      </span>
    </Callout>
  );
}
