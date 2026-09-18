import { Button, Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { Toolbar } from 'react-science/ui';

import type { CollectionEntry, MoleculeCollection } from '../../data/index.ts';
import { COLLECTIONS, findCollection } from '../../data/index.ts';
import {
  clearResults,
  clearRunError,
  preferences,
  run,
  series,
  setPage,
  startTour,
  view,
} from '../../state/index.ts';

import { CollectionDetail } from './CollectionDetail.tsx';
import { CollectionList } from './CollectionList.tsx';
import { TourDialog } from './TourDialog.tsx';
import { pendingEntries } from './entryStatus.ts';
import { useCollectionQueue } from './useCollectionQueue.ts';

/**
 * The curated collections: pick a set, compute all of it, and read the trend
 * its overlaid spectra spell out.
 *
 * This is what makes the app a teaching tool rather than a calculator — every
 * collection holds one structural variable and everything else fixed, so the
 * shift of a single band is the whole lesson.
 * @returns The page.
 */
export function CollectionsPage() {
  useSignals();
  const { queue, runCollection, runEntry, cancel } = useCollectionQueue();
  const collection =
    findCollection(view.param.value ?? '') ??
    (COLLECTIONS[0] as MoleculeCollection);
  const engineId = preferences.engine.primary.value;
  const error = run.errors.value[engineId];
  const missing = pendingEntries(
    collection.entries,
    series.results.value,
    collection.id,
  );

  function onRunEntry(entry: CollectionEntry) {
    runEntry(collection.id, entry);
  }

  return (
    <div style={pageStyle}>
      <Toolbar aria-label="Collection actions">
        <Toolbar.Item
          icon="play"
          tooltip={`Compute all ${collection.entries.length} molecules, replacing what is on the chart`}
          aria-label="Run this collection"
          disabled={queue.running}
          onClick={() => runCollection(collection)}
        />
        <Toolbar.Item
          icon="add"
          tooltip={
            missing.length === 0
              ? 'Every molecule of this collection is already computed'
              : `Compute the ${missing.length} molecules that have no spectrum yet, keeping the chart`
          }
          aria-label="Compute what is missing"
          disabled={queue.running || missing.length === 0}
          onClick={() => runCollection(collection, { fresh: false })}
        />
        <Toolbar.Item
          icon="stop"
          tooltip="Stop the queue, keeping every spectrum already computed"
          aria-label="Cancel"
          disabled={!queue.running}
          onClick={cancel}
        />
        <Toolbar.Item
          icon="trash"
          tooltip="Remove every computed spectrum from the chart"
          aria-label="Clear the chart"
          disabled={queue.running || series.results.value.length === 0}
          onClick={clearResults}
        />
        <Toolbar.Item
          icon="chart"
          tooltip="Open the Calculator page, where the collection is overlaid"
          aria-label="Show the spectra"
          onClick={() => setPage('calculator')}
        />
        <Toolbar.Item
          icon="help"
          tooltip="Guided tour"
          aria-label="Guided tour"
          onClick={startTour}
        />
      </Toolbar>

      {error !== undefined && (
        <Callout intent="danger" compact style={{ margin: 8 }}>
          <div style={errorRowStyle}>
            <span>{error}</span>
            <Button
              variant="minimal"
              size="small"
              icon="cross"
              aria-label="Dismiss"
              onClick={() => clearRunError(engineId)}
            />
          </div>
        </Callout>
      )}

      <div style={bodyStyle}>
        <CollectionList
          collections={COLLECTIONS}
          selectedId={collection.id}
          onSelect={(next) => setPage('collections', next.id)}
        />
        <CollectionDetail
          collection={collection}
          queue={queue}
          onRunEntry={onRunEntry}
        />
      </div>

      <TourDialog />
    </div>
  );
}

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
} as const;

const errorRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
} as const;

const bodyStyle = {
  display: 'flex',
  flex: '1 1 1px',
  minHeight: 0,
  minWidth: 0,
} as const;
