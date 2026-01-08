# CoarScrollbarDirective

**Type:** Directive

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Directive that applies custom overlay scrollbars to an element.
Uses OverlayScrollbars library to replace native scrollbars with
styleable overlay scrollbars while preserving native scroll behavior.
**Example :**`<!-- Basic usage -->
<div coarScrollbar>Scrollable content</div>

<!-- With options -->
<div coarScrollbar [theme]="'light'" [autoHide]="'scroll'">
  Scrollable content
</div>

<!-- Horizontal only -->
<div coarScrollbar [overflowX]="'scroll'" [overflowY]="'hidden'">
  Horizontal scrollable content
</div>`

## Selector

```html
[[coarScrollbar]]
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autoHide` | `CoarScrollbarAutoHide` | `'leave'` | - | Auto-hide behavior for scrollbars |
| `autoHideDelay` | `number` | `400` | - | Delay in ms before auto-hide triggers |
| `clickScroll` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether clicking the track scrolls to that position |
| `defer` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether to defer initialization until browser is idle |
| `overflowX` | `CoarScrollbarOverflow` | `'scroll'` | - | Overflow behavior for x-axis |
| `overflowY` | `CoarScrollbarOverflow` | `'scroll'` | - | Overflow behavior for y-axis |
| `overscrollBehavior` | `"auto" \| "contain" \| "none"` | `'auto'` | - | Overscroll behavior to prevent scroll chaining to parent elements.  - 'auto': Default browser behavior (scroll chains to parent)  - 'contain': Prevents scroll chaining when reaching scroll boundaries  - 'none': Prevents scroll chaining and disables bounce effects |
| `theme` | `CoarScrollbarTheme` | `'dark'` | - | Theme for scrollbar appearance |
