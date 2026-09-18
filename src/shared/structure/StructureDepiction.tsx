import { Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';
import { Structure } from 'react-cheminfo/structure';

import {
  activeModes,
  activeMolecule,
  activeResult,
  selectMode,
  state,
  view,
} from '../../state/index.ts';
import { useElementSize } from '../useElementSize.ts';

import { modeForBond, modeHighlight } from './modeStructure.ts';
import { useStructureLayout } from './useStructureLayout.ts';

/**
 * The 2D depiction of the active molecule, marking what the current mode moves.
 *
 * Clicking a bond selects the mode that stretches it most, and clicking an atom
 * selects that atom. The picture is
 * drawn from the molecule's molfile, never its idCode: an idCode round-trip
 * reorders atoms, and every index here has to be the index the Hessian used.
 * @returns The depiction, or a note when there is nothing to draw.
 */
export function StructureDepiction(): ReactElement {
  useSignals();
  const editing = state.data.molecule.value;
  const molecule = activeMolecule.value ?? editing;
  const geometry = activeResult.value?.geometry ?? molecule;
  const modes = activeModes.value;
  const layout = useStructureLayout(molecule?.molfile);
  const [sizeRef, size] = useElementSize();

  const modeIndex = view.hoveredMode.value ?? view.selectedMode.value;
  const mode = modeIndex === null ? null : (modes[modeIndex] ?? null);
  const selectedAtom = view.selectedAtom.value;
  const hoveredAtom = view.hoveredAtom.value;
  const selectedBond = view.selectedBond.value;
  const hoveredBond = view.hoveredBond.value;

  const marked = useMemo(
    () =>
      mode === null || geometry === null || layout === null
        ? { atoms: [], bonds: [] }
        : modeHighlight(mode, geometry, layout.bonds),
    [mode, geometry, layout],
  );

  if (molecule === null) {
    return (
      <Callout compact icon="cube">
        Load or draw a molecule to see its structure.
      </Callout>
    );
  }
  if (molecule.molfile === undefined) {
    return (
      <Callout compact intent="warning" icon="cube">
        {`"${molecule.label}" came from a file with no connectivity, so it has no structure to draw.`}
      </Callout>
    );
  }

  const width = Math.max(MINIMUM_WIDTH, Math.round(size.width));
  return (
    <div ref={sizeRef} style={rootStyle}>
      {editing !== null && editing.id !== molecule.id && (
        <Callout compact intent="primary" icon="info-sign">
          {`This is the selected result — ${molecule.label}. The editor holds ${editing.label}.`}
        </Callout>
      )}
      <Structure
        molfile={layout?.molfile ?? molecule.molfile}
        width={width}
        height={Math.round(width * HEIGHT_RATIO)}
        atomHighlight={withExtra(marked.atoms, selectedAtom, hoveredAtom)}
        bondHighlight={withExtra(marked.bonds, selectedBond, hoveredBond)}
        onAtomClick={(atom: number) => {
          view.selectedAtom.value = selectedAtom === atom ? null : atom;
        }}
        onBondClick={(bond: number) => {
          view.selectedBond.value = selectedBond === bond ? null : bond;
          if (layout === null || geometry === null) return;
          selectMode(modeForBond(modes, geometry, layout.bonds, bond));
        }}
      />
    </div>
  );
}

/**
 * Add the pointed-at atom or bond to what the mode already marks.
 * @param base - Indices the mode moves.
 * @param selected - The selected index, or `null`.
 * @param hovered - The hovered index, or `null`.
 * @returns One array of indices, without duplicates.
 */
function withExtra(
  base: readonly number[],
  selected: number | null,
  hovered: number | null,
): number[] {
  const indices = [...base];
  if (selected !== null && !indices.includes(selected)) indices.push(selected);
  if (hovered !== null && !indices.includes(hovered)) indices.push(hovered);
  return indices;
}

/** Narrower than this and the atom labels collide. */
const MINIMUM_WIDTH = 180;
/** Structures are wider than they are tall far more often than not. */
const HEIGHT_RATIO = 0.7;

const rootStyle = { width: '100%' } as const satisfies CSSProperties;
