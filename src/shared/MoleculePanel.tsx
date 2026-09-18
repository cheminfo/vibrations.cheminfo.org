import { Callout, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';
import { MF } from 'react-mf';
import { Toolbar } from 'react-science/ui';
import { toXyz } from 'xtb-wasm';

import { clearMolecule, state } from '../state/index.ts';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from './panelStyles.ts';
import { ChargeControls } from './structure/ChargeControls.tsx';
import { MoleculeCandidates } from './structure/MoleculeCandidates.tsx';
import { MoleculeInput } from './structure/MoleculeInput.tsx';
import { StructureDepiction } from './structure/StructureDepiction.tsx';
import { StructureDrawer } from './structure/StructureDrawer.tsx';
import { moleculeGuards } from './structure/electrons.ts';
import { useMoleculeLoader } from './structure/useMoleculeLoader.ts';

/**
 * Molecule input: the drawing canvas, the text and file loaders, the structure
 * with the current mode marked on it, and what the next run will be given.
 * @returns The molecule panel.
 */
export function MoleculePanel(): ReactElement {
  useSignals();
  const loader = useMoleculeLoader();
  const [drawing, setDrawing] = useState(false);
  const molecule = state.data.molecule.value;
  const loaderWarnings = state.data.moleculeWarnings.value;
  const guards = moleculeGuards(molecule);

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Molecule actions">
          <Toolbar.Item
            icon="draw"
            tooltip={drawing ? 'Hide the drawing canvas' : 'Draw a structure'}
            aria-label="Draw a structure"
            active={drawing}
            onClick={() => setDrawing(!drawing)}
          />
          <Toolbar.Item
            icon="clipboard"
            tooltip="Copy the current geometry as XYZ"
            aria-label="Copy XYZ"
            disabled={molecule === null}
            onClick={() => {
              if (molecule !== null) {
                void navigator.clipboard.writeText(
                  toXyz(molecule, molecule.label),
                );
              }
            }}
          />
          <Toolbar.Item
            icon="trash"
            tooltip="Empty the editor"
            aria-label="Empty the editor"
            disabled={molecule === null}
            onClick={() => {
              clearMolecule();
              loader.dismiss();
            }}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        {molecule !== null && (
          <div style={identityStyle}>
            <b>{molecule.label}</b>
            <MF mf={molecule.formula} />
            <Tag minimal>{`${molecule.elements.length} atoms`}</Tag>
          </div>
        )}

        {guards.refusals.map((refusal) => (
          <Callout key={refusal} intent="danger" compact icon="ban-circle">
            {refusal}
          </Callout>
        ))}
        {guards.warnings.map((warning) => (
          <Callout key={warning} intent="warning" compact icon="time">
            {warning}
          </Callout>
        ))}

        <StructureDepiction />
        {molecule !== null && <ChargeControls molecule={molecule} />}

        {drawing && <StructureDrawer loader={loader} />}
        <MoleculeInput loader={loader} />

        {loader.error !== null && (
          <Callout intent="danger" compact>
            {loader.error}
          </Callout>
        )}
        {loaderWarnings.map((warning) => (
          <Callout key={warning} intent="warning" compact>
            {warning}
          </Callout>
        ))}

        {loader.candidates.length > 1 && (
          <MoleculeCandidates
            candidates={loader.candidates}
            onChoose={loader.choose}
          />
        )}
      </div>
    </div>
  );
}

const identityStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
} as const satisfies CSSProperties;
