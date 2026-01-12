# i18n (Translations)

Cocoar separates **translations (i18n)** from **formatting (localization)**:

- **i18n** answers: “What text should be shown for this key in the current language?”
- **Localization** answers: “How should numbers/dates be formatted for this locale?”

These two concepts are related and are usually configured together, but they solve different problems.

## What Cocoar provides

`@cocoar/i18n` is a small abstraction used by Cocoar UI components:

- `CoarI18n` service with `t()`, `t$()` and `tSignal()`
- `COAR_I18N_PROVIDER` token to plug in your backend (Transloco, custom loader, etc.)
- `COAR_I18N_EVENTS` token (optional) to publish language-change events
- `CoarI18nPipe` for template usage with optional fallback texts

## How components use it

Cocoar components use `CoarI18nPipe` with fallbacks so they still render meaningful text even when no translation backend is configured.

Example:

```html
{{ 'coar.button.save' | coarI18n:'Save' }}
```

## Setup in Angular

You need to provide two things:

1. A translation backend via `COAR_I18N_PROVIDER`
2. Optionally, language-change events via `COAR_I18N_EVENTS` (recommended)

### Option A (recommended): Transloco adapter

If you use Transloco, use the Cocoar adapter from `@cocoar/i18n-transloco`:

```ts
import { ApplicationConfig } from '@angular/core';
import { CoarI18n } from '@cocoar/i18n';
import {
  provideCoarTranslocoI18n,
  provideCoarTranslocoI18nEvents,
} from '@cocoar/i18n-transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarTranslocoI18n(),
    provideCoarTranslocoI18nEvents(),
    CoarI18n,
  ],
};
```

### Option B: Custom backend

If you have your own translation system, provide a `CoarI18nProvider` implementation:

```ts
import { ApplicationConfig } from '@angular/core';
import {
  COAR_I18N_PROVIDER,
  COAR_I18N_EVENTS,
  CoarI18n,
  type CoarI18nProvider,
  type CoarI18nEvents,
} from '@cocoar/i18n';

class MyI18nBackend implements CoarI18nProvider, CoarI18nEvents {
  readonly languageChanged$ = /* Observable<void> */ undefined as any;

  t(key: string, params?: Record<string, unknown>): string {
    // Return the translated string (or the key if missing)
    return key;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    MyI18nBackend,
    { provide: COAR_I18N_PROVIDER, useExisting: MyI18nBackend },
    { provide: COAR_I18N_EVENTS, useExisting: MyI18nBackend }, // optional but recommended
    CoarI18n,
  ],
};
```

## Using i18n together with localization

Use localization for formatting and pass formatted values into translations.

For example:

- Format a number/date using `COAR_LOCALE_SERVICE`
- Pass the resulting string as a translation param (e.g. `{ count: formattedCount }`)

See the Localization page for formatting setup and behavior.
