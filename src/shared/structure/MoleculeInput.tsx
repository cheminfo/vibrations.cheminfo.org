import { Button, TextArea } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';
import { DropZone } from 'react-science/ui';

import type { MoleculeLoader } from './useMoleculeLoader.ts';

/** What {@link MoleculeInput} sends its molecules to. */
export interface MoleculeInputProps {
  loader: MoleculeLoader;
}

/**
 * Text and file input: a box that takes a SMILES or a pasted molfile, SDF, XYZ
 * or PDB, and a drop target for the same formats as files. The format is
 * detected, so there is nothing to pick.
 * @param props - The loader the input feeds.
 * @returns The text box and the drop zone.
 */
export function MoleculeInput(props: MoleculeInputProps): ReactElement {
  const { loader } = props;
  const [text, setText] = useState('');
  const trimmed = text.trim();

  function submit() {
    if (trimmed === '') return;
    loader.loadText(trimmed);
  }

  return (
    <div style={rootStyle}>
      <TextArea
        fill
        rows={2}
        value={text}
        placeholder="SMILES, or paste a molfile, SDF, XYZ or PDB"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        aria-label="Molecule text"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !text.includes('\n')
          ) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <div style={actionsStyle}>
        <Button
          intent="primary"
          icon="arrow-right"
          loading={loader.loading}
          disabled={trimmed === ''}
          onClick={submit}
        >
          Load
        </Button>
        <Button
          variant="minimal"
          icon="cross"
          disabled={text === ''}
          onClick={() => setText('')}
        >
          Clear
        </Button>
      </div>

      <DropZone
        onDrop={(files: File[]) => loader.loadFiles(files)}
        emptyIcon="import"
        emptyTitle="Drop molecule files"
        emptyDescription="molfile, SDF, XYZ or PDB"
        emptyButtonText="Choose files"
      />
    </div>
  );
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const actionsStyle = {
  display: 'flex',
  gap: 6,
} as const satisfies CSSProperties;
