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
      checked: 'indeterminate',
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
      checked: 'checked',
      readonly: true,
    });

    const checkbox = page.locator('coar-checkbox input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();

    const component = page.locator('coar-checkbox');
    await expect(component).toHaveClass(/coar-checkbox--readonly/);
  });
});
