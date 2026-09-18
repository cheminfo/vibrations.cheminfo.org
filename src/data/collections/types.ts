/** One molecule in a curated collection. */
export interface CollectionEntry {
  id: string;
  /** Display name, with any experimental value moved out of it. */
  name: string;
  /** OpenChemLib idCode — identity and depiction. */
  idCode: string;
  smiles: string;
  formula: string;
  /** Atom count including hydrogens, so the UI can warn before an expensive run. */
  atoms: number;
  charge: number;
  /** Experimental band position in cm⁻¹, where the collection cites one. @default undefined */
  experimentalWavenumber?: number;
}

/** A curated set of molecules that makes one electronic or symmetry effect visible. */
export interface MoleculeCollection {
  id: string;
  name: string;
  /** Plain-text explanation shown when the collection is loaded. */
  explanation: string;
  entries: readonly CollectionEntry[];
}
