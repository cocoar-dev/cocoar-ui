import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Badge (isolated) @badges', () => {
  test('badge is visible with content', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '5',
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('5');
  });

  test('badge with different variants apply styling', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '10',
      variant: 'success',
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toBeVisible();
  });

  test('badge with max value shows plus sign', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: 150,
      max: 99,
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toContainText('99+');
  });

  test('badge with dot mode shows dot without content', async ({ page }) => {
    await openScenario(page, 'badge', {
      dot: true,
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(text?.trim()).toBe('');
  });

  test('badge with pulse animation', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '3',
      pulse: true,
    });

    const host = page.locator('coar-badge');
    await expect(host).toHaveClass(/coar-badge-host--pulse/);
  });

  test('badge with border', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '7',
      bordered: true,
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toBeVisible();
  });

  test('badge with different sizes', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '2',
      size: 'lg',
    });

    const badge = page.locator('coar-badge');
    await expect(badge).toBeVisible();
  });

  test('badge with count is accessible @a11y', async ({ page }) => {
    await openScenario(page, 'badge', {
      content: '5',
    });

    const badge = page.locator('coar-badge');

    // Badge should have readable content (text or aria-label)
    const textContent = await badge.textContent();
    const ariaLabel = await badge.getAttribute('aria-label');
    expect(textContent || ariaLabel).toBeTruthy();
  });
});
