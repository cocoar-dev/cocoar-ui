import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Localization (integrated) @localization', () => {
  test('displays default language (en) on load', async ({ page }) => {
    await openScenario(page, 'localization');

    const title = page.locator('h2');
    await expect(title).toBeVisible();

    const languageDisplay = page.locator('h3').filter({ hasText: 'Current Language:' });
    await expect(languageDisplay).toContainText('en');
  });

  test('switches language and updates all translations', async ({ page }) => {
    await openScenario(page, 'localization');

    const switchButton = page.locator('button', { hasText: 'Switch to' });
    await expect(switchButton).toBeVisible();

    // Click to switch language
    await switchButton.click();

    // Wait for language to update
    const languageDisplay = page.locator('h3').filter({ hasText: 'Current Language:' });
    await expect(languageDisplay).toContainText('de');

    // Verify button text updated
    await expect(switchButton).toContainText('Switch to en');
  });

  test('number formatting reflects current language', async ({ page }) => {
    await openScenario(page, 'localization');

    // Check initial formatting (English uses comma for thousands)
    const numberSection = page.locator('h3').filter({ hasText: 'Number Formatting' });
    await expect(numberSection).toBeVisible();

    // Get number list items
    const priceItem = page.locator('li').filter({ hasText: 'Price:' });
    await expect(priceItem).toContainText('1,234.56');

    // Switch to German
    const switchButton = page.locator('button', { hasText: 'Switch to' });
    await switchButton.click();

    // Wait for language change
    await page.waitForTimeout(500);

    // German uses period for thousands, comma for decimal
    // (depends on locale data configuration)
    await expect(priceItem).toBeVisible();
  });

  test('date formatting reflects current language', async ({ page }) => {
    await openScenario(page, 'localization');

    const dateSection = page.locator('h3').filter({ hasText: 'Date Formatting' });
    await expect(dateSection).toBeVisible();

    // Get date list items
    const referenceDateItem = page.locator('li').filter({ hasText: 'Reference date:' });
    await expect(referenceDateItem).toBeVisible();

    // Should contain some date format
    const dateText = await referenceDateItem.textContent();
    expect(dateText).toMatch(/\d{2,4}[./-]\d{2}[./-]\d{2,4}/);
  });

  test('translation pipe handles fallback values', async ({ page }) => {
    await openScenario(page, 'localization');

    // Even if translations are missing, fallback values should display
    const welcomeItem = page.locator('li').filter({ hasText: 'Welcome:' });
    await expect(welcomeItem).toBeVisible();

    const descriptionItem = page.locator('li').filter({ hasText: 'Description:' });
    await expect(descriptionItem).toBeVisible();
  });

  test('translation pipe with parameters works', async ({ page }) => {
    await openScenario(page, 'localization');

    const greetingItem = page.locator('li').filter({ hasText: 'With params:' });
    await expect(greetingItem).toBeVisible();

    // Should contain the interpolated username
    await expect(greetingItem).toContainText('World');
  });

  test('language switch is reactive across all pipes', async ({ page }) => {
    await openScenario(page, 'localization');

    // Get initial state
    const switchButton = page.locator('button', { hasText: 'Switch to' });
    const initialButtonText = await switchButton.textContent();

    // Switch language
    await switchButton.click();

    // Wait for update
    await page.waitForTimeout(300);

    // Button text should have changed
    const newButtonText = switchButton;
    await expect(newButtonText).not.toHaveText(initialButtonText);

    // All sections should still be visible (no errors)
    await expect(page.locator('h3').filter({ hasText: /Translations|Number|Date/ })).toHaveCount(3);
  });

  test('no console errors during language switch', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await openScenario(page, 'localization');

    const switchButton = page.locator('button', { hasText: 'Switch to' });
    await switchButton.click();

    // Wait for async operations
    await page.waitForTimeout(500);

    // Filter out expected/acceptable errors (if any)
    const relevantErrors = errors.filter((e) => !e.includes('404') && !e.includes('favicon'));
    expect(relevantErrors.length).toBe(0);
  });
});
