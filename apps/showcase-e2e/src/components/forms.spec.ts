import { test, expect } from '@playwright/test';

/**
 * Form components interaction tests
 */

test.describe('Checkbox Component @checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkboxes');
    await page.waitForLoadState('domcontentloaded');
  });

  test('checkbox can be checked', async ({ page }) => {
    const checkboxWrapper = page.locator('.coar-checkbox-wrapper').first();
    const checkbox = checkboxWrapper.locator('input[type="checkbox"]');

    await expect(checkboxWrapper).toBeVisible();
    // Click the wrapper instead of the hidden input
    await checkboxWrapper.click();
    await expect(checkbox).toBeChecked();
  });

  test('checkbox can be unchecked', async ({ page }) => {
    const checkboxWrapper = page.locator('.coar-checkbox-wrapper').first();
    const checkbox = checkboxWrapper.locator('input[type="checkbox"]');

    await expect(checkboxWrapper).toBeVisible();
    // First click will check or uncheck
    await checkboxWrapper.click();
    // Get current state after click settles
    const isChecked = await checkbox.isChecked();
    // Click again to toggle
    await checkboxWrapper.click();
    // Now we should be in the opposite state
    await expect(checkbox).toBeChecked({ checked: !isChecked });
  });

  test('disabled checkbox cannot be changed @fixme', async ({ page }) => {
    const disabledCheckboxLocator = page.locator('coar-checkbox input[type="checkbox"][disabled]');
    const count = await disabledCheckboxLocator.count();
    test.fixme(
      count === 0,
      'Checkboxes page has no disabled-checkbox example; add one in showcase so disabled behavior is enforced.'
    );

    const disabledCheckbox = disabledCheckboxLocator.first();
    await expect(disabledCheckbox).toBeVisible();
    await expect(disabledCheckbox).toBeDisabled();
  });

  test('clicking label toggles checkbox', async ({ page }) => {
    const checkbox = page.locator('coar-checkbox').first();
    const input = checkbox.locator('input[type="checkbox"]');
    const wrapper = checkbox.locator('.coar-checkbox-wrapper').first();

    await expect(wrapper).toBeVisible();
    await expect(input).toBeAttached();
    const initialState = await input.isChecked();

    await wrapper.click();

    await expect(input).toBeChecked({ checked: !initialState });
  });
});
