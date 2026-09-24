import type { CopyToClipboard } from 'react-cheminfo/ui';

/**
 * Which glyph a `Toolbar.Item` copy action shows, from the state of the copy.
 * @param copy - The hook's state.
 * @returns The Blueprint icon name.
 */
export function copyIcon(
  copy: CopyToClipboard,
): 'clipboard' | 'tick' | 'cross' {
  if (copy.failed) return 'cross';
  if (copy.copied) return 'tick';
  return 'clipboard';
}

/**
 * What a `Toolbar.Item` copy action says on hover, from the state of the copy.
 * @param copy - The hook's state.
 * @param idle - What the action offers before it has been used.
 * @returns The tooltip text.
 */
export function copyTooltip(copy: CopyToClipboard, idle: string): string {
  if (copy.failed) return 'The clipboard refused the copy';
  if (copy.copied) return 'Copied';
  return idle;
}
