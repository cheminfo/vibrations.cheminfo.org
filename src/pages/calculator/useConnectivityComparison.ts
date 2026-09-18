import { useEffect, useState } from 'react';
import type { ConnectivityComparison, Geometry, Molecule } from 'xtb-wasm';

import { compareMoleculeConnectivity } from './connectivityCheck.ts';

/**
 * How the legacy distance rule and the molecule's own bond list compare.
 *
 * The comparison needs openchemlib, which is loaded lazily, so it arrives after
 * the first render and is `null` until it does — and stays `null` for a molecule
 * that carries no connectivity at all, such as one read from an XYZ file.
 * @param molecule - The molecule that was computed, or `null`.
 * @param geometry - The geometry the Hessian was built at, or `null`.
 * @returns The comparison, or `null` while it is unknown.
 */
export function useConnectivityComparison(
  molecule: Molecule | null,
  geometry: Geometry | null,
): ConnectivityComparison | null {
  const [comparison, setComparison] = useState<ConnectivityComparison | null>(
    null,
  );

  useEffect(() => {
    if (molecule === null || geometry === null) return;
    let cancelled = false;
    compareMoleculeConnectivity(molecule, geometry).then(
      (value) => {
        if (!cancelled) setComparison(value);
      },
      () => {
        if (!cancelled) setComparison(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [molecule, geometry]);

  return comparison;
}
