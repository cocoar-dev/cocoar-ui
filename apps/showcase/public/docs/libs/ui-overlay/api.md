# Overlay API

This is the public API surface of `@cocoar/ui/overlay`.

## Exports overview

| Area | What you use |
|---|---|
| Create/open overlays | `createOverlayBuilder`, `OverlayRef` |
| Reusable defaults | `coarTooltipPreset`, `coarModalPreset`, `coarMenuPreset`, `coarHoverMenuPreset` |
| Spec model (types) | `AnchorSpec`, `PositionSpec`, `SizeSpec`, `BackdropSpec`, `ScrollSpec`, `DismissSpec`, `FocusSpec`, `A11ySpec`, `AttachmentSpec`, `Placement` |
| Overlay context | `COAR_OVERLAY_REF` |

## Core entry points

| Symbol | Kind | Notes |
|---|---|---|
| `createOverlayBuilder` | function | Creates a content-last builder (configure settings once, choose content last). |
| `OverlayRef` | type | Handle returned by `open(...)` to close and update position; exposes `afterClosed$`. |

## Typical usage

```ts
import { createOverlayBuilder, coarMenuPreset } from '@cocoar/ui/overlay';

const overlay = createOverlayBuilder(coarMenuPreset);

const ref = overlay
  .anchor({ kind: 'point', x: 120, y: 120 })
  .position({ placement: 'bottom', offset: 4, flip: true, shift: true })
  .dismiss({ outsideClick: true, escapeKey: true })
  .fromTemplate(menuTemplate)
  .open(undefined);

ref.afterClosed$.subscribe(() => {
  // cleanup
});

ref.close();
```

## Overlay context

### `COAR_OVERLAY_REF`

Injection token that resolves to the current `OverlayRef` inside overlay content.

```ts
import { inject } from '@angular/core';
import { COAR_OVERLAY_REF } from '@cocoar/ui/overlay';

const overlayRef = inject(COAR_OVERLAY_REF, { optional: true });
```

This is useful for opening true child overlays without manually passing the parent ref around.

## Spec builder API

### `createOverlayBuilder`

`createOverlayBuilder()` returns a chainable builder for shared overlay settings.

- Configure settings: `anchor`, `position`, `size`, `backdrop`, `scroll`, `dismiss`, `focus`, `a11y`, `attachment`, `defaults`.
- Choose content last: `.fromTemplate(...)`, `.fromComponent(...)`, `.fromText()`.
- Open: `.open(inputs)` and `.openAsChild(parent, inputs, { closeSiblings })`.

## Spec model (types)

These are the building blocks that make up an `OverlaySpec<TInputs>`.

| Type | Shape (summary) | Purpose |
|---|---|---|
| *(internal)* | — | The overlay implementation uses a spec internally; public usage does not require creating `OverlaySpec` objects. |
| `AnchorSpec` | `{ kind: 'element' \| 'point' \| 'virtual', ... }` | Where the overlay is anchored (DOM element / pointer point / virtual position). |
| `PositionSpec` | `{ placement, offset?, flip?, shift? }` | Placement and collision behavior. |
| `Placement` | union of placement strings | `top`, `bottom-start`, `right-end`, `center`, etc. |
| `SizeSpec` | `{ overflow?, width?, height?, minWidth?, minHeight?, maxWidth?, maxHeight? }` | CSS-like sizing constraints (numbers in px, `'anchor'/'viewport'`, or CSS lengths). |
| `BackdropSpec` | `{ kind: 'none' } \| { kind: 'modal', closeOnBackdropClick? }` | Backdrop policy. |
| `ScrollSpec` | `{ strategy: 'noop' \| 'reposition' \| 'close' }` | What to do on scroll. |
| `DismissSpec` | `{ outsideClick?, escapeKey?, hoverTree? }` | Dismissal triggers. |
| `FocusSpec` | `{ trap?, restore? }` | Focus management. |
| `A11ySpec` | `{ role?, label?, labelledBy?, describedBy? }` | Accessibility metadata. |
| `AttachmentSpec` | `{ strategy: 'body' } \| { strategy: 'parent', container }` | DOM attachment + boundary source. |

## DismissSpec

Dismiss policies for the overlay.

```ts
export interface DismissSpec {
  outsideClick?: boolean;
  escapeKey?: boolean;

  hoverTree?: {
    enabled?: boolean;
    delayMs?: number;
  };
}
```

Defaults:
- `outsideClick`: `true`
- `escapeKey`: `true`
- `hoverTree.enabled`: `false`
- `hoverTree.delayMs`: `300`

Notes:
- Backdrop click behavior is configured via `BackdropSpec` (`closeOnBackdropClick`).

## Defaults & global policies

| Export | Kind | Notes |
|---|---|---|
| `COAR_OVERLAY_DEFAULTS` | const | Default config for anchor/position/backdrop/scroll/dismiss/focus/a11y/attachment. |
| `OverlaySpecResolver` | type | `(spec) => spec` hook to apply global defaults/policies. |
| `COAR_OVERLAY_SPEC_RESOLVERS` | DI token | Multi-provider token; resolvers applied in registration order. |

### Registering spec resolvers (example)

## Internal APIs

The overlay implementation has additional internal helpers (policy hooks, positioning helpers, etc.), but the supported public API is limited to:

- `createOverlayBuilder()` for creating/opening overlays
- `coar*Preset` constants for reusable defaults
- `OverlayRef` for lifecycle and close handling
- Spec model types (`AnchorSpec`, `PositionSpec`, etc.)
