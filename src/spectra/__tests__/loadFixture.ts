import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A fixture from `__tests__/data` as a `File`, read as bytes.
 *
 * No encoding is passed to `readFileSync`: the parsers sniff the encoding
 * themselves, and decoding here would hide a latin1 JCAMP header.
 * @param name - File name inside `__tests__/data`.
 * @returns The fixture as a `File` named after it.
 */
export function loadFixture(name: string): File {
  return new File([new Uint8Array(readBytes(name))], name);
}

/**
 * A fixture from `__tests__/data` as a detached `ArrayBuffer`.
 * @param name - File name inside `__tests__/data`.
 * @returns The fixture's bytes.
 */
export function readBytes(name: string): ArrayBuffer {
  const bytes = readFileSync(join(import.meta.dirname, 'data', name));
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
}
