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
  b.position({ placement: 'bottom', offset: 4, flip: true, shift: true });
};
