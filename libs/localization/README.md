# @cocoar/localization

Complete localization system for the Cocoar Design System.

## Overview

This library provides centralized language management, formatting (L10n), and translations (i18n) for Cocoar applications. It serves as the single source of truth for the current language and automatically synchronizes all localization systems.

## Features

- **Language Management** - Centralized language state with Observable-first API
- **L10n (Localization)** - Date, number, currency, percent formatting with browser Intl API + optional HTTP overrides
- **i18n (Internationalization)** - Translation system with automatic loading and parameter interpolation
- **Automatic Synchronization** - Language changes automatically trigger L10n and i18n updates
- **Reactive API** - Observable-first API; Signals are available for Angular template/Signal edges
- **Lightweight** - Zero dependencies beyond Angular core and RxJS

## Installation

```bash
pnpm add @cocoar/localization
```

## Quick Start

### Minimal Setup (L10n only)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    // Core system: language management + Intl formatting
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),
  ],
};
```

This gives you:
- Language management (`CoarLocalizationService`, Observable-first)
- Browser Intl API for formatting (date, number, currency, percent)
- i18n system (but no translation loader)

### With HTTP Sources (L10n + i18n)

```typescript
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

    // Core system
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),

    // Optional: L10n HTTP overrides for business rules
    provideCoarL10nHttpSource(),  // Defaults to /locales/{lang}.json

    // Optional: i18n HTTP translations
    provideCoarI18nHttpSource(),  // Defaults to /i18n/{lang}.json
  ],
};
```

```typescript
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div>
      <p>Current language: {{ currentLanguage() }}</p>
      <button (click)="switchToGerman()">Deutsch</button>
      <button (click)="switchToEnglish()">English</button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  readonly locale = inject(CoarLocalizationService);
  readonly currentLanguage = toSignal(this.locale.languageState.value$, {
    initialValue: this.locale.languageState.value,
  });

  switchToGerman() {
    this.locale.setLanguage('de');
  }

  switchToEnglish() {
    this.locale.setLanguage('en');
  }
}
```

### Using the Observable

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  selector: 'app-example',
  template: `<p>Language changes: {{ changeCount }}</p>`,
})
export class ExampleComponent implements OnInit {
  private readonly locale = inject(CoarLocalizationService);
  changeCount = 0;

  ngOnInit() {
    // Subscribe to language changes
    this.locale.languageState.value$.subscribe((newLang) => {
      console.log('Language changed to:', newLang);
      this.changeCount++;
      // Reload data, update formatting, etc.
    });
  }
}

// Note: languageState.value$ emits the current language immediately on subscribe.
// If you only care about subsequent changes, use `skip(1)` in your pipe chain.
```

### Getting Current Language

```typescript
import { inject } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

export class MyService {
  private readonly locale = inject(CoarLocalizationService);

  doWork() {
    const currentLang = this.locale.languageState.value;
    console.log('Current language:', currentLang);
  }
}
```

## API

### provideCoarLocalization()

Configures the locale system with the default language.

**Note:** Browser Intl API is automatically included as the first localization source.

```typescript
function provideCoarLocalization(config: CoarLocalizationConfig): EnvironmentProviders;

interface CoarLocalizationConfig {
  /** The default/fallback language */
  defaultLanguage: string;
}
```

**Example:**

```typescript
provideCoarLocalization({
  defaultLanguage: 'en',
});
```

### CoarLocalizationService

#### Properties

- **`languageState: ReadonlyState<string>`** - Canonical language state (`.value` + `.value$`)

#### Methods

- **`setLanguage(language: string): Promise<void>`** - Sets the current language (async to load data)
- **`getDefaultLanguage(): string`** - Returns the default language (from config)

## Default Configuration

If `provideCoarLocalization()` is not called, the service uses these defaults:
- **Default language**: `'en'`
- **L10n source**: Browser Intl API (always included automatically)
- **i18n service**: Available but no translation loader (use `provideCoarI18nHttpSource()` to add one)

## License

Apache-2.0
