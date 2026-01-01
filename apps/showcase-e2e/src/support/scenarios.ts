import type { Page } from '@playwright/test';
import { serializeWithCodecs } from './scenario-codecs';

/**
 * Configuration for opening scenarios
 */
export interface OpenScenarioOptions {
  /**
   * Timeout for navigation in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Wait until condition
   * @default 'networkidle'
   */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
}

/**
 * Opens a scenario by ID with optional input parameters.
 * Uses the baseURL configured in playwright.config.ts.
 *
 * @param page - Playwright page object
 * @param scenarioId - Scenario ID (e.g., 'demo/icon', 'ui/button/primary')
 * @param inputs - Optional inputs to override scenario defaults (passed as query parameters)
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * test('icon renders correctly', async ({ page }) => {
 *   await openScenario(page, 'demo/icon', { name: 'check', size: 'lg' });
 *   await expect(page.locator('coar-icon')).toBeVisible();
 * });
 *
 * test('date picker with date', async ({ page }) => {
 *   await openScenario(page, 'ui/date-picker', {
 *     selectedDate: new Date('2025-01-15'),
 *     allowedDays: [1, 2, 3, 4, 5]
 *   });
 * });
 * ```
 */
export async function openScenario(
  page: Page,
  scenarioId: string,
  inputs?: Record<string, any>,
  options?: OpenScenarioOptions
): Promise<void> {
  const timeout = options?.timeout ?? 30000;
  const waitUntil = options?.waitUntil ?? 'networkidle';

  // Construct path with query parameters
  const url = new URL(`/__scenario/${encodeURIComponent(scenarioId)}`, 'http://dummy');

  // Add input parameters as query params using codec-based serialization
  if (inputs) {
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, serializeWithCodecs(value));
      }
    }
  }

  // Use path + search (Playwright will prepend baseURL from config)
  const path = url.pathname + url.search;
  await page.goto(path, { timeout, waitUntil });
}
