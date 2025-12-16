# Overlay API

This is the public API surface of `@cocoar/ui-overlay`.

## Exports overview

| Area | What you use |
|---|---|
| Define specs | `Overlay`, `CoarOverlay`, `OverlayBuilder`, `ContentBuilder` |
| Open/close overlays | `CoarOverlayService` (also exported as `OverlayService`), `OverlayRef` |
| Spec model (types) | `OverlaySpec`, `ContentSpec`, `AnchorSpec`, `PositionSpec`, `SizeSpec`, `BackdropSpec`, `ScrollSpec`, `DismissSpec`, `FocusSpec`, `A11ySpec`, `AttachmentSpec`, `Placement` |
| Defaults & policies | `COAR_OVERLAY_DEFAULTS`, `COAR_OVERLAY_SPEC_RESOLVERS`, `OverlaySpecResolver`, `ResolvedOverlaySpec` |
| Presets | `coarTooltipPreset`, `coarModalPreset`, `coarMenuPreset` + aliases `tooltipPreset`, `modalPreset`, `menuPreset` |
| Positioning helpers | `computeOverlayCoordinates`, `getAnchorRect`, `getViewportRect`, `getContainerRect`, `getScrollParents`, and related geometry types |

## Core entry points

| Symbol | Kind | Notes |
|---|---|---|
| `CoarOverlayService` | service | Imperative service: opens overlays from an `OverlaySpec`. |
| `OverlayService` | alias | Alias of `CoarOverlayService` (spec-friendly naming). |
| `Overlay` | builder API | Alias of `CoarOverlay` for the ergonomic `Overlay.define(...)` naming. |
| `CoarOverlay` | builder API | Static helpers to define and fork immutable overlay specs. |
| `OverlayRef` | type | Handle returned by `open(...)` to close and update position; exposes `afterClosed$`. |

## Typical usage

```ts
import { CoarOverlayService, Overlay, coarMenuPreset } from '@cocoar/ui-overlay';

const spec = Overlay.define<{ x: number; y: number }>((b) => {
  b.content((c) => c.fromTemplate(menuTemplate));
  b.anchor({ kind: 'point', x: 120, y: 120 });
  b.position({ placement: 'bottom', offset: 4, flip: true, shift: true });
  b.dismiss({ outsideClick: true, escapeKey: true });
}, coarMenuPreset);

const ref = overlayService.open(spec, { x: 120, y: 120 });
ref.afterClosed$.subscribe(() => {
  // cleanup
});

ref.close();
```

## Service API

| API | Returns | Notes |
|---|---|---|
| `open(spec, inputs, options?)` | `OverlayRef` | Opens an overlay for a spec and runtime inputs. |
| `openChild(parent, spec, inputs)` | `OverlayRef` | Opens a child overlay (menus/submenus). |
| `closeAll()` | `void` | Closes all open overlays. |
| `OverlayOpenOptions` | type | Supports `{ parent?: OverlayRef }`. |

## Spec builder API

### `Overlay` / `CoarOverlay`

| API | Returns | Notes |
|---|---|---|
| `Overlay.define((b) => { ... }, ...presets)` | `OverlaySpec<TInputs>` | Builds a spec from scratch via an `OverlayBuilder` (optionally applying presets first). |
| `Overlay.fork(base, (b) => { ... })` | `OverlaySpec<TInputs>` | Creates a modified spec from a base spec without mutating it. |

### `OverlayBuilder`

| Builder call | Type | Notes |
|---|---|---|
| `content((c) => ...)` | `ContentSpec<TInputs>` | Set content (template/component/text). |
| `anchor(cfg)` | `AnchorSpec` | Element / point / virtual anchor. |
| `position(cfg)` | `PositionSpec` | Placement(s), offset, flip, shift. |
| `size(cfg)` | `SizeSpec` | Content/fixed sizing and clamp rules. |
| `backdrop(cfg)` | `BackdropSpec \| 'none' \| 'modal'` | Controls backdrop (including modal backdrop click behavior). |
| `scroll(cfg)` | `ScrollSpec` | `noop` / `reposition` / `close`. |
| `dismiss(cfg)` | `DismissSpec` | Escape key / outside click policies. |
| `focus(cfg)` | `FocusSpec` | Focus trap and restore policies. |
| `a11y(cfg)` | `A11ySpec` | Role, label, aria relationships. |
| `attachment(cfg)` | `AttachmentSpec` | Attach to body or to a parent container. |

### `ContentBuilder`

