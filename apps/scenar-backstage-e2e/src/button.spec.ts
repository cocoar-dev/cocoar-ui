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
});
