import { signal } from '@preact/signals-react';
import { afterEach, expect, test } from 'vitest';

import { persistBucket } from '../persist.ts';

interface FakeStore {
  entries: Map<string, string>;
  full: boolean;
}

function installStorage(): FakeStore {
  const store: FakeStore = { entries: new Map(), full: false };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.entries.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (store.full) {
          const error = new Error('full');
          error.name = 'QuotaExceededError';
          throw error;
        }
        store.entries.set(key, value);
      },
      removeItem: (key: string) => store.entries.delete(key),
    },
  });
  return store;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage');
});

test('a bucket is stored under a namespaced, versioned key', () => {
  const store = installStorage();
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 3);
  bucket.fwhm.value = 8;
  expect([...store.entries.keys()]).toStrictEqual(['vibrations:probe:v3']);
  expect(store.entries.get('vibrations:probe:v3')).toBe('{"fwhm":8}');
});

test('a stored bucket is read back, nested groups included', () => {
  const store = installStorage();
  store.entries.set(
    'vibrations:probe:v3',
    '{"fwhm":7,"window":{"from":600,"to":3800}}',
  );
  const bucket = persistBucket(
    'probe',
    { fwhm: signal(20), window: { from: signal(500), to: signal(4000) } },
    3,
  );
  expect(bucket.fwhm.value).toBe(7);
  expect(bucket.window.from.value).toBe(600);
  expect(bucket.window.to.value).toBe(3800);
});

test('a leaf added since the last save keeps its default', () => {
  const store = installStorage();
  store.entries.set('vibrations:probe:v3', '{"fwhm":7}');
  const bucket = persistBucket(
    'probe',
    { fwhm: signal(20), tracking: signal(true) },
    3,
  );
  expect(bucket.fwhm.value).toBe(7);
  expect(bucket.tracking.value).toBe(true);
});

test('a key the bucket no longer declares is ignored, then dropped', () => {
  const store = installStorage();
  store.entries.set('vibrations:probe:v3', '{"fwhm":7,"retired":"anything"}');
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 3);
  expect(bucket.fwhm.value).toBe(7);
  bucket.fwhm.value = 12;
  expect(store.entries.get('vibrations:probe:v3')).toBe('{"fwhm":12}');
});

test('an older version is ignored rather than migrated', () => {
  const store = installStorage();
  store.entries.set('vibrations:probe:v1', '{"fwhm":7}');
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 2);
  expect(bucket.fwhm.value).toBe(20);
});

test('a full store loses the preference instead of the page', () => {
  const store = installStorage();
  store.full = true;
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 3);
  expect(() => {
    bucket.fwhm.value = 9;
  }).not.toThrow();
  expect(bucket.fwhm.value).toBe(9);
  expect(store.entries.size).toBe(0);
});

test('a store that throws on read leaves the defaults in place', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('blocked');
    },
  });
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 3);
  expect(bucket.fwhm.value).toBe(20);
});

test('no store at all is not an error', () => {
  const bucket = persistBucket('probe', { fwhm: signal(20) }, 3);
  bucket.fwhm.value = 11;
  expect(bucket.fwhm.value).toBe(11);
});

test('opening the page does not write the defaults back', () => {
  const store = installStorage();
  persistBucket('probe', { fwhm: signal(20) }, 3);
  expect(store.entries.size).toBe(0);
});
