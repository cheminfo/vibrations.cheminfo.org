import { expect, test } from 'vitest';
import { moleculeFromSmiles } from 'xtb-wasm';

import { OCL_TIMEOUT } from '../../../test/timeouts.ts';
import { structureLayout } from '../structureLayout.ts';

test(
  'the flat depiction keeps the atom order the geometry uses',
  async () => {
    const molecule = await moleculeFromSmiles('CC(=O)O', 'acetic acid');
    const layout = await structureLayout(molecule.molfile as string);

    expect(layout.elements).toStrictEqual([...molecule.elements]);
    expect(layout.molfile).not.toBe(molecule.molfile);
  },
  OCL_TIMEOUT,
);

test(
  'the bond table names the two atoms of every bond',
  async () => {
    const molecule = await moleculeFromSmiles('CC(=O)O', 'acetic acid');
    const layout = await structureLayout(molecule.molfile as string);

    // C2H4O2: three heavy-atom bonds plus four X–H bonds.
    expect(layout.bonds).toHaveLength(7);
    for (const [first, second] of layout.bonds) {
      expect(first).toBeLessThan(layout.elements.length);
      expect(second).toBeLessThan(layout.elements.length);
      expect(first).not.toBe(second);
    }
    const carbonyl = layout.bonds.filter(
      ([first, second]) =>
        layout.elements[first] === 'C' && layout.elements[second] === 'O',
    );
    expect(carbonyl).toHaveLength(2);
  },
  OCL_TIMEOUT,
);

test('a molfile with no atoms is refused', async () => {
  await expect(structureLayout('not a molfile')).rejects.toThrow(
    'the molfile has no atoms to draw',
  );
});
