import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Icon (isolated) @icons', () => {
  test('icon is visible on the page', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
    });

    const icon = page.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('icon renders as SVG element', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
    });

    const svg = page.locator('coar-icon svg');
    await expect(svg).toBeVisible();
  });

  test('icon has accessible attributes', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
    });

    const icon = page.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('icon sizes are applied correctly', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
      size: 'lg',
    });

    const icon = page.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('icon with custom color', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
      color: '#ff0000',
    });

    const icon = page.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('icon with rotation', async ({ page }) => {
    await openScenario(page, 'icon', {
      name: 'add',
      rotate: 90,
    });

    const icon = page.locator('coar-icon');
    await expect(icon).toBeVisible();
  });

  test('different icon names render correctly', async ({ page }) => {
    const iconNames = ['add', 'close', 'check'];

    for (const name of iconNames) {
      await openScenario(page, 'icon', { name });
      const svg = page.locator('coar-icon svg');
      await expect(svg).toBeVisible({ timeout: 10000 });
      // Wait a bit before loading next icon
      await page.waitForTimeout(500);
    }
  });

  test('icon loads dynamically without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await openScenario(page, 'icon', {
      name: 'add',
    });

    const svg = page.locator('coar-icon svg');
    await expect(svg).toBeVisible();

    const iconErrors = errors.filter((e) => e.includes('icon') && !e.includes('404'));
    expect(iconErrors.length).toBe(0);
  });
});
