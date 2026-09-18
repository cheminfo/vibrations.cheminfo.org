/**
 * Synthetic engine results built from a reference fixture, so the comparison
 * can be tested without running the wasm engine at all.
 *
 * A result that reproduces its fixture exactly is the baseline; each test then
 * perturbs one quantity and asserts that the matching check — and only that
 * check — turns red.
 */

import type {
  Thermochemistry,
  VibrationalMode,
  VibrationalRequest,
  VibrationalResult,
} from 'xtb-wasm';
import { DEFAULT_SETTINGS } from 'xtb-wasm';

import type { ReferenceFixture } from '../fixtureShape.ts';

/** Overrides applied to an otherwise exact reproduction of a fixture. */
export interface Perturbation {
  /** Replace the wavenumbers, cm⁻¹. @default the fixture's tier-1 list */
  wavenumbers?: number[];
  /** Replace the IR intensities, km/mol. @default the fixture's tier-1 list */
  irIntensities?: number[];
  /** Replace G(RRHO), Eh. @default the fixture's own value */
  gibbsCorrection?: number;
}

/**
 * A result that reproduces the fixture exactly, except where asked not to.
 * @param fixture - The reference fixture.
 * @param perturbation - What to change. @default {}
 * @returns The synthetic result.
 */
export function perfectResult(
  fixture: ReferenceFixture,
  perturbation: Perturbation = {},
): VibrationalResult {
  const wavenumbers = perturbation.wavenumbers ?? fixture.tierOne.wavenumbers;
  const irIntensities =
    perturbation.irIntensities ?? fixture.tierOne.irIntensities;
  const modes = new Array<VibrationalMode>(wavenumbers.length);
  for (let index = 0; index < wavenumbers.length; index++) {
    modes[index] = syntheticMode(
      wavenumbers[index] as number,
      irIntensities[index] as number,
    );
  }

  return {
    id: 'synthetic',
    engineId: 'test',
    request: syntheticRequest(fixture),
    geometry: fixture.geometry,
    energy: {
      total: fixture.tierOne.totalEnergy,
      scc: null,
      repulsion: null,
      dispersion: null,
    },
    modes,
    imaginaryCount: 0,
    thermochemistry: syntheticThermochemistry(fixture, perturbation),
    timings: { optimize: 0, hessian: 0, analyse: 0, total: 0 },
    warnings: [],
  };
}

/**
 * A request carrying the fixture's geometry. The comparison never reads it; it
 * is here because a result echoes the request that produced it.
 * @param fixture - The reference fixture.
 * @returns The request.
 */
function syntheticRequest(fixture: ReferenceFixture): VibrationalRequest {
  return {
    molecule: {
      id: fixture.id,
      label: fixture.name,
      formula: fixture.formula,
      source: { kind: 'fixture', fixtureId: fixture.id },
      charge: fixture.charge,
      unpairedElectrons: fixture.unpairedElectrons,
      elements: fixture.geometry.elements,
      coordinates: fixture.geometry.coordinates,
    },
    settings: { ...DEFAULT_SETTINGS, optimize: false },
    outputs: { ir: true, raman: false, thermochemistry: true },
  };
}

/**
 * The mRRHO block the fixture itself reports.
 * @param fixture - The reference fixture.
 * @param perturbation - What to change.
 * @returns The synthetic block.
 */
function syntheticThermochemistry(
  fixture: ReferenceFixture,
  perturbation: Perturbation,
): Thermochemistry {
  const gibbsCorrection =
    perturbation.gibbsCorrection ?? fixture.thermochemistry.gibbsCorrection;
  return {
    temperature: 298.15,
    pressure: 101_325,
    zeroPointEnergy: fixture.tierOne.zeroPointEnergy,
    thermalCorrection: 0,
    enthalpyCorrection: fixture.thermochemistry.enthalpyCorrection,
    entropy: 0,
    gibbsCorrection,
    totalFreeEnergy: fixture.thermochemistry.electronicEnergy + gibbsCorrection,
    totalEnthalpy:
      fixture.thermochemistry.electronicEnergy +
      fixture.thermochemistry.enthalpyCorrection,
    heatCapacity: 0,
    symmetryNumber: 2,
    pointGroup: 'C2v',
    isLinear: false,
    skippedImaginaryModes: 0,
  };
}

/**
 * A mode carrying only the two quantities the comparison reads.
 * @param wavenumber - Position in cm⁻¹.
 * @param irIntensity - Intensity in km/mol.
 * @returns The mode.
 */
function syntheticMode(
  wavenumber: number,
  irIntensity: number,
): VibrationalMode {
  return {
    wavenumber,
    irIntensity,
    ramanActivity: null,
    depolarizationRatio: null,
    eigenvector: new Float64Array(9),
    cartesianDisplacement: new Float64Array(9),
    maxDisplacement: 0,
    reducedMass: 0,
    forceConstant: 0,
    involvement: null,
  };
}
