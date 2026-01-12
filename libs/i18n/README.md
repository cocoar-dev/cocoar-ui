# @cocoar/i18n

Core i18n abstraction for the Cocoar Design System.

## Overview

This library provides a framework-agnostic i18n contract that COAR UI components depend on. It defines interfaces and tokens for translation services, allowing apps to choose their own i18n implementation (Transloco, custom JSON loader, etc.).

## Features

- **CoarI18n** interface - Core translation contract
- **CoarI18nEvents** - Optional language change events
- **coarInterpolate** - Placeholder interpolation helper (`{name}` syntax)
- **CoarDefaultI18n** - Minimal passthrough implementation (returns key unchanged)
- **CoarI18nPipe** - Angular pipe for template usage with optional default values
- **coarIsMissingTranslation** - Unified missing-translation detection
- **coarTWithDefault** - TypeScript helper for translations with defaults
- **coarT$** - Observable-based helper for reactive translations

## Installation

```bash
pnpm add @cocoar/i18n
```

## Usage

### Pipe Usage (Recommended for Templates)

```html
<!-- Simple translation -->
{{ 'coar.button.save' | coarI18n }}

<!-- With fallback default -->
{{ 'coar.button.save' | coarI18n:'Save' }}

<!-- With parameters -->
{{ 'coar.items.count' | coarI18n:{ count: items.length } }}

<!-- With parameters and fallback -->
{{ 'coar.items.count' | coarI18n:{ count: items.length }:'You have {count} items.' }}

<!-- Chaining with other pipes -->
{{ 'coar.button.save' | coarI18n:'Save' | uppercase }}
```

### TypeScript Helpers

#### coarTWithDefault - Simple synchronous helper

```typescript
import { inject } from '@angular/core';
import { COAR_I18N, coarTWithDefault } from '@cocoar/i18n';

export class MyComponent {
  private readonly i18n = inject(COAR_I18N);

  label = coarTWithDefault(this.i18n, 'coar.button.save', 'Save');

  getMessage(count: number) {
    return coarTWithDefault(
      this.i18n,
      'coar.items.count',
      'You have {count} items.',
      { count }
    );
  }
}
```

#### coarT$ - Reactive observable helper

```typescript
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { COAR_I18N, COAR_I18N_EVENTS, coarT$ } from '@cocoar/i18n';

@Component({
  selector: 'app-example',
  template: `<h1>{{ title() }}</h1>`,
})
export class ExampleComponent {
  private readonly i18n = inject(COAR_I18N);
  private readonly events = inject(COAR_I18N_EVENTS, { optional: true });

  readonly title = toSignal(
    coarT$(this.i18n, this.events, 'coar.alert.errorTitle', undefined, 'Error')
  );
}
```

#### Reactive usage with language changes

```typescript
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  COAR_I18N,
  COAR_I18N_EVENTS,
  coarTWithDefault,
} from '@cocoar/i18n';

@Component({
  selector: 'coar-menu',
  template: `<button>{{ closeLabel() }}</button>`,
})
export class CoarMenuComponent {
  private readonly i18n = inject(COAR_I18N);
  private readonly events = inject(COAR_I18N_EVENTS, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly closeLabel = signal('');

  constructor() {
    const updateLabels = () => {
      this.closeLabel.set(
        coarTWithDefault(this.i18n, 'coar.menu.close', 'Close')
      );
    };

    updateLabels();

    if (this.events) {
      const sub = this.events.languageChanged$.subscribe(updateLabels);
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    }
  }
}
```

### Missing Translation Detection

```typescript
import { coarIsMissingTranslation } from '@cocoar/i18n';

// Check if a translation is missing
const result = i18n.t('coar.button.save');
if (coarIsMissingTranslation('coar.button.save', result)) {
  // Use fallback logic
}
```

## Why Default Values?

COAR UI components use the pipe with default values to ensure they work even without a configured i18n backend:

- **No central dictionary** - Component libraries don't need to modify `@cocoar/i18n` to add default texts
- **Local defaults** - Each usage can specify its own fallback
- **Framework agnostic** - Works with any i18n engine (Transloco, custom, etc.)
- **Graceful degradation** - UI renders meaningful text even without translation files
- **Unified semantics** - Consistent missing-translation detection across all engines

## Missing Translation Semantics

A translation is considered "missing" if it is:
- `null` or `undefined`
- An empty string (after trimming whitespace)
- Exactly equal to the requested key

This ensures consistent behavior regardless of the i18n backend.

## License

Apache-2.0
