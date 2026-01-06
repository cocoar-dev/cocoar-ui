# Overlay System - Progress Tracker

This document tracks implementation progress for the Cocoar Overlay System.

## Scope

The overlay system is a reusable primitive intended to support:

- tooltips
- popovers
- menus / submenus
- dialogs
- context menus

## Status Summary

- Library exists and is wired into Nx (build/test/lint).
- Public API is builder-only via `createOverlayBuilder()`.
- Reusable defaults are exported as `coar*Preset` constants.
- Positioning supports anchor + placement + flip + shift, with scroll/resize repositioning.
- Outside-click + Escape handling is implemented (respects overlay stack).
- Scroll strategy supports close-on-scroll for menu/context-menu style overlays.
- Focus trapping is implemented for modal-like overlays.
- Layering uses design tokens (`--coar-z-overlay`, `--coar-z-overlay-backdrop`).

## Implemented

### Library + tooling

`@cocoar/ui-overlay` publishable library scaffolded with ng-packagr, vitest, and eslint.

Key files:

- [libs/ui-overlay/project.json](../libs/ui-overlay/project.json)
- [libs/ui-overlay/ng-package.json](../libs/ui-overlay/ng-package.json)

### Public API (builder-only)

- Settings-first builder: `createOverlayBuilder()`
- Content factories: `fromTemplate`, `fromComponent`, `fromText`
- Open methods: `open(inputs)` and `openAsChild(parent, inputs, { closeSiblings })`
- Reusable defaults: `coarTooltipPreset`, `coarModalPreset`, `coarMenuPreset`, `coarHoverMenuPreset`

Key files:

- [libs/ui-overlay/src/lib/overlay/create-overlay-builder.ts](../libs/ui-overlay/src/lib/overlay/create-overlay-builder.ts)
- [libs/ui-overlay/src/lib/overlay/overlay-settings.ts](../libs/ui-overlay/src/lib/overlay/overlay-settings.ts)
- [libs/ui-overlay/src/lib/overlay/index.ts](../libs/ui-overlay/src/lib/overlay/index.ts)

### Overlay runtime

- Runtime engine opens template/component/text content and returns `OverlayRef`.
- Supports child overlays with sibling-close behavior.

Key files:

- [libs/ui-overlay/src/lib/overlay/overlay-service.ts](../libs/ui-overlay/src/lib/overlay/overlay-service.ts)
- [libs/ui-overlay/src/lib/overlay/overlay-ref.ts](../libs/ui-overlay/src/lib/overlay/overlay-ref.ts)

### Positioning

- Anchors: `element`, `point`, `virtual`
- Placement/offset + collision behavior (`flip`, `shift`)
- Reposition triggers: scroll, resize, overlay element resize

Key files:

- [libs/ui-overlay/src/lib/overlay/overlay-position.ts](../libs/ui-overlay/src/lib/overlay/overlay-position.ts)

## Notes

- Generated outputs under `dist/` and `.nx/cache/` may contain stale documentation and are not the source of truth.
