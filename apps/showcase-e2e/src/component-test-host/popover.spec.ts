import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';
test.describe('Component Test Host: Popover @ct-host @popover', () => {
  test('opens popover overlay on click', async ({ page }, testInfo) => {
    await openScenario(page, 'coar-popover', {
      triggerLabel: 'Open',
      content: 'Hello from popover',
      openOnClick: true,
      interactive: true,
    });

    const trigger = page.getByTestId('coar-popover-trigger').getByRole('button');
    await trigger.click();

    const content = page.getByTestId('coar-popover-content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('Hello from popover');

    const screenshot = await page.screenshot({ fullPage: false });
    await testInfo.attach('popover-open', { body: screenshot, contentType: 'image/png' });
  });
});
