# CoarButtonComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-button></coar-button>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ariaLabel` | `string` | `''` | - | Optional aria-label applied to the underlying <button> element |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the button is disabled |
| `fullWidth` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the button should take full width |
| `iconEnd` | `string \| undefined` | `undefined` | - | Icon to display after the label |
| `iconStart` | `string \| undefined` | `undefined` | - | Icon to display before the label |
| `loading` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the button is in loading state |
| `size` | `ButtonSize` | `'md'` | - | Button size |
| `type` | `"button" \| "submit" \| "reset"` | `'button'` | - | Button type attribute |
| `variant` | `ButtonVariant` | `'primary'` | - | Button visual variant |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `clicked` | `MouseEvent` | Emitted when the button is clicked (not emitted when disabled or loading) |
