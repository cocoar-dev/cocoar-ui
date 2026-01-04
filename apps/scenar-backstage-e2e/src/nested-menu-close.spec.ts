import { test, expect } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

/**
 * E2E test for nested menu close behavior bug.
 *
 * Tests the scenario where clicking an item in a nested submenu
 * should close both the root menu and all submenu flyouts.
 */
test.describe('Nested Menu Close Bug @menu @bug', () => {
  test.beforeEach(async ({ page }) => {
    await openScenario(page, 'menu/nested-close-bug');
  });

  test('clicking item in first-level submenu closes all menus', async ({ page }) => {
    const demoArea = page.locator('[data-testid="context-demo-area"]');

    // Open context menu
    await demoArea.click({ button: 'right' });

    // Wait for root menu to appear
    await page.waitForSelector('.coar-overlay-panel coar-menu', { state: 'visible' });
    const rootMenu = page.locator('.coar-overlay-panel').first();
    await expect(rootMenu).toBeVisible();

    // Hover over "Status" to open submenu
    const statusItem = page.locator('coar-submenu-item').filter({ hasText: 'Status' });
    await statusItem.hover();

    // Wait for submenu flyout to appear
    await page.waitForTimeout(300); // Allow for hover delay
    const overlayPanels = page.locator('.coar-overlay-panel');
    const overlayCount = await overlayPanels.count();
    expect(overlayCount).toBeGreaterThan(1); // Should have root + submenu

    // Click an item in the submenu
    const newItem = page
      .locator('.coar-overlay-panel')
      .nth(1)
      .locator('coar-menu-item')
      .filter({ hasText: 'New' });
    await newItem.click();

    // Move mouse away to prevent hover interference
    await page.mouse.move(10, 10);

    // Wait for animations to complete
    await page.waitForTimeout(500);

    // Verify all overlays are closed
    const visibleOverlays = await page.locator('.coar-overlay-panel:visible').count();
    expect(visibleOverlays).toBe(0);

    // Verify action was logged
    const actionLog = page.locator('[data-testid="action-log"]');
    await expect(actionLog).toContainText('Action: Status: New');
  });

  test('clicking item in second-level nested submenu closes all menus', async ({ page }) => {
    const demoArea = page.locator('[data-testid="context-demo-area"]');

    // Open context menu
    await demoArea.click({ button: 'right' });

    // Wait for root menu
    await page.waitForSelector('.coar-overlay-panel coar-menu', { state: 'visible' });

    // Hover over "Advanced" to open first submenu
    const advancedItem = page.locator('coar-submenu-item').filter({ hasText: 'Advanced' }).first();
    await advancedItem.hover();
    await page.waitForTimeout(300);

    // Hover over "More Options" to open second-level submenu
    const moreOptionsItem = page
      .locator('.coar-overlay-panel')
      .nth(1)
      .locator('coar-submenu-item')
      .filter({ hasText: 'More Options' });
    await moreOptionsItem.hover();
    await page.waitForTimeout(300);

    // Should now have 3 overlay panels (root + 2 submenus)
    const overlayCount = await page.locator('.coar-overlay-panel').count();
    expect(overlayCount).toBe(3);

    // Click an item in the deeply nested submenu
    const subOptionA = page
      .locator('.coar-overlay-panel')
      .nth(2)
      .locator('coar-menu-item')
      .filter({ hasText: 'Sub-option A' });
    await subOptionA.click();

    // Move mouse away
    await page.mouse.move(10, 10);

    // Wait for animations
    await page.waitForTimeout(500);

    // Verify all overlays are closed
    const visibleOverlays = await page.locator('.coar-overlay-panel:visible').count();
    expect(visibleOverlays).toBe(0);

    // Verify action was logged
    const actionLog = page.locator('[data-testid="action-log"]');
    await expect(actionLog).toContainText('Action: Advanced: More: A');
  });

  test('clicking item in Priority submenu closes all menus', async ({ page }) => {
    const demoArea = page.locator('[data-testid="context-demo-area"]');

    // Open context menu
    await demoArea.click({ button: 'right' });
    await page.waitForSelector('.coar-overlay-panel coar-menu', { state: 'visible' });

    // Hover over "Priority"
    const priorityItem = page.locator('coar-submenu-item').filter({ hasText: 'Priority' }).first();
    await priorityItem.hover();
    await page.waitForTimeout(300);

    // Click "Critical" in the submenu
    const criticalItem = page
      .locator('.coar-overlay-panel')
      .nth(1)
      .locator('coar-menu-item')
      .filter({ hasText: 'Critical' });
    await criticalItem.click();

    await page.mouse.move(10, 10);
    await page.waitForTimeout(500);

    // Verify all closed
    const visibleOverlays = await page.locator('.coar-overlay-panel:visible').count();
    expect(visibleOverlays).toBe(0);

    const actionLog = page.locator('[data-testid="action-log"]');
    await expect(actionLog).toContainText('Action: Priority: Critical');
  });

  test('visual inspection: check if overlays remain after click', async ({ page }) => {
    // This test is designed to be run manually for visual verification
    const demoArea = page.locator('[data-testid="context-demo-area"]');

    await demoArea.click({ button: 'right' });
    await page.waitForSelector('.coar-overlay-panel coar-menu', { state: 'visible' });

    const statusItem = page.locator('coar-submenu-item').filter({ hasText: 'Status' });
    await statusItem.hover();
    await page.waitForTimeout(300);

    // Take screenshot before click
    await page.screenshot({ path: 'test-results/before-click.png' });

    const inProgressItem = page
      .locator('.coar-overlay-panel')
      .nth(1)
      .locator('coar-menu-item')
      .filter({ hasText: 'In Progress' });
    await inProgressItem.click();

    // Take screenshot after click (should show no overlays)
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/after-click.png' });

    const visibleOverlays = await page.locator('.coar-overlay-panel:visible').count();
    expect(visibleOverlays).toBe(0);
  });
});
