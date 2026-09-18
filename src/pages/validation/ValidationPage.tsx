import { Callout, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useState } from 'react';
import { Toolbar } from 'react-science/ui';
import { occjsSerialEngine } from 'xtb-wasm';

import { INTERACTIVE_ATOM_LIMIT } from '../../data/index.ts';
import { state } from '../../state/index.ts';

import { ValidationChecks } from './ValidationChecks.tsx';
import { ValidationTable } from './ValidationTable.tsx';
import { EXPECTED_FIXTURE_IDS, FIXTURE_PROBLEM } from './fixtures.ts';
import { cancelValidation, runAll, runOne } from './runValidation.ts';
import {
  clearValidation,
  fixtureChecks,
  loadProblem,
  loadValidationRows,
} from './validationRows.ts';

/**
 * The browser engine against the native-xtb reference fixtures — the same
 * comparison `experiments/reference/scripts/validate.py` performs against a
 * native build, so the two are directly readable side by side.
 */
export function ValidationPage() {
  useSignals();
  const rows = state.data.validation.value;
  const checks = fixtureChecks.value;
  const problem = FIXTURE_PROBLEM ?? loadProblem.value;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (FIXTURE_PROBLEM !== null) return;
    void loadValidationRows();
  }, []);

  async function withBusy(work: () => Promise<void>) {
    setBusy(true);
    try {
      await work();
    } finally {
      setBusy(false);
    }
  }

  const selected = rows.find((row) => row.fixtureId === selectedId) ?? null;
  let passed = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.status === 'pass') passed++;
    if (row.status === 'fail' || row.status === 'error') failed++;
  }

  return (
    <div style={pageStyle}>
      <Toolbar aria-label="Validation actions">
        <Toolbar.Item
          icon="play"
          tooltip={`Run every fixture up to ${INTERACTIVE_ATOM_LIMIT} atoms`}
          aria-label="Run the small fixtures"
          disabled={busy || problem !== null}
          onClick={() =>
            void withBusy(async () => runAll(INTERACTIVE_ATOM_LIMIT))
          }
        />
        <Toolbar.Item
          icon="fast-forward"
          tooltip="Run every fixture, including the 74-atom one (minutes)"
          aria-label="Run every fixture"
          disabled={busy || problem !== null}
          onClick={() =>
            void withBusy(async () => runAll(Number.POSITIVE_INFINITY))
          }
        />
        <Toolbar.Item
          icon="stop"
          tooltip="Cancel the run in flight"
          aria-label="Cancel"
          disabled={!busy}
          onClick={cancelValidation}
        />
        <Toolbar.Item
          icon="eraser"
          tooltip="Forget every result"
          aria-label="Clear results"
          disabled={busy || rows.length === 0}
          onClick={clearValidation}
        />
      </Toolbar>

      <div style={bodyStyle}>
        {problem === null ? (
          <Callout compact intent="primary">
            Each fixture is a native <b>xtb 6.7.1</b> calculation. This page
            runs the <code>tier_1_fixed_geometry</code> protocol: the Hessian is
            rebuilt at exactly the stored coordinates with the optimizer
            switched off, so what is compared is the SCF, the finite-difference
            Hessian, the dipole gradients and the mRRHO block — and nothing
            else. Every run uses <b>{occjsSerialEngine.label}</b>, because the
            parallel engine reproduces itself only to about 0.01 cm⁻¹ and this
            table is about exact digits.
          </Callout>
        ) : (
          <Callout compact intent="danger" title="Reference fixtures missing">
            {problem} The page needs all {EXPECTED_FIXTURE_IDS.length} files
            from <code>experiments/reference/fixtures</code> in the build
            context; an empty table would otherwise read as “nothing to check”.
          </Callout>
        )}

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tag minimal intent="success">
            {passed} within tolerance
          </Tag>
          <Tag minimal intent="danger">
            {failed} out of tolerance
          </Tag>
          <Tag minimal>{rows.length} fixtures</Tag>
        </div>

        <ValidationTable
          rows={rows}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRun={(fixtureId) => void withBusy(async () => runOne(fixtureId))}
          busy={busy}
        />

        {selected !== null && (
          <ValidationChecks
            label={selected.label}
            checks={checks[selected.fixtureId] ?? []}
          />
        )}
      </div>
    </div>
  );
}

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
  overflow: 'auto',
} as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 8,
} as const;
