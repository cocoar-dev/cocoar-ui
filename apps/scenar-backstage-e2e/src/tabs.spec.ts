import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Tabs (isolated) @tabs', () => {
  test('tabs are visible', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
  });

  test('first tab is selected by default', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const firstTab = page.locator('[role="tab"]').first();
    await expect(firstTab).toBeVisible();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking tab switches content', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const tabs = page.locator('[role="tab"]');
    const secondTab = tabs.nth(1);
    await secondTab.click();

    await expect(secondTab).toHaveAttribute('aria-selected', 'true');

    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
  });

  test('tab panel content changes when tab is selected', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const tabs = page.locator('[role="tab"]');
    await tabs.nth(1).click();

    const visiblePanel = page.locator('[role="tabpanel"]:not([hidden])');
    await expect(visiblePanel).toBeVisible();
    await expect(visiblePanel).toContainText('Content for Tab 2');
  });

  test('keyboard navigation with arrow keys', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const tabs = page.locator('[role="tab"]');
    const firstTab = tabs.first();
    await firstTab.focus();

    await page.keyboard.press('ArrowRight');

    const secondTab = tabs.nth(1);
    await expect(secondTab).toBeFocused();
  });

  test('tab panel has correct aria-labelledby', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const firstTab = page.locator('[role="tab"]').first();
    const tabId = await firstTab.getAttribute('id');

    const panel = page.locator('[role="tabpanel"]:not([hidden])');
    await expect(panel).toHaveAttribute('aria-labelledby', tabId || '');
  });

  test('tabs support keyboard Home/End navigation', async ({ page }) => {
    await openScenario(page, 'tabs', {});

    const tabs = page.locator('[role="tab"]');
    await tabs.first().focus();

    await page.keyboard.press('End');
    const lastTab = tabs.last();
    await expect(lastTab).toBeFocused();

    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
  });
});
