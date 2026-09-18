import { Callout } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import {
  activeMolecule,
  activeResult,
  preferences,
} from '../../state/index.ts';

import { ramanCaveats } from './ramanCaveats.ts';
import { useConnectivityComparison } from './useConnectivityComparison.ts';

/**
 * The caveats that qualify every Raman number this app produces, shown wherever
 * Raman is on screen rather than hidden in the background reading.
 * @returns One callout per caveat, most serious first.
 */
export function RamanNotes() {
  useSignals();
  const molecule = activeMolecule.value;
  const result = activeResult.value;
  const source = preferences.display.connectivity.value;
  const comparison = useConnectivityComparison(
    molecule,
    result?.geometry ?? null,
  );

  if (molecule === null) return null;
  const caveats = ramanCaveats({
    elements: molecule.elements,
    source,
    connectivity: comparison,
  });

  return (
    <>
      {caveats.map((caveat) => (
        <Callout
          key={caveat.id}
          intent={caveat.intent}
          compact
          title={caveat.title}
          style={calloutStyle}
        >
          {caveat.text}
        </Callout>
      ))}
    </>
  );
}

const calloutStyle = { margin: '0 8px 6px' } as const;
