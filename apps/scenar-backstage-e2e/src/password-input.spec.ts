import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Password Input (isolated) @password-input', () => {
  const baseInputs = {
    id: 'demo-password-input',
    label: 'Password',
    placeholder: 'Enter password',
    value: '',
    clearable: true,
  } as const;

  test('allows typing and clearing', async ({ page }) => {
    await openScenario(page, 'demo/password-input', baseInputs);

    const input = page.getByRole('textbox', { name: 'Password' });
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'password');

    await input.fill('secret');
    await expect(input).toHaveValue('secret');

    const clearIcon = page.locator('.coar-password-input-clear');
    await expect(clearIcon).toBeVisible();
    await clearIcon.click();

    await expect(input).toHaveValue('');
  });

  test('toggle visibility switches input type', async ({ page }) => {
    await openScenario(page, 'demo/password-input', {
      ...baseInputs,
      value: 'secret',
    });

    const input = page.getByRole('textbox', { name: 'Password' });
    await expect(input).toHaveAttribute('type', 'password');

    const toggle = page.locator('.coar-password-input-toggle');
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'text');

    await toggle.click();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('readonly: does not accept typing, hides clear icon, blocks toggle', async ({ page }) => {
    await openScenario(page, 'demo/password-input', {
      ...baseInputs,
      value: 'secret',
      readonly: true,
    });

    const component = page.locator('coar-password-input');
    const input = page.getByRole('textbox', { name: 'Password' });

    await expect(input).toHaveJSProperty('readOnly', true);
    await expect(component.locator('.coar-password-input-container')).toHaveClass(
      /coar-password-input-readonly/
    );

    await input.click();
    await page.keyboard.type('X');
    await expect(input).toHaveValue('secret');

    await expect(component.locator('.coar-password-input-clear')).toHaveCount(0);

    const toggle = component.locator('.coar-password-input-toggle');
    await toggle.click({ force: true, timeout: 1000 });
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('disabled: prevents input, hides clear icon, blocks toggle', async ({ page }) => {
    await openScenario(page, 'demo/password-input', {
      ...baseInputs,
      value: 'secret',
      disabled: true,
    });

    const component = page.locator('coar-password-input');
    const input = page.getByRole('textbox', { name: 'Password' });
    await expect(input).toBeDisabled();
    await expect(component.locator('.coar-password-input-container')).toHaveClass(
      /coar-password-input-disabled/
    );

    await expect(component.locator('.coar-password-input-clear')).toHaveCount(0);

    const toggle = component.locator('.coar-password-input-toggle');
    await toggle.click({ force: true, timeout: 1000 });
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('maxlength: truncates typing and paste', async ({ page }) => {
    await openScenario(page, 'demo/password-input', {
      ...baseInputs,
      maxlength: 3,
    });

    const input = page.getByRole('textbox', { name: 'Password' });
    await expect(input).toHaveAttribute('maxlength', '3');

    await input.click();
    await page.keyboard.type('abcd');
    await expect(input).toHaveValue('abc');

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(async () => {
      await navigator.clipboard.writeText('abcdef');
    });

    await input.fill('');
    await page.keyboard.press('Control+V');
    await expect(input).toHaveValue('abc');
  });
});
