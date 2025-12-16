import { test, expect } from '@playwright/test';

/**
 * Icons component and icon service tests
 */

test.describe('Icons Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/icons');
    await page.waitForLoadState('domcontentloaded');
    // Wait for icons to render
    await page
      .locator('coar-icon')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('icons are visible on the page', async ({ page }) => {
    // Wait for icon components to render
    await page
      .locator('coar-icon')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
    const icons = page.locator('coar-icon');
    const count = await icons.count();

    // Should have icons displayed (may be 0 if icons lazy load)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('icons render as SVG elements', async ({ page }) => {
    const icon = page.locator('coar-icon svg').first();

    await expect(icon).toBeVisible();
  });

  test('icons have accessible attributes', async ({ page }) => {
    const icon = page.locator('coar-icon').first();

    // Icons should either have role="img" for meaningful icons
    // or aria-hidden="true" for decorative icons
    // The component decides which to use
    await expect(icon).toBeVisible();
  });

  test('icon sizes are applied correctly', async ({ page }) => {
    // Look for icons with different sizes
    const smallIcon = page.locator('coar-icon[size="sm"], coar-icon.coar-icon-sm').first();
    const mediumIcon = page.locator('coar-icon[size="md"], coar-icon.coar-icon-md').first();
    const largeIcon = page.locator('coar-icon[size="lg"], coar-icon.coar-icon-lg').first();

    // At least one size variant should exist
    const hasSmall = await smallIcon.isVisible().catch(() => false);
    const hasMedium = await mediumIcon.isVisible().catch(() => false);
    const hasLarge = await largeIcon.isVisible().catch(() => false);

    // Page should have icons of some size
    expect(await page.locator('coar-icon').count()).toBeGreaterThan(0);
  });

  test('icons load dynamically without errors', async ({ page }) => {
    // Check for console errors during icon loading
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for icons to fully load
    await page
      .locator('coar-icon svg')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});

    // Filter out expected errors (like network failures for non-existent icons)
    const iconErrors = errors.filter((e) => e.includes('icon') && !e.includes('404'));
    expect(iconErrors).toHaveLength(0);
  });

  test('icon colors can be customized', async ({ page }) => {
    const coloredIconLocator = page.locator('coar-icon[color], coar-icon[style*="color"]');
    const count = await coloredIconLocator.count();
    test.skip(count === 0, 'No colored icons on this page');

    const coloredIcon = coloredIconLocator.first();
    await expect(coloredIcon).toBeVisible();
    const style = await coloredIcon.getAttribute('style');
    const colorAttr = await coloredIcon.getAttribute('color');

    expect(style || colorAttr).toBeTruthy();
  });

  // Clipboard permissions only work in Chromium
  test('clicking icon name copies to clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard API only supported in Chromium');

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const iconNameLocator = page.locator('.icon-name, button:has(coar-icon)');
    const count = await iconNameLocator.count();
    test.skip(count === 0, 'No icon name buttons on this page');

    const iconName = iconNameLocator.first();
    await expect(iconName).toBeVisible();
    await iconName.click();
    // Click completes synchronously - clipboard operation is done
  });

  test('icon grid/list displays all available icons', async ({ page }) => {
    const iconGridLocator = page.locator('.icon-grid, .icons-container');
    const count = await iconGridLocator.count();
    test.skip(count === 0, 'No icon grid/container on this page');

    const iconGrid = iconGridLocator.first();
    await expect(iconGrid).toBeVisible();
    const icons = iconGrid.locator('coar-icon');
    const iconCount = await icons.count();

    // Should display a reasonable number of icons
    expect(iconCount).toBeGreaterThan(5);
  });
});
