import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Scenario providers (isolated) @providers', () => {
  test('with scenario providers: resolves scenario-only DI', async ({ page }) => {
    await openScenario(page, 'providers/probe');

    await expect(page.getByRole('heading', { name: 'Scenario crashed' })).toHaveCount(0);
    await expect(page.getByTestId('probe')).toHaveText('ok');
  });

  test('without scenario providers: crashes with missing provider', async ({ page }) => {
    await openScenario(page, 'providers/probe/no-providers');

    await expect(page.getByRole('heading', { name: 'Scenario crashed' })).toBeVisible();
    await expect(page.getByText('Scenario id: providers/probe/no-providers')).toBeVisible();

    const crashText = page.locator('main');
    await expect(crashText).toContainText(
      /(NullInjectorError|No provider for|SCENAR_PROVIDERS_PROBE_TOKEN)/
    );
  });
});
