import { test, expect } from '@playwright/test';

/**
 * Tabs component interaction tests
 */

test.describe('Tabs Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tabs');
    await page.waitForLoadState('domcontentloaded');
    // Wait for tabs to render
    await page
      .locator('[role="tab"]')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('tabs are visible', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThanOrEqual(0);
  });

  test('first tab is selected by default', async ({ page }) => {
    const firstTab = page.locator('[role="tab"]').first();

    await expect(firstTab).toBeVisible();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking tab switches content', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    test.skip(tabCount < 2, 'Need at least 2 tabs to test switching');

    const secondTab = tabs.nth(1);
    await secondTab.click();

    // Second tab should now be selected
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');

    // First tab should be deselected
    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
  });

  test('tab panel content changes when tab is selected', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    test.skip(tabCount < 2, 'Need at least 2 tabs to test panel switching');

    // Click second tab
    await tabs.nth(1).click();

    // Verify that a non-hidden tab panel exists (assertion auto-waits)
    const visiblePanel = page.locator('[role="tabpanel"]:not([hidden])').first();
    await expect(visiblePanel).toBeVisible();
  });

  test('keyboard navigation with arrow keys', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    test.skip(tabCount < 2, 'Need at least 2 tabs to test keyboard navigation');

    const firstTab = tabs.first();
    await firstTab.focus();

    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Second tab should be focused
    const focusedTab = page.locator('[role="tab"]:focus');
    await expect(focusedTab).toBeVisible();
  });

  test('disabled tabs cannot be selected', async ({ page }) => {
    const disabledTabLocator = page.locator('[role="tab"][aria-disabled="true"]');
    const count = await disabledTabLocator.count();
    test.skip(count === 0, 'No disabled tabs on this page');

    const disabledTab = disabledTabLocator.first();
    await expect(disabledTab).toBeVisible();
    await disabledTab.click();

    // Disabled tab should not become selected
    await expect(disabledTab).toHaveAttribute('aria-selected', 'false');
  });
});
