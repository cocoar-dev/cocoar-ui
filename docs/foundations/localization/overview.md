# Localization System

The Cocoar Localization System provides **language management**, **locale-aware formatting (L10n)**, and **translations (i18n)** for Cocoar applications.

**Package:** `@cocoar/localization`

## What it provides

### Language Management
- Centralized language state with Signal-based API
- Automatic synchronization of L10n and i18n when language changes
- Observable streams for reactive updates

### L10n (Localization)
- Date, number, currency, percent formatting
- Browser Intl API as default source (zero-config)
- Optional HTTP overrides for business-specific rules
- Reactive pipes that update when language changes

### i18n (Internationalization)
- Translation system with key-based lookups
- Automatic translation loading when language changes
- Parameter interpolation
- HTTP loader for JSON translation files

## Quick Start

### Basic Setup (L10n only)

```ts
import { ApplicationConfig } from '@angular/core';
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),
  ],
};
```

This provides:
- Language management
- Browser Intl API for formatting
- i18n system (but no translation loader)

### With HTTP Sources

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideCoarLocalization,
  provideCoarL10nHttpSource,
  provideCoarI18nHttpSource,
} from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideCoarLocalization({ defaultLanguage: 'en' }),
    provideCoarL10nHttpSource(),  // Defaults to /locales/{lang}.json
    provideCoarI18nHttpSource(),  // Defaults to /i18n/{lang}.json
  ],
};
```

## Changing Language

```ts
import { Component, inject } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div>
      <p>Current: {{ locale.language() }}</p>
      <button (click)="locale.setLanguage('de')">Deutsch</button>
      <button (click)="locale.setLanguage('en')">English</button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  readonly locale = inject(CoarLocalizationService);
}
```

When language changes:
1. `locale.language()` signal updates
2. L10n data reloads (if HTTP source configured)
3. i18n translations reload (if HTTP source configured)
4. All formatting pipes update automatically

## Custom URL Patterns

```ts
// Custom L10n URL (business formatting overrides)
provideCoarL10nHttpSource({
  url: (lang) => `/api/config/intl-${lang}.json`,
  headers: { 'Authorization': 'Bearer ' + getToken() }
})

// Custom i18n URL (translations)
provideCoarI18nHttpSource({
  url: (lang) => `/api/translations/${lang}.json`,
  headers: { 'Authorization': 'Bearer ' + getToken() }
})
```

## L10n JSON Format

```json
{
  "dateFormat": {
    "pattern": "dd.mm.yyyy",
    "firstDayOfWeek": 1
  },
  "numberFormat": {
    "decimal": ",",
    "thousand": "."
  }
}
```

## Where it's used

UI components consume localization for formatting defaults:

- **Date Picker** - Uses L10n for default date pattern and first day of week
- **Number Input** - Uses L10n for default decimal/thousand separators
- **All components** - Can use i18n for translatable labels/messages

Components always allow explicit overrides via inputs when needed.
