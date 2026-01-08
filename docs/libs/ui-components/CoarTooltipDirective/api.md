# CoarTooltipDirective

**Type:** Directive

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
[[coarTooltip]]
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `coarTooltip` | `CoarTooltipOverlayContent \| null` | `null` | - | Tooltip content (string, TemplateRef, or Component type). |
| `coarTooltipClampToViewport` | `boolean, unknown` | `true, {    transform: booleanAttribute,  }` | - | Whether the tooltip should be clamped into the viewport. Default: true |
| `coarTooltipCloseDelay` | `number, unknown` | `0, { transform: numberAttribute }` | - | Delay (ms) before closing on leave/blur. Default: 0 |
| `coarTooltipContext` | `object \| null` | `null` | - | Optional context for TemplateRef tooltips. |
| `coarTooltipDisabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disable tooltip behavior. |
| `coarTooltipFallbackToBestFit` | `boolean, unknown` | `false, {    transform: booleanAttribute,  }` | - | When placement is explicit (not auto), fall back to best-fit when it doesn't fit. Default: false |
| `coarTooltipOpenDelay` | `number, unknown` | `0, { transform: numberAttribute }` | - | Delay (ms) before opening on hover/focus. Default: 0 |
| `coarTooltipPlacement` | `TooltipPlacement` | `'top'` | - | Placement preference. Default: 'top'. Use 'auto' for best-fit. |
