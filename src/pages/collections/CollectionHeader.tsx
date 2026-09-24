import { Callout, Classes, Tag } from '@blueprintjs/core';

import type { MoleculeCollection } from '../../data/index.ts';
import {
  COLLECTION_THEORY,
  INTERACTIVE_ATOM_LIMIT,
  isExpensiveEntry,
} from '../../data/index.ts';

import { estimateQueueSeconds, formatDuration } from './cost.ts';

interface CollectionHeaderProps {
  collection: MoleculeCollection;
}

/**
 * What a collection is, what it costs to run, and what it is meant to teach.
 *
 * The teaching paragraphs are the site's own prose and a student quotes them,
 * so they carry `text-selectable`; the title row, the tags and the estimate
 * callout are chrome and stay unselectable.
 * @param props - Component props.
 * @param props.collection - The open collection.
 * @returns The header block.
 */
export function CollectionHeader(props: CollectionHeaderProps) {
  const { collection } = props;
  const { entries, explanation, id, name } = collection;
  const expensive = entries.filter(isExpensiveEntry);
  const largest = largestAtomCount(entries);
  const theory = COLLECTION_THEORY[id];

  return (
    <div style={headerStyle}>
      <div style={titleRowStyle}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        <Tag minimal round>
          {entries.length} molecules
        </Tag>
        <Tag minimal round>
          up to {largest} atoms
        </Tag>
        <Tag minimal intent="primary" round icon="time">
          ≈ {formatDuration(estimateQueueSeconds(entries))} for the set
        </Tag>
      </div>

      <Callout intent={expensive.length > 0 ? 'warning' : 'primary'} compact>
        The whole set is computed in this browser tab, one molecule after
        another, and the estimate above is an order of magnitude rather than a
        promise — it scales as the cube of the atom count and your machine sets
        the constant.
        {expensive.length > 0 && (
          <>
            {' '}
            {expensive.length === 1
              ? 'One molecule is'
              : `${expensive.length} molecules are`}{' '}
            past the {INTERACTIVE_ATOM_LIMIT}-atom interactive limit:{' '}
            {expensive.map((entry) => entry.name).join(', ')}.
          </>
        )}
      </Callout>

      {paragraphs(explanation).map((paragraph) => (
        <p key={paragraph} className="text-selectable" style={paragraphStyle}>
          {paragraph}
        </p>
      ))}

      {theory !== undefined && (
        <p
          className={`${Classes.TEXT_MUTED} text-selectable`}
          style={paragraphStyle}
        >
          {theory}
        </p>
      )}
    </div>
  );
}

function largestAtomCount(entries: MoleculeCollection['entries']): number {
  let largest = 0;
  for (const entry of entries) {
    if (entry.atoms > largest) largest = entry.atoms;
  }
  return largest;
}

function paragraphs(text: string): string[] {
  const parts: string[] = [];
  for (const part of text.split('\n')) {
    const trimmed = part.trim();
    if (trimmed.length > 0) parts.push(trimmed);
  }
  return parts;
}

const headerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const;

const titleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 6,
} as const;

const paragraphStyle = { margin: 0, maxWidth: '72ch' } as const;
