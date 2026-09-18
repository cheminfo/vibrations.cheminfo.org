import type { ConnectivityComparison } from 'xtb-wasm';
import { ramanSupport } from 'xtb-wasm';

import type { ConnectivitySource } from '../../state/index.ts';

/** One thing the user has to know before reading a Raman number. */
export interface Caveat {
  /** Stable React key. */
  id: string;
  intent: 'primary' | 'warning' | 'danger';
  title: string;
  text: string;
}

/** What the Raman caveats are computed from. */
export interface RamanCaveatOptions {
  /** Element symbols of the molecule that was computed. */
  elements: readonly string[];
  /** Which bond list the model used. */
  source: ConnectivitySource;
  /**
   * How the legacy distance rule and the molecular graph compare on this
   * molecule, or `null` when the comparison could not be made.
   * @default null
   */
  connectivity?: ConnectivityComparison | null;
}

/**
 * Everything that qualifies a Raman activity computed here, worst first.
 *
 * These are model limitations, not failures: the bond-polarizability model is
 * empirical and geometric, so its absolute intensities are indicative and its
 * refusals are hard. They are surfaced wherever Raman is shown rather than
 * folded into a footnote.
 * @param options - The molecule and the connectivity the model used.
 * @returns The caveats, most serious first.
 */
export function ramanCaveats(options: RamanCaveatOptions): Caveat[] {
  const { elements, source, connectivity = null } = options;
  const caveats: Caveat[] = [];

  const support = ramanSupport(elements);
  if (!support.supported) {
    caveats.push({
      id: 'unsupported-elements',
      intent: 'danger',
      title: 'No Raman activities for this molecule',
      text: `The Lippincott–Stutman tables cover thirty-six elements and do not include ${support.unsupported.join(', ')}. No activity is reported rather than one computed from a guessed parameter.`,
    });
  }

  if (source === 'distance') {
    caveats.push({
      id: 'legacy-connectivity',
      intent: 'warning',
      title: 'Legacy distance connectivity is in use',
      text: 'Bonds are taken from ASE’s rule d < 1.5·(rᵢ + rⱼ) rather than from the molecular graph. The rule counts close non-bonded contacts as bonds — all six Cl···Cl pairs of CCl₄ — so it is offered only for comparison with results computed under that rule.',
    });
  }

  if (connectivity !== null && !connectivity.agree) {
    caveats.push({
      id: 'connectivity-disagreement',
      intent: 'warning',
      title: 'The two bond lists disagree on this molecule',
      text: `The legacy distance rule invents ${connectivity.extraBonds.length} bond(s) the structure does not have and misses ${connectivity.missingBonds.length} it does. The two connectivity settings therefore give different Raman intensities here.`,
    });
  }

  caveats.push({
    id: 'model',
    intent: 'primary',
    title: 'Raman intensities come from an empirical model',
    text: 'Activities are the Placzek quantity over the Lippincott–Stutman bond-polarizability model: purely geometric, with no wavefunction behind it. Absolute intensities are typically tens of percent out and the model is qualitatively wrong for cumulated and triple bonds. Depolarization ratios inherit the same limit — a linear symmetric stretch such as the one in CO₂ comes out at exactly 1/3 in this model.',
  });

  return caveats;
}
