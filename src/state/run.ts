import { computed, signal } from '@preact/signals-react';
import type {
  EngineProgress,
  VibrationalRequest,
  VibrationalResult,
} from 'xtb-wasm';
import { getEngine } from 'xtb-wasm';

import { currentRequest } from './derived.ts';
import { preferences } from './preferences.ts';
import { addResult } from './seriesActions.ts';

/** One calculation in flight. */
export interface RunStatus {
  engineId: string;
  /** The request being computed, so the status bar can name the molecule. */
  request: VibrationalRequest;
  /** The last progress report, or `null` before the first one arrives. */
  progress: EngineProgress | null;
  /** When the run started, from `performance.now()`. */
  startedAt: number;
}

export const run = {
  /** Runs in flight, keyed by engine id — one run per engine at a time. */
  active: signal<Readonly<Record<string, RunStatus>>>({}),
  /** The last failure per engine id, cleared when that engine starts again. */
  errors: signal<Readonly<Record<string, string>>>({}),
};

/** Whether any engine is computing. */
export const isRunning = computed(
  () => Object.keys(run.active.value).length > 0,
);

/** The engines computing right now. */
export const runningEngineIds = computed<readonly string[]>(() =>
  Object.keys(run.active.value),
);

/** How a calculation is started. */
export interface StartRunOptions {
  /** Which engine to run. @default the stored primary engine */
  engineId?: string;
  /** Store the result in the history. @default true */
  addToHistory?: boolean;
  /** Make the stored result the active one. @default true */
  select?: boolean;
  /** Also called on every progress report, after the status is updated. @default undefined */
  onProgress?: (progress: EngineProgress) => void;
}

const controllers = new Map<string, AbortController>();

/**
 * Run one calculation, refusing it up front rather than letting `compute` throw.
 *
 * Any run already in flight on the same engine is cancelled first, so the UI
 * cannot accumulate workers. A refusal or a failure lands in `run.errors` under
 * the engine id and the call resolves to `null`; a cancelled run resolves to
 * `null` silently.
 * @param request - The calculation to run.
 * @param options - See {@link StartRunOptions}.
 * @returns The result, or `null` when the run was refused, cancelled or failed.
 */
export async function startRun(
  request: VibrationalRequest,
  options: StartRunOptions = {},
): Promise<VibrationalResult | null> {
  const {
    engineId = preferences.engine.primary.value,
    addToHistory = true,
    select = true,
    onProgress,
  } = options;

  const engine = getEngine(engineId);
  if (engine === undefined) {
    setError(engineId, `Unknown engine "${engineId}".`);
    return null;
  }

  const refusals = engine.validate(request);
  if (refusals.length > 0) {
    setError(engineId, refusals.join(' '));
    return null;
  }

  controllers.get(engineId)?.abort();
  const controller = new AbortController();
  controllers.set(engineId, controller);
  setError(engineId, null);
  setStatus(engineId, {
    engineId,
    request,
    progress: null,
    startedAt: performance.now(),
  });

  try {
    const result = await engine.compute(request, {
      signal: controller.signal,
      onProgress: (progress) => {
        const status = run.active.value[engineId];
        if (status !== undefined) setStatus(engineId, { ...status, progress });
        onProgress?.(progress);
      },
    });
    if (controller.signal.aborted) return null;
    if (addToHistory) addResult(result, { select });
    return result;
  } catch (error) {
    if (!controller.signal.aborted) {
      setError(
        engineId,
        error instanceof Error ? error.message : String(error),
      );
    }
    return null;
  } finally {
    if (controllers.get(engineId) === controller) controllers.delete(engineId);
    setStatus(engineId, null);
  }
}

/**
 * Run the molecule currently in the editor with the stored settings.
 * @param options - See {@link StartRunOptions}.
 * @returns The result, or `null` when there is no molecule or the run failed.
 */
export async function predict(
  options: StartRunOptions = {},
): Promise<VibrationalResult | null> {
  const request = currentRequest.value;
  if (request === null) return null;
  return startRun(request, options);
}

/**
 * Cancel a run in flight, if there is one.
 * @param engineId - Which engine to stop.
 */
export function cancelRun(engineId: string): void {
  controllers.get(engineId)?.abort();
}

/** Cancel every run in flight. */
export function cancelAllRuns(): void {
  for (const controller of controllers.values()) {
    controller.abort();
  }
}

/**
 * Drop one engine's last error, e.g. when the user dismisses the callout.
 * @param engineId - Which engine to clear.
 */
export function clearRunError(engineId: string): void {
  setError(engineId, null);
}

function setStatus(engineId: string, status: RunStatus | null): void {
  const next: Record<string, RunStatus> = {};
  for (const [key, value] of Object.entries(run.active.value)) {
    if (key !== engineId) next[key] = value;
  }
  if (status !== null) next[engineId] = status;
  run.active.value = next;
}

function setError(engineId: string, message: string | null): void {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(run.errors.value)) {
    if (key !== engineId) next[key] = value;
  }
  if (message !== null) next[engineId] = message;
  run.errors.value = next;
}
