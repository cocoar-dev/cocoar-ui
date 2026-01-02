import { expect, test } from '@playwright/test';

import { openScenario } from '@cocoar/scenar-testing-playwright';

function sectionByLabel(page: import('@playwright/test').Page, label: string) {
  return page.locator('strong', { hasText: label }).locator('..');
}

test('loads codec demo scenario', async ({ page }) => {
  await openScenario(page, 'demo/codec/union-date');

  await expect(page.getByText('Codec Demo - Union Type Handling')).toBeVisible();

  const unionSection = sectionByLabel(page, 'Union (string | Date | object):');
  await expect(unionSection.locator('pre')).toHaveText('2025-01-15T12:00:00.000Z');
});

test('loads codec demo scenario with query params', async ({ page }) => {
  await openScenario(page, 'demo/codec/union-date', {
    unionValue: new Date('2026-01-01T00:00:00.000Z'),
    numberOrString: 123,
    dateOrString: 'hello',
  });

  await expect(page.getByText('Codec Demo - Union Type Handling')).toBeVisible();

  await expect(sectionByLabel(page, 'Union (string | Date | object):').locator('pre')).toHaveText(
    '2026-01-01T00:00:00.000Z'
  );
  await expect(
    sectionByLabel(page, 'Union (string | Date | object):').locator('small')
  ).toContainText('Date');

  await expect(sectionByLabel(page, 'Number or String:').locator('pre')).toHaveText('123');
  await expect(sectionByLabel(page, 'Number or String:').locator('small')).toContainText('number');

  await expect(sectionByLabel(page, 'Date or String:').locator('pre')).toHaveText('hello');
  await expect(sectionByLabel(page, 'Date or String:').locator('small')).toContainText('string');
});
