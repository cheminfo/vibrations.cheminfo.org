import { defineConfig, globalIgnores } from 'eslint/config';
import { globals } from 'eslint-config-zakodium';
import react from 'eslint-config-zakodium/react';
import ts from 'eslint-config-zakodium/ts';
import unicorn from 'eslint-config-zakodium/unicorn';

export default defineConfig(
  globalIgnores(['coverage', 'dist']),
  ts,
  unicorn,
  react,
  {
    // The build config and the build scripts run under Node, not in the page.
    files: ['vite.config.ts', 'vitest.config.ts', 'scripts/**'],
    languageOptions: { globals: { ...globals.nodeBuiltin } },
  },
);
