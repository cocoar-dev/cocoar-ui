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

  test('clicking item in nested submenu closes all menus in hierarchy', async ({ page }) => {
    // Open the context menu
    const contextArea = page.locator('.context-demo-area');
    await contextArea.click({ button: 'right' });

    // Wait for root menu to appear
    const rootMenu = page.locator('.coar-overlay-panel coar-menu').first();
    await expect(rootMenu).toBeVisible();

    // Hover over "Share" to open first-level submenu
    const shareItem = rootMenu.locator('coar-sub-flyout').filter({ hasText: 'Share' });
    await shareItem.hover();

    // Wait for Share submenu to appear
    const shareSubmenu = page.locator('.coar-overlay-panel coar-menu').nth(1);
    await expect(shareSubmenu).toBeVisible();

    // Hover over "Copy Link" to open second-level submenu
    const copyLinkItem = shareSubmenu.locator('coar-sub-flyout').filter({ hasText: 'Copy Link' });
    await copyLinkItem.hover();

    // Wait for Copy Link submenu to appear
    const copyLinkSubmenu = page.locator('.coar-overlay-panel coar-menu').nth(2);
    await expect(copyLinkSubmenu).toBeVisible();

    // Click a menu item in the deeply nested submenu
    const markdownItem = copyLinkSubmenu
      .locator('coar-menu-item')
      .filter({ hasText: 'Copy as Markdown' });
    await markdownItem.click();

    // Move mouse away to ensure hover state doesn't interfere
    await page.mouse.move(10, 10);

    // All menus should close (root, Share submenu, and Copy Link submenu)
    await expect(rootMenu).not.toBeVisible({ timeout: 1500 });
    await expect(shareSubmenu).not.toBeVisible({ timeout: 1500 });
    await expect(copyLinkSubmenu).not.toBeVisible({ timeout: 1500 });
  });
});
