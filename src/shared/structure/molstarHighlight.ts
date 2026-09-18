import type { StructureElement } from 'molstar/lib/mol-model/structure.js';

import type { LociElement, PluginLike } from './molstarTypes.ts';

/**
 * Mark a set of atoms with Mol*'s own highlight — the one hovering the canvas
 * produces — so the marked atoms read as pointed at rather than as a change to
 * the structure.
 * @param plugin - The Mol* plugin.
 * @param atoms - Atom indices to mark, or `null` to clear the marking.
 */
export async function highlightAtoms(
  plugin: PluginLike,
  atoms: readonly number[] | null,
): Promise<void> {
  const highlights = plugin.managers.interactivity.lociHighlights;
  if (atoms === null || atoms.length === 0) {
    highlights.clearHighlights();
    return;
  }

  const structure =
    plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
  if (structure === undefined) return;

  const [{ StructureElement }, { OrderedSet, SortedArray }] = await Promise.all(
    [
      import('molstar/lib/mol-model/structure/structure/element.js'),
      import('molstar/lib/mol-data/int.js'),
    ],
  );

  const elements: LociElement[] = [];
  for (const unit of structure.units) {
    const indices: StructureElement.UnitIndex[] = [];
    for (const atom of atoms) {
      const found = SortedArray.indexOf(unit.elements, atom);
      if (found !== -1) indices.push(found as StructureElement.UnitIndex);
    }
    if (indices.length > 0) {
      elements.push({ unit, indices: OrderedSet.ofSortedArray(indices) });
    }
  }
  if (elements.length === 0) return;

  // Granularity is not applied: Mol*'s default expands an atom to its whole
  // residue, which for a small molecule is every atom there is.
  // Mol* names this factory like a constructor, but it is a plain function.
  const createLoci = StructureElement.Loci;
  highlights.highlightOnly({ loci: createLoci(structure, elements) }, false);
}
