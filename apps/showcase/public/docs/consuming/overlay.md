# Consuming `@cocoar/ui-overlay`

This document describes how to use the overlay primitives in consuming Angular applications.

## What you get

- A single, content-last builder API via `createOverlayBuilder()`
- Strongly typed runtime inputs via `opener.open(inputs)`
- Reusable preset constants for common patterns (`coarMenuPreset`, `coarModalPreset`, `coarTooltipPreset`, `coarHoverMenuPreset`)
- Child overlays via `openAsChild(parent, inputs, { closeSiblings })`

## Basic usage

Build once, pick content last:

```ts
import { createOverlayBuilder, coarMenuPreset, type OverlayRef } from '@cocoar/ui-overlay';

// Create a baseline builder once (e.g. as a field in a component).
const overlay = createOverlayBuilder(coarMenuPreset);

// Later: choose content and open.
const ref: OverlayRef = overlay
	.anchor({ kind: 'point', x: 120, y: 120 })
	.position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
	.fromTemplate(menuTemplate)
	.open(undefined);

ref.afterClosed$.subscribe(() => {
	// cleanup
});

ref.close();
```

## Preset constants

Use `*.withPreset(...)` to apply reusable baseline behavior without overriding fields already set on your builder.

Example:

- `createOverlayBuilder(coarMenuPreset)`
- `createOverlayBuilder(coarHoverMenuPreset)` (menus with hoverTree)

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

- Overlays are resolved at open-time; updating settings/content while open is not supported.
- HTML strings are intentionally not supported as overlay content.
	- If you need rich/styled tooltip content, render a `component` or `template` overlay and handle any sanitization in that component.
