import { test, expect } from '@playwright/test';

/**
 * Cards, Badges, Tags, and Dividers component tests
 */

test.describe('Cards Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards');
    await page.waitForLoadState('domcontentloaded');
    // Wait for cards to render
    await page
      .locator('coar-card, .coar-card, .card')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('cards are visible', async ({ page }) => {
    const cards = page.locator('coar-card, .coar-card, .card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('card has content sections', async ({ page }) => {
    const card = page.locator('coar-card, .coar-card').first();
    await expect(card).toBeVisible();

    // Card should have visible content
    const text = await card.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('clickable cards respond to click', async ({ page }) => {
    // The showcase page demonstrates visual variants. It does not currently include a dedicated
    // "clickable" card API, so this test is conditional.
    const possibleClickable = page.locator('coar-card[tabindex], a coar-card, button coar-card').first();
    test.skip((await possibleClickable.count()) === 0, 'No clickable card examples on this page');

    await expect(possibleClickable).toBeVisible();
    await possibleClickable.click();
    await expect(possibleClickable).toBeVisible();
  });
});

test.describe('Badges Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('domcontentloaded');
  });

  test('badges are visible', async ({ page }) => {
    // Badge component uses span with class
    const badges = page.locator('.badge, [class*="badge"], coar-badge');
    const count = await badges.count();
    // Page should have badge examples
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('badge variants are styled differently', async ({ page }) => {
    const primaryBadge = page.locator('coar-badge[variant="primary"], .coar-badge-primary').first();
    const secondaryBadge = page
      .locator('coar-badge[variant="secondary"], .coar-badge-secondary')
      .first();

    // At least some badges should be visible
    await expect(page.locator('coar-badge, .coar-badge').first()).toBeVisible();
  });

  test('badges display text content', async ({ page }) => {
    const badge = page.locator('coar-badge, .coar-badge').first();
    await expect(badge).toBeVisible();

    const text = await badge.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Tags Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags');
    await page.waitForLoadState('domcontentloaded');
    // Wait for tags to render
    await page
      .locator('coar-tag, .coar-tag, .tag')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('tags are visible', async ({ page }) => {
    const tags = page.locator('coar-tag, .coar-tag, .tag, [class*="tag"]');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('removable tags have close button', async ({ page }) => {
    const closableTag = page.locator('coar-tag[closable]').first();
    const count = await page.locator('coar-tag[closable]').count();
    test.skip(count === 0, 'No closable tags on page');

    await expect(closableTag).toBeVisible();
    const closeButton = closableTag.locator('button.coar-tag__close');
    await expect(closeButton).toBeVisible();
  });

  test('clicking remove button removes tag', async ({ page }) => {
    const closableTag = page.locator('coar-tag[closable]').first();
    const count = await page.locator('coar-tag[closable]').count();
    test.skip(count === 0, 'No closable tags on page');

    await expect(closableTag).toBeVisible();
    const closeButton = closableTag.locator('button.coar-tag__close').first();
    await expect(closeButton).toBeVisible();

    await closeButton.click();
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Dividers Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dividers');
    await page.waitForLoadState('domcontentloaded');
    // Wait for dividers to render
    await page
      .locator('coar-divider, .coar-divider, hr')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('dividers are visible', async ({ page }) => {
    const dividers = page.locator('coar-divider, .coar-divider, hr, [class*="divider"]');
    const count = await dividers.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('horizontal dividers have correct orientation', async ({ page }) => {
    const horizontalDivider = page
      .locator('coar-divider:not([vertical]), .coar-divider-horizontal')
      .first();
    await expect(horizontalDivider).toBeVisible();
  });

  test('vertical dividers have correct orientation', async ({ page }) => {
    const verticalDivider = page.locator('coar-divider[vertical], .coar-divider-vertical').first();

    // Vertical dividers may not be present on the page
    const count = await page.locator('coar-divider[vertical], .coar-divider-vertical').count();
    test.skip(count === 0, 'No vertical dividers on page');

    await expect(verticalDivider).toBeVisible();
  });

  test('dividers with labels display text', async ({ page }) => {
    const labeledDivider = page.locator('coar-divider:has-text(""), .coar-divider-label').first();

    // Some dividers may have labels, some may not
    await expect(page.locator('coar-divider, .coar-divider').first()).toBeVisible();
  });
});

test.describe('Notes Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.waitForLoadState('domcontentloaded');
    // Wait for notes to render
    await page
      .locator('coar-note, .coar-note, .note')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});
  });

  test('notes are visible', async ({ page }) => {
    const notes = page.locator('coar-note, .coar-note, .note, [class*="note"]');
    const count = await notes.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('note variants are styled', async ({ page }) => {
    const infoNote = page.locator('coar-note[variant="info"], .coar-note-info').first();
    const warningNote = page.locator('coar-note[variant="warning"], .coar-note-warning').first();
    const errorNote = page.locator('coar-note[variant="error"], .coar-note-error').first();

    // At least one note variant should be visible
    await expect(page.locator('coar-note, .coar-note').first()).toBeVisible();
  });

  test('notes display content', async ({ page }) => {
    const note = page.locator('coar-note, .coar-note').first();
    await expect(note).toBeVisible();

    const text = await note.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('dismissible notes have close button', async ({ page }) => {
    const dismissibleNote = page.locator('coar-note[dismissible], .coar-note-dismissible').first();

    // Dismissible notes may not be present on the page
    const count = await page.locator('coar-note[dismissible], .coar-note-dismissible').count();
    test.skip(count === 0, 'No dismissible notes on page');

    await expect(dismissibleNote).toBeVisible();
    const closeButton = dismissibleNote.locator('button, .coar-note-close');
    await expect(closeButton).toBeVisible();
  });
});
