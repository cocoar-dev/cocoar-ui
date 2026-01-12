/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/i18n',
  plugins: [angular(), nxViteTsPaths()],
  test: {
    name: 'i18n',
    watch: false,
    globals: true,
    environment: 'jsdom',
    sequence: {
      setupFiles: 'list',
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/setup-zone-once.ts', 'src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/i18n',
      provider: 'v8' as const,
    },
  },
}));
