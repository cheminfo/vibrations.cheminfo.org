import { beforeEach, expect, test } from 'vitest';

import type { SpectrumTrace } from '../../types/trace.ts';
import { series, usedSeriesColors, visibleResults } from '../series.ts';
import {
  addExperimentalTraces,
  addResult,
  clearResults,
  removeResult,
  selectResult,
  toggleResultVisible,
  toggleTraceVisible,
} from '../seriesActions.ts';

import { fakeResult } from './fakeResult.ts';

function experimentalTrace(id: string): SpectrumTrace {
  return {
    id,
    label: id,
    color: '#000000',
    kind: 'ir-absorbance',
    origin: {
      kind: 'experimental',
      fileName: `${id}.jdx`,
      parser: 'ir-spectrum',
    },
    measurement: {
      variables: {
        x: { data: [1000, 1100], label: 'Wavenumber', units: 'cm-1' },
        y: { data: [0.2, 0.4], label: 'Absorbance' },
      },
    },
  };
}

beforeEach(() => {
  series.results.value = [];
  series.experimental.value = [];
  series.activeResultId.value = null;
});

test('a result is stored, selected and given the first palette colour', () => {
  const entry = addResult(fakeResult('a'));
  expect(entry.color).toBe('#0072b2');
  expect(entry.visible).toBe(true);
  expect(series.activeResultId.value).toBe('a');
  expect(series.results.value).toHaveLength(1);
});

test('computed results and experimental traces never share a colour', () => {
  addResult(fakeResult('a'));
  const [trace] = addExperimentalTraces([experimentalTrace('exp')]);
  const second = addResult(fakeResult('b'));
  expect(trace?.color).toBe('#d55e00');
  expect(second.color).toBe('#009e73');
  expect(usedSeriesColors.value).toStrictEqual([
    '#0072b2',
    '#009e73',
    '#d55e00',
  ]);
});

test('a hidden entry keeps its colour and nobody else gets it', () => {
  addResult(fakeResult('a'));
  toggleResultVisible('a');
  const second = addResult(fakeResult('b'));
  expect(series.results.value[0]?.visible).toBe(false);
  expect(second.color).toBe('#d55e00');
  expect(visibleResults.value.map((entry) => entry.id)).toStrictEqual(['b']);
});

test('recomputing a molecule keeps its colour and its visibility', () => {
  addResult(fakeResult('a'));
  toggleResultVisible('a');
  const again = addResult(fakeResult('a'));
  expect(series.results.value).toHaveLength(1);
  expect(again.color).toBe('#0072b2');
  expect(again.visible).toBe(false);
});

test('removing the active entry selects the one that takes its place', () => {
  addResult(fakeResult('a'));
  addResult(fakeResult('b'));
  addResult(fakeResult('c'));
  selectResult('b');
  removeResult('b');
  expect(series.activeResultId.value).toBe('c');
  removeResult('c');
  expect(series.activeResultId.value).toBe('a');
  expect(series.results.value.map((entry) => entry.id)).toStrictEqual(['a']);
  removeResult('a');
  expect(series.activeResultId.value).toBe(null);
});

test('removing a different entry leaves the selection alone', () => {
  addResult(fakeResult('a'));
  addResult(fakeResult('b'));
  selectResult('a');
  removeResult('b');
  expect(series.activeResultId.value).toBe('a');
});

test('selecting an unknown id selects nothing rather than going stale', () => {
  addResult(fakeResult('a'));
  selectResult('missing');
  expect(series.activeResultId.value).toBe(null);
});

test('clearing the history leaves the experimental traces alone', () => {
  addResult(fakeResult('a'));
  addExperimentalTraces([experimentalTrace('exp')]);
  clearResults();
  expect(series.results.value).toStrictEqual([]);
  expect(series.activeResultId.value).toBe(null);
  expect(series.experimental.value).toHaveLength(1);
});

test('an experimental trace toggles between drawn and hidden', () => {
  addExperimentalTraces([experimentalTrace('exp')]);
  toggleTraceVisible('exp');
  expect(series.experimental.value[0]?.visible).toBe(false);
  toggleTraceVisible('exp');
  expect(series.experimental.value[0]?.visible).toBe(true);
});
