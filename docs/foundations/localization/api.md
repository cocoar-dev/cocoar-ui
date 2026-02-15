# Localization API Reference

**Package:** `@cocoar/localization`

## Configuration Functions

### `provideCoarLocalization(config)`

Configures the core localization system.

```ts
function provideCoarLocalization(
  config: CoarLocalizationConfig
): EnvironmentProviders;

interface CoarLocalizationConfig {
  defaultLanguage: string;
}
```

**Automatically includes:**
- Language management (`CoarLocalizationService`)
- L10n: Browser Intl API
- i18n: Translation system

**Example:**
```ts
provideCoarLocalization({ defaultLanguage: 'en' })
```

---

### `provideCoarL10nHttpSource(config?)`

Adds HTTP loader for L10n formatting overrides.

```ts
function provideCoarL10nHttpSource(
  config?: CoarHttpLocaleSourceConfig
): EnvironmentProviders;

interface CoarHttpLocaleSourceConfig {
  url?: (language: string) => string;  // Default: (lang) => `/locales/${lang}.json`
  headers?: Record<string, string>;
}
```

**Example:**
```ts
// Use defaults
provideCoarL10nHttpSource()

// Custom URL
provideCoarL10nHttpSource({
  url: (lang) => `/api/config/${lang}.json`
})
```

---

### `provideCoarI18nHttpSource(config?)`

Adds HTTP loader for i18n translations.

```ts
function provideCoarI18nHttpSource(
  config?: CoarI18nHttpSourceConfig
): EnvironmentProviders;

interface CoarI18nHttpSourceConfig {
  url?: (language: string) => string;  // Default: (lang) => `/i18n/${lang}.json`
  headers?: Record<string, string>;
}
```

**Example:**
```ts
// Use defaults
provideCoarI18nHttpSource()

// Custom URL with auth
provideCoarI18nHttpSource({
  url: (lang) => `/api/translations/${lang}.json`,
  headers: { 'Authorization': 'Bearer ' + token }
})
```

---

## Services

### `CoarLocalizationService`

Centralized language management service.

#### Properties

**`languageState: ReadonlyState<string>`**
- Canonical language state
- `languageState.value` returns current language synchronously
- `languageState.value$` emits current language immediately on subscribe and then on changes

#### Methods

**`setLanguage(language: string): Promise<void>`**
- Sets current language
- Async: waits for L10n/i18n data to load
- Triggers all reactive updates

**`getDefaultLanguage(): string`**
- Returns default language from config

---

### `CoarI18nService`

Translation service (injected via `COAR_I18N_PROVIDER`).

#### Methods

**`t(key: string, params?: Record<string, unknown>): string`**
- Translates a key
- Returns key if translation missing
- Supports `{{placeholder}}` interpolation

---

## Data Types

### `LocalizationData`

```ts
interface LocalizationData {
  dateFormat?: DateFormatConfig;
  numberFormat?: NumberFormatConfig;
}
```

### `DateFormatConfig`

```ts
interface DateFormatConfig {
  pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  firstDayOfWeek: 1 | 7;  // 1 = Monday, 7 = Sunday
}
```

### `NumberFormatConfig`

```ts
interface NumberFormatConfig {
  decimal: string;   // e.g. '.', ','
  thousand: string;  // e.g. ',', '.', ' '
}
```

### `CoarTranslations`

```ts
type CoarTranslations = Record<string, string>;
```

Flat key-value map:
```json
{
  "welcome": "Welcome",
  "hello": "Hello, {{name}}!"
}
```
