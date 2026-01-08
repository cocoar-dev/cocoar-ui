# CoarTagComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarTagComponent
A compact label component for categorizing, labeling, or marking content.
Shares the same color system as CoarCard for visual consistency.
Unlike badges (pill-shaped, for counts/notifications), tags use
slight rounding and support interactive features like closing.
**Example :**`<coar-tag>Default</coar-tag>
<coar-tag color="success">Published</coar-tag>
<coar-tag color="warning" closable (closed)="onRemove()">Draft</coar-tag>`

## Selector

```html
<coar-tag></coar-tag>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `borderless` | `` | `false, { transform: booleanAttribute }` | - | Removes the border from the tag, leaving only background color. By default (false), tags have a visible border matching their color. Use as boolean attribute: `<coar-tag borderless>` or `[borderless]="true"` |
| `closable` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the tag can be closed/removed |
| `color` | `TagColor` | `'neutral'` | - | Tag color scheme - matches Card colors |
| `elevated` | `` | `false, { transform: booleanAttribute }` | - | Adds a box-shadow for elevation/depth. Use as boolean attribute: `<coar-tag elevated>` or `[elevated]="true"` |
| `size` | `TagSize` | `'md'` | - | Tag size |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `closed` | `void` | Emitted when the close button is clicked |
