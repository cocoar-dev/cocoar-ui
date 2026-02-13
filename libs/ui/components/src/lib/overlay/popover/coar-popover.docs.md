# Popover

Popover shows rich, tooltip-like content in an overlay anchored to a trigger.

Popover can be configured for hover/focus (desktop-friendly) and/or click/tap (touch-friendly).

## Basic usage (hover/focus)

Enable hover/focus behavior with `openOnHover`.

```html
<coar-popover [openOnHover]="true">
  <button type="button" coarPopoverTrigger>Hover me</button>

  <div coarPopoverContent>
    <strong>Title</strong>
    <p>Rich content goes here.</p>
  </div>
</coar-popover>
```

## Click/tap behavior (pinning)

Enable click/tap behavior with `openOnClick`.

```html
<coar-popover [openOnClick]="true">
  <button type="button" coarPopoverTrigger>Click me</button>

  <div coarPopoverContent>
    Click again to close.
  </div>
</coar-popover>
```

Notes:

- If the popover is opened via hover, clicking the trigger “pins” it open.
- When pinned via click, it won’t close on hover out.
- With `openOnClick` enabled, clicking outside closes the popover when it is pinned.

## Non-interactive panel

By default, the panel is interactive (`interactive=true`). To make the panel ignore pointer events (tooltip-like), set `interactive` to `false`.

```html
<coar-popover [openOnHover]="true" [interactive]="false">
  <button type="button" coarPopoverTrigger>Hover me</button>
  <div coarPopoverContent>Non-interactive content</div>
</coar-popover>
```

## Scoped coordination (only one open)

Provide `CoarPopoverGroupService` on a parent container to ensure only one popover in that scope is open at a time.

```ts
import { Component } from '@angular/core';
import { CoarPopoverGroupService } from '@cocoar/ui/components';

@Component({
  // ...
  providers: [CoarPopoverGroupService],
})
export class ExampleContainerComponent {}
```

## Accessibility notes

- The panel uses `role="tooltip"`.
- `Escape` closes the popover.
- When pinned by click, focus leaving the trigger/panel does not force close; when not pinned, focus leaving closes the popover.
