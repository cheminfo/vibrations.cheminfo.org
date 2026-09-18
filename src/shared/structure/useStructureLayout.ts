import { useEffect, useState } from 'react';

import type { StructureLayout } from './structureLayout.ts';
import { structureLayout } from './structureLayout.ts';

/**
 * Lay a molfile out flat and read its bond table, once per molfile.
 *
 * openchemlib is loaded lazily, so this cannot be done while rendering; the
 * answer arrives a tick later and a superseded one is dropped.
 * @param molfile - The molecule's molfile, or `undefined` when it has none.
 * @returns The layout, or `null` while it is being built or when it failed.
 */
export function useStructureLayout(
  molfile: string | undefined,
): StructureLayout | null {
  const [layout, setLayout] = useState<Entry>(EMPTY);

  useEffect(() => {
    // A stale entry is never shown — the read below checks the molfile it was
    // built from — so there is nothing to clear when there is no molfile.
    if (molfile === undefined) return;
    let cancelled = false;
    void structureLayout(molfile).then(
      (built) => {
        if (!cancelled) setLayout({ molfile, layout: built });
      },
      () => {
        if (!cancelled) setLayout({ molfile, layout: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [molfile]);

  return layout.molfile === molfile ? layout.layout : null;
}

/** The layout together with the molfile it was built from. */
interface Entry {
  molfile: string | undefined;
  layout: StructureLayout | null;
}

const EMPTY: Entry = { molfile: undefined, layout: null };
