import type { ConnectivityComparison, Geometry, Molecule } from 'xtb-wasm';
import { compareConnectivity, getOcl } from 'xtb-wasm';

/**
 * Where the legacy distance rule and the molecule's own bond list disagree.
 *
 * The bond list is read from the molfile, which is the only representation
 * whose atom and bond indices round-trip, so pair `[i, j]` addresses the same
 * atoms the geometry and the Hessian used.
 * @param molecule - The molecule that was computed. Needs a molfile.
 * @param geometry - The geometry the Hessian was built at, in Å.
 * @returns The comparison, or `null` when the molecule carries no connectivity.
 */
export async function compareMoleculeConnectivity(
  molecule: Molecule,
  geometry: Geometry,
): Promise<ConnectivityComparison | null> {
  const bonds = await moleculeBonds(molecule);
  if (bonds === null) return null;
  return compareConnectivity(geometry, bonds);
}

/**
 * The molecule's bonds as atom-index pairs, in molfile bond order — the same
 * order `VibrationalMode.involvement.bonds` indexes into.
 * @param molecule - The molecule to read.
 * @returns The pairs, or `null` when the molecule has no molfile.
 */
export async function moleculeBonds(
  molecule: Molecule,
): Promise<Array<[number, number]> | null> {
  const { molfile } = molecule;
  if (molfile === undefined) return null;

  const ocl = await getOcl();
  const structure = ocl.Molecule.fromMolfile(molfile);
  const count = structure.getAllBonds();
  const bonds = new Array<[number, number]>(count);
  for (let bond = 0; bond < count; bond++) {
    bonds[bond] = [
      structure.getBondAtom(0, bond),
      structure.getBondAtom(1, bond),
    ];
  }
  return bonds;
}
