import { test, expect } from '@playwright/test';

test('has title @smoke', async ({ page }) => {
  await page.goto('/home');

  // Expect h1 to contain a substring.
  await expect(page.locator('h1')).toBeVisible();
});
