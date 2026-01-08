# CoarPopoverGroupService

**Type:** Service

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Local coordination for popovers inside the same container (e.g. a date picker panel).
Provided by a parent component to ensure only one popover in that scope is open at a time.

## Methods

### `notifyClosed()`

**Parameters:**

- `id`: `string`

**Returns:** `void`

### `requestOpen()`

**Parameters:**

- `id`: `string`
- `close`: `function`

**Returns:** `void`
