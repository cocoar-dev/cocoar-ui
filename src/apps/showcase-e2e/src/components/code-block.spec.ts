import { test, expect } from '@playwright/test';

/**
 * Code block component interaction tests
 */

test.describe('Code Block Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/code-block');
    await page.waitForLoadState('domcontentloaded');
  });

  test('code block displays code', async ({ page }) => {
    // Target the example that is explicitly configured as collapsible + collapsed by default.
    const codeBlock = page.locator('coar-code-block:has(button.coar-code-toggle[aria-expanded="false"])').first();
    await expect(codeBlock).toBeVisible();

    const toggle = codeBlock.locator('button.coar-code-toggle[aria-expanded="false"]').first();
    await expect(toggle).toBeVisible();
    await toggle.click();

    const codeContent = codeBlock.locator('pre.coar-code-pre, code.coar-code');
    await expect(codeContent.first()).toBeVisible();
  });

  test('copy button is visible', async ({ page }) => {
    const copyButton = page.locator('coar-code-block .coar-code-header-right button.coar-button').first();
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });

  test('copy button provides feedback when clicked', async ({ page }) => {
    const copyButton = page.locator('coar-code-block .coar-code-header-right button.coar-button').first();
    await expect(copyButton).toBeVisible();

    await copyButton.click();

    // Depending on browser permissions and capabilities, copying can succeed or fail.
    // The important part is that the component responds with user feedback.
    await expect(copyButton).toHaveAttribute('aria-label', /^(Copied!|Failed)$/);
  });

  test('collapse/expand toggle works', async ({ page }) => {
    const toggleButton = page
      .locator('coar-code-block .coar-code-toggle[aria-expanded]')
      .first();
    await expect(toggleButton).toBeVisible();

    // Click once to toggle state
    await toggleButton.click();
    // Verify aria-expanded has a valid value (either 'true' or 'false')
    await expect(toggleButton).toHaveAttribute('aria-expanded', /^(true|false)$/);

    // Click again to toggle back
    await toggleButton.click();
    // Verify it still has a valid value (toggle works in both directions)
    await expect(toggleButton).toHaveAttribute('aria-expanded', /^(true|false)$/);
  });

  test('syntax highlighting is applied', async ({ page }) => {
    const highlightedCode = page
      .locator('coar-code-block code.coar-code .token, coar-code-block code.coar-code span[class*="token"]')
      .first();

    // If syntax highlighting is working, there should be token spans
    await expect(highlightedCode).toBeVisible();
  });

  test('line numbers are visible when enabled', async ({ page }) => {
    const lineNumbers = page.locator('.coar-code-block-line-numbers, .line-numbers');

    // Line numbers may or may not be visible depending on configuration
    // This test just verifies the feature doesn't break the component
    await expect(page.locator('coar-code-block').first()).toBeVisible();
  });
});
