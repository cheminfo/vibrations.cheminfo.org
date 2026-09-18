import { signal } from '@preact/signals-react';
import type {
  CalculationSettings,
  Molecule,
  OutputSelection,
  XtbMethod,
} from 'xtb-wasm';
import { DEFAULT_OUTPUTS, DEFAULT_SETTINGS } from 'xtb-wasm';

/**
 * The physics the user can change. Charge and unpaired electrons are stored as
 * overrides rather than values, because both are properties of the structure:
 * with no override they follow the loaded molecule, and an override sticks until
 * another molecule is loaded.
 */
export const settingsSignals = {
  /** @see DEFAULT_SETTINGS */
  method: signal<XtbMethod>(DEFAULT_SETTINGS.method),
  /** Total charge in e, or `null` to take the molecule's own. */
  chargeOverride: signal<number | null>(null),
  /** `nAlpha − nBeta`, or `null` to take the molecule's own. */
  unpairedElectronsOverride: signal<number | null>(null),
  optimize: signal(DEFAULT_SETTINGS.optimize),
  maxCycles: signal(DEFAULT_SETTINGS.maxCycles),
  temperature: signal(DEFAULT_SETTINGS.temperature),
  pressure: signal(DEFAULT_SETTINGS.pressure),
  /** Rotational symmetry number σ, or `null` to take it from the point group. */
  symmetryNumber: signal<number | null>(DEFAULT_SETTINGS.symmetryNumber),
};

/** Which derived quantities to compute. */
export const outputSignals = {
  ir: signal(DEFAULT_OUTPUTS.ir),
  raman: signal(DEFAULT_OUTPUTS.raman),
  thermochemistry: signal(DEFAULT_OUTPUTS.thermochemistry),
};

/**
 * The settings to run a given molecule with: the stored preferences, with charge
 * and unpaired electrons taken from the molecule unless the user overrode them.
 * @param molecule - The molecule about to be computed, or `null` for the defaults.
 * @returns A complete, self-contained `CalculationSettings`.
 */
export function settingsForMolecule(
  molecule: Molecule | null,
): CalculationSettings {
  return {
    method: settingsSignals.method.value,
    charge:
      settingsSignals.chargeOverride.value ??
      molecule?.charge ??
      DEFAULT_SETTINGS.charge,
    unpairedElectrons:
      settingsSignals.unpairedElectronsOverride.value ??
      molecule?.unpairedElectrons ??
      DEFAULT_SETTINGS.unpairedElectrons,
    optimize: settingsSignals.optimize.value,
    maxCycles: settingsSignals.maxCycles.value,
    temperature: settingsSignals.temperature.value,
    pressure: settingsSignals.pressure.value,
    symmetryNumber: settingsSignals.symmetryNumber.value,
  };
}

/** The output selection as the engine wants it. */
export function currentOutputs(): OutputSelection {
  return {
    ir: outputSignals.ir.value,
    raman: outputSignals.raman.value,
    thermochemistry: outputSignals.thermochemistry.value,
  };
}

/**
 * Forget the charge and unpaired-electron overrides so the next molecule's own
 * values apply. Called whenever a molecule is loaded.
 */
export function resetStructureOverrides(): void {
  settingsSignals.chargeOverride.value = null;
  settingsSignals.unpairedElectronsOverride.value = null;
}
