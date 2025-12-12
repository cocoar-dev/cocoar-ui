# Overlay System – Progress Tracker

This document tracks implementation progress for the Overlay System specified in:
- [src/.local/overlay-system.md](../src/.local/overlay-system.md)

## Scope

The overlay system is a reusable primitive intended to support:
- tooltips
- popovers
- menus / submenus
- dialogs
- context menus

## Status Summary

- Library exists and is wired into Nx (build/test/lint).
- Core API shape (spec/builder/presets/service/ref) exists.
- v1 positioning is implemented (anchor + placement/flip/shift) with scroll/resize repositioning.
- Outside-click + Escape handling is implemented (closes topmost overlay, respects overlay stack).
- Scroll strategy supports `close` (close-on-scroll), used for menu/context-menu style overlays.
- Focus trapping is implemented for modal-like overlays (`focus.trap: true`).
- Basic size clamping is implemented (maxWidth/maxHeight + overflow scrolling).
- Layering uses design tokens (`--coar-z-overlay`, `--coar-z-overlay-backdrop`) instead of hardcoded z-index.
- Legacy overlay manager implementation in `@cocoar/ui-components` (`CoarOverlayManager`) has been removed.
- The showcase "Overlay" page now demonstrates `@cocoar/ui-overlay`.
- Showcase runtime smoke-check:
  - Connected overlay opens and closes.
  - Context menu opens at pointer coordinates and receives typed inputs.
  - Centered modal opens with backdrop and closes on backdrop click.

## Implemented

### Library + tooling

- `@cocoar/ui-overlay` publishable library scaffolded with:
  - ng-packagr build target
  - vitest test target
  - eslint config
  - tsconfigs aligned with other libs

Key files:
- [src/libs/ui-overlay/project.json](../src/libs/ui-overlay/project.json)
- [src/libs/ui-overlay/ng-package.json](../src/libs/ui-overlay/ng-package.json)

### Overlay configuration + immutability

- `OverlaySpec<TInputs>` exists and models the spec sections:
  - `content`, `anchor`, `position`, `size`, `backdrop`, `scroll`, `focus`, `a11y`
- Builder API exists:
  - `Overlay.define(...)`
  - `Overlay.fork(base, ...)`
  - `OverlayBuilder` supports `anchor`, `position`, `size`, `scroll`, `focus`, `a11y`, `backdrop`, `content`
- Specs are frozen for plain-object/array parts (to avoid freezing Angular internal objects).
- Runtime defaults are applied at open-time by the service (not baked into specs), enabling DI-based environment overrides.

Key files:
- [src/libs/ui-overlay/src/lib/overlay/overlay-spec.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-spec.ts)
- [src/libs/ui-overlay/src/lib/overlay/overlay-builder.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-builder.ts)
- [src/libs/ui-overlay/src/lib/overlay/overlay.ts](../src/libs/ui-overlay/src/lib/overlay/overlay.ts)
- [src/libs/ui-overlay/src/lib/overlay/deep-freeze.ts](../src/libs/ui-overlay/src/lib/overlay/deep-freeze.ts)

### Typed content

- `ContentSpec<TInputs>` + `ContentBuilder` exist:
  - component content (`fromComponent`)
  - template content (`fromTemplate`)
  - text content (`fromText`) with runtime inputs `{ text: string }`
  - html content is intentionally not supported (use `fromComponent` / `fromTemplate`)
- Runtime inputs are merged over defaults at open time.

Key files:
- [src/libs/ui-overlay/src/lib/overlay/content-builder.ts](../src/libs/ui-overlay/src/lib/overlay/content-builder.ts)

### OverlayService + OverlayRef

- `CoarOverlayService.open(spec, inputs)`:
  - validates `content` exists at open-time (throws descriptive error otherwise)
  - attaches overlay host element to `document.body`
  - renders content (text/template/component)
  - returns `OverlayRef` with `close()`, `updatePosition()`, `afterClosed$`
- `closeAll()` closes all open overlays created via the service.

