# Writing Tests (Dev Guide)

This guide explains how we write tests in this repository:

- **Unit tests** for Angular libraries using **Vitest**
- **E2E tests** for showcase pages using **Playwright**
- How to apply and maintain **Playwright tags** (for component-focused execution)
- How to run the automated **tag lint check**

If you only want to *run* tests, see [testing.md](testing.md).

---

## Principles

- Prefer tests that assert **observable behavior** (DOM, ARIA attributes, emitted events).
- Keep tests **resilient**: use stable selectors/roles, avoid timing-based sleeps.
- Keep tests **small and focused**: one reason to fail per test.
- Keep setup **consistent**: use shared helpers instead of per-test custom bootstrapping.

---

## Unit Tests (Angular + Vitest)

### Where unit tests live

- `*.spec.ts` next to the component/service in `libs/**/src/`

### Use the shared helper library

All Angular unit tests should use:

- `@cocoar/testing-angular` (source: `libs/testing-angular/`)

Typical pattern:

```ts
import { describe, it, expect } from 'vitest';
import { renderCoarComponent, queryRequired } from '@cocoar/testing-angular';

import { CoarButtonComponent } from './coar-button.component';

describe('CoarButtonComponent', () => {
  it('renders', async () => {
    const fixture = await renderCoarComponent(CoarButtonComponent);
    const button = queryRequired<HTMLButtonElement>(fixture.nativeElement, 'button');
    expect(button).toBeDefined();
  });
});
```

### Common providers/stubs (when needed)

- **Noop animations** (deterministic unit tests):

```ts
import { provideCoarNoopAnimations } from '@cocoar/testing-angular';

providers: [...provideCoarNoopAnimations()]
```

- **Locale formatting** (`COAR_LOCALE_SERVICE`):

```ts
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';
import { createCoarLocaleServiceStub } from '@cocoar/testing-angular';

providers: [{ provide: COAR_LOCALE_SERVICE, useValue: createCoarLocaleServiceStub() }]
```

- **Overlays**: route overlays into a test container and clean up:

```ts
import { afterEach } from 'vitest';
import { COAR_OVERLAY_SPEC_RESOLVERS } from '@cocoar/ui-overlay';
import {
  cleanupCoarOverlays,
  createCoarOverlayAttachmentResolver,
  createCoarOverlayTestContainer,
} from '@cocoar/testing-angular';

const { container, cleanup } = createCoarOverlayTestContainer();

afterEach(() => {
  cleanupCoarOverlays();
  cleanup();
});

providers: [
  {
    provide: COAR_OVERLAY_SPEC_RESOLVERS,
    multi: true,
    useValue: createCoarOverlayAttachmentResolver(container),
  },
]
```

---

## E2E Tests (Playwright + Showcase)

### Where e2e tests live

- `apps/showcase-e2e/src/**/*.spec.ts`

Scenario-host e2e tests live in:

- `apps/scenar-backstage-e2e/src/**/*.spec.ts`

### Structure

Prefer this structure for new e2e specs:

- One file per component page: `apps/showcase-e2e/src/components/<component>.spec.ts`
- Use `test.beforeEach()` to navigate to the component route

Example:

```ts
import { test, expect } from '@playwright/test';

import { openScenario } from '@cocoar/scenar-testing-playwright';

test.describe('Menu Component @menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('domcontentloaded');
  });

  test('opens on click', async ({ page }) => {
    await page.locator('.context-demo-area').click({ button: 'right' });
    await expect(page.locator('.coar-overlay-panel coar-menu').first()).toBeVisible();
  });
});
```

For scenario-based suites (component test host / scenar-backstage), prefer `openScenario(page, id, inputs)` instead of building query strings manually.

### Tagging (required)

We use tags in `test.describe()` (or test titles) so developers can run focused subsets via Playwright `--grep`.

Rules:

1. Every e2e spec file must include **at least one** tag in a `test.describe()` title or a `test()` title.
2. Tags must be **lowercase kebab-case**: `@menu`, `@code-block`, `@text-input`.
3. Accessibility specs (under `apps/showcase-e2e/src/accessibility/`) must include `@a11y`.
4. The smoke suite must include `@smoke`.

Common tags:

- `@smoke` — fast “does it load?” checks
- `@a11y` — accessibility checks
- Component tags — `@menu`, `@buttons`, `@checkboxes`, ...

Running tagged subsets:

```bash
pnpm e2e -- --grep "@menu"
pnpm e2e -- --grep "@a11y"
pnpm e2e -- --grep "@smoke"

# Combine tags using regex
pnpm e2e -- --grep "@smoke|@a11y"
```

### Tracking known gaps with `test.fixme` (preferred over conditional skip)

If a scenario cannot be tested yet (missing showcase example, under discussion, or intentionally Chromium-only), prefer `test.fixme(condition, reason)`.

Convention in this repo:

- Add `@fixme` to the affected `test()` title.
- Keep the `reason` actionable (what to change in showcase or in the component).

List all tracked fixmes:

```bash
pnpm e2e -- --grep "@fixme"
```

Note: `--grep "@fixme"` runs only the fixme-tagged subset, so its reported "skipped" count is not comparable to a full `pnpm e2e` run.

### Tag lint check

We keep tags consistent with an automated check:

```bash
pnpm nx run showcase-e2e:lint-tags
```

This validates:

- Every `*.spec.ts` has at least one `@tag` in a suite/test title
- Accessibility specs include `@a11y`
- Smoke spec includes `@smoke`

Implementation:

- `scripts/testing/check-e2e-tags.mjs`

---

## What to do when a test is flaky

- Prefer using Playwright locators that auto-wait (`getByRole`, `getByText`, `locator(...).waitFor()`)
- Avoid fixed delays (`waitForTimeout`) unless there is no alternative
- Make the selector more stable (ARIA roles, explicit labels)
- If a behavior is under product discussion or blocked by missing showcase examples, keep the test as a `test.fixme(...)` with an actionable reason

