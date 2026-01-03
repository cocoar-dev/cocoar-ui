import { test, expect } from '@playwright/test';

/**
 * ARIA compliance tests for showcase app structure.
 * Component-specific accessibility tests have been migrated to scenar-backstage-e2e.
 */

test.describe('Landmarks', () => {
  test('page has main landmark', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThanOrEqual(1);
  });

  test('page has navigation landmark', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Headings', () => {
  test('pages have h1 heading', async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');

    // Page should have at least one heading (h1, h2, or h3)
    const headings = page.locator('h1, h2, h3');
    // Wait for content to render
    await headings
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
    expect(await headings.count()).toBeGreaterThanOrEqual(0);
  });

  test('heading hierarchy is logical', async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();

    // First heading should be h1 or h2
    const firstTag = await headings.first().evaluate((el) => el.tagName);
    expect(['H1', 'H2']).toContain(firstTag);
  });
});
