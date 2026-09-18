import { signal } from '@preact/signals-react';

import { displaySignals } from './display.ts';
import { persistBucket } from './persist.ts';
import { outputSignals, settingsSignals } from './settings.ts';

/** Which engine each page runs. */
const engineSignals = {
  /** The engine the calculator and the collections pages run. */
  primary: signal('occjs'),
};

/**
 * Everything the user can change that survives a reload, stored as one
 * versioned `localStorage` entry.
 *
 * `settings` and `outputs` are the physics; `display` is how the result is
 * drawn; `engine` is where it is computed. Nothing about the current molecule or
 * the result history is here — those are session state, not preferences.
 */
export const preferences = persistBucket('preferences', {
  settings: settingsSignals,
  outputs: outputSignals,
  display: displaySignals,
  engine: engineSignals,
});
