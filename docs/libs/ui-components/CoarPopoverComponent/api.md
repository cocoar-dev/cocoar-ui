# CoarPopoverComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

A lightweight, hover/focus popover for rich tooltip-like content.
Uses the overlay system for positioning with automatic placement and viewport clamping.

## Selector

```html
<coar-popover></coar-popover>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `clampToViewport` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether the panel should be clamped into the viewport. Default: true |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disable popover behavior (still renders trigger content). |
| `fallbackToBestFit` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | When a concrete placement is set, fall back to best-fit when it doesn't fit. Default: false |
| `interactive` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether the panel should receive pointer events. Default: true |
| `openOnClick` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Enable click/tap behavior (touch-friendly). Default: false |
| `openOnHover` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Enable hover/focus behavior (desktop-friendly). Default: false |