Key files:
- [src/libs/ui-overlay/src/lib/overlay/overlay-service.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-service.ts)
- [src/libs/ui-overlay/src/lib/overlay/overlay-ref.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-ref.ts)

### Positioning (JavaScript-first)

- Implemented anchor resolution:
  - `element` (DOMRect via `getBoundingClientRect()`)
  - `point` (x/y)
  - `virtual` (center/top/bottom of viewport)
- Implemented placement selection + offset:
  - supports `placement: Placement | Placement[]`
  - supports `placement: 'center'` for true centered overlays
  - flip: chooses first candidate that fully fits in viewport
  - best-fit fallback when none fully fit
  - shift: clamps coordinates into viewport bounds
- `updatePosition()` runs in `requestAnimationFrame` and applies `translate3d(x,y,0)`.
- Reposition triggers:
  - scroll (scroll parents for element anchors + window)
  - window resize
  - `ResizeObserver` on overlay host

Key files:
- [src/libs/ui-overlay/src/lib/overlay/overlay-position.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-position.ts)

### Backdrop (minimal)

- `backdrop.kind: 'modal'` creates a backdrop element behind the overlay.
- Optional close on backdrop click (`closeOnBackdropClick`, default true).

Backdrop uses a visible scrim (token-based).

Layering uses z-index tokens from `@cocoar/ui-tokens` and applies small runtime offsets per open overlay.

### Focus

- Focus restore is implemented:
  - captures `document.activeElement` at open
  - focuses it again on close (best-effort)
  - uses `preventScroll` (when supported) to avoid scroll-jumps

- Focus trap is implemented:
  - `focus.trap: true` keeps Tab/Shift+Tab inside the topmost trapping overlay

### Outside click + Escape (stack-aware)

- Global Escape closes the topmost overlay (configurable).
- Outside click closes the topmost overlay (configurable).
- Clicking inside any overlay does not close parent overlays.

### Presets

- Preset functions exist:
  - `coarTooltipPreset`
  - `coarModalPreset`
  - `coarMenuPreset`

Notes:
- `coarModalPreset` now uses `placement: 'center'` for true dialog centering.

Key file:
- [src/libs/ui-overlay/src/lib/overlay/presets.ts](../src/libs/ui-overlay/src/lib/overlay/presets.ts)

### Tests

- Unit tests for:
  - builder immutability + defaults
  - service open/close for text/template/component
  - positioning selection and anchor resolution

Key files:
- [src/libs/ui-overlay/src/lib/overlay/overlay.spec.ts](../src/libs/ui-overlay/src/lib/overlay/overlay.spec.ts)
- [src/libs/ui-overlay/src/lib/overlay/overlay-service.spec.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-service.spec.ts)
- [src/libs/ui-overlay/src/lib/overlay/overlay-position.spec.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-position.spec.ts)

## Missing (planned / future)

- Advanced autosize pipeline: explicit "measure → clamp → position" flow if we later need more complex sizing rules.
- Advanced menu a11y patterns (optional): roving tabindex / arrow-key navigation / `aria-activedescendant` patterns (content-level responsibility).
- Broader layering ladder (optional): define additional `--coar-z-*` tokens for headers/drawers/toasts when those primitives exist.

## Recommended Implementation Order

This is the suggested order to implement the remaining spec work so each step unlocks real component use-cases.

1) Overlay stack + interaction rules (foundation)
- Track open overlays and their ordering (topmost).
- Implement Escape handling (close topmost when allowed).
- Implement outside-click handling that respects nested overlays (child overlays must not close parents).

2) Modal focus management
- Implement focus trap for modal-like overlays (`focus.trap: true`).
- Keep focus restore (already present) and ensure it does not scroll the page.

3) Scroll behavior (menus & context menus)
- Tighten scroll strategy semantics for all anchor types.
- Add close-on-scroll for menu/context-menu style overlays (either as a new strategy or a preset-level behavior).
- Ensure `scroll.strategy: 'noop'` truly attaches no listeners.

