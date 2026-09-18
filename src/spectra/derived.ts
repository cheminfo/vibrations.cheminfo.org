import type { MeasurementXY } from 'cheminfo-types';
import { xMaxValue } from 'ml-spectra-processing';

/**
 * Transmittance above which a spectrum cannot be read as percent at all, so the
 * only consistent reading left is that its source was already in percent and
 * was scaled by a further 100. A real baseline sits a little over 100 % when
 * the background drifts, and even a nearly opaque sample transmits more than
 * 1.5 %, so nothing legitimate lands above this while a factor-100 error lands
 * two orders above it.
 */
const MAX_PLAUSIBLE_TRANSMITTANCE = 150;

/**
 * Absorbance above which the value cannot have been measured: it means less
 * than one part in a million of the beam reached the detector, far under the
 * photometric range of any FTIR. A y column labelled as absorbance that goes
 * this high is carrying something else — counts, or percent transmittance.
 */
const MAX_MEASURABLE_ABSORBANCE = 6;

/**
 * Repair the absorbance and transmittance a parser derived, and report what
 * could not be repaired.
 *
 * `ir-spectrum` decides between fraction and percent transmittance from the `y`
 * label alone, so a file whose label reads `Transmission` while its values are
 * already percent is scaled by a further 100 and its absorbance comes back
 * negative. That case is not a guess: dividing the transmittance by 100 and
 * recomputing `a = −log10(t / 100)` is the only reading under which the two
 * agree, so it is corrected rather than announced and plotted at 9488 %.
 *
 * An implausible absorbance cannot be repaired the same way — 3 to 205
 * absorbance units could be counts or percent, and picking one would be
 * inventing data — so it is only reported.
 *
 * The measurements are modified in place, which is safe because every array
 * reaching here was freshly allocated by `detachMeasurement`.
 * @param measurements - Detached measurements whose `a` and `t` are the parser's.
 * @returns One warning per spectrum that was corrected or is still suspect.
 */
export function repairDerivedVariables(
  measurements: ReadonlyArray<MeasurementXY<Float64Array>>,
): string[] {
  const warnings: string[] = [];
  for (let index = 0; index < measurements.length; index++) {
    const measurement = measurements[index];
    if (!measurement) continue;
    const warning = repairOne(measurement, index + 1);
    if (warning) warnings.push(warning);
  }
  return warnings;
}

function repairOne(
  measurement: MeasurementXY<Float64Array>,
  position: number,
): string | null {
  const { variables } = measurement;
  const label = variables.y.label;
  const transmittance = variables.t?.data;
  const absorbance = variables.a?.data;

  if (
    transmittance &&
    absorbance &&
    xMaxValue(transmittance) > MAX_PLAUSIBLE_TRANSMITTANCE
  ) {
    for (let index = 0; index < transmittance.length; index++) {
      const percent = (transmittance[index] as number) / 100;
      transmittance[index] = percent;
      absorbance[index] = -Math.log10(percent / 100);
    }
    return `Spectrum ${position} labels y as "${label}" without declaring percent, so its values were read as a fraction and scaled by 100 twice; the transmittance and absorbance were divided back down.`;
  }

  if (absorbance) {
    const highest = xMaxValue(absorbance);
    if (highest > MAX_MEASURABLE_ABSORBANCE) {
      return `Spectrum ${position} labels y as "${label}" but reaches an absorbance of ${highest.toFixed(1)}, which no instrument can measure; the column is probably counts or percent transmittance, and the transmittance derived from it is meaningless.`;
    }
  }

  return null;
}
