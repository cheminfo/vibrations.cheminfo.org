import type { Thermochemistry } from 'xtb-wasm';
import { KCAL_PER_MOL_PER_HARTREE, KJ_PER_MOL_PER_HARTREE } from 'xtb-wasm';

/** One energy of the RRHO block, in the three units a chemist reads it in. */
export interface EnergyRow {
  label: string;
  /** What the quantity means, shown as the row's tooltip. */
  description: string;
  hartree: number;
  kcalPerMol: number;
  kilojoulePerMol: number;
}

/** One temperature-derivative quantity, per mole and per kelvin. */
export interface EntropyRow {
  label: string;
  description: string;
  hartreePerKelvin: number;
  caloriePerMoleKelvin: number;
  joulePerMoleKelvin: number;
}

/**
 * The energies of a thermochemistry block, in Hartree, kcal/mol and kJ/mol.
 *
 * Every conversion goes through `src/chemistry/constants.ts`, which derives its
 * factors from the CODATA-2018 values rather than transcribing them.
 * @param thermochemistry - The block to display.
 * @returns The rows, in reading order.
 */
export function energyRows(
  thermochemistry: Thermochemistry,
): readonly EnergyRow[] {
  const {
    zeroPointEnergy,
    thermalCorrection,
    enthalpyCorrection,
    gibbsCorrection,
    totalEnthalpy,
    totalFreeEnergy,
  } = thermochemistry;
  return [
    energyRow(
      'Zero-point vibrational energy',
      'Half a quantum in every genuine vibration, present even at 0 K.',
      zeroPointEnergy,
    ),
    energyRow(
      'Thermal correction',
      'Internal energy above the zero-point energy: translation, rotation and the populated vibrations.',
      thermalCorrection,
    ),
    energyRow(
      'Enthalpy correction H(T) − E',
      'Zero-point energy, thermal correction and RT together.',
      enthalpyCorrection,
    ),
    energyRow(
      'Gibbs correction G(T) − E',
      'xtb prints this as G(RRHO) contrib.: the enthalpy correction minus T·S.',
      gibbsCorrection,
    ),
    energyRow(
      'Total enthalpy',
      'Electronic energy plus the enthalpy correction.',
      totalEnthalpy,
    ),
    energyRow(
      'Total free energy',
      'Electronic energy plus the Gibbs correction — the number a reaction energy is built from.',
      totalFreeEnergy,
    ),
  ];
}

/**
 * Entropy and heat capacity, per mole and per kelvin.
 * @param thermochemistry - The block to display.
 * @returns The rows, in reading order.
 */
export function entropyRows(
  thermochemistry: Thermochemistry,
): readonly EntropyRow[] {
  return [
    entropyRow(
      'Entropy S',
      'Translational, rotational and vibrational entropy, with Grimme’s interpolation for the low-lying modes.',
      thermochemistry.entropy,
    ),
    entropyRow(
      'Heat capacity Cv',
      'How much the internal energy rises per kelvin at constant volume.',
      thermochemistry.heatCapacity,
    ),
  ];
}

function energyRow(
  label: string,
  description: string,
  hartree: number,
): EnergyRow {
  return {
    label,
    description,
    hartree,
    kcalPerMol: hartree * KCAL_PER_MOL_PER_HARTREE,
    kilojoulePerMol: hartree * KJ_PER_MOL_PER_HARTREE,
  };
}

function entropyRow(
  label: string,
  description: string,
  hartreePerKelvin: number,
): EntropyRow {
  return {
    label,
    description,
    hartreePerKelvin,
    caloriePerMoleKelvin: hartreePerKelvin * KCAL_PER_MOL_PER_HARTREE * 1000,
    joulePerMoleKelvin: hartreePerKelvin * KJ_PER_MOL_PER_HARTREE * 1000,
  };
}
