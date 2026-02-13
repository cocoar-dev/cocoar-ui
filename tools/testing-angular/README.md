# @cocoar/testing-angular (internal)

Internal helpers for writing stable Angular unit tests in this Nx monorepo using Vitest.

## What it provides

- `setupCoarAngularVitest()`
  - Initializes Angular TestBed once (with zone support)
  - Optionally resets TestBed before each test to reduce flakiness
  - Stubs `ResizeObserver` and `IntersectionObserver` for JSDOM

- `renderCoarComponent()`
  - Quick render helper for standalone components

- `queryRequired()`
  - Small DOM helper that throws a useful error when an element is missing

- `createCoarLocaleServiceStub()`
  - Small stub for locale formatting (numbers/dates)

- `provideCoarNoopAnimations()`
  - Noop animation providers for deterministic tests

- `createCoarOverlayTestContainer()` / `cleanupCoarOverlays()`
  - Small helpers for DOM-based overlays in unit tests

- `dispatchKeyboardEvent()` / `dispatchPointerEvent()` / `dispatchClick()`
  - Low-level event helpers for JSDOM-based unit tests

## Usage

In a component spec:

```ts
import { describe, expect, it } from 'vitest';
import { renderCoarComponent, queryRequired } from '@cocoar/testing-angular';

import { CoarButtonComponent } from './coar-button.component';

describe('CoarButtonComponent', () => {
  it('renders the label', async () => {
    const fixture = await renderCoarComponent(CoarButtonComponent, {
      inputs: { disabled: false },
    });

    const button = queryRequired<HTMLButtonElement>(fixture.nativeElement, 'button');
    expect(button).toBeDefined();
  });
});
```

### Locale stub

Some components use a locale formatting service (not a translation/i18n library). You can stub it like this:

```ts
import { COAR_LOCALE_SERVICE } from '@cocoar/ui/components';
import { createCoarLocaleServiceStub } from '@cocoar/testing-angular';

providers: [{ provide: COAR_LOCALE_SERVICE, useValue: createCoarLocaleServiceStub() }]
```

### Overlay container + cleanup

`@cocoar/ui/overlay` defaults to attaching overlays to `document.body`. For unit tests, you can route overlays into a dedicated container (via the overlay spec resolver token) and clean up after each test.

```ts
import { afterEach } from 'vitest';
import { COAR_OVERLAY_SPEC_RESOLVERS } from '@cocoar/ui/overlay';
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

## Environment toggles

- `COAR_VITEST_RESET_TESTBED=false` disables the global `TestBed.resetTestingModule()` beforeEach hook.
  - Default is enabled because it reduces cross-test leakage in component suites.
