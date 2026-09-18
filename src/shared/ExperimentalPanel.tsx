import { Button, Callout, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { DropZone, Toolbar } from 'react-science/ui';

import { spectraFromFile } from '../spectra/index.ts';
import {
  addExperimentalTraces,
  clearExperimental,
  removeTrace,
  state,
  toggleTraceVisible,
} from '../state/index.ts';

import {
  panelBodyStyle,
  panelStyle,
  panelToolbarStyle,
} from './panelStyles.ts';

/**
 * Experimental spectra dropped by the user, overlaid on the computed ones.
 *
 * A measured spectrum is the only thing that says whether a prediction is any
 * good, so the dropped traces share the chart, the colour pool and the
 * normalization window with the computed ones rather than living beside them.
 * @returns The drop target and the list of loaded traces.
 */
export function ExperimentalPanel(): ReactElement {
  useSignals();
  const traces = state.series.experimental.value;
  const [warnings, setWarnings] = useState<readonly string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  async function load(files: File[]) {
    const collected: string[] = [];
    setFailure(null);
    for (const file of files) {
      try {
        /* eslint-disable-next-line no-await-in-loop -- one file at a time keeps
           each warning attributable to its file and the memory flat for a large
           WDF map, which yields one spectrum per point. */
        const loaded = await spectraFromFile(file);
        addExperimentalTraces(loaded.traces);
        for (const warning of loaded.warnings) {
          collected.push(`${file.name}: ${warning}`);
        }
      } catch (error) {
        setFailure(
          `${file.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    setWarnings(collected);
  }

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Experimental spectra actions">
          <Toolbar.Item
            icon="trash"
            tooltip="Remove every experimental spectrum"
            aria-label="Remove every experimental spectrum"
            disabled={traces.length === 0}
            onClick={() => clearExperimental()}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        <DropZone onDrop={(files) => void load(files)} />
        <p style={hintStyle}>
          JCAMP-DX (.jdx, .dx), SPC, Renishaw WDF, and plain xy text. A Raman
          file is read as Raman, so its counts are never pushed through the
          Beer–Lambert transform an IR absorbance would get.
        </p>

        {failure !== null && (
          <Callout intent="danger" title="Could not read that file">
            {failure}
          </Callout>
        )}
        {warnings.length > 0 && (
          <Callout intent="warning" title="Read with warnings">
            <ul style={listStyle}>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Callout>
        )}

        {traces.map((trace) => (
          <div key={trace.id} style={rowStyle}>
            <Tag
              minimal
              style={{ backgroundColor: trace.color, color: 'white' }}
            >
              {trace.kind === 'raman' ? 'Raman' : 'IR'}
            </Tag>
            <span style={labelStyle} title={trace.label}>
              {trace.label}
            </span>
            <Button
              variant="minimal"
              icon={trace.visible === false ? 'eye-off' : 'eye-open'}
              aria-label={`Toggle ${trace.label}`}
              onClick={() => toggleTraceVisible(trace.id)}
            />
            <Button
              variant="minimal"
              icon="trash"
              aria-label={`Remove ${trace.label}`}
              onClick={() => removeTrace(trace.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const hintStyle = { margin: 0, fontSize: 12, opacity: 0.75 } as const;
const listStyle = { margin: 0, paddingLeft: 18 } as const;
const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 0,
} as const;
const labelStyle = {
  flex: '1 1 1px',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
