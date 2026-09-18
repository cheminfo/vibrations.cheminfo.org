import { data } from './data.ts';
import { preferences } from './preferences.ts';
import { run } from './run.ts';
import { series } from './series.ts';
import { view } from './view.ts';

/**
 * The single global store, read in a component with `useSignals()`.
 *
 * `view` is where the user is looking, `data` is the molecule in the editor,
 * `series` is everything on the charts, `run` is what is computing, and
 * `preferences` is the part that survives a reload.
 */
export const state = { view, data, series, run, preferences };

export { SERIES_PALETTE, assignSeriesColor } from './colors.ts';
export { clearMolecule, data, setMolecule } from './data.ts';
export type { ValidationRow } from './data.ts';
export {
  activeEngine,
  currentOutputSelection,
  currentRequest,
  currentSettings,
  isExpensiveRun,
  normalization,
  requestRefusals,
} from './derived.ts';
export type {
  ChartSelection,
  ConnectivitySource,
  IrVariable,
} from './display.ts';
export { currentNormalization, displaySignals } from './display.ts';
export { PREFERENCES_VERSION, persistBucket } from './persist.ts';
export { preferences } from './preferences.ts';
export type { RunStatus, StartRunOptions } from './run.ts';
export {
  cancelAllRuns,
  cancelRun,
  clearRunError,
  isRunning,
  predict,
  run,
  runningEngineIds,
  startRun,
} from './run.ts';
export type { ResultEntry } from './series.ts';
export {
  activeEntry,
  activeModes,
  activeMolecule,
  activeResult,
  series,
  usedSeriesColors,
  visibleExperimental,
  visibleResults,
} from './series.ts';
export type { AddResultOptions } from './seriesActions.ts';
export {
  addExperimentalTraces,
  addResult,
  clearExperimental,
  clearResults,
  removeResult,
  removeTrace,
  selectResult,
  setResultVisible,
  toggleResultVisible,
  toggleTraceVisible,
} from './seriesActions.ts';
export {
  currentOutputs,
  outputSignals,
  resetStructureOverrides,
  settingsForMolecule,
  settingsSignals,
} from './settings.ts';
export type { PageId, PanelId, Route } from './view.ts';
export {
  PAGES,
  PANEL_IDS,
  applyHash,
  clearSelection,
  closePanel,
  closeTour,
  openPanel,
  routeFromHash,
  selectMode,
  setPage,
  setTourStep,
  startTour,
  togglePanel,
  view,
} from './view.ts';
