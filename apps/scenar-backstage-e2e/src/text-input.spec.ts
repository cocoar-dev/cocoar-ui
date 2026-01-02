import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Text Input (isolated) @text-input', () => {
  const baseInputs = {
    id: 'demo-text-input',
    label: 'Name',
    placeholder: 'Type here',
    value: '',
    clearable: true,
  } as const;

  test('allows typing and clearing', async ({ page }, testInfo) => {
    await openScenario(page, 'input/text', baseInputs);

    const input = page.getByLabel('Name');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Type here');

    await input.fill('Alice');
    await expect(input).toHaveValue('Alice');

    const clearIcon = page.locator('.coar-text-input-clear');
    await expect(clearIcon).toBeVisible();
    await clearIcon.click();

    await expect(input).toHaveValue('');

    const screenshot = await page.screenshot({ fullPage: false });
    await testInfo.attach('text-input', { body: screenshot, contentType: 'image/png' });
  });

  test('disabled: applies disabled style, prevents input, hides clear icon', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      value: 'Alice',
      disabled: true,
      clearable: true,
    });

    const component = page.locator('coar-text-input');
    const input = page.getByLabel('Name');
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue('Alice');

    const container = component.locator('.coar-text-input-container');
    await expect(container).toHaveClass(/coar-text-input-disabled/);

    const clearIcon = component.locator('.coar-text-input-clear');
    await expect(clearIcon).toHaveCount(0);

    try {
      await input.fill('Bob', { timeout: 500 });
    } catch {
      // Expected: Playwright refuses to fill a disabled input.
    }
    await expect(input).toHaveValue('Alice');
  });

  test('label click focuses input', async ({ page }) => {
    await openScenario(page, 'input/text', baseInputs);

    const input = page.getByLabel('Name');
    await expect(input).not.toBeFocused();

    await page.getByText('Name', { exact: true }).click();
    await expect(input).toBeFocused();
  });

  test('error message wins over hint + aria attributes are set', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      id: 'text-input-aria',
      error: 'Oops',
      hint: 'Helpful hint',
    });

    const input = page.getByLabel('Name');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', 'text-input-aria-message');

    const message = page.locator('#text-input-aria-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Oops');
    await expect(message).not.toContainText('Helpful hint');
    await expect(message).toHaveClass(/coar-text-input-message-error/);
  });

  test('multiline renders textarea and sets multiline host class', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      id: 'text-input-multiline',
      label: 'Description',
      rows: 3,
    });

    const field = page.getByLabel('Description');
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute('rows', '3');

    const tagName = await field.evaluate((el) => el.tagName);
    expect(tagName).toBe('TEXTAREA');

    await expect(page.locator('coar-text-input')).toHaveClass(/coar-text-input--multiline/);
  });

  test('readonly: is focusable, does not accept typing, hides clear icon', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      value: 'Alice',
      readonly: true,
      clearable: true,
    });

    const component = page.locator('coar-text-input');
    const input = page.getByLabel('Name');
    await expect(input).toBeVisible();
    await expect(input).toHaveJSProperty('readOnly', true);
    await expect(input).toHaveValue('Alice');

    const container = component.locator('.coar-text-input-container');
    await expect(container).toHaveClass(/coar-text-input-readonly/);

    const clearIcon = component.locator('.coar-text-input-clear');
    await expect(clearIcon).toHaveCount(0);

    await input.click();
    await expect(input).toBeFocused();
    await page.keyboard.type('Bob');
    await expect(input).toHaveValue('Alice');
  });

  test('maxlength: limits user typing', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      maxlength: 3,
    });

    const input = page.getByLabel('Name');
    await expect(input).toHaveAttribute('maxlength', '3');

    await input.click();
    await page.keyboard.type('abcd');
    await expect(input).toHaveValue('abc');
  });

  test('maxlength: truncates pasted text', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      maxlength: 3,
    });

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(async () => {
      await navigator.clipboard.writeText('abcdef');
    });

    const input = page.getByLabel('Name');
    await input.click();
    await page.keyboard.press('Control+V');

    await expect(input).toHaveValue('abc');
  });

  test('prefix/suffix: renders and does not block typing', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      prefix: '€',
      suffix: 'kg',
    });

    const component = page.locator('coar-text-input');
    await expect(component.locator('.coar-text-input-prefix')).toContainText('€');
    await expect(component.locator('.coar-text-input-suffix')).toContainText('kg');

    const input = page.getByLabel('Name');
    await input.fill('10');
    await expect(input).toHaveValue('10');
  });

  test('required: sets required attribute and shows asterisk', async ({ page }) => {
    await openScenario(page, 'input/text', {
      ...baseInputs,
      required: true,
    });

    const component = page.locator('coar-text-input');
    const input = page.getByLabel('Name');
    await expect(input).toHaveAttribute('required', '');
    await expect(component.locator('.coar-text-input-required')).toBeVisible();
  });

  test('keyboard: Tab moves focus between inputs', async ({ page }) => {
    await openScenario(page, 'input/text/multiple');

    const first = page.getByRole('textbox', { name: 'First' });
    const second = page.getByRole('textbox', { name: 'Second' });

    await first.focus();
    await expect(first).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(second).toBeFocused();
  });
});
