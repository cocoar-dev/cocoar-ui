# Consuming `@cocoar/ui-overlay`

This document describes how to use the overlay primitives in consuming Angular applications.

## What you get

- Immutable overlay configuration via `Overlay.define(...)` / `Overlay.fork(...)`
- Strongly typed runtime inputs via `overlayService.open(spec, inputs)`
- Presets for common patterns (`coarMenuPreset`, `coarModalPreset`, `coarTooltipPreset`)
- Optional environment-wide policy via DI (`COAR_OVERLAY_SPEC_RESOLVERS`)

## Basic usage

Define an overlay spec:

- Use `Overlay.define((b) => ...)` to create a frozen `OverlaySpec`.
- Provide `content` and optionally `anchor`, `position`, etc.

At runtime, open it with inputs:

- `overlayService.open(spec, inputs)` returns an `OverlayRef`.

## Presets

Presets are best when you own the call sites and want reusable configurations:

- `coarMenuPreset`: close-on-scroll menus, outside click + Escape enabled
- `coarModalPreset`: modal backdrop, focus trap, centered placement, viewport clamping
- `coarTooltipPreset`: non-dismissable, scroll noop, tooltip role

Example:

- Define: `Overlay.define((b) => { ... }, coarMenuPreset)`

## `resolveSpec` via DI (global policy)

Sometimes you want application-wide defaults without requiring every caller (or plugin) to import and apply your presets.

`@cocoar/ui-overlay` supports this via the multi-provider token `COAR_OVERLAY_SPEC_RESOLVERS`.
Resolvers are applied when an overlay is opened.

### Example: default menus to close-on-scroll

Provide a resolver:

- Register `COAR_OVERLAY_SPEC_RESOLVERS` in your app (or feature) providers.
- Only fill missing fields (do not override explicit caller config).

Conceptually:

- If `spec.a11y.role === 'menu'` and `spec.scroll` is missing → set `scroll.strategy = 'close'`.

This allows plugins to call `overlayService.open(...)` with a minimal spec and still inherit your app-level policy.

## Sticky overlays (stay visible while scrolling)

If you want an overlay to stay open and remain at the same viewport location while the page scrolls ("sticky" panel), use:

- `scroll.strategy: 'noop'`
- an anchor that is already in viewport coordinates:
	- `anchor.kind: 'point'` (fixed x/y)
	- or `anchor.kind: 'virtual'` (e.g. `placement: 'center'`)

Example (fixed point):

- Anchor at a point and disable scroll listeners so the overlay does not reposition or close.

If you start from an element anchor but want it to become sticky, the simplest approach is:

- compute the element's position once (when opening)
- open the overlay with a `point` anchor using that position

This way the overlay doesn't track the element while the user scrolls.

## Notes

- Runtime defaults are resolved at open-time by `CoarOverlayService`.
- If you explicitly set a field in the spec (e.g. `b.scroll({ strategy: 'noop' })`), DI resolvers should generally respect that.
- HTML strings are intentionally not supported as overlay content.
	- If you need rich/styled tooltip content, render a `component` or `template` overlay and handle any sanitization in that component.
