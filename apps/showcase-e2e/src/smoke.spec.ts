import { test, expect } from '@playwright/test';

/**
 * Smoke tests verify that component showcase pages load without critical errors.
 * These run quickly and catch obvious build/render issues with components.
 */

// Component pages to test (excludes design/documentation pages)
const componentPages = [
  { path: '/buttons', name: 'Buttons' },
  { path: '/text-input', name: 'Text Input' },
  { path: '/number-input', name: 'Number Input' },
  { path: '/password-input', name: 'Password Input' },
  { path: '/checkboxes', name: 'Checkboxes' },
  { path: '/tabs', name: 'Tabs' },
  { path: '/cards', name: 'Cards' },
  { path: '/code-block', name: 'Code Block' },
  { path: '/icons', name: 'Icons' },
  { path: '/badges', name: 'Badges' },
  { path: '/tags', name: 'Tags' },
  { path: '/dividers', name: 'Dividers' },
  { path: '/table', name: 'Table' },
  { path: '/notes', name: 'Notes' },
  { path: '/labels', name: 'Labels' },
  { path: '/forms', name: 'Forms' },
];

test.describe('Component Pages Load', () => {
  for (const page of componentPages) {
    test(`${page.name} renders without errors`, async ({ page: browserPage }) => {
      const consoleErrors: string[] = [];

      browserPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('domcontentloaded');

      // Page should have content
      await expect(browserPage.locator('body')).not.toBeEmpty();

      // No critical Angular/component errors
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes('zone.js') &&
          !err.includes('favicon') &&
          (err.includes('Error') || err.includes('Exception'))
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});
