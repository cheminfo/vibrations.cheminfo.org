import { Annotation } from 'react-plot';

import type { SpectrumBand } from './types.ts';

interface SpectrumBandsProps {
  bands: readonly SpectrumBand[];
  selectedMode: number | null;
  hoveredMode: number | null;
}

/**
 * The clickable band strip above the spectrum, one marker per mode.
 *
 * Each marker is 20 cm⁻¹ wide and 7 px tall, stacked
 * over five rows so that neighbouring bands of a crowded fingerprint region
 * stay separately visible. The rows are assigned in the order the bands are
 * given, so a caller that sorts them by wavenumber gets a regular staircase
 * across the spectrum.
 *
 * The markers are drawn, never clicked: react-plot puts its own transparent
 * tracking rectangle above every annotation, so the selection goes through the
 * plot's click handler and the wavenumber it reports.
 * @param props - Component props.
 * @param props.bands - The bands, in the order they should be stacked.
 * @param props.selectedMode - `modeIndex` of the selected band, drawn in the selection colour.
 * @param props.hoveredMode - `modeIndex` of the hovered band.
 * @returns The band annotations.
 */
export function SpectrumBands(props: SpectrumBandsProps) {
  const { bands, selectedMode, hoveredMode } = props;

  return (
    <>
      {selectedMode !== null && (
        <SelectedBandLine bands={bands} modeIndex={selectedMode} />
      )}
      {bands.map((band, index) => {
        const row = index % ROWS;
        const selected = band.modeIndex === selectedMode;
        const hovered = band.modeIndex === hoveredMode;
        return (
          <Annotation.Rectangle
            key={band.modeIndex}
            x1={band.wavenumber - HALF_WIDTH}
            x2={band.wavenumber + HALF_WIDTH}
            y1={`${TOP + ROW_HEIGHT * row}`}
            y2={`${TOP + ROW_HEIGHT * row + BAR_HEIGHT}`}
            color={selected ? SELECTED : hovered ? HOVERED : IDLE}
            rx={1}
          />
        );
      })}
    </>
  );
}

function SelectedBandLine(props: {
  bands: readonly SpectrumBand[];
  modeIndex: number;
}) {
  const { bands, modeIndex } = props;
  const band = bands.find((entry) => entry.modeIndex === modeIndex);
  if (band === undefined) return null;
  return (
    <Annotation.Line
      x1={band.wavenumber}
      x2={band.wavenumber}
      y1="0%"
      y2="100%"
      color={SELECTED}
      strokeWidth={1}
      strokeDasharray="4 4"
    />
  );
}

/** Rows the markers are stacked over, so crowded bands stay distinguishable. */
const ROWS = 5;
/** Half the marker's width in cm⁻¹. */
const HALF_WIDTH = 10;
/** Pixels from the top of the plot area to the first row. */
const TOP = 1;
/** Pixels between two rows. */
const ROW_HEIGHT = 10;
/** Marker height in pixels. */
const BAR_HEIGHT = 7;

const IDLE = '#d9a441';
const HOVERED = '#c87619';
const SELECTED = 'var(--accent)';
