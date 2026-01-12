# CoarI18nPipe

`CoarI18nPipe` translates i18n keys in Angular templates using the `CoarI18n` service.

The pipe supports:

- `key` only
- `key` + `params`
- `key` + `fallback`
- `key` + `params` + `fallback`

## When to use

- You want declarative translations in templates.
- You need optional fallbacks for missing keys.
- You want parameter interpolation (e.g. counts).

## Basic usage

```html
<!-- Simple key -->
<span>{{ 'coar.button.save' | coarI18n }}</span>

<!-- Missing key with fallback -->
<span>{{ 'coar.button.missing' | coarI18n:'Save' }}</span>

<!-- With parameters -->
<span>{{ 'coar.items.count' | coarI18n:{ count: items.length } }}</span>

<!-- With parameters and fallback -->
<span>{{ 'coar.items.count' | coarI18n:{ count: items.length }:'You have {count} items.' }}</span>

<!-- Chaining with other pipes -->
<span>{{ 'coar.button.save' | coarI18n:'Save' | uppercase }}</span>
```

## Parameters vs fallback

The argument order is:

1. `params` (optional object)
2. `fallback` (optional string)

If you want a fallback without parameters, pass the fallback as the first argument:

```html
<span>{{ 'coar.button.save' | coarI18n:'Save' }}</span>
```

## Setup

The pipe depends on `CoarI18n`, which in turn needs an app-level translation provider.

```ts
import { COAR_I18N_EVENTS, COAR_I18N_PROVIDER, CoarI18n } from '@cocoar/i18n';

export const appProviders = [
  { provide: COAR_I18N_PROVIDER, useExisting: MyI18nProvider },
  // Optional: enables live updates when the language changes
  { provide: COAR_I18N_EVENTS, useExisting: MyI18nProvider },
  CoarI18n,
];
```

## Live updates (language changes)

If `COAR_I18N_EVENTS` is provided, the pipe subscribes to `languageChanged$` and marks the view for check so it updates even under `OnPush` change detection.

If you do not provide `COAR_I18N_EVENTS`, translations still resolve, but you are responsible for triggering change detection when the language changes.

## Performance notes

`CoarI18nPipe` is intentionally **impure** so it can react to language changes.

To avoid unnecessary work in templates:

- Prefer stable `params` objects (e.g. component field or signal/computed), instead of inline object literals.
- For heavy or repeated translations, consider using `CoarI18n.tSignal()` / `CoarI18n.t$()` in TypeScript and binding to the resulting Signal/Observable.
