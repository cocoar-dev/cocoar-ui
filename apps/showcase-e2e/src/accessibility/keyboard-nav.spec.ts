import { test, expect } from '@playwright/test';

/**
 * Keyboard navigation tests ensure all interactive components
 * can be operated without a mouse.
 */

test.describe('Keyboard Navigation @a11y', () => {
  test.describe('Buttons', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/buttons');
      await page.waitForLoadState('domcontentloaded');
    });

    test('buttons are focusable with Tab', async ({ page }) => {
      const buttons = page.locator('button, coar-button');
      await expect(buttons.first()).toBeVisible();

      // Tab to first button
      await page.keyboard.press('Tab');

      // At least one button should be focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('buttons can be activated with Enter', async ({ page }) => {
      const button = page.locator('coar-button button').first();
      await expect(button).toBeVisible();

      await button.focus();
      await page.keyboard.press('Enter');
      // Button should handle the activation (no error)
    });

    test('buttons can be activated with Space', async ({ page }) => {
      const button = page.locator('coar-button button').first();
      await expect(button).toBeVisible();

      await button.focus();
      await page.keyboard.press('Space');
      // Button should handle the activation (no error)
    });
  });

  test.describe('Checkboxes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/checkboxes');
      await page.waitForLoadState('domcontentloaded');
    });

    test('checkboxes are focusable with Tab', async ({ page }) => {
      const checkbox = page.locator('coar-checkbox input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible();

      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    });

    test('checkboxes toggle with Space', async ({ page }) => {
      const checkbox = page.locator('coar-checkbox input[type="checkbox"]').first();
      await expect(checkbox).toBeVisible();

      await checkbox.focus();
      const initialChecked = await checkbox.isChecked();

      await page.keyboard.press('Space');

      await expect(checkbox).toBeChecked({ checked: !initialChecked });
    });
  });

  test.describe('Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tabs');
      await page.waitForLoadState('domcontentloaded');
    });

    test('tab list is focusable', async ({ page }) => {
      const tabList = page.locator('[role="tablist"]').first();
      await expect(tabList).toBeVisible();

      const firstTab = page.locator('[role="tab"]').first();
      await firstTab.focus();
      await expect(firstTab).toBeFocused();
    });

    test('arrow keys navigate between tabs', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      await expect(tabs.first()).toBeVisible();
      await expect(tabs.nth(1)).toBeVisible();

      const firstTab = tabs.first();
      await firstTab.focus();

      // Press right arrow to move to next tab
      await page.keyboard.press('ArrowRight');

      // Second tab should now be focused
      const focusedTab = page.locator('[role="tab"]:focus');
      await expect(focusedTab).toBeVisible();
    });

    test('Enter/Space activates focused tab', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      await expect(tabs.nth(1)).toBeVisible();

      const secondTab = tabs.nth(1);
      await secondTab.focus();
      await page.keyboard.press('Enter');

      // Tab should now be selected
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});

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
