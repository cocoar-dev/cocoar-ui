# CoarLabelComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Standalone label component for consistent form labeling across the design system.
**Example :**`<coar-label size="sm" [required]="true">Email Address</coar-label>
<coar-text-input size="sm" placeholder="your&#64;email.com" />`

## Selector

```html
<coar-label></coar-label>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `for` | `string \| undefined` | `undefined` | - | The ID of the form element this label is associated with. Sets the 'for' attribute for accessibility. |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether to show a required indicator (*) after the label text. |
| `size` | `CoarLabelSize` | `'md'` | - | Size of the label. Should match the size of the associated input/form element. |
| `text` | `string` | `''` | - |  |

## Host Bindings

| Binding | Value |
| --- | --- |
| `0` | `[object Object]` |
| `1` | `[object Object]` |
| `2` | `[object Object]` |
| `3` | `[object Object]` |
| `4` | `[object Object]` |
