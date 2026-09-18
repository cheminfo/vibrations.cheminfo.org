/**
 * `raman-spectrum@1.0.1` is plain JavaScript with no bundled types, so the only
 * symbol this module uses is declared here rather than imported blind.
 *
 * The declared return type is deliberately the narrow structural shape
 * `src/spectra/parsers.ts` reads — `spectra` is already a `MeasurementXY[]` —
 * and NOT the package's `Analysis` class. `raman-spectrum` pins
 * `common-spectrum@3.0.0` while `ir-spectrum` pins `3.2.0`, so npm nests two
 * copies and the two `Analysis` classes are unrelated types at run time. Typing
 * only `spectra` makes it impossible for an `Analysis` instance to leave the
 * parse boundary.
 */
declare module 'raman-spectrum' {
  import type { MeasurementXY } from 'cheminfo-types';

  /**
   * Parse a Renishaw WDF file. A mapping measurement yields one spectrum per
   * map point, so `spectra` routinely holds tens of entries.
   * @param arrayBuffer - The raw file bytes.
   * @returns An object whose `spectra` are the parsed map points.
   */
  export function fromWDF(arrayBuffer: ArrayBuffer): {
    spectra: MeasurementXY[];
  };
}
