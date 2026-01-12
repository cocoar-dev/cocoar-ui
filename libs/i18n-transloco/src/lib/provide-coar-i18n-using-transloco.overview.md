# provideCoarI18nUsingTransloco

Convenience providers to connect Cocoar i18n (`@cocoar/i18n`) to Transloco (`@jsverse/transloco`).

This is the recommended setup because it provides all required Cocoar pieces in one place:

- `COAR_I18N_PROVIDER`
- `COAR_I18N_EVENTS` (so pipes and reactive APIs update on language changes)
- `CoarI18n` (the Cocoar service used by components/pipes)

It also preloads the active language during application bootstrap to avoid rendering fallback text before translations are available.

## Usage

```ts
import { ApplicationConfig } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { provideCoarI18nUsingTransloco } from '@cocoar/i18n-transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
      },
      loader: YourTranslocoLoader,
    }),
    ...provideCoarI18nUsingTransloco(),
  ],
};
```

## Interpolation

`@cocoar/i18n` always applies Cocoar interpolation (`{name}`) after the backend resolves a translation.
