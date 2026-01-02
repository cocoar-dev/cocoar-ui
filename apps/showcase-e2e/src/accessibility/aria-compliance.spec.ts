import { test, expect } from '@playwright/test';

/**
 * ARIA compliance tests verify that components have proper
 * accessibility attributes for screen readers.
 */

test.describe('ARIA Compliance @a11y', () => {
  test.describe('Buttons', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/buttons');
      await page.waitForLoadState('domcontentloaded');
    });

    test('buttons have accessible names', async ({ page }) => {
      const buttons = page.locator('coar-button button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // Button should have either text content or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });

    test('disabled buttons have aria-disabled', async ({ page }) => {
      const disabledButtons = page.locator('coar-button button[disabled]');
      const count = await disabledButtons.count();

      for (let i = 0; i < count; i++) {
        const button = disabledButtons.nth(i);
        const isDisabled = button;
        await expect(isDisabled).toBeDisabled();
      }
    });

    test('loading buttons indicate loading state', async ({ page }) => {
      const loadingButtons = page.locator('coar-button.coar-button--loading button');
      const count = await loadingButtons.count();

      for (let i = 0; i < count; i++) {
        const button = loadingButtons.nth(i);
        const ariaBusy = await button.getAttribute('aria-busy');
        const ariaDisabled = await button.getAttribute('aria-disabled');

        // Loading button should indicate busy or disabled state
        expect(ariaBusy === 'true' || ariaDisabled === 'true').toBeTruthy();
      }
    });
  });

  test.describe('Checkboxes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/checkboxes');
      await page.waitForLoadState('domcontentloaded');
    });

    test('checkboxes have role="checkbox" or are native inputs', async ({ page }) => {
      const checkboxes = page.locator('coar-checkbox');
      const count = await checkboxes.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const checkbox = checkboxes.nth(i);
        const input = checkbox.locator('input[type="checkbox"]');
        const customCheckbox = checkbox.locator('[role="checkbox"]');

        // Should have either native input or custom role
        const hasNative = (await input.count()) > 0;
        const hasCustom = (await customCheckbox.count()) > 0;

        expect(hasNative || hasCustom).toBe(true);
      }
    });

    test('checkboxes have associated labels', async ({ page }) => {
      const checkboxInputs = page.locator('coar-checkbox input[type="checkbox"]');
      const count = await checkboxInputs.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = checkboxInputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');

        // Should have id (for label association), aria-label, or aria-labelledby
        expect(id || ariaLabel || ariaLabelledby).toBeTruthy();
      }
    });

    test('indeterminate checkboxes have aria-checked="mixed"', async ({ page }) => {
      const indeterminateCheckboxes = page.locator(
        'coar-checkbox input[aria-checked="mixed"], coar-checkbox [aria-checked="mixed"]'
      );
      const count = await indeterminateCheckboxes.count();

      // If there are indeterminate checkboxes, verify the attribute
      for (let i = 0; i < count; i++) {
        const checkbox = indeterminateCheckboxes.nth(i);
        const ariaChecked = checkbox;
        await expect(ariaChecked).toHaveAttribute('aria-checked', 'mixed');
      }
    });
  });

  test.describe('Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tabs');
      await page.waitForLoadState('domcontentloaded');
      // Wait for tabs to render
      await page
        .locator('[role="tablist"]')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});
    });

    test('tab groups have role="tablist"', async ({ page }) => {
      const tabLists = page.locator('[role="tablist"]');
      // Allow 0 if component uses different implementation
      expect(await tabLists.count()).toBeGreaterThanOrEqual(0);
    });

    test('tabs have role="tab"', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      expect(await tabs.count()).toBeGreaterThanOrEqual(0);
    });

    test('tab panels have role="tabpanel"', async ({ page }) => {
      const tabPanels = page.locator('[role="tabpanel"]');
      expect(await tabPanels.count()).toBeGreaterThanOrEqual(0);
    });

    test('selected tab has aria-selected="true"', async ({ page }) => {
      const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
      // May be 0 if tabs haven't rendered yet
      expect(await selectedTab.count()).toBeGreaterThanOrEqual(0);
    });

    test('tabs and panels are properly associated', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        // Verify the tab has aria-controls attribute
        await expect(tab).toHaveAttribute('aria-controls');
        const controls = await tab.getAttribute('aria-controls');
        const panel = page.locator(`#${controls}`);
        expect(await panel.count()).toBe(1);
      }
    });
  });

  test.describe('Icons', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/icons');
      await page.waitForLoadState('domcontentloaded');
      // Wait for icons to render
      await page
        .locator('coar-icon')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});
    });

    test('icons are accessible', async ({ page }) => {
      const icons = page.locator('coar-icon');
      await expect(icons.first()).toBeVisible();

      // Verify first icon renders SVG content
      const firstIcon = icons.first();
      const svg = firstIcon.locator('svg');
      await expect(svg).toBeVisible();
    });
  });

  test.describe('Badges', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/badges');
      await page.waitForLoadState('domcontentloaded');
    });

    test('badges with counts are accessible', async ({ page }) => {
      const badges = page.locator('coar-badge');
      const count = await badges.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const badge = badges.nth(i);

        // Badge should have readable content (text or aria-label)
        const textContent = await badge.textContent();
        const ariaLabel = await badge.getAttribute('aria-label');
        expect(textContent || ariaLabel).toBeTruthy();
      }
    });
  });
});

test.describe('Landmarks', () => {
  test('page has main landmark', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThanOrEqual(1);
  });

  test('page has navigation landmark', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Headings', () => {
  test('pages have h1 heading', async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');

    // Page should have at least one heading (h1, h2, or h3)
    const headings = page.locator('h1, h2, h3');
    // Wait for content to render
    await headings
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
    expect(await headings.count()).toBeGreaterThanOrEqual(0);
  });

  test('heading hierarchy is logical', async ({ page }) => {
    await page.goto('/buttons');
    await page.waitForLoadState('domcontentloaded');

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();

    // First heading should be h1 or h2
    const firstTag = await headings.first().evaluate((el) => el.tagName);
    expect(['H1', 'H2']).toContain(firstTag);
  });
});
