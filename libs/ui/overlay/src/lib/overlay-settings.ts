import { type OverlaySettings } from './overlay-service';

export const coarTooltipPreset: OverlaySettings<unknown> = {
  backdrop: { kind: 'none' },
  scroll: { strategy: 'noop' },
  dismiss: { outsideClick: false, escapeKey: false },
  a11y: { role: 'tooltip' },
  position: {
    placement: ['top', 'bottom', 'left', 'right'],
    offset: 8,
    flip: true,
    shift: true,
  },
  attachment: { strategy: 'body' },
};

export const coarModalPreset: OverlaySettings<unknown> = {
  backdrop: { kind: 'modal', closeOnBackdropClick: true },
  anchor: { kind: 'virtual', placement: 'center' },
  focus: { trap: true, restore: true },
  size: { maxWidth: 'viewport', maxHeight: 'viewport' },
  position: { placement: 'center', offset: 0, flip: false, shift: true },
  a11y: { role: 'dialog' },
  attachment: { strategy: 'body' },
};

export const coarMenuPreset: OverlaySettings<unknown> = {
  backdrop: { kind: 'none' },
  scroll: { strategy: 'close' },
  dismiss: { outsideClick: true, escapeKey: true },
  focus: { trap: false, restore: true },
  a11y: { role: 'menu' },
  position: {
    placement: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    offset: 4,
    flip: true,
    shift: true,
  },
};

export const coarHoverMenuPreset: OverlaySettings<unknown> = {
  ...coarMenuPreset,
  dismiss: {
    outsideClick: true,
    escapeKey: true,
    hoverTree: { enabled: true, delayMs: 300 },
  },
};
