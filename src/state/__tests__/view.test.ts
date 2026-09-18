import { beforeEach, expect, test } from 'vitest';

import {
  closePanel,
  openPanel,
  routeFromHash,
  togglePanel,
  view,
} from '../view.ts';

beforeEach(() => {
  view.openPanels.value = new Set(['molecule']);
});

test('a bare page hash reads as that page with no parameter', () => {
  expect(routeFromHash('#/collections')).toStrictEqual({
    page: 'collections',
    param: null,
  });
});

test('a second segment is the deep-link parameter, percent-decoded', () => {
  expect(routeFromHash('#/collections/inductive%2Fmesomeric')).toStrictEqual({
    page: 'collections',
    param: 'inductive/mesomeric',
  });
});

test('an unknown or empty hash falls back to the calculator', () => {
  expect(routeFromHash('')).toStrictEqual({ page: 'calculator', param: null });
  expect(routeFromHash('#/nowhere')).toStrictEqual({
    page: 'calculator',
    param: null,
  });
  expect(routeFromHash('#/validation/')).toStrictEqual({
    page: 'validation',
    param: null,
  });
});

test('toggling a panel opens it and closes it again', () => {
  togglePanel('modes');
  expect([...view.openPanels.value]).toStrictEqual(['molecule', 'modes']);
  togglePanel('modes');
  expect([...view.openPanels.value]).toStrictEqual(['molecule']);
});

test('opening an already-open panel does not replace the set', () => {
  const before = view.openPanels.value;
  openPanel('molecule');
  expect(view.openPanels.value).toBe(before);
  closePanel('modes');
  expect(view.openPanels.value).toBe(before);
});
