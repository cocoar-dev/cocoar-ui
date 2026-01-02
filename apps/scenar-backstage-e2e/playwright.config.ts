import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

function isCi() {
  const ciEnv = process.env['CI'];
  return ciEnv === 'true' || ciEnv === '1';
}

function parseBrowserList(rawValue: string | undefined): Array<'chromium' | 'firefox' | 'webkit'> {
  if (!rawValue) return [];

  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) return [];
  if (normalized === 'all') return ['chromium', 'firefox', 'webkit'];

  const parts = normalized
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const result: Array<'chromium' | 'firefox' | 'webkit'> = [];
  for (const part of parts) {
    if (part === 'chromium' || part === 'firefox' || part === 'webkit') {
      result.push(part);
    }
  }

  return Array.from(new Set(result));
}

function selectedProjects() {
  const configured = parseBrowserList(process.env['COAR_E2E_BROWSERS']);
  const requested =
    configured.length > 0 ? configured : isCi() ? ['chromium', 'firefox', 'webkit'] : ['chromium'];

  const available = {
    chromium: {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    firefox: {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    webkit: {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  };

  type BrowserKey = keyof typeof available;
  const isBrowserKey = (key: string): key is BrowserKey => key in available;
  return requested.filter(isBrowserKey).map((key) => available[key]);
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  // When running through our Nx wrapper script, the dev server lifecycle is managed externally.
  // This avoids orphaned servers on Windows.
  webServer: process.env['COAR_E2E_MANAGED_SERVER']
    ? undefined
    : {
        command: 'pnpm exec nx serve scenar-backstage',
        url: 'http://localhost:4300',
        reuseExistingServer: true,
        cwd: workspaceRoot,
      },
  projects: selectedProjects(),
});
