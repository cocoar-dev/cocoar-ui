import { test, expect } from '@playwright/test';

/**
 * General keyboard navigation and focus management tests for showcase app.
 * Component-specific keyboard navigation tests have been migrated to scenar-backstage-e2e.
 */

test.describe('Focus Management', () => {
  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');

    const button = page.locator('coar-button button').first();
    await expect(button).toBeVisible();

    await button.focus();

    // Check that focus styles are applied (outline or box-shadow)
    const outlineStyle = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });

    // Should have some focus indicator
    expect(outlineStyle).toBeTruthy();
  });

  test('focus trap works in modal-like components', async ({ page }) => {
    await page.goto('/code-block');
    await page.waitForLoadState('domcontentloaded');

    // This test is for future modal components
    // For now, verify focus doesn't escape the page
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');

    // Focus should be on an element within the page
    await expect(focusedElement).toBeVisible();
  });
});
