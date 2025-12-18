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
  - [Auto-Placement](#auto-placement)
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
✅ **Container Boundaries** — Clamp and fallback within parent containers, not just viewport
✅ **Auto-Placement** — Best-fit algorithm when space is constrained
✅ **Focus Management** — Trap, restore, and auto-focus with accessibility support
✅ **Dismiss Modes** — ESC key, outside clicks, backdrop clicks, programmatic
✅ **Z-Index Stacking** — Automatic layering for nested overlays
✅ **Multiple Content Types** — Component, template, or HTML string

---

## Core Concepts

### Overlay Spec

An `OverlaySpec` is a configuration object describing how an overlay should behave:

```typescript
interface OverlaySpec<TInputs = unknown> {
  anchor: AnchorSpec;           // What to anchor to
  content: ContentSpec<TInputs>; // What to render
  position?: PositionSpec;       // Where to place it
  attachment?: AttachmentSpec;   // How to attach it
  dismiss?: DismissSpec;         // How to close it
  focus?: FocusSpec;             // Focus management
  backdrop?: BackdropSpec;       // Backdrop dimming
  style?: StyleSpec;             // Custom styling
}
```

### Overlay Ref

An `OverlayRef` represents an open overlay instance. Use it to:

- Check if the overlay is open
- Close the overlay programmatically
- Access result/value from the overlay
- Create child overlays

```typescript
const ref = overlayService.open(spec);

// Later...
if (ref.isOpen) {
  ref.close();
}
```

### Builder API

The builder provides a fluent interface for constructing overlay specs:

```typescript
const ref = Overlay.builder()
  .anchorToElement(triggerElement)
  .component(MyComponent)
  .placement('bottom')
  .dismissOnOutsideClick()
  .build(overlayService);
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
    const ref = Overlay.builder()
      .anchorToElement(this.trigger().nativeElement)
      .component(MyPopupComponent)
      .placement('bottom')
      .dismissOnEscape()
      .dismissOnOutsideClick()
      .build(this.overlayService);
  }
}
```

---

## API Reference

### CoarOverlayService

The service manages overlay lifecycle and global event handling.

#### Methods

**`open<T>(spec: OverlaySpec<T>): OverlayRef`**

Opens a new overlay with the given specification.

```typescript
const ref = this.overlayService.open({
  anchor: { kind: 'element', element: triggerEl },
  content: { kind: 'component', component: MyComponent },
  position: { placement: 'bottom' }
});
```

**`getTopmostOverlayAtPoint(x: number, y: number): OverlayRef | null`**

Returns the topmost overlay at the given screen coordinates, or `null` if none.

---

### Overlay Builder

Fluent API for constructing overlay specs.

#### Anchoring

**`.anchorToElement(element: HTMLElement): this`**

Anchor the overlay to a specific element.

**`.anchorToPoint(x: number, y: number): this`**

Anchor the overlay to screen coordinates.

**`.anchorToViewport(): this`**

Anchor the overlay to the center of the viewport (for modals).

#### Content

**`.component<T>(component: Type<T>, inputs?: Partial<T>): this`**

Render an Angular component.

```typescript
.component(MyComponent, { title: 'Hello', count: 42 })
```

**`.template(template: TemplateRef<C>, context?: C): this`**

Render a template with optional context.

**`.html(html: string): this`**

Render raw HTML (sanitized by Angular).

#### Positioning

**`.placement(placement: Placement): this`**

Set preferred placement. Options:
- `'top'`, `'top-start'`, `'top-end'`
- `'bottom'`, `'bottom-start'`, `'bottom-end'`
- `'left'`, `'left-start'`, `'left-end'`
- `'right'`, `'right-start'`, `'right-end'`

**`.offset(offset: number): this`**

Set distance (in pixels) from anchor element.

**`.clampToViewport(clamp: boolean = true): this`**

Keep overlay within viewport boundaries.

**`.clampToContainer(clamp: boolean = true): this`**

Keep overlay within parent container boundaries.

**`.fallbackToBestFit(fallback: boolean = true): this`**

Try alternative placements if preferred placement doesn't fit.

#### Attachment

**`.attachment(spec: AttachmentSpec): this`**

Set attachment strategy:

```typescript
// Portal to document.body (default)
.attachment({ strategy: 'body' })

// Attach to parent container
.attachment({ strategy: 'parent', container: parentElement })
```

#### Dismissal

**`.dismissOnEscape(enabled: boolean = true): this`**

Close overlay when ESC key is pressed.

**`.dismissOnOutsideClick(enabled: boolean = true): this`**

Close overlay when clicking outside.

**`.dismissOnBackdropClick(enabled: boolean = true): this`**

Close overlay when clicking the modal backdrop (ultimately controlled by `BackdropSpec.closeOnBackdropClick`).

#### Focus

**`.autoFocus(selector?: string): this`**

Auto-focus an element when overlay opens.

```typescript
.autoFocus('input') // Focus first input
```

**`.trapFocus(enabled: boolean = true): this`**

Trap keyboard focus within overlay (for modals).

**`.restoreFocus(enabled: boolean = true): this`**

Restore focus to trigger element when overlay closes.

#### Backdrop

**`.backdrop(opacity?: number): this`**

Show a backdrop with optional opacity (0-1).

```typescript
.backdrop(0.5) // 50% opacity backdrop
```

#### Building

**`.build(service: CoarOverlayService): OverlayRef`**

Build and open the overlay.

**`.toSpec(): OverlaySpec`**

Build the spec without opening (useful for presets).

---

### Overlay Spec

Detailed breakdown of the specification object.

#### AnchorSpec

Defines what the overlay is anchored to.

```typescript
type AnchorSpec =
  | { kind: 'element'; element: HTMLElement }
  | { kind: 'point'; x: number; y: number }
  | { kind: 'viewport' };
```

**Element Anchor:**
```typescript
{ kind: 'element', element: document.getElementById('trigger') }
```

**Point Anchor:**
```typescript
{ kind: 'point', x: 150, y: 200 }
```

**Viewport Anchor** (centered):
```typescript
{ kind: 'viewport' }
```

#### ContentSpec

Defines what to render inside the overlay.

```typescript
type ContentSpec<TInputs = unknown> =
  | { kind: 'component'; component: Type<unknown>; inputs?: TInputs }
  | { kind: 'template'; template: TemplateRef<unknown>; context?: unknown }
  | { kind: 'html'; html: string };
```

#### PositionSpec

Controls positioning behavior.

```typescript
interface PositionSpec {
  placement?: Placement;            // Default: 'auto'
  offset?: number;                  // Default: 8
  clampToViewport?: boolean;        // Default: true
  clampToContainer?: boolean;       // Default: false
  fallbackToBestFit?: boolean;      // Default: false
}
```

**Placement Types:**
```typescript
type Placement =
  | 'auto'
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';
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
- Respects container boundaries (clamp/fallback)
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
    enabled?: boolean;           // Default: false
    delayMs?: number;            // Default: 300
  };
}
```

> Note: modal backdrop click behavior is configured on `BackdropSpec`.

#### FocusSpec

Controls focus management.

```typescript
interface FocusSpec {
  autoFocus?: boolean | string;   // Default: false (or CSS selector)
  trap?: boolean;                 // Default: false
  restore?: boolean;              // Default: true
}
```

#### BackdropSpec

Controls backdrop appearance.

```typescript
interface BackdropSpec {
  opacity?: number;               // Default: 0.5 (0-1 range)
}
```

#### StyleSpec

Custom styling for the overlay host.

```typescript
interface StyleSpec {
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  zIndex?: number;
}
```

---

### Overlay Ref

The `OverlayRef` represents an active overlay instance.

#### Properties

**`isOpen: boolean`** (readonly)

Whether the overlay is currently open.

**`result: T | undefined`** (readonly)

Result value after overlay closes (useful for dialogs).

#### Methods

**`close(result?: T): void`**

Close the overlay, optionally passing a result value.

```typescript
ref.close({ confirmed: true, value: 'User input' });
```

**`openChild<TChild>(spec: OverlaySpec<TChild>): OverlayRef`**

Open a child overlay (e.g., nested dropdown).

```typescript
const childRef = ref.openChild({
  anchor: { kind: 'element', element: subMenuTrigger },
  content: { kind: 'component', component: SubMenuComponent }
});
```

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
- Clamp/fallback respect **viewport** only

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
- Clamp/fallback respect **container** boundaries when `clampToContainer` is enabled

### Auto-Placement

When `placement: 'auto'`, the system uses a best-fit algorithm:

1. Calculate available space in all 4 directions (top/bottom/left/right)
2. Choose the direction with the most space
3. Apply center alignment by default

```typescript
.placement('auto')
.fallbackToBestFit(false) // Only use auto for initial placement
```

### Boundary Constraints

#### Clamp to Viewport

Shifts the overlay to stay within viewport boundaries:

```typescript
.clampToViewport(true) // Default: true
```

**Behavior:**
- Horizontal shift: Adjust `left` position to keep overlay visible
- Vertical shift: Adjust `top` position to keep overlay visible
- Preserves preferred placement direction

#### Clamp to Container

Shifts the overlay to stay within parent container:

```typescript
.clampToContainer(true)
.attachment({ strategy: 'parent', container: parentEl })
```

**Requirements:**
- Only works with `strategy: 'parent'`
- Container must have defined boundaries

#### Fallback to Best Fit

Tries alternative placements if preferred doesn't fit:

```typescript
.placement('top')
.fallbackToBestFit(true)
```

**Behavior:**
1. Try preferred placement (`top`)
2. If doesn't fit, try opposite (`bottom`)
3. If still doesn't fit, try perpendicular sides (`left`, `right`)
4. Choose placement with best fit

**Fallback order:**
- `top` → `bottom` → `left` → `right`
- `bottom` → `top` → `left` → `right`
- `left` → `right` → `top` → `bottom`
- `right` → `left` → `top` → `bottom`

---

## Focus Management

### Auto Focus

Automatically focus an element when overlay opens:

```typescript
// Focus first focusable element
.autoFocus(true)

// Focus specific element
.autoFocus('input[name="username"]')

// No auto-focus
.autoFocus(false)
```

### Focus Trap

Trap keyboard navigation within the overlay:

```typescript
.trapFocus(true) // For modals
```

**Behavior:**
- TAB cycles through focusable elements
- SHIFT+TAB cycles backward
- Focus wraps from last to first element

### Focus Restore

Restore focus to trigger element when overlay closes:

```typescript
.restoreFocus(true) // Default: true
```

---

## Dismiss Behavior

### ESC Key

Close overlay when ESC is pressed:

```typescript
.dismissOnEscape(true) // Default: true for most presets
```

### Outside Click

Close overlay when clicking outside:

```typescript
.dismissOnOutsideClick(true)
```

**Special handling:**
- Clicks on the anchor element are treated as "inside"
- Prevents toggle race condition (click to close → immediately reopens)

### Hover Tree (menus / flyouts)

Enable "hover to keep open, leave to close" behavior across a parent-child overlay chain:

```ts
import { Overlay, coarHoverMenuPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<void>((b) => {
  b.content((c) => c.fromTemplate(menuTemplate));
  b.anchor({ kind: 'element', element: triggerEl });
  b.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
}, coarHoverMenuPreset);
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
.backdrop(0.5)
.dismissOnBackdropClick(true)
```

### Programmatic

Close overlay from code:

```typescript
const ref = overlayService.open(spec);

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
import { tooltipPreset } from '@cocoar/ui-overlay';

const spec = tooltipPreset({
  anchor: { kind: 'element', element: triggerEl },
  content: { kind: 'html', html: 'Tooltip text' },
  position: { placement: 'top' }
});
```

**Configuration:**
- No backdrop
- Dismiss on ESC
- No focus trap
- Body attachment
- Clamp to viewport

### Modal Preset

Full-screen modal dialogs:

```typescript
import { modalPreset } from '@cocoar/ui-overlay';

const spec = modalPreset({
  anchor: { kind: 'viewport' },
  content: { kind: 'component', component: DialogComponent },
  backdrop: { opacity: 0.6 }
});
```

**Configuration:**
- Backdrop with 60% opacity
- Dismiss on ESC and backdrop click
- Focus trap enabled
- Focus restore enabled
- Body attachment
- Viewport anchor (centered)

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
export function dropdownPreset(
  partial: Partial<OverlaySpec>
): OverlaySpec {
  return {
    anchor: partial.anchor!,
    content: partial.content!,
    position: {
      placement: 'bottom-start',
      offset: 4,
      clampToViewport: true,
      fallbackToBestFit: true,
      ...partial.position
    },
    dismiss: {
      escapeKey: true,
      outsideClick: true,
      ...partial.dismiss
    },
    focus: {
      autoFocus: true,
      restore: true,
      ...partial.focus
    },
    attachment: { strategy: 'body', ...partial.attachment },
    backdrop: partial.backdrop,
    style: partial.style
  };
}
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

### Overlay Context (`COAR_OVERLAY_REF`)

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

### Angular Content Projection Caveat

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

const ref = Overlay.builder()
  .component(MyComponent, {
    title: 'Initial Title',
    count: 0
  })
  .build(overlayService);
```

**Note:** Inputs are set once at creation. For reactive updates, use a shared service or signal.

### Result Values

Get result data when overlay closes:

```typescript
const ref = overlayService.open({
  // ... spec
});

// In the overlay component:
class DialogComponent {
  private overlayRef = inject(OverlayRef);

  confirm() {
    this.overlayRef.close({ confirmed: true, value: this.form.value });
  }
}

// Back in the caller:
console.log(ref.result); // { confirmed: true, value: {...} }
```

### Container-Based Boundaries

Constrain overlay to a scrollable container:

```typescript
const container = document.getElementById('scrollable-container')!;

Overlay.builder()
  .anchorToElement(trigger)
  .component(DropdownComponent)
  .placement('bottom')
  .attachment({ strategy: 'parent', container })
  .clampToContainer(true)
  .fallbackToBestFit(true)
  .build(overlayService);
```

**Use case:** Dropdown in a dashboard widget with `overflow: auto`

### Custom Z-Index

Override default z-index stacking:

```typescript
.style({ zIndex: 9999 })
```

**Default z-index:**
- Base overlay: `1000 + stackIndex * 10`
- Backdrop: `zIndex - 1`

---

## Examples

### Tooltip

```typescript
import { Overlay } from '@cocoar/ui-overlay';

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
    if (this.overlayRef?.isOpen) return;

    this.overlayRef = Overlay.builder()
      .anchorToElement(this.trigger().nativeElement)
      .html('This is a tooltip')
      .placement('top')
      .offset(8)
      .dismissOnEscape()
      .build(this.overlayService);
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
    if (this.overlayRef?.isOpen) {
      this.overlayRef.close();
    } else {
      this.overlayRef = Overlay.builder()
        .anchorToElement(this.trigger().nativeElement)
        .component(MenuComponent)
        .placement('bottom-start')
        .offset(4)
        .dismissOnEscape()
        .dismissOnOutsideClick()
        .fallbackToBestFit(true)
        .build(this.overlayService);
    }
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
    const ref = Overlay.builder()
      .anchorToViewport()
      .component(ConfirmDialogComponent, {
        title: 'Confirm Action',
        message: 'Are you sure?'
      })
      .backdrop(0.6)
      .dismissOnEscape()
      .dismissOnBackdropClick()
      .trapFocus()
      .restoreFocus()
      .autoFocus('[data-primary]')
      .build(this.overlayService);

    // Wait for result (if needed)
    if (ref.result?.confirmed) {
      console.log('User confirmed');
    }
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

    Overlay.builder()
      .anchorToPoint(event.clientX, event.clientY)
      .component(ContextMenuComponent)
      .placement('bottom-start')
      .dismissOnEscape()
      .dismissOnOutsideClick()
      .fallbackToBestFit(true)
      .build(this.overlayService);
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
    if (this.overlayRef?.isOpen) {
      this.overlayRef.close();
    } else {
      this.overlayRef = Overlay.builder()
        .anchorToElement(this.trigger().nativeElement)
        .component(OptionsComponent)
        .placement('bottom')
        .attachment({
          strategy: 'parent',
          container: this.container().nativeElement
        })
        .clampToContainer(true)
        .fallbackToBestFit(true)
        .dismissOnEscape()
        .dismissOnOutsideClick()
        .build(this.overlayService);
    }
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

1. **Measure anchor element** (or use point/viewport)
2. **Calculate overlay dimensions** (estimate or measure after render)
3. **Apply placement** (top/bottom/left/right with alignment)
4. **Apply offset** (distance from anchor)
5. **Check boundaries** (viewport or container)
6. **Shift if needed** (horizontal/vertical adjustment)
7. **Fallback if enabled** (try alternative placements)
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
```typescript
.style({ zIndex: 9999 })
```

**Verify attachment strategy:**
```typescript
.attachment({ strategy: 'body' }) // Escapes stacking contexts
```

### Positioning Issues

**Enable clamping:**
```typescript
.clampToViewport(true)
.fallbackToBestFit(true)
```

**Check container boundaries:**
```typescript
.attachment({ strategy: 'parent', container: parentEl })
.clampToContainer(true)
```

### Focus Not Working

**Enable focus trap for modals:**
```typescript
.trapFocus(true)
.autoFocus(true)
```

**Ensure focusable elements exist:**
```typescript
.autoFocus('button, input, [tabindex="0"]')
```

### Dismiss Not Working

**Verify dismiss configuration:**
```typescript
.dismissOnEscape(true)
.dismissOnOutsideClick(true)
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
this.overlayRef = Overlay.builder()
  .anchorToElement(trigger)
  .component(MyComponent)
  .placement('bottom')
  .dismissOnEscape()
  .dismissOnOutsideClick()
  .build(this.overlayService);
```

**Key differences:**
- No more `usePortal` / `usesCssAnchor` flags (always portaled)
- Explicit `attachment` strategy instead
- Builder API instead of constructor configuration
- `OverlayRef` instead of helper methods

---

## Changelog

### v2.0.0 (December 2025)

- ✨ Full overlay system implementation
- ✨ 12 placement options with `-start`/`-end` variants
- ✨ Attachment strategies (`body` vs `parent`)
- ✨ Container-based boundaries for clamp/fallback
- ✨ Builder API for fluent configuration
- ✨ Presets for common use cases (tooltip, modal)
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
