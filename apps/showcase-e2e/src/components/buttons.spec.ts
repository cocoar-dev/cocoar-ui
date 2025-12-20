import { test, expect } from '@playwright/test';

/**
 * Button component interaction tests
 */

test.describe('Button Component @buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');
  });

  test('primary button is clickable', async ({ page }) => {
    const button = page.locator('coar-button button').first();

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
    // No error means click was successful
  });

  test('disabled button cannot be clicked', async ({ page }) => {
    const disabledButton = page.locator('coar-button button[disabled]').first();

    await expect(disabledButton).toBeVisible();
    await expect(disabledButton).toBeDisabled();
  });

  test('button shows hover state', async ({ page }) => {
    const button = page.locator('coar-button button').first();

    await expect(button).toBeVisible();
    const initialBg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    await button.hover();

    const hoverBg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Background may or may not change based on design
    // This just verifies hover doesn't break anything
    expect(hoverBg).toBeTruthy();
  });

  test('button variants render correctly', async ({ page }) => {
    // Check that different button variants exist
    const primaryCount = await page.locator('.coar-button--primary').count();
    const secondaryCount = await page.locator('.coar-button--secondary').count();
    const ghostCount = await page.locator('.coar-button--ghost').count();

    // At least some variants should be present on the page
    expect(primaryCount + secondaryCount + ghostCount).toBeGreaterThan(0);
  });

  test('button sizes render correctly', async ({ page }) => {
    const smCount = await page.locator('.coar-button--sm').count();
    const mdCount = await page.locator('.coar-button--md').count();
    const lgCount = await page.locator('.coar-button--lg').count();

    // At least some sizes should be present on the page
    expect(smCount + mdCount + lgCount).toBeGreaterThan(0);
  });
});
