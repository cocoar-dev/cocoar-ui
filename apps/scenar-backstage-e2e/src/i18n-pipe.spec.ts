import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('I18n Pipe (isolated) @i18n', () => {
  test('renders translations and updates after language toggle', async ({ page }) => {
    await openScenario(page, 'i18n/pipe');

    await expect(page.getByTestId('title')).toHaveText('CoarI18nPipe');

    await expect(page.getByTestId('lang')).toHaveText('en');
    await expect(page.getByTestId('simple')).toHaveText('Hello');
    await expect(page.getByTestId('fallback')).toHaveText('Fallback text');
    await expect(page.getByTestId('params')).toHaveText('You have 3 items');

    await page.getByTestId('toggle-lang').click();

    await expect(page.getByTestId('lang')).toHaveText('de');
    await expect(page.getByTestId('simple')).toHaveText('Hallo');
    await expect(page.getByTestId('params')).toHaveText('Sie haben 3 Elemente');
  });
});
