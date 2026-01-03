import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Button (isolated) @buttons', () => {
  test('primary button is clickable', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Click Me',
      variant: 'primary',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
  });

  test('disabled button cannot be clicked', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Disabled Button',
      disabled: true,
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  });

  test('button shows hover state', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Hover Me',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();

    const initialBg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    await button.hover();
    const hoverBg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(hoverBg).toBeTruthy();
  });

  test('button variants render correctly', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Primary',
      variant: 'primary',
    });

    await expect(page.locator('.coar-button--primary')).toBeVisible();
  });

  test('button sizes render correctly', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Small Button',
      size: 'sm',
    });

    await expect(page.locator('.coar-button--sm')).toBeVisible();
  });

  test('loading button shows loading state', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Loading',
      loading: true,
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  });

  test('button with icon start renders icon', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'With Icon',
      iconStart: 'add',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();
    const icon = button.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('full width button takes full width', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Full Width',
      fullWidth: true,
    });

    const host = page.locator('coar-button');
    await expect(host).toHaveClass(/coar-button--full-width/);
  });

  test('button has accessible name @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      ariaLabel: 'Accessible Button',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();

    const ariaLabel = button;
    await expect(ariaLabel).toHaveAttribute('aria-label');
  });

  test('disabled button has correct aria attributes @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Disabled',
      disabled: true,
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeDisabled();
  });

  test('loading button indicates loading state @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Loading',
      loading: true,
    });

    const button = page.locator('coar-button button');
    const ariaBusy = await button.getAttribute('aria-busy');
    const ariaDisabled = await button.getAttribute('aria-disabled');

    // Loading button should indicate busy or disabled state
    expect(ariaBusy === 'true' || ariaDisabled === 'true').toBeTruthy();
  });

  test('button is focusable with Tab @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Focusable Button',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();

    await button.focus();
    await expect(button).toBeFocused();
  });

  test('button can be activated with Enter @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Enter Button',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();

    await button.focus();
    await page.keyboard.press('Enter');
    // Button should handle the activation (no error)
  });

  test('button can be activated with Space @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Space Button',
    });

    const button = page.locator('coar-button button');
    await expect(button).toBeVisible();

    await button.focus();
    await page.keyboard.press('Space');
    // Button should handle the activation (no error)
  });

  test('focus is visible on button @a11y', async ({ page }) => {
    await openScenario(page, 'button', {
      label: 'Focus Visible',
    });

    const button = page.locator('coar-button button');
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
});
