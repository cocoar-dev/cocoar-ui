/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => {
  const ciEnv = process.env['CI'];
  const isCi = ciEnv === 'true' || ciEnv === '1';

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/libs/ui-overlay',
    plugins: [angular(), nxViteTsPaths()],
    test: {
      name: 'ui-overlay',
      watch: false,
      globals: true,
      environment: 'jsdom',
      fileParallelism: !isCi,
      sequence: {
        setupFiles: 'list',
      },
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['src/test-setup.ts'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/libs/ui-overlay',
        provider: 'v8' as const,
      },
    },
  };
});
