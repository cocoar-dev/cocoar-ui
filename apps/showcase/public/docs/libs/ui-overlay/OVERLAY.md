# Cocoar Overlay System

> **A framework-pure, spec-driven overlay system for Angular applications**

The Cocoar Overlay System provides a flexible, imperative API for creating floating panels, modals, tooltips, dropdowns, and other overlay-based UI components.

---

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [CoarOverlayService](#coaroverlayservice)
  - [Overlay Builder](#overlay-builder)
  - [Overlay Spec](#overlay-spec)
  - [Overlay Ref](#overlay-ref)
- [Positioning](#positioning)
  - [Placement Options](#placement-options)
  - [Attachment Strategies](#attachment-strategies)
  - [Placement Selection](#placement-selection)
  - [Boundary Constraints](#boundary-constraints)
- [Focus Management](#focus-management)
- [Dismiss Behavior](#dismiss-behavior)
- [Presets](#presets)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)

---

## Overview

The Overlay System is built on these principles:

- **Framework Purity**: No external positioning libraries (Popper.js, Floating UI, etc.)
- **Spec-Driven**: Configuration via plain objects, not directives or decorators
- **Imperative API**: Programmatic control over lifecycle and behavior
- **Portal-Based**: Renders outside normal DOM hierarchy to escape stacking contexts
- **Type-Safe**: Full TypeScript support with strict types

### Key Features

✅ **12 Placement Options** — All standard positions (top/bottom/left/right × start/end/center)
✅ **Attachment Strategies** — Portal to body or attach to parent container
✅ **Container Boundaries** — Placement evaluation and shifting can use parent containers (not just viewport)
✅ **Placement Selection** — Best-overflow selection with optional “prefer-first-fit” (`position.flip`) and explicit fallback order
✅ **Focus Management** — Trap and restore with accessibility support
✅ **Dismiss Modes** — ESC key, outside clicks, backdrop clicks, programmatic
✅ **Z-Index Stacking** — Automatic layering for nested overlays
✅ **Multiple Content Types** — Component, template, or text

---

## Core Concepts

### Overlay Spec

An `OverlaySpec` is a configuration object describing how an overlay should behave:

```typescript
interface OverlaySpec<TInputs = void> {
  content?: ContentSpec<TInputs>;
  anchor?: AnchorSpec;
  position?: PositionSpec;
  size?: SizeSpec;
  backdrop?: BackdropSpec;
  scroll?: ScrollSpec;
  dismiss?: DismissSpec;
  focus?: FocusSpec;
  a11y?: A11ySpec;
  attachment?: AttachmentSpec;
}
```

### Overlay Ref

An `OverlayRef` represents an open overlay instance.

```typescript
interface OverlayRef {
  close(result?: unknown): void;
  updatePosition(): void;
  readonly afterClosed$: Observable<unknown>;
}
```

### Spec builder API

Use `Overlay.define(...)` to build immutable specs (optionally applying presets):

```typescript
import { CoarOverlayService, Overlay, coarMenuPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromComponent(MyComponent));
  b.anchor({ kind: 'element', element: triggerElement });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
}, coarMenuPreset);

const ref = overlayService.open(spec, undefined);
```

---

## Getting Started

### Installation

The overlay system is part of `@cocoar/ui-overlay`:

```typescript
import { CoarOverlayService, Overlay } from '@cocoar/ui-overlay';
```

### Basic Usage

```typescript
import { Component, inject, ElementRef, viewChild } from '@angular/core';
import { CoarOverlayService, Overlay } from '@cocoar/ui-overlay';
import { MyPopupComponent } from './my-popup.component';

@Component({
  selector: 'app-example',
  template: `
    <button #trigger (click)="openOverlay()">Open Overlay</button>
  `
})
export class ExampleComponent {
  private overlayService = inject(CoarOverlayService);
  private trigger = viewChild.required<ElementRef>('trigger');

  openOverlay() {
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromComponent(MyPopupComponent));
      b.anchor({ kind: 'element', element: this.trigger().nativeElement });
      b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
      b.dismiss({ outsideClick: true, escapeKey: true });
    });

    this.overlayService.open(spec, undefined);
  }
}
```

---

## API Reference

### CoarOverlayService

The service manages overlay lifecycle and global event handling.

#### Methods

**`open<TInputs>(spec: OverlaySpec<TInputs>, inputs: TInputs, options?: OverlayOpenOptions): OverlayRef`**

Opens a new overlay with the given specification.

```typescript
const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromComponent(MyComponent));
  b.anchor({ kind: 'element', element: triggerEl });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
});

const ref = this.overlayService.open(spec, undefined);
```

**`openChild<TInputs>(parent: OverlayRef, spec: OverlaySpec<TInputs>, inputs: TInputs): OverlayRef`**

Opens a child overlay (menus/submenus). Closing a parent closes its children.

---

### Spec builder API

Use `Overlay.define(...)` and `Overlay.fork(...)` to create immutable specs.

#### `Overlay` / `CoarOverlay`

```ts
Overlay.define((b) => {
  // configure builder
});

Overlay.fork(baseSpec, (b) => {
  // tweak builder
});
```

#### `OverlayBuilder` calls

- `b.content((c) => ...)`
- `b.anchor(...)`
- `b.position(...)`
- `b.size(...)`
- `b.backdrop('none' | 'modal' | BackdropSpec)`
- `b.scroll(...)`
- `b.dismiss(...)`
- `b.focus(...)`
- `b.a11y(...)`
- `b.attachment(...)`

#### `ContentBuilder` calls

- `c.fromComponent(SomeComponent)`
- `c.fromTemplate(someTemplate)`
- `c.fromText()`

#### Positioning (`PositionSpec`)

Configure positioning via `b.position(...)`:

```ts
b.position({
  placement: 'bottom-start',
  offset: 4,
  flip: true,
  shift: true,
});
```

#### Attachment (`AttachmentSpec`)

Controls where the overlay host is attached:

```ts
b.attachment({ strategy: 'body' });
// or
b.attachment({ strategy: 'parent', container: someElement });
```

#### Dismiss (`DismissSpec`) and backdrop click

Dismiss triggers:

```ts
b.dismiss({ outsideClick: true, escapeKey: true });
```

Backdrop click behavior is configured via `BackdropSpec`:

```ts
b.backdrop({ kind: 'modal', closeOnBackdropClick: true });
```

#### Focus (`FocusSpec`)

```ts
b.focus({ trap: true, restore: true });
```

#### Backdrop (`BackdropSpec`)

```ts
b.backdrop('none');
// or
b.backdrop('modal');
```

---

### Overlay Spec

Detailed breakdown of the specification object.

#### AnchorSpec

Defines what the overlay is anchored to.

```typescript
type AnchorSpec =
  | { kind: 'element'; element: Element }
  | { kind: 'point'; x: number; y: number }
  | { kind: 'virtual'; placement: 'center' | 'top' | 'bottom' };
```

**Element Anchor:**
```typescript
{ kind: 'element', element: document.getElementById('trigger') }
```

**Point Anchor:**
```typescript
{ kind: 'point', x: 150, y: 200 }
```

**Virtual Anchor** (centered):
```typescript
{ kind: 'virtual', placement: 'center' }
```

#### ContentSpec

Defines what to render inside the overlay.

```typescript
type ContentSpec<TInputs> = {
  kind: 'component' | 'template' | 'text';
  component?: Type<unknown>;
  template?: TemplateRef<unknown>;

  /** Optional defaults merged with runtime inputs. */
  defaults?: Partial<TInputs>;
};
```

#### PositionSpec

Controls positioning behavior.

```typescript
interface PositionSpec {
  placement: Placement | readonly Placement[];
  offset?: number;
  flip?: boolean;
  shift?: boolean;
}
```

**Placement Types:**
```typescript
type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'center';
```

#### AttachmentSpec

Controls how the overlay is attached to the DOM.

```typescript
type AttachmentSpec =
  | { strategy: 'body' }                                    // Portal to document.body
  | { strategy: 'parent'; container: HTMLElement };         // Attach to specific container
```

**Body Strategy** (default):
- Portal to `document.body`
- Escapes all stacking contexts
- Best for tooltips, modals, global overlays

**Parent Strategy:**
- Attach to specific container
- Uses the container as the positioning boundary
- Best for contained dropdowns, inline popovers

#### DismissSpec

Controls how the overlay can be closed.

```typescript
interface DismissSpec {
  outsideClick?: boolean;        // Default: true
  escapeKey?: boolean;           // Default: true

  /**
   * Optional pointer-based dismissal for menu-like overlays.
   *
   * When enabled, the overlay closes after the pointer leaves the overlay tree
   * (this overlay and any child overlays opened via openChild()).
   */
  hoverTree?: {
    enabled?: boolean;            // Default: false
    delayMs?: number;             // Default: 300
  };
}
```

> Note: modal backdrop click behavior is configured on `BackdropSpec`.

#### FocusSpec

Controls focus management.

```typescript
interface FocusSpec {
  trap?: boolean;                 // Default: false
  restore?: boolean;              // Default: true
}
```

#### BackdropSpec

Controls backdrop behavior.

```typescript
type BackdropSpec =
  | { kind: 'none' }
  | { kind: 'modal'; closeOnBackdropClick?: boolean };
```

> Note: Custom styling is intentionally not modeled as a first-class spec field.
> Style the overlay content itself (component/template), and use `size` / `position` for layout behavior.

---

### Overlay Ref

The `OverlayRef` represents an active overlay instance.

#### Methods

**`close(result?: unknown): void`**

Close the overlay, optionally passing a result value.

```typescript
ref.close({ confirmed: true, value: 'User input' });
```

**`updatePosition(): void`**

Recompute and apply the overlay position.

```typescript
ref.updatePosition();
```

**`afterClosed$`**

Observable that emits the close result when the overlay is closed.

---

## Positioning

### Placement Options

The overlay system supports **12 standard placements**:

```
        top-start    top    top-end
              ┌──────────────┐
    left-start│              │right-start
         left │    ANCHOR    │ right
      left-end│              │right-end
              └──────────────┘
      bottom-start bottom bottom-end
```

**Alignment variants:**
- **`-start`**: Align to start edge (left for vertical, top for horizontal)
- **`-end`**: Align to end edge (right for vertical, bottom for horizontal)
- **No suffix**: Center alignment

### Attachment Strategies

#### Body Strategy (Default)

Portals the overlay to `document.body`:

```typescript
.attachment({ strategy: 'body' })
```

**Use cases:**
- Tooltips that need to escape overflow containers
- Modal dialogs
- Global dropdowns
- Full-screen overlays

**Boundaries:**
- Placement evaluation and shifting use **viewport** boundaries

#### Parent Strategy

Attaches the overlay to a specific container:

```typescript
.attachment({
  strategy: 'parent',
  container: parentElement
})
```

**Use cases:**
- Dropdowns within a scrollable container
- Inline popovers that should respect parent boundaries
- Contained overlays within a specific region

**Boundaries:**
- Placement evaluation and shifting use the **container** boundaries

### Placement Selection

The overlay positions itself using `position.placement`.

- Provide a single placement (e.g. `'bottom-start'`) for a stable preferred placement.
- Provide an ordered array of placements (e.g. `['bottom-start', 'top-start']`) as an explicit fallback order.

`position.flip` changes the selection strategy:

- When `flip: true`, the system returns the **first** placement that fully fits within the boundary.
- Otherwise, it chooses the placement with the **smallest total overflow**.

### Boundary Constraints

#### Shift Into Boundary

Enable shifting to keep the overlay within the boundary (viewport by default, or the parent container when using `attachment.strategy: 'parent'`):

```ts
b.attachment({ strategy: 'body' });
b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
```

#### Container Boundaries

Use a parent attachment strategy to apply container boundaries:

```ts
b.attachment({ strategy: 'parent', container: parentEl });
b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
```

**Requirements:**
- Only works with `strategy: 'parent'`
- Container must have defined boundaries

#### Fallback placements

Use `position.placement` as an array to provide an explicit fallback order:

```ts
b.position({
  placement: ['bottom-start', 'top-start', 'right-start', 'left-start'],
  offset: 4,
  flip: true,
  shift: true,
});
```

---

## Focus Management

The overlay system intentionally keeps focus behavior minimal and explicit.

### Focus Trap

Trap keyboard navigation within the overlay:

```typescript
b.focus({ trap: true }) // For modals
```

**Behavior:**
- TAB cycles through focusable elements
- SHIFT+TAB cycles backward
- Focus wraps from last to first element

### Focus Restore

Restore focus to trigger element when overlay closes:

```typescript
b.focus({ restore: true }) // Default: true
```

---

## Dismiss Behavior

### ESC Key

Close overlay when ESC is pressed:

```typescript
b.dismiss({ escapeKey: true })
```

### Outside Click

Close overlay when clicking outside:

```typescript
b.dismiss({ outsideClick: true })
```

**Special handling:**
- Clicks on the anchor element are treated as "inside"
- Prevents toggle race condition (click to close → immediately reopens)

### Hover Tree (menus / flyouts)

Enable "hover to keep open, leave to close" behavior across a parent-child overlay chain:

```ts
dismiss: {
  hoverTree: {
    enabled: true,
    delayMs: 300,
  },
}
```

What it does:
- Closes the overlay after the pointer leaves the *overlay tree* (this panel + all `openChild(...)` descendants).
- Entering any child overlay cancels the parent's pending close timer.
- Leaving a deeper child schedules closing for the full chain (child + parents).

Inheritance rule:
- If a parent overlay has `dismiss.hoverTree.enabled: true`, overlays opened via `openChild(parent, ...)` inherit the same `hoverTree` config (including `delayMs`) unless the child overrides/turns it off.

### Backdrop Click

Close overlay when clicking the backdrop:

```typescript
// Configure on the spec builder:
b.backdrop({ kind: 'modal', closeOnBackdropClick: true });
```

### Programmatic

Close overlay from code:

```typescript
const ref = overlayService.open(spec, inputs);

// Later...
ref.close();

// With result value
ref.close({ confirmed: true });
```

---

## Presets

Pre-configured overlay specs for common use cases.

### Tooltip Preset

Lightweight hover tooltips:

```typescript
import { Overlay, tooltipPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<{ text: string }>((b) => {
  b.content((c) => c.fromText());
  b.anchor({ kind: 'element', element: triggerEl });
  b.position({ placement: 'top', offset: 8, flip: true, shift: true });
}, tooltipPreset);
```

**Configuration:**
- No backdrop
- No outside-click / ESC dismiss (tooltips are controlled by the caller)
- No focus trap
- Body attachment
- Viewport-aware positioning (`flip` + `shift`)

### Modal Preset

Full-screen modal dialogs:

```typescript
import { Overlay, modalPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<Partial<DialogComponent>>((b) => {
  b.content((c) => c.fromComponent(DialogComponent));
}, modalPreset);
```

**Configuration:**
- Modal backdrop (optionally close on backdrop click)
- Dismiss on ESC
- Focus trap enabled
- Focus restore enabled
- Body attachment
- Virtual center anchor

### Hover Menu Preset

For hover-driven menus (context menus, cascading flyouts), use the hover-menu preset:

```ts
import { Overlay, hoverMenuPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromTemplate(menuTemplate));
  b.anchor({ kind: 'point', x: 120, y: 120 });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
}, hoverMenuPreset);
```

This preset is equivalent to the normal menu preset plus `dismiss.hoverTree` enabled (default `delayMs: 300`).

### Custom Presets

Create your own presets:

```typescript
import { type OverlayPreset } from '@cocoar/ui-overlay';

export const dropdownPreset: OverlayPreset = (b) => {
  b.backdrop('none');
  b.scroll({ strategy: 'close' });
  b.dismiss({ outsideClick: true, escapeKey: true });
  b.focus({ trap: false, restore: true });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
  b.attachment({ strategy: 'body' });
};
```

---

## Advanced Usage

### Nested Overlays

Open child overlays from a parent:

```typescript
const parentRef = overlayService.open({
  anchor: { kind: 'element', element: menuButton },
  content: { kind: 'component', component: MenuComponent }
});

// Inside MenuComponent, open a submenu
const childRef = parentRef.openChild({
  anchor: { kind: 'element', element: submenuTrigger },
  content: { kind: 'component', component: SubmenuComponent }
});
```

**Behavior:**
- Child overlays have higher z-index
- Closing parent automatically closes children
- Outside-click detection considers parent chain

#### Overlay Context (`COAR_OVERLAY_REF`)

Content rendered inside an overlay can inject the current `OverlayRef`:

```ts
import { inject } from '@angular/core';
import { COAR_OVERLAY_REF, CoarOverlayService, Overlay } from '@cocoar/ui-overlay';

const overlayService = inject(CoarOverlayService);
const currentOverlay = inject(COAR_OVERLAY_REF, { optional: true });

if (currentOverlay) {
  const spec = Overlay.define<void>((b) => {
    b.content((c) => c.fromText());
    b.anchor({ kind: 'point', x: 10, y: 10 });
  });

  overlayService.openChild(currentOverlay, spec, undefined);
}
```

Use this when you want to open a true child overlay from within overlay content without plumbing the parent ref manually.

#### Angular Content Projection Caveat

If your overlay content uses `<ng-content>`, remember:
- Projected components keep the injector context of where they were *declared*, not where they are *projected into*.

That means nested overlay triggers inside projected content may inject the "wrong" `COAR_OVERLAY_REF`.

Recommended solutions for advanced reusable components:
- Prefer a `TemplateRef`-based API for nested overlay content (so the embedded view is created inside the overlay injector).
- Or provide an internal component-level context (similar to how the Cocoar menu components handle nested submenus).

### Dynamic Content Updates

Pass inputs to component overlays:

```typescript
interface MyComponentInputs {
  title: string;
  count: number;
}

const spec = Overlay.define<Partial<MyComponentInputs>>((b) => {
  b.content((c) => c.fromComponent(MyComponent));
  b.anchor({ kind: 'point', x: 10, y: 10 });
});

const ref = overlayService.open(spec, { title: 'Initial Title', count: 0 });
```

**Note:** Inputs are set once at creation. For reactive updates, use a shared service or signal.

### Result Values

Get result data when overlay closes:

```typescript
// Caller:
const ref = overlayService.open(spec, inputs);
ref.afterClosed$.subscribe((result) => {
  // result is the value passed to close(result)
});

// In overlay content (component rendered inside the overlay):
class DialogComponent {
  private overlayRef = inject(COAR_OVERLAY_REF);

  confirm() {
    this.overlayRef.close({ confirmed: true, value: this.form.value });
  }
}
```

### Container-Based Boundaries

Constrain overlay to a scrollable container:

```typescript
const container = document.getElementById('scrollable-container')!;

const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromComponent(DropdownComponent));
  b.anchor({ kind: 'element', element: trigger });
  b.attachment({ strategy: 'parent', container });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
});

overlayService.open(spec, undefined);
```

**Use case:** Dropdown in a dashboard widget with `overflow: auto`

---

## Examples

### Tooltip

```typescript
import { CoarOverlayService, Overlay, type OverlayRef, coarTooltipPreset } from '@cocoar/ui-overlay';

@Component({
  selector: 'app-tooltip-example',
  template: `
    <button #trigger (mouseenter)="open()" (mouseleave)="close()">
      Hover me
    </button>
  `
})
export class TooltipExample {
  private overlayService = inject(CoarOverlayService);
  private trigger = viewChild.required<ElementRef>('trigger');
  private overlayRef: OverlayRef | null = null;

  open() {
    if (this.overlayRef) return;

    const spec = Overlay.define<{ text: string }>((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'element', element: this.trigger().nativeElement });
      b.position({ placement: 'top', offset: 8, flip: true, shift: true });
    }, coarTooltipPreset);

    this.overlayRef = this.overlayService.open(spec, { text: 'This is a tooltip' });
    this.overlayRef.afterClosed$.subscribe(() => {
      this.overlayRef = null;
    });
  }

  close() {
    this.overlayRef?.close();
  }
}
```

### Dropdown Menu

```typescript
@Component({
  selector: 'app-dropdown-example',
  template: `
    <button #trigger (click)="toggle()">Menu</button>
  `
})
export class DropdownExample {
  private overlayService = inject(CoarOverlayService);
  private trigger = viewChild.required<ElementRef>('trigger');
  private overlayRef: OverlayRef | null = null;

  toggle() {
    if (this.overlayRef) {
      this.overlayRef.close();
      return;
    }

    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromComponent(MenuComponent));
      b.anchor({ kind: 'element', element: this.trigger().nativeElement });
      b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
    }, coarMenuPreset);

    this.overlayRef = this.overlayService.open(spec, undefined);
    this.overlayRef.afterClosed$.subscribe(() => {
      this.overlayRef = null;
    });
  }
}
```

### Modal Dialog

```typescript
@Component({
  selector: 'app-modal-example',
  template: `
    <button (click)="openModal()">Open Modal</button>
  `
})
export class ModalExample {
  private overlayService = inject(CoarOverlayService);

  async openModal() {
    const spec = Overlay.define<Partial<ConfirmDialogComponent>>((b) => {
      b.content((c) => c.fromComponent(ConfirmDialogComponent));
      // Modal preset configures virtual center anchor, modal backdrop, focus trap, etc.
    }, coarModalPreset);

    const ref = this.overlayService.open(spec, {
      title: 'Confirm Action',
      message: 'Are you sure?',
    });

    ref.afterClosed$.subscribe((result) => {
      if ((result as { confirmed?: boolean } | null)?.confirmed) {
        console.log('User confirmed');
      }
    });
  }
}
```

### Contextual Menu (Right-Click)

```typescript
@Component({
  selector: 'app-context-menu-example',
  template: `
    <div (contextmenu)="openContextMenu($event)">
      Right-click me
    </div>
  `
})
export class ContextMenuExample {
  private overlayService = inject(CoarOverlayService);

  openContextMenu(event: MouseEvent) {
    event.preventDefault();

    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromComponent(ContextMenuComponent));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
    }, coarMenuPreset);

    this.overlayService.open(spec, undefined);
  }
}
```

### Constrained Dropdown (Scrollable Container)

```typescript
@Component({
  selector: 'app-constrained-dropdown',
  template: `
    <div #container class="scrollable-panel">
      <button #trigger (click)="toggle()">Options</button>
    </div>
  `,
  styles: [`
    .scrollable-panel {
      height: 300px;
      overflow: auto;
      border: 1px solid #ccc;
    }
  `]
})
export class ConstrainedDropdownExample {
  private overlayService = inject(CoarOverlayService);
  private trigger = viewChild.required<ElementRef>('trigger');
  private container = viewChild.required<ElementRef>('container');
  private overlayRef: OverlayRef | null = null;

  toggle() {
    if (this.overlayRef) {
      this.overlayRef.close();
      return;
    }

    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromComponent(OptionsComponent));
      b.anchor({ kind: 'element', element: this.trigger().nativeElement });
      b.attachment({ strategy: 'parent', container: this.container().nativeElement });
      b.position({ placement: 'bottom', offset: 4, flip: true, shift: true });
      b.dismiss({ outsideClick: true, escapeKey: true });
    });

    this.overlayRef = this.overlayService.open(spec, undefined);
    this.overlayRef.afterClosed$.subscribe(() => {
      this.overlayRef = null;
    });
  }
}
```

---

## Architecture Notes

### Why No External Libraries?

The Cocoar Overlay System is **framework-pure** and doesn't use Popper.js, Floating UI, or similar libraries:

**Benefits:**
- No dependency bloat
- Full control over positioning logic
- Optimized for Angular's change detection
- Predictable behavior
- Easier debugging

**Trade-offs:**
- More code to maintain
- Fewer exotic positioning features

### Positioning Algorithm

The system uses a straightforward positioning algorithm:

1. **Measure anchor** (element/point/virtual)
2. **Calculate overlay dimensions** (estimate or measure after render)
3. **Generate candidates** from `position.placement` (single or array)
4. **Apply offset** (distance from anchor)
5. **Choose placement** (first that fully fits when `flip: true`, otherwise smallest overflow)
6. **Shift if enabled** (move into the active boundary)
8. **Set fixed position** (top, left CSS values)

### Performance Considerations

**Efficient Positioning:**
- Uses `position: fixed` for overlays
- Minimizes reflows with batched measurements
- RequestAnimationFrame for smooth updates

**Memory Management:**
- Automatic cleanup when overlays close
- Detaches views and destroys components
- Removes event listeners

**Change Detection:**
- Overlay components use `OnPush` where possible
- Minimal re-renders via careful input management

---

## Troubleshooting

### Overlay Not Visible

**Check z-index conflicts:**
The overlay host/backdrop z-index is derived from CSS variables:

- `--coar-z-overlay`
- `--coar-z-overlay-backdrop`

**Verify attachment strategy:**
```typescript
.attachment({ strategy: 'body' }) // Escapes stacking contexts
```

### Positioning Issues

**Prefer a specific placement first:**

```ts
b.position({
  placement: ['bottom-start', 'top-start', 'right-start', 'left-start'],
  offset: 4,
  flip: true,
  shift: true,
});
```

**Check container boundaries:**
```typescript
.attachment({ strategy: 'parent', container: parentEl })
// The parent container becomes the boundary.
.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
```

### Focus Not Working

**Enable focus trap for modals:**
```ts
b.focus({ trap: true, restore: true });
```

**Ensure focusable elements exist:**
Make sure your overlay content contains a focusable element (e.g. a button or an input), or add `tabindex="0"` to an element that should be focusable.

### Dismiss Not Working

**Verify dismiss configuration:**
```ts
b.dismiss({ escapeKey: true, outsideClick: true });
```

**Check for event.stopPropagation()** in your component templates.

---

## Migration from Floating System

If migrating from the old floating system:

**Old (Floating Helper):**
```typescript
private floatingHelper = new CoarFloatingHelper(
  floatingService,
  { estimatedHeight: 280, usePortal: true },
  () => this.close()
);

this.floatingHelper.open(trigger, 'bottom');
```

**New (Overlay System):**
```typescript
const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromComponent(MyComponent));
  b.anchor({ kind: 'element', element: trigger });
  b.position({ placement: 'bottom', offset: 4, flip: true, shift: true });
  b.dismiss({ outsideClick: true, escapeKey: true });
});

this.overlayRef = this.overlayService.open(spec, undefined);
```

**Key differences:**
- No more `usePortal` / `usesCssAnchor` flags (always portaled)
- Explicit `attachment` strategy instead
- Spec builder (`Overlay.define`) instead of constructor configuration
- `OverlayRef` instead of helper methods

---

## Changelog

### v2.0.0 (December 2025)

- ✨ Full overlay system implementation
- ✨ 12 placement options with `-start`/`-end` variants
- ✨ Attachment strategies (`body` vs `parent`)
- ✨ Container-aware attachment boundaries (`attachment: 'parent'`)
- ✨ Spec builder (`Overlay.define` / `Overlay.fork`)
- ✨ Presets for common use cases (tooltip, modal)
- ✨ Hover-tree dismiss for cascading menus
- ✨ Overlay DI context (`COAR_OVERLAY_REF`) for child overlays
- 🔥 Removed old floating system
- 🐛 Fixed select toggle race condition (anchor element handling)

---

## Future Enhancements

Potential features for future versions:

- [ ] Collision detection with other overlays
- [ ] Animation/transition hooks
- [ ] Resize observer for responsive positioning
- [ ] Virtual scrolling for large dropdown lists
- [ ] Accessibility improvements (ARIA live regions)
- [ ] Performance profiling tools

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

**When modifying the overlay system:**
- Follow NAMING.md conventions (`coar-` prefix, `Coar` class prefix)
- Add tests for new features
- Update this documentation
- Ensure builds pass for all consumers

---

## License

See [LICENSE](../../LICENSE) for details.

---

**Version:** 2.0.0
**Last Updated:** December 16, 2025
**Maintainer:** Cocoar Design System Team
