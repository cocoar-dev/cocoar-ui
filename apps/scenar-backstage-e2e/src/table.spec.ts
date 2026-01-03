import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Table (isolated) @table', () => {
  test('table renders with header and rows', async ({ page }) => {
    await openScenario(page, 'table', {});

    const table = page.locator('coar-table table.coar-table');
    await expect(table).toBeVisible();

    const headerRow = table.locator('thead tr');
    await expect(headerRow).toBeVisible();

    const dataRows = table.locator('tbody tr');
    expect(await dataRows.count()).toBeGreaterThan(0);
  });

  test('table cells contain data', async ({ page }) => {
    await openScenario(page, 'table', {});

    const cell = page.locator('coar-table td').first();
    await expect(cell).toBeVisible();

    const textContent = await cell.textContent();
    expect(textContent?.trim()).toBeTruthy();
  });

  test('table has proper ARIA attributes', async ({ page }) => {
    await openScenario(page, 'table', {});

    const table = page.locator('coar-table table');
    await expect(table).toBeVisible();

    const role = await table.getAttribute('role');
    expect(['grid', 'table', null]).toContain(role);
  });

  test('table with bordered variant shows borders', async ({ page }) => {
    await openScenario(page, 'table', {
      variant: 'bordered',
    });

    const host = page.locator('coar-table');
    await expect(host).toHaveClass(/coar-table--bordered/);
  });

  test('table with plain variant removes stripes', async ({ page }) => {
    await openScenario(page, 'table', {
      variant: 'plain',
    });

    const host = page.locator('coar-table');
    await expect(host).toHaveClass(/coar-table--plain/);
  });

  test('compact table uses reduced padding', async ({ page }) => {
    await openScenario(page, 'table', {
      compact: true,
    });

    const host = page.locator('coar-table');
    await expect(host).toHaveClass(/coar-table--compact/);
  });

  test('table with hover enabled highlights rows', async ({ page }) => {
    await openScenario(page, 'table', {
      hover: true,
    });

    const host = page.locator('coar-table');
    await expect(host).toHaveClass(/coar-table--hover/);

    const row = page.locator('coar-table tbody tr').first();
    await row.hover();
    await expect(row).toBeVisible();
  });

  test('table header cells are visible', async ({ page }) => {
    await openScenario(page, 'table', {});

    const headers = page.locator('coar-table th');
    expect(await headers.count()).toBeGreaterThan(0);

    await expect(headers.first()).toBeVisible();
    const headerText = await headers.first().textContent();
    expect(headerText?.trim()).toBeTruthy();
  });
});
