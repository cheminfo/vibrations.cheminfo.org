import type { Molecule } from 'xtb-wasm';
import { getOcl, moleculeFromStructure } from 'xtb-wasm';

import type { CollectionEntry } from '../../data/index.ts';

/**
 * Build the 3D molecule of one collection entry.
 *
 * The stored idCode is an identity, not a geometry, so the conformer is
 * generated here and the molfile written from that same structure — which is
 * the representation whose atom and bond order matches the coordinates the
 * Hessian will be computed at.
 * @param collectionId - Id of the collection, recorded as provenance.
 * @param entry - The entry to build.
 * @returns The molecule, ready to hand to an engine.
 */
export async function buildEntryMolecule(
  collectionId: string,
  entry: CollectionEntry,
): Promise<Molecule> {
  const ocl = await getOcl();
  const built = await moleculeFromStructure(
    ocl.Molecule.fromIDCode(entry.idCode),
    {
      label: entry.name,
      source: { kind: 'collection', collectionId, entryId: entry.id },
    },
  );
  return built.molecule;
}
