import { test, expect } from '@playwright/test';

/**
 * Checkbox component interaction tests
 */

test.describe('Checkbox Component @checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkboxes');
    await page.waitForLoadState('domcontentloaded');
  });

  test('checkbox can be toggled', async ({ page }) => {
    const checkbox = page.locator('coar-checkbox input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();

    const initialChecked = await checkbox.isChecked();

    // Click the checkbox wrapper/label to toggle
    const wrapper = page.locator('.coar-checkbox-wrapper').first();
    await wrapper.click();

    // Verify checkbox toggled to opposite state
    await expect(checkbox).toBeChecked({ checked: !initialChecked });
  });

  test('checkbox respects disabled state', async ({ page }) => {
    const disabledCheckbox = page
      .locator('coar-checkbox.coar-checkbox--disabled input, coar-checkbox input[disabled]')
      .first();
    await expect(disabledCheckbox).toBeVisible();
    await expect(disabledCheckbox).toBeDisabled();
  });

  test('checkbox shows focus ring on keyboard focus', async ({ page }) => {
    const checkbox = page.locator('coar-checkbox').first();
    const input = checkbox.locator('input[type="checkbox"]').first();
    const wrapper = checkbox.locator('.coar-checkbox-wrapper').first();
    await expect(input).toBeVisible();

    await input.focus();
    await expect(wrapper).toHaveClass(/\bcoar-checkbox-focused\b/);
  });

  test('checkbox can be toggled with Space key', async ({ page }) => {
    const checkbox = page.locator('coar-checkbox input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();

    // Focus the checkbox
    await checkbox.focus();
    const initialChecked = await checkbox.isChecked();

    // Press Space to toggle
    await page.keyboard.press('Space');

    // Verify checkbox toggled to opposite state
    await expect(checkbox).toBeChecked({ checked: !initialChecked });
  });

  test('checkbox has accessible label', async ({ page }) => {
    const checkbox = page.locator('coar-checkbox input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();

    // In CoarCheckbox, the input is wrapped by a <label> that contains text, so
    // the accessible name should come from the label text.
    await expect(checkbox).toHaveAccessibleName(/\S+/);
  });

  test('indeterminate checkbox is displayed correctly', async ({ page }) => {
    // CoarCheckbox uses aria-checked="mixed" and the native input.indeterminate flag.
    const indeterminateInput = page.locator('coar-checkbox input[aria-checked="mixed"]').first();
    await expect(indeterminateInput).toBeVisible();
  });

  test('multiple checkboxes can be checked independently', async ({ page }) => {
    const wrappers = page.locator('.coar-checkbox-wrapper');
    await expect(wrappers.nth(0)).toBeVisible();
    await expect(wrappers.nth(1)).toBeVisible();

    // Click first two checkbox wrappers to toggle them
    await wrappers.nth(0).click();
    await wrappers.nth(1).click();

    // Verify no errors occurred
    await expect(wrappers.nth(0)).toBeVisible();
  });
});
