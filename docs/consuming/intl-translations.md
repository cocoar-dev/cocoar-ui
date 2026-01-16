# Using Intl-Based Translations in Components

## Overview

The `@cocoar/localization` library now automatically provides common translations from the browser's Intl API. These translations are loaded by default and can be overridden by your application's HTTP translations.

## How It Works

When you call `provideCoarLocalization()`, the system registers two translation loaders:

1. **`CoarIntlTranslationLoader`** (first) - Provides defaults from browser Intl API
2. **`CoarHttpTranslationLoader`** (second, if configured) - Loads app-specific translations from JSON

Later sources override earlier sources, so your HTTP translations can customize any Intl-provided default.

## Available Intl Translations

The Intl loader automatically provides these translation keys:

### Relative Time
- `common.today` - "today", "heute", "aujourd'hui", etc.
- `common.yesterday` - "yesterday", "gestern", "hier", etc.
- `common.tomorrow` - "tomorrow", "morgen", "demain", etc.

### Months (Full)
- `common.month.1` through `common.month.12` - "January", "Februar", "janvier", etc.

### Months (Abbreviated)
- `common.month.short.1` through `common.month.short.12` - "Jan", "Feb", "janv.", etc.

### Weekdays (Full, Monday=1)
- `common.weekday.1` through `common.weekday.7` - "Monday", "Montag", "lundi", etc.

### Weekdays (Abbreviated)
- `common.weekday.short.1` through `common.weekday.short.7` - "Mon", "Mo", "lun.", etc.

## Example: Date Picker "Today" Button

```typescript
// In your date picker component
import { Component, inject } from '@angular/core';
import { CoarI18n } from '@cocoar/localization';

@Component({
  selector: 'coar-date-picker',
  template: `
    <button (click)="selectToday()">
      {{ i18n.t('common.today') }}
    </button>
  `
})
export class CoarDatePickerComponent {
  protected readonly i18n = inject(CoarI18n);

  selectToday() {
    // Set to today's date
  }
}
```

**Result:**
- English: "today"
- German: "heute"
- French: "aujourd'hui"
- Spanish: "hoy"

## Overriding Intl Translations

If you want to customize the "today" label, just add it to your HTTP translations:

```json
// public/i18n/en.json
{
  "common.today": "Now",
  "common.yesterday": "Previous day"
}
```

The HTTP loader runs second, so it will override the Intl defaults.

## Configuration

### Minimal Setup (Intl only)

```typescript
// app.config.ts
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),
    // No HTTP source needed - Intl provides defaults
  ],
};
```

### With HTTP Overrides

```typescript
// app.config.ts
import { provideCoarLocalization, provideCoarI18nHttpSource } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),
    provideCoarI18nHttpSource({
      url: (lang) => `/i18n/${lang}.json`
    }),
  ],
};
```

## Benefits

✅ **Zero configuration** - Common translations work out of the box
✅ **Automatic localization** - Uses browser's native language data
✅ **Overridable** - Customize any translation via HTTP loader
✅ **Type-safe** - Use `i18n.t('common.today')` with autocomplete
✅ **No JSON files needed** - Unless you want custom overrides

## Migration Guide

If you were manually maintaining translations for "today", "yesterday", etc., you can now remove them from your JSON files. The Intl loader provides them automatically.

**Before:**
```json
{
  "datepicker.today": "today",
  "datepicker.yesterday": "yesterday",
  "datepicker.tomorrow": "tomorrow"
}
```

**After:**
```typescript
// Just use the Intl keys
i18n.t('common.today')
i18n.t('common.yesterday')
i18n.t('common.tomorrow')

// No JSON needed! (unless you want custom labels)
```

## Technical Details

- **Source:** `CoarIntlTranslationLoader` in `@cocoar/localization`
- **Execution:** Runs first before HTTP loaders
- **Merge strategy:** Later loaders (HTTP) override Intl defaults
- **Fallback:** If `Intl.RelativeTimeFormat` unavailable, uses English defaults
- **Browser support:** Modern browsers (Chrome 71+, Firefox 65+, Safari 14+)
