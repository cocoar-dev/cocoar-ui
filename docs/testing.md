# Testing

If you want guidance on how to *write* tests (unit + e2e) and how to apply tags correctly, see [testing-writing.md](testing-writing.md).

This repository uses **Vitest** for unit tests and **Playwright** for end-to-end (e2e) tests.

Key goals:

- Keep tests **fast** and **easy to run** per project
- Keep test setup **consistent** across libraries
- Run e2e tests against the **showcase app** (no Storybook)
- Ensure automation **always exits cleanly**, especially on Windows

---

## Quick Commands

### Unit tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run a single project
pnpm nx test ui-menu

# Run a single project and skip Nx cache (useful while iterating)
pnpm nx test ui-menu --skip-nx-cache
```

### E2E tests (Playwright)

```bash
# Run e2e (local default is Chromium)
pnpm e2e

# Run e2e with Playwright UI mode
pnpm e2e -- --ui

# Override browser selection
pnpm e2e -- --browsers=firefox
pnpm e2e -- --browsers=webkit
pnpm e2e -- --browsers=all

# Pass through any Playwright args (examples)
pnpm e2e -- --headed
pnpm e2e -- --grep "menu"

# Notes:
# - When running via Nx directly, pass Playwright args after `--` (Nx arg separator):
#   pnpm nx e2e showcase-e2e -- --headed
# - `--headed` and `--ui` are debugging modes (visible/interactive) and may require you to stop the run manually with Ctrl+C.

# Run a tagged subset (component-focused / suite-focused)
pnpm e2e -- --grep "@menu"
pnpm e2e -- --grep "@smoke"
pnpm e2e -- --grep "@a11y"

# List tracked fixmes
pnpm e2e -- --grep "@fixme"

# Note: this runs only tests tagged @fixme.
# The "skipped" count you see is for that subset (not comparable to a full `pnpm e2e` run).

# Combine tags using a regex
pnpm e2e -- --grep "@smoke|@a11y"
```

---

## Unit Tests (Angular + Vitest)

### Shared setup: `@cocoar/testing-angular`

Angular unit tests in this repo should rely on the internal helper library:

- Library: `@cocoar/testing-angular`
- Source: `libs/testing-angular/`

It provides:

- `setupCoarAngularVitest()`
  - Initializes Angular’s TestBed once (Zone + BrowserTestingModule)
  - Optional global reset hook (`TestBed.resetTestingModule()`) to reduce cross-test leakage
  - JSDOM stubs for `ResizeObserver` and `IntersectionObserver`

- `renderCoarComponent()`
  - Simple helper to create a fixture for standalone components

- DOM helpers
  - `queryRequired()` / `queryAll()` for ergonomic queries

- Common testing utilities
  - Locale stub: `createCoarLocaleServiceStub()` (for components using `COAR_LOCALE_SERVICE`)
  - Overlay helpers: `createCoarOverlayTestContainer()`, `cleanupCoarOverlays()`, `createCoarOverlayAttachmentResolver()`
  - Event helpers: `dispatchKeyboardEvent()`, `dispatchPointerEvent()`, `dispatchClick()`, `setInputValueAndBlur()`
  - Noop animations: `provideCoarNoopAnimations()`

### Minimal component spec example

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

### Test setup files (`src/test-setup.ts`)

Most projects keep a tiny `src/test-setup.ts` that calls `setupCoarAngularVitest()`.
This keeps per-library setup consistent and avoids duplicated boilerplate.

### Environment toggles

- `COAR_VITEST_RESET_TESTBED=false`
  - Disables the global `TestBed.resetTestingModule()` hook.
  - Default is enabled because it reduces flakiness in large component suites.

---

## Common Providers & Stubs

### Locale formatting stub

This repo’s component libraries currently use locale *formatting* (numbers/dates), not a translation/i18n framework.
If a component injects `COAR_LOCALE_SERVICE`, you can stub it like this:

```ts
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';
import { createCoarLocaleServiceStub } from '@cocoar/testing-angular';

providers: [{ provide: COAR_LOCALE_SERVICE, useValue: createCoarLocaleServiceStub() }]
```

### Overlays in unit tests

`@cocoar/ui-overlay` attaches overlays to `document.body` by default.
For unit tests, it’s often easier to route overlays into a dedicated container and clean them up after each test.

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

### Noop animations

If a component depends on Angular animations, prefer noop animations in unit tests:

```ts
import { provideCoarNoopAnimations } from '@cocoar/testing-angular';

providers: [...provideCoarNoopAnimations()]
```

---

## E2E Tests (Playwright + Showcase)

### Host app

E2E tests run against the **showcase app** (`apps/showcase`).

### Why e2e is wrapped

Local e2e runs are executed via a small wrapper script to guarantee:

- The showcase dev server is started if needed
- The server is always terminated at the end (even when tests fail)
- No orphaned processes remain on Windows

Wrapper:

- `scripts/e2e/run-e2e.mjs`

### Browser selection defaults

- Local default: **Chromium only**
- CI default: **all browsers** (Chromium, Firefox, WebKit)

Override locally:

- `pnpm e2e -- --browsers=firefox`
- `pnpm e2e -- --browsers=all`

Under the hood:

- The wrapper sets `COAR_E2E_BROWSERS`.
- `apps/showcase-e2e/playwright.config.ts` uses it to choose Playwright projects.

### Passing Playwright CLI flags

Any additional arguments after `--` are forwarded to `playwright test`.

Examples:

- `pnpm e2e -- --grep "menu"`
- `pnpm e2e -- --headed`

---

## Where Tests Live

- Unit tests: `*.spec.ts` next to components/services in `libs/**/src/`
- E2E tests: `apps/showcase-e2e/src/**`

---

## Troubleshooting

## Tagging Conventions (Playwright)

We use a simple convention: include `@tags` in `test.describe()` titles (or test titles) so Playwright's built-in `--grep` can select suites.

Common tags:

- `@smoke` — fast “does it load?” checks
- `@a11y` — accessibility checks (keyboard navigation, ARIA compliance)
- Component tags — `@menu`, `@buttons`, `@checkboxes`, `@tabs`, `@table`, `@icons`, `@code-block`, ...

Examples:

- Run only menu e2e tests: `pnpm e2e -- --grep "@menu"`
- Run only smoke tests: `pnpm e2e -- --grep "@smoke"`
- Run only accessibility tests: `pnpm e2e -- --grep "@a11y"`

### E2E run fails, but leaves no server running

That’s expected behavior: the wrapper always shuts down the managed server. If you want to keep a server running for manual investigation, start it separately:

```bash
pnpm start
pnpm nx e2e showcase-e2e --headed
```

---

## Component Test Host (Prototype)

For isolated, component-level rendering (Storybook “preview iframe”-style) without Storybook, see:

- [component-test-host.md](component-test-host.md)

This is a dedicated Angular app at `apps/component-test-host` with a registry-driven route:

- `/__ct/:id` (default port `4300`)

### Peer dependency warnings

You may see peer warnings related to tooling versions (e.g. Vitest major version). These warnings are currently tolerated in this repo; they are not automatically fixed as part of testing infrastructure work.
