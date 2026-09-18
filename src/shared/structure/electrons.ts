import type { Molecule } from 'xtb-wasm';
import { elementSymbols } from 'xtb-wasm';

import { INTERACTIVE_ATOM_LIMIT } from '../../data/index.ts';

/**
 * The electron count a molecule is refused past. GFN2 scales steeply with the
 * basis, so the line is drawn here rather than letting the tab freeze on a
 * molecule it cannot finish.
 */
export const MAX_ELECTRONS = 300;

/** What the UI must say before a molecule is handed to an engine. */
export interface MoleculeGuards {
  /** Total electrons the molecule carries. */
  electrons: number;
  atoms: number;
  /** Reasons the molecule must not be run at all. */
  refusals: readonly string[];
  /** Reasons a run is allowed but will be slow. */
  warnings: readonly string[];
}

/**
 * Judge a molecule before a run starts: too many electrons is a refusal, more
 * atoms than the interactive limit is a warning.
 * @param molecule - The molecule about to be computed, or `null` for none.
 * @returns The counts plus what the user must be told.
 */
export function moleculeGuards(molecule: Molecule | null): MoleculeGuards {
  if (molecule === null) {
    return { electrons: 0, atoms: 0, refusals: [], warnings: [] };
  }
  const electrons = electronCount(molecule.elements, molecule.charge);
  const atoms = molecule.elements.length;
  const refusals: string[] = [];
  const warnings: string[] = [];
  if (electrons > MAX_ELECTRONS) {
    refusals.push(
      `${molecule.label} carries ${electrons} electrons; this build stops at ${MAX_ELECTRONS}`,
    );
  }
  if (atoms > INTERACTIVE_ATOM_LIMIT) {
    warnings.push(
      `${atoms} atoms is past the interactive limit of ${INTERACTIVE_ATOM_LIMIT}: the optimization and the Hessian will take tens of seconds`,
    );
  }
  return { electrons, atoms, refusals, warnings };
}

/**
 * Electrons in a neutral set of atoms, less the total charge.
 * @param elements - Element symbols, one per atom.
 * @param charge - Total molecular charge in units of e.
 * @returns The electron count.
 * @throws When an element symbol names no element.
 */
export function electronCount(
  elements: readonly string[],
  charge: number,
): number {
  let electrons = 0;
  for (const element of elements) {
    const atomicNumber = ATOMIC_NUMBERS.get(element);
    if (atomicNumber === undefined) {
      throw new Error(`"${element}" is not an element symbol`);
    }
    electrons += atomicNumber;
  }
  return electrons - charge;
}

const ATOMIC_NUMBERS = buildAtomicNumbers();

/**
 * Index the element table by symbol.
 * @returns A map from canonical element symbol to atomic number.
 */
function buildAtomicNumbers(): Map<string, number> {
  const symbols = elementSymbols();
  const numbers = new Map<string, number>();
  for (let index = 0; index < symbols.length; index++) {
    numbers.set(symbols[index] as string, index + 1);
  }
  return numbers;
}
