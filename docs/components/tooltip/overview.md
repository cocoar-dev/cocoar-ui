# Tooltip

Tooltips display short, **non-interactive** helper text or lightweight content when the user hovers or focuses an element.

If you need rich, interactive content (links, inputs, buttons), use Popover instead.

## Basic usage

```html
<button type="button" coarTooltip="Copy to clipboard">Copy</button>
```

Tooltips open on `mouseenter`/`focusin` and close on `mouseleave`/`focusout`.

## Placement

Use `coarTooltipPlacement` to choose a preferred placement.

```html
<button type="button" coarTooltip="Top (default)">Top</button>
<button type="button" coarTooltip="Bottom" coarTooltipPlacement="bottom">Bottom</button>
<button type="button" coarTooltip="Auto" coarTooltipPlacement="auto">Auto</button>
```

## Open/close delays

Use open/close delays (in ms) to avoid flicker.

```html
<button
  type="button"
  coarTooltip="Opens after 200ms; closes after 100ms"
  coarTooltipOpenDelay="200"
  coarTooltipCloseDelay="100"
>
  Hover me
</button>
```

## Template tooltip (with context)

```html
<ng-template #tip let-name="name">
  Hello {{ name }}
</ng-template>

<button
  type="button"
  [coarTooltip]="tip"
  [coarTooltipContext]="{ name: 'Ada' }"
>
  Hover me
</button>
```

## Component tooltip

`[coarTooltip]` can also receive a Component type.

```ts
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `Details from a component`,
})
export class TooltipContentComponent {}

// In the host component:
TooltipContentComponent = TooltipContentComponent;
```

```html
<button type="button" [coarTooltip]="TooltipContentComponent">
  Hover me
</button>
```

## Programmatic control

The directive is exported as `coarTooltip`, so you can call `open()`, `close()`, or `toggle()`.

```html
<button
  type="button"
  coarTooltip="Controlled tooltip"
  #tt="coarTooltip"
  (click)="tt.toggle()"
>
  Click me
</button>
```

## Accessibility notes

- Tooltip overlays use `role="tooltip"`.
- The trigger element receives `aria-describedby` while the tooltip is open.
- Tooltips are intentionally **non-interactive** (the overlay disables pointer events).
