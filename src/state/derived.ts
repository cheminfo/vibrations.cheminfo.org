import { computed } from '@preact/signals-react';
import type {
  CalculationSettings,
  OutputSelection,
  VibrationalEngine,
  VibrationalRequest,
} from 'xtb-wasm';
import { getEngine } from 'xtb-wasm';

import { INTERACTIVE_ATOM_LIMIT } from '../data/index.ts';
import type { NormalizationOptions } from '../types/trace.ts';

import { data } from './data.ts';
import { currentNormalization } from './display.ts';
import { preferences } from './preferences.ts';
import { currentOutputs, settingsForMolecule } from './settings.ts';

/** The settings the next run will use, with the loaded molecule's charge folded in. */
export const currentSettings = computed<CalculationSettings>(() =>
  settingsForMolecule(data.molecule.value),
);

/** The outputs the next run will ask for. */
export const currentOutputSelection = computed<OutputSelection>(() =>
  currentOutputs(),
);

/** The normalization window the charts apply. */
export const normalization = computed<NormalizationOptions>(() =>
  currentNormalization(),
);

/** The engine the calculator runs, or `undefined` when the stored id is unknown. */
export const activeEngine = computed<VibrationalEngine | undefined>(() =>
  getEngine(preferences.engine.primary.value),
);

/**
 * The complete calculation the Predict button would run, or `null` when no
 * molecule is loaded.
 */
export const currentRequest = computed<VibrationalRequest | null>(() => {
  const molecule = data.molecule.value;
  if (molecule === null) return null;
  return {
    molecule,
    settings: currentSettings.value,
    outputs: currentOutputSelection.value,
  };
});

/**
 * Why the active engine would refuse the current request, empty when it would
 * run it. The UI shows these instead of letting `compute` throw.
 */
export const requestRefusals = computed<readonly string[]>(() => {
  const engine = activeEngine.value;
  const request = currentRequest.value;
  if (engine === undefined || request === null) return [];
  return engine.validate(request);
});

/**
 * Whether the loaded molecule is large enough that a full optimization plus
 * Hessian leaves the interactive band, so the UI warns before starting it
 * rather than after.
 */
export const isExpensiveRun = computed(() => {
  const molecule = data.molecule.value;
  return molecule !== null && molecule.elements.length > INTERACTIVE_ATOM_LIMIT;
});
