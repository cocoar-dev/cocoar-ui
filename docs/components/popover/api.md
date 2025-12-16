# Popover API

## CoarPopoverComponent

### Import

```ts
import { CoarPopoverComponent } from '@cocoar/ui-components';
```

### Selector

```html
<coar-popover></coar-popover>
```

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables popover behavior (still renders trigger content). Supports boolean attribute usage. |
| `openOnHover` | `boolean` | `false` | Enables hover/focus open + hover/focus close behavior. |
| `openOnClick` | `boolean` | `false` | Enables click/tap open/close behavior (including “pin by click”). |
| `interactive` | `boolean` | `true` | When false, the panel ignores pointer events (`pointer-events: none`). |
| `fallbackToBestFit` | `boolean` | `false` | Reserved for best-fit fallback behavior when concrete placements are introduced; popover currently uses a best-fit placement list. |
| `clampToViewport` | `boolean` | `true` | When true, shifts to remain within the viewport. |

### Content projection

| Slot | Selector | Description |
| --- | --- | --- |
| Trigger | `[coarPopoverTrigger]` | The anchor/trigger element. Clicking this toggles when `openOnClick` is enabled. |
| Panel content | `[coarPopoverContent]` | The content rendered inside the overlay panel. |

### Scoped coordination

To coordinate multiple popovers within a container (only one open at a time), provide `CoarPopoverGroupService` from a parent component.

```ts
import { CoarPopoverGroupService } from '@cocoar/ui-components';

@Component({
  // ...
  providers: [CoarPopoverGroupService],
})
export class ContainerComponent {}
```

### Behavior notes

- Hover close uses a short delay (~80ms) to allow moving the pointer between trigger and panel without flicker.
- Dismissal: `Escape` closes the popover; outside click closes only when `openOnClick` is enabled and the popover is pinned by click.

## CSS tokens used

The popover panel uses design tokens (CSS variables), including:

- Spacing: `--coar-spacing-xs`, `--coar-spacing-s`
- Colors/borders: `--coar-background-neutral-primary`, `--coar-border-neutral`
- Radius/shadow: `--coar-radius-s`, `--coar-shadow-m`
- Sizing: `--coar-popover-min-width`, `--coar-popover-max-width`, `--coar-popover-max-height`
