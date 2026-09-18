import { Classes, Tag } from '@blueprintjs/core';
import { useEffect, useLayoutEffect, useRef } from 'react';

import type { MoleculeCollection } from '../../data/index.ts';

interface CollectionListProps {
  collections: readonly MoleculeCollection[];
  selectedId: string;
  onSelect: (collection: MoleculeCollection) => void;
}

/**
 * The seven collections, one row each, with the arrow keys moving the
 * selection the way every other selectable list in the app does.
 * @param props - Component props.
 * @param props.collections - The collections to list, in teaching order.
 * @param props.selectedId - Id of the collection currently open.
 * @param props.onSelect - Called with the collection the user moved to.
 * @returns The list.
 */
export function CollectionList(props: CollectionListProps) {
  const { collections, selectedId, onSelect } = props;
  const listRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef(collections);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useLayoutEffect(() => {
    collectionsRef.current = collections;
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return;
      }
      const list = collectionsRef.current;
      if (list.length === 0) return;
      event.preventDefault();
      const current = list.findIndex(
        (collection) => collection.id === selectedIdRef.current,
      );
      const next =
        event.key === 'ArrowDown'
          ? Math.min(current + 1, list.length - 1)
          : Math.max(current - 1, 0);
      if (next !== current) {
        onSelectRef.current(list[next] as MoleculeCollection);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Molecule collections"
      tabIndex={0}
      style={listStyle}
    >
      {collections.map((collection) => {
        const selected = collection.id === selectedId;
        return (
          <div
            key={collection.id}
            role="option"
            aria-selected={selected}
            data-selected={selected ? 'true' : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(collection)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onSelect(collection);
            }}
            style={selected ? selectedRowStyle : rowStyle}
          >
            <span style={{ fontWeight: selected ? 600 : 400 }}>
              {collection.name}
            </span>
            <Tag minimal round>
              {collection.entries.length}
            </Tag>
          </div>
        );
      })}
      <div className={Classes.TEXT_MUTED} style={hintStyle}>
        Use ↑ and ↓ to move between collections.
      </div>
    </div>
  );
}

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: 220,
  flex: '0 0 auto',
  borderRight: '1px solid rgb(217 223 230)',
  overflow: 'auto',
  outline: 'none',
} as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
  padding: '6px 10px',
  cursor: 'pointer',
  borderLeft: '3px solid transparent',
} as const;

const selectedRowStyle = {
  ...rowStyle,
  borderLeft: '3px solid rgb(45 114 210)',
  background: 'rgb(237 242 250)',
} as const;

const hintStyle = { padding: '8px 10px', fontSize: 11 } as const;
