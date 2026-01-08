# CoarIconService

**Type:** Service

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Methods

### `clearCache()`

**Returns:** `void`

### `clearIconCache()`

**Parameters:**

- `name`: `string`

**Returns:** `void`

### `getAvailableIconKeys()`

<p>Get the available icon keys from a specific source.</p>
<p>Throws if the source does not support listing keys.</p>

**Parameters:**

- `sourceKey`: `string`

**Returns:** `Observable<string[]>`

### `getIcon()`

<p>Get an icon by name from a specific icon source.</p>
<ul>
<li>If <code>sourceKey</code> is omitted, the default source is used.</li>
<li>If no source is configured, this throws to make misconfiguration obvious.</li>
</ul>

**Parameters:**

- `name`: `string`
- `sourceKey`: `string`

**Returns:** `Observable<string \| null>`

### `getRegisteredSources()`

<p>List all registered icon sources.</p>
<p>This is useful for UIs that allow users to browse icons grouped by source.</p>

**Returns:** `ReadonlyArray<CoarIconRegisteredSource>`
