# Cocoar Overlay System

The Cocoar Overlay System provides framework-pure primitives for floating UI like menus, tooltips, popovers, and dialogs.

This repository supports one public way to configure and open overlays: `createOverlayBuilder()`.

---

## The Only Supported API

Configure settings once using the builder, then choose content last.

```ts
import {
  createOverlayBuilder,
  coarMenuPreset,
  type OverlayRef,
} from '@cocoar/ui/overlay';

const overlay = createOverlayBuilder(coarMenuPreset);

function openContextMenu(event: MouseEvent, template: TemplateRef<unknown>): OverlayRef {
  event.preventDefault();

  return overlay
    .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
    .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
    .fromTemplate(template)
    .open(undefined);
}
```

---

## Content

Use one of these content factories:

- `fromTemplate(templateRef)`
- `fromComponent(componentType)`
- `fromText()`

Each factory returns an opener with:

- `open(inputs)`
- `openAsChild(parentRef, inputs, { closeSiblings })`

---

## Child Overlays

Child overlays participate in the same overlay stack and can optionally close sibling overlays.

```ts
const parent = overlay
  .anchor({ kind: 'element', element: button })
  .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true })
  .fromTemplate(parentTemplate)
  .open(undefined);

overlay
  .fromTemplate(childTemplate)
  .openAsChild(parent, undefined, { closeSiblings: true });
```

---

## Reusable Defaults

The package exports reusable preset constants:

- `coarTooltipPreset`
- `coarModalPreset`
- `coarMenuPreset`
- `coarHoverMenuPreset`

Use `builder.withPreset(...)` to apply them as a baseline, then override specifics per usage.

---

## OverlayRef

`open(...)` returns an `OverlayRef`.

Common members:

- `close()`
- `updatePosition()`
- `afterClosed$`

---

## Overlay Context

`COAR_OVERLAY_REF` is an injection token that resolves to the current `OverlayRef` inside overlay content.

---

## API Reference

- Public API surface: [api.md](./api.md)
