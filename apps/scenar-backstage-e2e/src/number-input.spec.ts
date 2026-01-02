import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Number Input (isolated) @number-input', () => {
  const baseInputs = {
    id: 'demo-number-input',
    label: 'Amount',
    placeholder: '0',
    clearable: true,
  } as const;

  test('allows typing numbers and clearing', async ({ page }) => {
    await openScenario(page, 'demo/number-input', baseInputs);

    const component = page.locator('coar-number-input');
    const input = page.getByLabel('Amount');
    await expect(input).toBeVisible();

    await input.fill('123');
    await expect(input).toHaveValue('123');

    // Clear button is driven by the committed numeric value (value()), which updates on blur.
    await input.blur();

    const clearIcon = component.locator('.coar-number-input-clear');
    await expect(clearIcon).not.toHaveClass(/coar-number-input-clear--hidden/);
    await clearIcon.click();
    await expect(input).toHaveValue('');

    await expect(clearIcon).toHaveClass(/coar-number-input-clear--hidden/);
  });

  test('prefix/suffix render and do not block typing', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      prefix: '€',
      suffix: 'kg',
    });

    const component = page.locator('coar-number-input');
    await expect(component.locator('.coar-number-input-prefix')).toContainText('€');
    await expect(component.locator('.coar-number-input-suffix')).toContainText('kg');

    const input = page.getByLabel('Amount');
    await input.fill('10');
    await expect(input).toHaveValue('10');
  });

  test('readonly: no stepper buttons, clear icon hidden, does not accept typing', async ({
    page,
  }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      value: 12,
      readonly: true,
      stepperButtons: 'both',
    });

    const component = page.locator('coar-number-input');
    const input = page.getByLabel('Amount');

    await expect(input).toHaveJSProperty('readOnly', true);
    await expect(component.locator('.coar-number-input-container')).toHaveClass(
      /coar-number-input-readonly/
    );

    await expect(component.locator('.coar-number-input-buttons')).toHaveCount(0);

    const clearIcon = component.locator('.coar-number-input-clear');
    await expect(clearIcon).toHaveClass(/coar-number-input-clear--hidden/);

    await input.click();
    await page.keyboard.type('3');
    await expect(input).toHaveValue('12');
  });

  test('disabled: stepper buttons not rendered and clear icon hidden', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      value: 12,
      disabled: true,
      stepperButtons: 'both',
    });

    const component = page.locator('coar-number-input');
    const input = page.getByLabel('Amount');
    await expect(input).toBeDisabled();

    await expect(component.locator('.coar-number-input-buttons')).toHaveCount(0);
    await expect(component.locator('.coar-number-input-clear')).toHaveClass(
      /coar-number-input-clear--hidden/
    );
  });

  test('stepper buttons increment/decrement value', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      value: 0,
      step: 1,
      stepperButtons: 'both',
    });

    const input = page.getByLabel('Amount');
    await expect(input).toHaveValue('0');

    const inc = page.getByRole('button', { name: 'Increase value' });
    const dec = page.getByRole('button', { name: 'Decrease value' });

    await inc.click();
    await expect(input).toHaveValue('1');

    await dec.click();
    await expect(input).toHaveValue('0');
  });

  test('keyboard: ArrowUp increments committed value', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      value: 5,
      step: 1,
      stepperButtons: 'none',
    });

    const input = page.getByLabel('Amount');
    await input.focus();
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveValue('6');
  });

  test('keyboard: ArrowDown decrements committed value', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      value: 5,
      step: 1,
      stepperButtons: 'none',
    });

    const input = page.getByLabel('Amount');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveValue('4');
  });

  test('min/max: disables steppers at bounds and sets aria attributes', async ({ page }) => {
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      min: 0,
      max: 10,
      value: 0,
      step: 1,
      stepperButtons: 'both',
    });

    const input = page.getByLabel('Amount');
    await expect(input).toHaveAttribute('aria-valuemin', '0');
    await expect(input).toHaveAttribute('aria-valuemax', '10');
    await expect(input).toHaveAttribute('aria-valuenow', '0');

    const dec = page.getByRole('button', { name: 'Decrease value' });
    await expect(dec).toBeDisabled();

    const inc = page.getByRole('button', { name: 'Increase value' });
    await inc.click();
    await expect(input).toHaveValue('1');

    // Jump to max and verify increment gets disabled.
    await openScenario(page, 'demo/number-input', {
      ...baseInputs,
      min: 0,
      max: 10,
      value: 10,
      step: 1,
      stepperButtons: 'both',
    });

    const inputAtMax = page.getByLabel('Amount');
    await expect(inputAtMax).toHaveAttribute('aria-valuenow', '10');
    await expect(page.getByRole('button', { name: 'Increase value' })).toBeDisabled();
  });
});
