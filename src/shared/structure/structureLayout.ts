import { getOcl } from 'xtb-wasm';

/** The two atoms a bond joins, as 0-based indices into the molecule's atoms. */
export type BondPair = readonly [number, number];

/** A structure laid out flat, with the bond table that goes with the drawing. */
export interface StructureLayout {
  /**
   * A molfile carrying invented 2D coordinates. A geometry optimizer's molfile
   * projects into an unreadable tangle, and inventing a layout keeps the atom
   * and bond order of the file it came from, which is what every highlight and
   * every click index into.
   */
  molfile: string;
  /** One entry per bond, in the drawing's bond order. */
  bonds: readonly BondPair[];
  /** Element symbols in the drawing's atom order, to check against the geometry. */
  elements: readonly string[];
}

/**
 * Lay a structure out for the depiction and read its bond table.
 *
 * Both come from one openchemlib parse of the same molfile, so a bond index the
 * depiction reports back on a click indexes this table, and atom `i` here is
 * atom `i` of the geometry the Hessian used.
 * @param molfile - The molecule's molfile, atom-order authoritative.
 * @returns The flat molfile, its bond table and its element list.
 * @throws When the molfile has no atoms.
 */
export async function structureLayout(
  molfile: string,
): Promise<StructureLayout> {
  const ocl = await getOcl();
  const structure = ocl.Molecule.fromMolfile(molfile);
  const atoms = structure.getAllAtoms();
  if (atoms === 0) {
    throw new Error('the molfile has no atoms to draw');
  }

  const elements = new Array<string>(atoms);
  for (let atom = 0; atom < atoms; atom++) {
    elements[atom] = structure.getAtomLabel(atom);
  }

  const bondCount = structure.getAllBonds();
  const bonds = new Array<BondPair>(bondCount);
  for (let bond = 0; bond < bondCount; bond++) {
    bonds[bond] = [
      structure.getBondAtom(0, bond),
      structure.getBondAtom(1, bond),
    ];
  }

  // Explicit hydrogens are kept: a mode is very often a C–H stretch, and a
  // depiction that hides those atoms cannot highlight them.
  structure.inventCoordinates({ keepHydrogens: true });
  return { molfile: structure.toMolfile(), bonds, elements };
}
