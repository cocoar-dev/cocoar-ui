# @cocoar/i18n-transloco

Transloco adapter for the Cocoar i18n abstraction.

## Overview

This library bridges `@cocoar/i18n` with Transloco, allowing COAR UI components to use Transloco as their translation backend.

## Features

- **provideCoarTranslocoI18n** - Connects COAR_I18N to TranslocoService
- **provideCoarTranslocoI18nEvents** - Connects COAR_I18N_EVENTS to Transloco language changes

## Installation

```bash
pnpm add @cocoar/i18n-transloco @jsverse/transloco
```

## Usage

```typescript
import { provideTransloco } from '@jsverse/transloco';
import { provideCoarTranslocoI18n, provideCoarTranslocoI18nEvents } from '@cocoar/i18n-transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
      },
      loader: YourTranslocoLoader,
    }),
    provideCoarTranslocoI18n(),
    provideCoarTranslocoI18nEvents(),
  ],
};
```

## License

Apache-2.0
