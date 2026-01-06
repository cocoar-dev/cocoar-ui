# @cocoar/ui-overlay

Overlay primitives for the Cocoar Design System.

This library provides an Angular-first overlay foundation (specs, builders, service, refs) that higher-level UI components (tooltips, popovers, menus, dialogs) can build on.

## Quick start

- Create a builder via `createOverlayBuilder()`
- Configure shared settings (anchor/position/dismiss/size/etc.)
- Choose content last via `.fromTemplate(...)` / `.fromComponent(...)` / `.fromText()` and open via `.open(...)`

## App-level policy (DI)

Consuming apps can provide `COAR_OVERLAY_SPEC_RESOLVERS` (multi provider) to apply global defaults/policies at open-time.
This is useful when plugins or shared libraries should inherit app behavior without importing app presets.

See the consuming guide: [docs/consuming/overlay.md](../../../docs/consuming/overlay.md)
