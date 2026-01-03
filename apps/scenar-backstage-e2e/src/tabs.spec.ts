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

  test('tab group has role="tablist" @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();
  });

  test('tabs have role="tab" @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThan(0);
  });

  test('tab panels have role="tabpanel" @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const tabPanels = page.locator('[role="tabpanel"]');
    expect(await tabPanels.count()).toBeGreaterThan(0);
  });

  test('selected tab has aria-selected="true" @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(selectedTab).toBeVisible();
  });

  test('tabs and panels are properly associated @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const tabs = page.locator('[role="tab"]');
    const firstTab = tabs.first();

    // Verify the tab has aria-controls attribute
    await expect(firstTab).toHaveAttribute('aria-controls');
    const controls = await firstTab.getAttribute('aria-controls');
    const panel = page.locator(`#${controls}`);
    expect(await panel.count()).toBe(1);
  });

  test('tab list is focusable @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const firstTab = page.locator('[role="tab"]').first();
    await expect(firstTab).toBeVisible();

    await firstTab.focus();
    await expect(firstTab).toBeFocused();
  });

  test('Enter/Space activates focused tab @a11y', async ({ page }) => {
    await openScenario(page, 'tabs');

    const tabs = page.locator('[role="tab"]');
    await expect(tabs.nth(1)).toBeVisible();

    const secondTab = tabs.nth(1);
    await secondTab.focus();
    await page.keyboard.press('Enter');

    // Tab should now be selected
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });
});
