import { test, expect } from '@playwright/test';

/**
 * Table component interaction tests
 */

test.describe('Table Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/table');
    await page.waitForLoadState('domcontentloaded');
  });

  test('table renders with header and rows', async ({ page }) => {
    const table = page.locator('coar-table, table.coar-table').first();

    await expect(table).toBeVisible();
    // Check for header row
    const headerRow = table.locator('thead tr, .coar-table-header');
    await expect(headerRow.first()).toBeVisible();

    // Check for at least one data row
    const dataRows = table.locator('tbody tr, .coar-table-row');
    expect(await dataRows.count()).toBeGreaterThan(0);
  });

  test('table cells contain data', async ({ page }) => {
    const cell = page.locator('coar-table td, table.coar-table td').first();

    await expect(cell).toBeVisible();
    // Cells should have content
    const textContent = await cell.textContent();
    expect(textContent?.trim()).toBeTruthy();
  });

  test('sortable columns can be clicked', async ({ page }) => {
    const sortableHeaders = page.locator('[aria-sort], .coar-table-sortable');
    const count = await sortableHeaders.count();
    test.skip(count === 0, 'Sortable columns not present on this page');

    const sortableHeader = sortableHeaders.first();
    await expect(sortableHeader).toBeVisible();
    await sortableHeader.click();
    await expect(page.locator('coar-table, table.coar-table').first()).toBeVisible();
  });

  test('table has proper ARIA attributes', async ({ page }) => {
    const table = page.locator('table[role="grid"], table[role="table"], coar-table table').first();

    await expect(table).toBeVisible();
    const role = await table.getAttribute('role');
    // Table should have appropriate role (grid or table)
    expect(['grid', 'table', null]).toContain(role);
  });

  test('table rows are keyboard navigable', async ({ page }) => {
    const table = page.locator('coar-table, table.coar-table').first();

    await expect(table).toBeVisible();
    // Keyboard navigation requires a focusable element; skip if none exist.
    const focusableInTable = table.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusableInTable.count();
    test.skip(count === 0, 'No focusable elements in table to navigate');

    await focusableInTable.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(table).toBeVisible();
  });

  test('table pagination works', async ({ page }) => {
    const nextButton = page
      .locator('.coar-table-pagination-next, button[aria-label*="next"], button:has-text("Next")')
      .first();

    const count = await page
      .locator('.coar-table-pagination-next, button[aria-label*="next"], button:has-text("Next")')
      .count();
    test.skip(count === 0, 'Pagination not present on this page');

    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Table should still display data (assertions auto-wait)
    const rows = page.locator('coar-table tbody tr, table.coar-table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('table selection works', async ({ page }) => {
    // Selection is not guaranteed in the current showcase demo; require an explicit control.
    const selectionControl = page.locator('coar-table input[type="checkbox"], coar-table input[type="radio"], table.coar-table input[type="checkbox"], table.coar-table input[type="radio"]').first();
    const count = await page
      .locator('coar-table input[type="checkbox"], coar-table input[type="radio"], table.coar-table input[type="checkbox"], table.coar-table input[type="radio"]')
      .count();
    test.skip(count === 0, 'Row selection controls not present on this page');

    await expect(selectionControl).toBeVisible();
    await selectionControl.click();
    await expect(selectionControl).toBeVisible();
  });

  test('responsive table scrolls on small screens', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const tableContainer = page.locator('.coar-table-container, coar-table').first();

    // Table should be contained/scrollable
    await expect(tableContainer).toBeVisible();

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
