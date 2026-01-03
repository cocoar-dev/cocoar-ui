import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Code Block (isolated) @code-block', () => {
  test('code block displays code', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'const greeting = "Hello, world!";',
      language: 'typescript',
      title: 'Sample Code',
    });

    const codeBlock = page.locator('coar-code-block');
    await expect(codeBlock).toBeVisible();

    const codeContent = codeBlock.locator('.coar-code-content');
    await expect(codeContent).toBeVisible();
    await expect(codeContent).toContainText('Hello, world!');
  });

  test('copy button is visible', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'console.log("test");',
      showCopy: true,
    });

    const copyButton = page.locator('coar-code-block .coar-code-header-right button.coar-button');
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });

  test('copy button provides feedback when clicked', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'test code',
      showCopy: true,
    });

    const copyButton = page.locator('coar-code-block .coar-code-header-right button.coar-button');
    await expect(copyButton).toBeVisible();

    await copyButton.click();
    await expect(copyButton).toHaveAttribute('aria-label', /^(Copied!|Failed)$/);
  });

  test('collapse/expand toggle works', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'function test() { return true; }',
      collapsible: true,
      collapsed: true,
      title: 'Collapsible Code',
    });

    const toggleButton = page.locator('coar-code-block .coar-code-toggle[aria-expanded]');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('syntax highlighting is applied', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'const x = 42;',
      language: 'javascript',
    });

    const highlightedCode = page.locator(
      'coar-code-block code.coar-code .token, coar-code-block code.coar-code span[class*="token"]'
    );

    await expect(highlightedCode.first()).toBeVisible();
  });

  test('code block without copy button hides button', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'test',
      showCopy: false,
    });

    const copyButton = page.locator('coar-code-block .coar-code-header-right button.coar-button');
    await expect(copyButton).toHaveCount(0);
  });

  test('non-collapsible code block hides toggle', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'test',
      collapsible: false,
    });

    const toggleButton = page.locator('coar-code-block .coar-code-toggle');
    await expect(toggleButton).toHaveCount(0);
  });

  test('code block with title displays title', async ({ page }) => {
    await openScenario(page, 'code-block', {
      code: 'test',
      title: 'Example Code Block',
    });

    const title = page.locator('coar-code-block .coar-code-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Example Code Block');
  });
});
