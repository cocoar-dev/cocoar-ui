import { test, expect } from '@playwright/test';

/**
 * Menu component interaction tests
 *
 * Core behavior: Menu items close the overlay by default when clicked.
 * Optional: Call event.keepMenuOpen() to prevent closing.
 */

test.describe('Menu Component - Close Behavior @menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('domcontentloaded');
  });

  test('context menu closes by default after clicking menu item', async ({ page }) => {
    // Open the overlay-backed context menu by right-clicking the demo area
    const contextArea = page.locator('.context-demo-area');
    await contextArea.click({ button: 'right' });

    // Wait for menu to appear
    const menu = page.locator('.coar-overlay-panel coar-menu').first();
    await expect(menu).toBeVisible();

    // Click a menu item
    const menuItem = menu.locator('coar-menu-item').first();
    await menuItem.click();

    // Move mouse away from menu to trigger hover close
    await page.mouse.move(10, 10);

    // Menu should close automatically (default behavior)
    await expect(menu).not.toBeVisible({ timeout: 1500 });
  });

  test('clicking outside closes context menu', async ({ page }) => {
    // Open the overlay-backed context menu
    const contextArea = page.locator('.context-demo-area');
    await contextArea.click({ button: 'right' });

    // Wait for menu to appear
    const menu = page.locator('.coar-overlay-panel coar-menu').first();
    await expect(menu).toBeVisible();

    // Click outside the menu
    await page.mouse.click(10, 10);

    // Menu should close
    await expect(menu).not.toBeVisible({ timeout: 1000 });
  });
});
