import { beforeEach, expect, test } from 'vitest';

import { routeFromAddress } from '../router.ts';
import { closePanel, openPanel, togglePanel, view } from '../view.ts';

beforeEach(() => {
  view.openPanels.value = new Set(['molecule']);
});

test('a bare page address reads as that page with no parameter', () => {
  expect(routeFromAddress('/collections')).toStrictEqual({
    page: 'collections',
    param: null,
  });
});

test('a second segment is the deep-link parameter, percent-decoded', () => {
  expect(routeFromAddress('/collections/inductive%2Fmesomeric')).toStrictEqual({
    page: 'collections',
    param: 'inductive/mesomeric',
  });
});

test('an unknown or empty address falls back to the calculator', () => {
  expect(routeFromAddress('')).toStrictEqual({
    page: 'calculator',
    param: null,
  });
  expect(routeFromAddress('/nowhere')).toStrictEqual({
    page: 'calculator',
    param: null,
  });
  expect(routeFromAddress('/validation/')).toStrictEqual({
    page: 'validation',
    param: null,
  });
});

test('a link written while the site routed by the hash still opens', () => {
  expect(routeFromAddress('/#/collections/ring-strain')).toStrictEqual({
    page: 'collections',
    param: 'ring-strain',
  });
  expect(routeFromAddress('#/validation')).toStrictEqual({
    page: 'validation',
    param: null,
  });
  expect(routeFromAddress('#/calculator')).toStrictEqual({
    page: 'calculator',
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
