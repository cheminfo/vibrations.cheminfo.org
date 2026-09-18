import type { VibrationalMode } from 'xtb-wasm';

import { fakeResult } from '../../../state/__tests__/fakeResult.ts';
import type { ResultEntry } from '../../../state/index.ts';

/**
 * A history entry carrying a given stick spectrum, which is all the calculator's
 * trace and table code reads.
 * @param id - Entry and result id, also the molecule label.
 * @param modes - The modes the result holds.
 * @param options - Colour and visibility.
 * @param options.color - The colour its curve is drawn in. @default '#0072b2'
 * @param options.visible - Whether it is drawn. @default true
 * @returns The entry.
 */
export function makeEntry(
  id: string,
  modes: readonly VibrationalMode[],
  options: { color?: string; visible?: boolean } = {},
): ResultEntry {
  const result = fakeResult(id);
  result.modes = [...modes];
  return {
    id,
    result,
    molecule: result.request.molecule,
    color: options.color ?? '#0072b2',
    visible: options.visible ?? true,
    completedAt: 0,
  };
}

export { makeMode } from '../../../spectra/__tests__/makeMode.ts';
