import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Card (isolated) @cards', () => {
  test('card is visible with content', async ({ page }) => {
    await openScenario(page, 'card', {});

    const card = page.locator('coar-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/coar-card/);
  });

  test('card with elevated variant shows shadow', async ({ page }) => {
    await openScenario(page, 'card', {
      elevated: true,
    });

    const card = page.locator('coar-card');
    await expect(card).toHaveClass(/coar-card--elevated/);
  });

  test('card with borderless variant removes border', async ({ page }) => {
    await openScenario(page, 'card', {
      borderless: true,
    });

    const card = page.locator('coar-card');
    await expect(card).toHaveClass(/coar-card--borderless/);
  });

  test('card with variant options apply correct styling', async ({ page }) => {
    await openScenario(page, 'card', {
      variant: 'success',
    });

    const card = page.locator('coar-card');
    await expect(card).toHaveClass(/coar-card--success/);
  });

  test('card with different padding sizes', async ({ page }) => {
    await openScenario(page, 'card', {
      padding: 'lg',
    });

    const card = page.locator('coar-card');
    await expect(card).toHaveClass(/coar-card--padding-lg/);
  });

  test('card with no padding', async ({ page }) => {
    await openScenario(page, 'card', {
      padding: 'none',
    });

    const card = page.locator('coar-card');
    await expect(card).toHaveClass(/coar-card--padding-none/);
  });
});
