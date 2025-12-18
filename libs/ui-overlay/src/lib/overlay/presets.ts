import { type OverlayBuilder } from './overlay-builder';

export type OverlayPreset = (b: OverlayBuilder) => void;

export const coarTooltipPreset: OverlayPreset = (b) => {
  b.backdrop('none');
  b.scroll({ strategy: 'noop' });
  b.dismiss({ outsideClick: false, escapeKey: false });
  b.a11y({ role: 'tooltip' });
  b.position({
    placement: ['top', 'bottom', 'left', 'right'],
    offset: 8,
    flip: true,
    shift: true,
  });
  b.attachment({ strategy: 'body' });
};

export const coarModalPreset: OverlayPreset = (b) => {
  b.backdrop('modal');
  b.anchor({ kind: 'virtual', placement: 'center' });
  b.focus({ trap: true, restore: true });
  b.size({ mode: 'content-clamped', maxWidth: 'viewport', maxHeight: 'viewport' });
  b.position({ placement: 'center', offset: 0, flip: false, shift: true });
  b.a11y({ role: 'dialog' });
  b.attachment({ strategy: 'body' });
};

export const coarMenuPreset: OverlayPreset = (b) => {
  b.backdrop('none');
  b.scroll({ strategy: 'close' });
  b.dismiss({ outsideClick: true, escapeKey: true });
  b.focus({ trap: false, restore: true });
  b.a11y({ role: 'menu' });
  // Provide fallback placements so the overlay can choose a side that fits.
  // Start/end variants help when the anchor is near the viewport edges.
  b.position({
    placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    offset: 4,
    flip: true,
    shift: true,
  });
};

/**
 * Menu preset for hover-driven menus (context menus, cascading flyouts).
 *
 * Enables hoverTree dismissal so a parent overlay stays open while the pointer
 * is inside any child overlay opened via openChild().
 */
export const coarHoverMenuPreset: OverlayPreset = (b) => {
  coarMenuPreset(b);
  b.dismiss({
    outsideClick: true,
    escapeKey: true,
    hoverTree: { enabled: true, delayMs: 300 },
  });
};
