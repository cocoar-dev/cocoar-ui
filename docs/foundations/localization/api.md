# Localization Service API

## Types

### `NumberFormatConfig`

- `decimal: string` — decimal separator (e.g. `.` or `,`)
- `thousand: string` — thousands separator (e.g. `,`, `.`, ` `)

### `DateFormatConfig`

- `pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'`
- `firstDayOfWeek: 1 | 7` — `1` = Monday, `7` = Sunday

### `LocaleConfig`

- `number: NumberFormatConfig`
- `date: DateFormatConfig`

## DI Token

### `COAR_LOCALE_SERVICE`

An Angular DI token that resolves to an `ICoarLocaleService`.

- The token is `providedIn: 'root'`.
- Default factory returns an instance of `CoarLocaleService`.

## Interface

### `ICoarLocaleService`

#### `getNumberFormat(locale?: string): NumberFormatConfig`
Returns number separators for the provided `locale`, or for the current default locale if `locale` is omitted.

#### `getDateFormat(locale?: string): DateFormatConfig`
Returns date pattern + first day of week for the provided `locale`, or for the current default locale if `locale` is omitted.

#### `getDefaultLocale(): string`
Returns the current default locale id.

#### `setDefaultLocale(locale: string): void`
Sets the default locale id.

#### `registerLocale(id: string, config: Partial<LocaleConfig>): void`
Registers an app-specific locale id with partial overrides:

- If `config.number` is omitted, the default number format for `id` is used.
- If `config.date` is omitted, the default date format for `id` is used.

## Default implementation

### `CoarLocaleService`

Default implementation used by `COAR_LOCALE_SERVICE`.

Behavior highlights:

- Uses browser `Intl.NumberFormat(...).formatToParts(...)` to derive decimal and group separators.
- Detects date order with `Intl.DateTimeFormat(...).formatToParts(...)` and maps it to supported patterns.
- Falls back to `decimal='.'`, `thousand=','`, `pattern='dd.mm.yyyy'`, `firstDayOfWeek=1` if locale detection fails.
