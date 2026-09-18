/**
 * Thermochemistry assertions against the fixtures' own mRRHO block.
 *
 * Nothing in the browser checked these before: the fixtures carry xtb's
 * zero-point energy, enthalpy and `G(RRHO) contrib.`, and reproducing them
 * exercises the rotor classification, the symmetry number, the free-rotor
 * interpolation and the translational term — none of which the band-position
 * comparison touches.
 */

import type { Thermochemistry } from 'xtb-wasm';
import { WAVENUMBER_PER_HARTREE } from 'xtb-wasm';

import type { FixtureCheck } from './checkTypes.ts';
import { numericCheck } from './checkTypes.ts';
import type { ReferenceFixture } from './fixtureShape.ts';

/**
 * Half-width of the interval a stored wavenumber was rounded from: xtb prints
 * two decimals, so each one carries an independent ±0.005 cm⁻¹ uncertainty.
 */
const STORED_FREQUENCY_HALF_WIDTH = 0.005;

/** Floor on the zero-point tolerance, absorbing double-precision noise, Eh. */
const ZERO_POINT_FLOOR = 1e-9;

/**
 * Headroom for the protocol difference plus the thermal terms, Eh. The
 * reference enthalpy belongs to the `--ohess` geometry while we run at the
 * stored one, which moves the fixtures' own zero-point energies by up to
 * 5.9 × 10⁻⁷ Eh; 10⁻⁵ Eh is 0.006 kcal/mol and still two orders below the
 * 1.1 × 10⁻³ Eh a wrong rotational treatment would cost.
 */
const ENTHALPY_HEADROOM = 1e-5;

/**
 * Headroom for the free energy, Eh. G is the rounding-sensitive one: it depends
 * on ln ν through the free-rotor term, so a 0.5 cm⁻¹ shift of a 30 cm⁻¹ torsion
 * is already worth ~1.6 × 10⁻⁵ Eh. 10⁻⁴ Eh covers a handful of those and stays
 * an order of magnitude below the RT·ln 2 = 1.1 × 10⁻³ Eh that the smallest
 * possible symmetry-number error costs.
 */
const GIBBS_HEADROOM = 1e-4;

/**
 * Judge our mRRHO block against the fixture's.
 * @param thermochemistry - What the run produced, or `null` when not requested.
 * @param fixture - The reference fixture.
 * @param summedFrequencyDelta - Σ|Δν| over the paired modes, cm⁻¹.
 * @returns One check per reference quantity.
 */
export function thermochemistryChecks(
  thermochemistry: Thermochemistry | null,
  fixture: ReferenceFixture,
  summedFrequencyDelta: number,
): FixtureCheck[] {
  if (thermochemistry === null) {
    return [
      {
        id: 'thermochemistry',
        label: 'Thermochemistry',
        status: 'info',
        actual: 'not computed',
        tolerance: null,
        note: 'The run did not ask for the mRRHO block.',
      },
    ];
  }

  const { tierOne, thermochemistry: reference } = fixture;
  const zeroPointTolerance =
    zeroPointBudget(summedFrequencyDelta, tierOne.modeCount) + ZERO_POINT_FLOOR;

  return [
    numericCheck({
      id: 'zeroPoint',
      label: 'Zero-point energy',
      deviation: thermochemistry.zeroPointEnergy - tierOne.zeroPointEnergy,
      tolerance: zeroPointTolerance,
      unit: 'Eh',
      note: 'The tolerance is exactly the budget the band-position deviations above already imply, because the zero-point energy is half their sum. So this checks the mode filter — that the sum runs over the 3N − 6 genuine vibrations and nothing else — rather than the frequencies again.',
    }),
    numericCheck({
      id: 'enthalpy',
      label: 'Enthalpy correction H(T) − E',
      deviation:
        thermochemistry.enthalpyCorrection - reference.enthalpyCorrection,
      tolerance: zeroPointTolerance + ENTHALPY_HEADROOM,
      unit: 'Eh',
      note: 'Against the fixture’s --ohess block, which is the one its enthalpy belongs to. Covers the vibrational thermal energy, the rigid-rotor and translational terms and RT.',
    }),
    numericCheck({
      id: 'gibbs',
      label: 'Free-energy correction G(RRHO)',
      deviation: thermochemistry.gibbsCorrection - reference.gibbsCorrection,
      tolerance: zeroPointTolerance + GIBBS_HEADROOM,
      unit: 'Eh',
      note: `Grimme’s damped free-rotor entropy at σ = ${thermochemistry.symmetryNumber}. A symmetry number off by a factor of two would land here at 1.1 × 10⁻³ Eh.`,
    }),
    {
      id: 'symmetry',
      label: 'Point group and σ',
      status: 'info',
      actual: `${thermochemistry.pointGroup}, σ = ${thermochemistry.symmetryNumber}`,
      tolerance: null,
      note: `Detected by the engine; ${thermochemistry.isLinear ? 'treated as a linear rotor' : 'treated as a non-linear rotor'}.`,
    },
  ];
}

/**
 * The zero-point energy deviation the frequency comparison already allows.
 *
 * ZPE is ½ Σ ν, so a per-mode deviation of Δνᵢ moves it by at most ½ Σ |Δνᵢ|.
 * The stored reference frequencies are themselves rounded to two decimals, so
 * each contributes a further ±0.005 cm⁻¹.
 * @param summedFrequencyDelta - Σ|Δν| over the paired modes, cm⁻¹.
 * @param modeCount - How many wavenumbers the reference stores.
 * @returns The bound in Hartree.
 */
function zeroPointBudget(
  summedFrequencyDelta: number,
  modeCount: number,
): number {
  const wavenumbers =
    summedFrequencyDelta + modeCount * STORED_FREQUENCY_HALF_WIDTH;
  return (0.5 * wavenumbers) / WAVENUMBER_PER_HARTREE;
}
