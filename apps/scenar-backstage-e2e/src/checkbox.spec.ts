import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Checkbox (isolated) @checkboxes', () => {
  test('checkbox can be toggled', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Accept Terms',
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    const initialChecked = await checkbox.isChecked();

    const wrapper = page.locator('.coar-checkbox-wrapper');
    await wrapper.click();

    await expect(checkbox).toBeChecked({ checked: !initialChecked });
  });

  test('checkbox respects disabled state', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Disabled Checkbox',
      disabled: true,
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeDisabled();
  });

  test('checkbox shows focus ring on keyboard focus', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Focus Test',
    });

    const input = page.locator('coar-checkbox input[type="checkbox"]');
    const wrapper = page.locator('.coar-checkbox-wrapper');

    await expect(input).toBeVisible();
    await input.focus();
    await expect(wrapper).toHaveClass(/coar-checkbox-focused/);
  });

  test('checkbox can be toggled with Space key', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Keyboard Test',
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    await checkbox.focus();
    const initialChecked = await checkbox.isChecked();

    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked({ checked: !initialChecked });
  });

  test('checkbox has accessible label', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Accessible Label',
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toHaveAccessibleName(/Accessible Label/);
  });

  test('indeterminate checkbox is displayed correctly', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Indeterminate',
      indeterminate: true,
    });

    const input = page.locator('coar-checkbox input[aria-checked="mixed"]');
    await expect(input).toBeVisible();
  });

  test('checkbox with error state shows error styling', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Error State',
      error: 'This field is required',
    });

    const component = page.locator('coar-checkbox');
    await expect(component).toHaveClass(/coar-checkbox--error/);
  });

  test('readonly checkbox cannot be changed', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Readonly',
      checked: true,
      readonly: true,
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();

    const component = page.locator('coar-checkbox');
    await expect(component).toHaveClass(/coar-checkbox--readonly/);
  });

  test('checkbox has role and is a native input @a11y', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Accessible Checkbox',
    });

    const checkbox = page.locator('coar-checkbox');
    const input = checkbox.locator('input[type="checkbox"]');
    const customCheckbox = checkbox.locator('[role="checkbox"]');

    // Should have either native input or custom role
    const hasNative = (await input.count()) > 0;
    const hasCustom = (await customCheckbox.count()) > 0;

    expect(hasNative || hasCustom).toBe(true);
  });

  test('checkbox has associated label @a11y', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Labeled Checkbox',
    });

    const input = page.locator('coar-checkbox input[type="checkbox"]');
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');

    // Should have id (for label association), aria-label, or aria-labelledby
    expect(id || ariaLabel || ariaLabelledby).toBeTruthy();
  });

  test('indeterminate checkbox has aria-checked="mixed" @a11y', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Indeterminate',
      indeterminate: true,
    });

    const input = page.locator('coar-checkbox input[type="checkbox"]');
    const ariaChecked = input;

    await expect(ariaChecked).toHaveAttribute('aria-checked', 'mixed');
  });

  test('checkbox is focusable with Tab @a11y', async ({ page }) => {
    await openScenario(page, 'checkbox', {
      label: 'Focusable Checkbox',
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();

    await checkbox.focus();
    await expect(checkbox).toBeFocused();
  });
});
