import { Button, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { MF } from 'react-mf';
import type { Molecule } from 'xtb-wasm';

import { state } from '../../state/index.ts';

/** What {@link MoleculeCandidates} offers. */
export interface MoleculeCandidatesProps {
  /** Every molecule the last file yielded. */
  candidates: readonly Molecule[];
  /** Make one of them the molecule in the editor. */
  onChoose: (molecule: Molecule) => void;
}

/**
 * The records of a multi-molecule file, so a two-hundred-record SDF does not
 * silently become its first entry. Arrow keys walk the list from whichever
 * entry has focus, and the entry in the editor is marked.
 * @param props - The candidates and where a choice goes.
 * @returns The picker.
 */
export function MoleculeCandidates(
  props: MoleculeCandidatesProps,
): ReactElement {
  useSignals();
  const { candidates, onChoose } = props;
  const currentId = state.data.molecule.value?.id ?? null;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    let current = -1;
    for (let index = 0; index < candidates.length; index++) {
      if ((candidates[index] as Molecule).id === currentId) current = index;
    }
    const next =
      event.key === 'ArrowDown'
        ? Math.min(current + 1, candidates.length - 1)
        : Math.max(current - 1, 0);
    const chosen = candidates[next];
    if (chosen !== undefined && next !== current) onChoose(chosen);
  }

  return (
    <div style={rootStyle}>
      <h6
        style={headingStyle}
      >{`${candidates.length} records in that file`}</h6>
      <div style={listStyle}>
        {candidates.map((candidate) => (
          <Button
            key={candidate.id}
            variant="minimal"
            alignText="start"
            active={candidate.id === currentId}
            data-selected={candidate.id === currentId ? 'true' : undefined}
            onClick={() => onChoose(candidate)}
            onKeyDown={handleKeyDown}
          >
            <span style={rowStyle}>
              <span style={labelStyle}>{candidate.label}</span>
              <MF mf={candidate.formula} />
              <Tag minimal>{candidate.elements.length}</Tag>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const satisfies CSSProperties;

const headingStyle = { margin: 0 } as const satisfies CSSProperties;

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: 180,
  overflow: 'auto',
} as const satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
} as const satisfies CSSProperties;

const labelStyle = { flex: 1 } as const satisfies CSSProperties;
