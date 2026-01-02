import { expect, test } from '@playwright/test';

import { openScenario } from '@cocoar/scenar-testing-playwright';

test('loads icon scenario', async ({ page }) => {
  await openScenario(page, 'icon');

  await expect(page.locator('coar-icon .coar-icon')).toBeVisible();
});

test('loads icon scenario with query params', async ({ page }) => {
  await openScenario(page, 'icon', {
    rotate: 90,
    spin: true,
    label: 'Smoke',
  });

  const icon = page.locator('coar-icon');
  const iconSvgHost = icon.locator('.coar-icon');

  await expect(iconSvgHost).toBeVisible();
  await expect(iconSvgHost).toHaveClass(/coar-icon--spin/);
  await expect(icon.locator('.coar-icon__label')).toHaveText('Smoke');

  const transform = await iconSvgHost.evaluate((el) => (el as HTMLElement).style.transform);
  expect(transform).toBe('rotate(90deg)');
});
