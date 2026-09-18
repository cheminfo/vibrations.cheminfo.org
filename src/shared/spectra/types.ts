/**
 * A band drawn above the spectrum, tying a place on the x axis to a normal
 * mode. It is the pedagogic link the tool is built around: the band, the mode,
 * and the part of the structure that moves.
 */
export interface SpectrumBand {
  /**
   * Index into the active result's `modes`. The chart never interprets it; it
   * hands it back to `onSelectBand` so the caller can write `view.selectedMode`.
   */
  modeIndex: number;
  /**
   * Where the band sits, in the chart's own coordinates — already multiplied by
   * the display wavenumber scale, like the traces are.
   */
  wavenumber: number;
  /** Shown in the band's tooltip. @default undefined */
  title?: string;
}
