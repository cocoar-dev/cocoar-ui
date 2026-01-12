# @cocoar/i18n-transloco

Transloco adapter for the Cocoar i18n abstraction.

## Overview

This library bridges `@cocoar/i18n` with Transloco, allowing COAR UI components to use Transloco as their translation backend.

## Features

- **provideCoarTranslocoI18n** - Connects COAR_I18N to TranslocoService
- **provideCoarTranslocoI18nEvents** - Connects COAR_I18N_EVENTS to Transloco language changes
- **provideCoarI18nUsingTransloco** - Convenience providers (provider + events + CoarI18n)

## Installation

```bash
pnpm add @cocoar/i18n-transloco @jsverse/transloco
```

## Usage

```typescript
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

## License

Apache-2.0
