/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => {
  // Angular's TestBed has shared global state and is sensitive to concurrency.
  // CI is faster and more parallel, so we disable file parallelism there for stability.
  // Locally we keep the default to retain fast feedback.
  const isCi = process.env.CI === 'true' || process.env.CI === '1';

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/libs/ui-components',
    plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    test: {
      name: 'ui-components',
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
        reportsDirectory: '../../coverage/libs/ui-components',
        provider: 'v8' as const,
      },
    },
  };
});
