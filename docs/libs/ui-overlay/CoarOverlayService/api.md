# CoarOverlayService

**Type:** Service

**Package:** `@cocoar/ui-overlay`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Methods

### `closeAll()`

**Returns:** `void`

### `openComponent()`

**Parameters:**

- `component`: `Type<C>`
- `settings`: `OverlaySettings<ComponentInputs<C>>`
- `inputs`: `ComponentInputs<C>`

**Returns:** `OverlayRef`

### `openComponentAsChild()`

**Parameters:**

- `parent`: `OverlayRef`
- `component`: `Type<C>`
- `settings`: `OverlaySettings<ComponentInputs<C>>`
- `inputs`: `ComponentInputs<C>`
- `options`: `OverlayOpenOptions`

**Returns:** `OverlayRef`

### `openTemplate()`

**Parameters:**

- `template`: `TemplateRef<TCtx>`
- `settings`: `OverlaySettings<TCtx>`
- `inputs`: `TCtx`

**Returns:** `OverlayRef`

### `openTemplateAsChild()`

**Parameters:**

- `parent`: `OverlayRef`
- `template`: `TemplateRef<TCtx>`
- `settings`: `OverlaySettings<TCtx>`
- `inputs`: `TCtx`
- `options`: `OverlayOpenOptions`

**Returns:** `OverlayRef`

### `openText()`

**Parameters:**

- `settings`: `OverlaySettings<literal type>`
- `inputs`: `literal type`

**Returns:** `OverlayRef`

### `openTextAsChild()`

**Parameters:**

- `parent`: `OverlayRef`
- `settings`: `OverlaySettings<literal type>`
- `inputs`: `literal type`
- `options`: `OverlayOpenOptions`

**Returns:** `OverlayRef`
