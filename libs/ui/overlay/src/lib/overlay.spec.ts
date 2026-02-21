import { describe, expect, it } from 'vitest';

import {
  coarHoverMenuPreset,
  coarMenuPreset,
  coarModalPreset,
  coarTooltipPreset,
} from './overlay-settings';

describe('overlay-settings', () => {
  it('defines menu overlay defaults', () => {
    expect(coarMenuPreset.a11y?.role).toBe('menu');
    expect(coarMenuPreset.scroll?.strategy).toBe('close');
    expect(coarMenuPreset.dismiss?.outsideClick).toBe(true);
    expect(coarMenuPreset.dismiss?.escapeKey).toBe(true);
  });

  it('defines modal overlay defaults', () => {
    expect(coarModalPreset.backdrop).toEqual({ kind: 'modal', closeOnBackdropClick: true });
    expect(coarModalPreset.size).toEqual({
      maxWidth: 'viewport',
      maxHeight: 'viewport',
    });
    expect(coarModalPreset.position?.placement).toBe('center');
    expect(coarModalPreset.a11y?.role).toBe('dialog');
  });

  it('defines tooltip overlay defaults', () => {
    expect(coarTooltipPreset.a11y?.role).toBe('tooltip');
    expect(coarTooltipPreset.dismiss?.outsideClick).toBe(false);
    expect(coarTooltipPreset.dismiss?.escapeKey).toBe(false);
    expect(coarTooltipPreset.scroll?.strategy).toBe('noop');
  });

  it('enables hoverTree for hover menus', () => {
    expect(coarHoverMenuPreset.dismiss?.hoverTree?.enabled).toBe(true);
    expect(coarHoverMenuPreset.dismiss?.hoverTree?.delayMs).toBe(300);
  });
});
