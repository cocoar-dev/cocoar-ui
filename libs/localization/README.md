# @cocoar/localization

Locale and language management for the Cocoar Design System.

## Overview

This library provides centralized language management for Cocoar applications. It serves as the single source of truth for the current language and notifies other systems (i18n, localization/formatting) about language changes.

## Features

- **CoarLocalizationService** - Language state management
- **Centralized Configuration** - Single source of truth for available languages
- **Signal-based API** - Reactive language updates using Angular Signals
- **Observable API** - RxJS-based language change notifications
- **Lightweight** - Zero dependencies beyond Angular core and RxJS

## Installation

```bash
pnpm add @cocoar/localization
```

## Usage

### Configuration

Configure available languages and default language using `provideCoarLocalization()`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      availableLanguages: ['en', 'de', 'fr'],
      defaultLanguage: 'en',
    }),
  ],
};
```

### Basic Usage

```typescript
import { Component, inject, effect } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div>
      <p>Current language: {{ locale.language() }}</p>
      <button (click)="switchToGerman()">Deutsch</button>
      <button (click)="switchToEnglish()">English</button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  readonly locale = inject(CoarLocalizationService);

  constructor() {
    // React to language changes using effects
    effect(() => {
      console.log('Language changed to:', this.locale.language());
    });
  }

  switchToGerman() {
    this.locale.setLanguage('de');
  }

  switchToEnglish() {
    this.locale.setLanguage('en');
  }
}
```

### Using the Signal

```typescript
import { Component, inject, computed } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

@Component({
  selector: 'app-example',
  template: `<h1>{{ greeting() }}</h1>`,
})
export class ExampleComponent {
  private readonly locale = inject(CoarLocalizationService);

  readonly greeting = computed(() => {
    const lang = this.locale.language();
    return lang === 'de' ? 'Hallo Welt' : 'Hello World';
  });
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
    this.locale.languageChanged$.subscribe((newLang) => {
      console.log('Language changed to:', newLang);
      this.changeCount++;
      // Reload data, update formatting, etc.
    });
  }
}
```

### Getting Current Language

```typescript
import { inject } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

export class MyService {
  private readonly locale = inject(CoarLocalizationService);

  doWork() {
    const currentLang = this.locale.getCurrentLanguage();
    console.log('Current language:', currentLang);
  }
}
```

## API

### provideCoarLocalization()

Configures the locale system with available languages and default language.

```typescript
function provideCoarLocalization(config: CoarLocalizationConfig): EnvironmentProviders;

interface CoarLocalizationConfig {
  /** All languages available in the application */
  availableLanguages: string[];
  /** The default/fallback language */
  defaultLanguage: string;
}
```

**Example:**

```typescript
provideCoarLocalization({
  availableLanguages: ['en', 'de', 'fr', 'es'],
  defaultLanguage: 'en',
});
```

### CoarLocalizationService

#### Properties

- **`language: Signal<string>`** - Signal containing the current language code
- **`languageChanged$: Observable<string>`** - Observable that emits when language changes

#### Methods

- **`getCurrentLanguage(): string`** - Returns the current language code
- **`setLanguage(language: string): void`** - Sets the current language
- **`getAvailableLanguages(): string[]`** - Returns all available languages (from config)
- **`getDefaultLanguage(): string`** - Returns the default language (from config)

## Default Configuration

If `provideCoarLocalization()` is not called, the service uses these defaults:
- **Default language**: `'en'`
- **Available languages**: `['en']`
      deps: [CoarLocalizationService],
    },
  ],
};
```


## Integration with i18n

The `@cocoar/localization` library includes a complete i18n system with built-in HTTP loader.

**Example:**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideCoarLocalization, provideCoarI18n } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),

    // 1. Configure locale (languages and default)
    provideCoarLocalization({
      availableLanguages: ['en', 'de', 'fr'],
      defaultLanguage: 'en',
    }),

    // 2. Set up i18n (loads from /i18n/en.json, /i18n/de.json, etc.)
    provideCoarI18n(),
  ],
};
```

For custom loaders (SignalR, static imports, etc.), implement `CoarTranslationLoader`.


This service is designed to be the foundation for both i18n (translations) and localization (formatting). Other systems can subscribe to `languageChanged$` to react to language changes:

```typescript
// Example: i18n integration (future)
locale.languageChanged$.subscribe((lang) => {
  translationService.loadLanguage(lang);
});

// Example: localization integration (future)
locale.languageChanged$.subscribe((lang) => {
  formattingService.setLocale(lang);
});
```

## License

Apache-2.0
