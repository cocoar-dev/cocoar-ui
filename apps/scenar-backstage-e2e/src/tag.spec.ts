import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Tag (isolated) @tags', () => {
  test('tag is visible with default content', async ({ page }) => {
    await openScenario(page, 'tag', {});

    const tag = page.locator('coar-tag');
    await expect(tag).toBeVisible();
    await expect(tag).toHaveClass(/coar-tag/);
  });

  test('tag with different variants apply styling', async ({ page }) => {
    await openScenario(page, 'tag', {
      variant: 'warning',
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
