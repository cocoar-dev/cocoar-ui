# Tooltip API

## CoarTooltipDirective

### Import

```ts
import { CoarTooltipDirective } from '@cocoar/ui-components';
```

### Selector

```html
<!-- Apply as an attribute directive to any element -->
<button coarTooltip="Hello">Hover me</button>
```

### Export

```html
<button coarTooltip="Hello" #tt="coarTooltip">Hover me</button>
```

### Types

- `TooltipPlacement = 'auto'
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'`
- `CoarTooltipOverlayContent = string | TemplateRef<unknown> | Type<unknown>`

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `coarTooltip` | `CoarTooltipOverlayContent \| null` | `null` | Tooltip content. Empty string / `null` means “no tooltip”. |
| `coarTooltipContext` | `object \| null` | `null` | Context object used when `coarTooltip` is a `TemplateRef`. |
| `coarTooltipDisabled` | `boolean` | `false` | Disables tooltip behavior and closes any open tooltip. Supports boolean attribute usage. |
| `coarTooltipPlacement` | `TooltipPlacement` | `'top'` | Placement preference. Use `'auto'` for best-fit across primary sides. |
| `coarTooltipOpenDelay` | `number` | `0` | Delay in ms before opening on hover/focus. |
| `coarTooltipCloseDelay` | `number` | `0` | Delay in ms before closing on leave/blur. |
| `coarTooltipClampToViewport` | `boolean` | `true` | When true, shifts to remain within the viewport. |
| `coarTooltipFallbackToBestFit` | `boolean` | `false` | When placement is explicit (not `'auto'`), allows falling back to best-fit when the requested placement doesn’t fit. |

### Methods

| Name | Description |
| --- | --- |
| `open()` | Opens the tooltip immediately (if enabled and has content). |
| `close(immediate?: boolean)` | Closes the tooltip. When `immediate` is true, clears pending timers. |
| `toggle()` | Toggles the tooltip open/closed. |

### Behavior notes

- Only one tooltip is allowed to be open at a time (app-wide).
- While open, changes to content or positioning-related inputs cause the tooltip to re-open to apply the update (the overlay does not update spec/content in-place).
- Dismissal: `Escape` closes the tooltip; outside click does not dismiss.

## CSS tokens used

The tooltip overlay uses design tokens (CSS variables), including:

- Spacing: `--coar-spacing-xs`
- Colors/borders: `--coar-background-neutral-primary`, `--coar-border-neutral`, `--coar-text-neutral-secondary`
- Radius/shadow: `--coar-radius-s`, `--coar-shadow-m`
- Sizing: `--coar-tooltip-max-width` (fallback `320px`)
