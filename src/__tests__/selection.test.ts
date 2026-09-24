import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

const SRC = join(import.meta.dirname, '..');
const ROOT = join(SRC, '..');
const CHROME_CSS = join(
  ROOT,
  'node_modules',
  'react-cheminfo',
  'styles',
  'chrome.css',
);

test('the family stylesheet is what makes the page unselectable', () => {
  const index = readFileSync(join(SRC, 'index.css'), 'utf8');
  expect(index).toContain("@import 'react-cheminfo/styles/chrome.css';");

  const chrome = readFileSync(CHROME_CSS, 'utf8');
  expect(chrome).toContain(
    'body {\n  -webkit-user-select: none;\n  user-select: none;\n}',
  );
  expect(chrome).toContain('.text-selectable,');
});

test('the site writes no selection policy of its own', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles(SRC)) {
    const text = readFileSync(file, 'utf8');
    if (/user-select|userSelect/.test(text)) {
      offenders.push(file.slice(ROOT.length + 1));
    }
  }
  expect(offenders).toStrictEqual([]);
});

test('the About dialog stays selectable, because a reader quotes it', () => {
  const dialog = readFileSync(join(SRC, 'shared', 'AboutDialog.tsx'), 'utf8');
  expect(dialog).toContain('<DialogBody className="text-selectable">');
});

/** Every source file of the site, its own tests left out. */
function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(path));
    } else if (/\.(?:css|ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}