Status:
- Implemented `scroll.strategy: 'close'` (close on any scroll container via document capture, plus window/parent fallbacks).
- `scroll.strategy: 'noop'` now attaches no scroll/resize/ResizeObserver listeners.

4) Size + autosize + clamping (polish + correctness)
- Implement `SizeSpec` modes (`content`, `content-clamped`, `fixed`).
- Implement hidden-measurement flow + viewport constraints.

Status:
- Implemented host sizing styles for `content-clamped` and `fixed` (max constraints / width/height + `overflow: auto`).
- Implemented initial render flow to avoid top-left flash (host stays visually hidden until first position is applied).
- Remaining: smarter viewport constraints and a more explicit "measure → clamp → position" pipeline if we later add complex sizing rules.

5) A11y wiring
- Apply `a11y.role` + relevant attributes to the overlay host.
- Document the split between overlay-host responsibilities and content responsibilities.

Status:
- Implemented host `role` + `aria-label` / `aria-labelledby` / `aria-describedby` wiring.
- Implemented `aria-modal="true"` for modal dialogs (`role: 'dialog'` + modal backdrop).

6) API polish / environment resolution

Status:
- Implemented: DI-based spec resolution via `COAR_OVERLAY_SPEC_RESOLVERS` (applied at open-time).
- Implemented: runtime defaults are applied at open-time (specs remain minimal/immutable), enabling environment policy without mutating specs.

### Autosize & SizeSpec behavior

Spec sections: 10.x
- Implement offscreen/hidden measurement flow (pragmatic v1: host stays visually hidden until first position is applied)
- Implement `SizeSpec`:
  - `content`
  - `content-clamped` (+ viewport constraints)
  - `fixed`
- Implement viewport clamping when `maxWidth/maxHeight` is `'viewport'` (v1 applies max constraints using viewport size)
- Ensure DOM read/write batching (avoid layout thrash)

### Focus trapping (modal)

Spec section: 15.5
- Implemented: `focus.trap: true` (Tab/Shift+Tab loop for the topmost trapping overlay)

### Scroll strategy: noop

Status:
- Implemented: `scroll.strategy: 'noop'` attaches no reposition listeners.

### Outside click + Escape + overlay stack (v1 implemented)

Spec sections: 15.4
- Implemented: stack-aware outside click + Escape (closes topmost; clicks inside any overlay do not close others).
- Implemented: parent/child overlay relationships for submenus.
  - Closing a parent closes its children.
  - Interacting with a parent closes its child overlays (submenu-style).
  - Outside-click closes the entire overlay tree (when a tree exists).

### A11y wiring

Status:
- Implemented: host `role`, `aria-label`, `aria-labelledby`, `aria-describedby`.
- Implemented: `aria-modal="true"` when `role: 'dialog'` + modal backdrop.

Notes:
- Keyboard navigation for menus is still content-level (not the overlay host).

### HTML content

Status:
- Not supported (by design): the overlay host does not render arbitrary HTML strings.

Guidance:
- If you need rich text or styled tooltip content, render a `component` or `template` overlay.
- If a consuming app needs HTML, the app-owned component can accept `SafeHtml` / sanitize with Angular APIs.

### Layering / z-index

Status:
- Implemented: z-index is token-based (`--coar-z-overlay`, `--coar-z-overlay-backdrop`) with small runtime offsets per open overlay.

Key files:
- [src/libs/ui-tokens/src/css/layers.css](../src/libs/ui-tokens/src/css/layers.css)
- [src/libs/ui-overlay/src/lib/overlay/overlay-service.ts](../src/libs/ui-overlay/src/lib/overlay/overlay-service.ts)

## Open Questions

- Should overlay host/backdrop styling remain inline in `@cocoar/ui-overlay`, or move to a small exported CSS file (still token-driven)?
- Do we want to expand `--coar-z-*` beyond overlays (header/drawer/toast), or keep the ladder minimal until those primitives exist?
- Should any remaining floating behavior live in `@cocoar/ui-overlay`, or be component-internal (e.g. simple dropdowns that never leave their stacking context)?
