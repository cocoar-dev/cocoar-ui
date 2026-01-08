# CoarCardComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-card></coar-card>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `borderless` | `` | `false, { transform: booleanAttribute }` | - | Removes the border from the card, leaving only background color. By default (false), cards have a visible border matching their color. Use as boolean attribute: `<coar-card borderless>` or `[borderless]="true"` |
| `color` | `CardColor` | `'neutral'` | - | Card color scheme |
| `elevated` | `` | `false, { transform: booleanAttribute }` | - | Adds a box-shadow for elevation/depth. Use as boolean attribute: `<coar-card elevated>` or `[elevated]="true"` |
| `padding` | `CardPadding` | `'md'` | - | Card padding size |
