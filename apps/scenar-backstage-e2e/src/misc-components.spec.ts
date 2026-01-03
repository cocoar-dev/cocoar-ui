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

  test('card with color variants apply correct styling', async ({ page }) => {
    await openScenario(page, 'card', {
      color: 'success',
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
});

test.describe('Tag (isolated) @tags', () => {
  test('tag is visible with default content', async ({ page }) => {
    await openScenario(page, 'tag', {});

    const tag = page.locator('coar-tag');
    await expect(tag).toBeVisible();
    await expect(tag).toHaveClass(/coar-tag/);
  });

  test('tag with different colors apply styling', async ({ page }) => {
    await openScenario(page, 'tag', {
      color: 'warning',
    });

    const tag = page.locator('coar-tag');
    await expect(tag).toHaveClass(/coar-tag--warning/);
  });

  test('tag with closable shows close button', async ({ page }) => {
    await openScenario(page, 'tag', {
      closable: true,
    });

    const closeButton = page.locator('coar-tag button');
    await expect(closeButton).toBeVisible();
  });

  test('tag close button emits closed event', async ({ page }) => {
    await openScenario(page, 'tag', {
      closable: true,
    });

    const closeButton = page.locator('coar-tag button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
  });

  test('tag with elevated shows shadow', async ({ page }) => {
    await openScenario(page, 'tag', {
      elevated: true,
    });

    const tag = page.locator('coar-tag');
    await expect(tag).toHaveClass(/coar-tag--elevated/);
  });

  test('tag with borderless removes border', async ({ page }) => {
    await openScenario(page, 'tag', {
      borderless: true,
    });

    const tag = page.locator('coar-tag');
    await expect(tag).toHaveClass(/coar-tag--borderless/);
  });

  test('tag with different sizes', async ({ page }) => {
    await openScenario(page, 'tag', {
      size: 'lg',
    });

    const tag = page.locator('coar-tag');
    await expect(tag).toHaveClass(/coar-tag--lg/);
  });
});
