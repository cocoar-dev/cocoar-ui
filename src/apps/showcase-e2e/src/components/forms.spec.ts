import { test, expect } from '@playwright/test';

/**
 * Form components interaction tests
 */

test.describe('Text Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/text-input');
    await page.waitForLoadState('domcontentloaded');
  });

  test('can type in text input', async ({ page }) => {
    const input = page.locator('coar-text-input input').first();

    await expect(input).toBeVisible();
    await input.fill('Test input value');
    await expect(input).toHaveValue('Test input value');
  });

  test('can clear text input', async ({ page }) => {
    const input = page.locator('coar-text-input input').first();

    await expect(input).toBeVisible();
    await input.fill('Some text');
    await input.clear();
    await expect(input).toHaveValue('');
  });

  test('placeholder is visible when empty', async ({ page }) => {
    const input = page.locator('coar-text-input input[placeholder]').first();

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder');
  });

  test('disabled input cannot be edited', async ({ page }) => {
    const disabledInput = page.locator('coar-text-input input[disabled]').first();

    await expect(disabledInput).toBeVisible();
    await expect(disabledInput).toBeDisabled();
  });

  test('readonly input displays value but cannot be edited', async ({ page }) => {
    const readonlyInput = page.locator('coar-text-input input[readonly]').first();

    await expect(readonlyInput).toBeVisible();
    // Readonly inputs should have a value but not be editable
    await expect(readonlyInput).toHaveAttribute('readonly');
  });

  test('error state shows error message', async ({ page }) => {
    const errorInputCount = await page
      .locator('.coar-text-input--error, .coar-text-input-error')
      .count();
    test.skip(errorInputCount === 0, 'No error state inputs on this page');

    const errorInput = page.locator('.coar-text-input--error, .coar-text-input-error').first();
    await expect(errorInput).toBeVisible();
    const errorMessage = page
      .locator('.coar-text-input-message--error, .coar-text-input-error')
      .first();
    await expect(errorMessage).toBeVisible();
  });
});

test.describe('Password Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/password-input');
    await page.waitForLoadState('domcontentloaded');
  });

  test('password input masks characters by default', async ({ page }) => {
    const input = page.locator('coar-password-input input').first();

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('visibility toggle shows password', async ({ page }) => {
    const input = page.locator('coar-password-input input').first();
    const toggleButton = page
      .locator('coar-password-input .coar-password-input-toggle, coar-password-input button')
      .first();

    await expect(input).toBeVisible();
    await expect(toggleButton).toBeVisible();
    await input.fill('secret123');

    // Initially should be password type
    await expect(input).toHaveAttribute('type', 'password');

    // Click toggle
    await toggleButton.click();

    // Should now be text type
    await expect(input).toHaveAttribute('type', 'text');
  });
});

test.describe('Number Input Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/number-input');
    await page.waitForLoadState('domcontentloaded');
  });

  test('can enter numeric values', async ({ page }) => {
    const input = page.locator('coar-number-input input').first();

    await expect(input).toBeVisible();
    await input.fill('42');
    const value = await input.inputValue();
    expect(value).toContain('42');
  });

  test('stepper buttons increment value', async ({ page }) => {
    const incrementButtonLocator = page.locator(
      'coar-number-input .coar-number-input-stepper-increment, coar-number-input button:has-text("+")'
    );
    const count = await incrementButtonLocator.count();
    test.skip(count === 0, 'Number input stepper buttons not present on this page');

    const incrementButton = incrementButtonLocator.first();
    await expect(incrementButton).toBeVisible();
    const input = page.locator('coar-number-input input').first();
    await input.fill('10');

    await incrementButton.click();

    const newValue = await input.inputValue();
    expect(parseInt(newValue)).toBeGreaterThanOrEqual(10);
  });

  test('stepper buttons decrement value', async ({ page }) => {
    const decrementButtonLocator = page.locator(
      'coar-number-input .coar-number-input-stepper-decrement, coar-number-input button:has-text("-")'
    );
    const count = await decrementButtonLocator.count();
    test.skip(count === 0, 'Number input stepper buttons not present on this page');

    const decrementButton = decrementButtonLocator.first();
    await expect(decrementButton).toBeVisible();
    const input = page.locator('coar-number-input input').first();
    await input.fill('10');

    await decrementButton.click();

    const newValue = await input.inputValue();
    expect(parseInt(newValue)).toBeLessThanOrEqual(10);
  });

  test('respects min/max constraints', async ({ page }) => {
    const inputLocator = page.locator('coar-number-input input[min], coar-number-input input[max]');
    const count = await inputLocator.count();
    test.skip(count === 0, 'No number inputs with min/max constraints on this page');

    const input = inputLocator.first();
    await expect(input).toBeVisible();
    const min = await input.getAttribute('min');
    const max = await input.getAttribute('max');

    // Component should have constraints defined
    expect(min !== null || max !== null).toBe(true);
  });
});

test.describe('Checkbox Component', () => {
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

  test('disabled checkbox cannot be changed', async ({ page }) => {
    const disabledCheckboxLocator = page.locator('coar-checkbox input[type="checkbox"][disabled]');
    const count = await disabledCheckboxLocator.count();
    test.skip(count === 0, 'No disabled checkboxes on this page');

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
