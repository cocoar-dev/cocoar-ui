# CoarDividerComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

A flexible divider component for visually separating content sections.
Supports optional content (text, icons, etc.) via ng-content that can be
aligned left, center, or right. When content is present, the divider line
splits around it.
**Example :**`<!-- Simple divider -->
<coar-divider />`**Example :**`<!-- Divider with centered text -->
<coar-divider>OR</coar-divider>`**Example :**`<!-- Divider with left-aligned content -->
<coar-divider align="left">Section Title</coar-divider>`

## Selector

```html
<coar-divider></coar-divider>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `align` | `DividerAlign` | `'center'` | - | Content alignment when ng-content is provided |
| `spacingBottom` | `number` | `0` | - | Spacing below the divider in pixels |
| `spacingTop` | `number` | `0` | - | Spacing above the divider in pixels |
| `variant` | `DividerVariant` | `'subtle'` | - | Visual style variant |
| `width` | `number` | `90` | - | Width of the divider as a percentage (0-100) |
