# CoarLocaleService

**Type:** Service

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Default implementation of locale service.
Uses browser's Intl.NumberFormat API for standard locales,
with support for custom locale registration.

## Methods

### `getDateFormat()`

**Parameters:**

- `locale`: `string`

**Returns:** `DateFormatConfig`

### `getDefaultLocale()`

**Returns:** `string`

### `getNumberFormat()`

**Parameters:**

- `locale`: `string`

**Returns:** `NumberFormatConfig`

### `registerLocale()`

**Parameters:**

- `id`: `string`
- `config`: `Partial<LocaleConfig>`

**Returns:** `void`

### `setDefaultLocale()`

**Parameters:**

- `locale`: `string`

**Returns:** `void`