| Builder call | Returns | Notes |
|---|---|---|
| `fromTemplate(template)` | `ContentSpec<TCtx>` | Renders an Angular `TemplateRef` with the provided runtime inputs as context. |
| `fromComponent(component)` | `ContentSpec<Partial<C>>` | Renders an Angular component and sets inputs from the runtime inputs object. |
| `fromText()` | `ContentSpec<{ text: string }>` | Renders plain text; requires inputs `{ text: string }`. |

## Spec model (types)

These are the building blocks that make up an `OverlaySpec<TInputs>`.

| Type | Shape (summary) | Purpose |
|---|---|---|
| `OverlaySpec<TInputs>` | `{ content?, anchor?, position?, size?, backdrop?, scroll?, dismiss?, focus?, a11y?, attachment? }` | High-level spec describing what to render and how the overlay behaves. |
| `ResolvedOverlaySpec<TInputs>` | `OverlaySpec` with required defaults applied | The resolved spec the service uses internally after applying defaults/policies. |
| `ContentSpec<TInputs>` | `{ kind: 'component' \| 'template' \| 'text', ... }` | Content source, plus optional `defaults` merged with runtime inputs. |
| `AnchorSpec` | `{ kind: 'element' \| 'point' \| 'virtual', ... }` | Where the overlay is anchored (DOM element / pointer point / virtual position). |
| `PositionSpec` | `{ placement, offset?, flip?, shift? }` | Placement and collision behavior. |
| `Placement` | union of placement strings | `top`, `bottom-start`, `right-end`, `center`, etc. |
| `SizeSpec` | `{ mode, minWidth?, minHeight?, maxWidth?, maxHeight? }` | Sizing policy (content, clamped, fixed). |
| `BackdropSpec` | `{ kind: 'none' } \| { kind: 'modal', closeOnBackdropClick? }` | Backdrop policy. |
| `ScrollSpec` | `{ strategy: 'noop' \| 'reposition' \| 'close' }` | What to do on scroll. |
| `DismissSpec` | `{ outsideClick?, escapeKey? }` | Dismissal triggers. |
| `FocusSpec` | `{ trap?, restore? }` | Focus management. |
| `A11ySpec` | `{ role?, label?, labelledBy?, describedBy? }` | Accessibility metadata. |
| `AttachmentSpec` | `{ strategy: 'body' } \| { strategy: 'parent', container }` | DOM attachment + boundary source. |

## Defaults & global policies

| Export | Kind | Notes |
|---|---|---|
| `COAR_OVERLAY_DEFAULTS` | const | Default config for anchor/position/backdrop/scroll/dismiss/focus/a11y/attachment. |
| `OverlaySpecResolver` | type | `(spec) => spec` hook to apply global defaults/policies. |
| `COAR_OVERLAY_SPEC_RESOLVERS` | DI token | Multi-provider token; resolvers applied in registration order. |

### Registering spec resolvers (example)

```ts
import { COAR_OVERLAY_SPEC_RESOLVERS } from '@cocoar/ui-overlay';

export const appProviders = [
  {
    provide: COAR_OVERLAY_SPEC_RESOLVERS,
    multi: true,
    useValue: (spec) => {
      // Example: default menu overlays to close-on-scroll unless explicitly configured.
      if (spec.scroll) return spec;
      if (spec.a11y?.role !== 'menu') return spec;
      return { ...spec, scroll: { strategy: 'close' } };
    },
  },
];
```

## Presets

| Export | Type | Intended use |
|---|---|---|
| `OverlayPreset` | type | `(b: OverlayBuilder) => void` function that configures a builder. |
| `coarTooltipPreset` (alias: `tooltipPreset`) | preset | Tooltips and small hint overlays (no dismiss, no scroll). |
| `coarModalPreset` (alias: `modalPreset`) | preset | Modal-like overlays (center, backdrop, focus trap). |
| `coarMenuPreset` (alias: `menuPreset`) | preset | Menus/context menus (close-on-scroll, dismissable). |

## Positioning helpers

These utilities are exported and used internally by the overlay service. They can also be useful for testing or for custom positioning work.

| Export | Kind | Notes |
|---|---|---|
| `computeOverlayCoordinates(...)` | function | Computes placement and coordinates given anchor rect, overlay size, and collision options. |
| `getAnchorRect(anchor, viewport)` | function | Gets an anchor rect from an `AnchorSpec`. |
| `getViewportRect()` | function | Reads viewport dimensions. |
| `getContainerRect(container)` | function | Reads container boundaries. |
| `getScrollParents(element)` | function | Collects scroll parents used for reposition triggers. |
| `Rect`, `Point`, `ViewportRect` | types | Geometry model used by the positioning functions. |
| `OverlayCoordinates`, `OverlaySize` | types | Output/input model for coordinate computations. |
