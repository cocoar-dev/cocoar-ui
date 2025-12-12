import { describe, expect, it } from 'vitest';

import { Overlay } from './overlay';
import { coarMenuPreset, coarModalPreset, coarTooltipPreset } from './presets';

describe('Overlay', () => {
  it('freezes the resulting spec without inventing runtime defaults', () => {
    const spec = Overlay.define((b) => {
      b.anchor({ kind: 'virtual', placement: 'center' });
      b.content((c) => c.fromText());
    });

    expect(Object.isFrozen(spec)).toBe(true);
    expect(spec.anchor).toEqual({ kind: 'virtual', placement: 'center' });
    expect(spec.position).toBeUndefined();
    expect(spec.backdrop).toBeUndefined();
    expect(spec.scroll).toBeUndefined();
  });

  it('forks without mutating the base spec', () => {
    const base = Overlay.define((b) => {
      b.content((c) => c.fromText());
    });

    const forked = Overlay.fork(base, (b) => {
      b.backdrop('modal');
    });

    expect(base.backdrop).toBeUndefined();
    expect(forked.backdrop).toEqual({ kind: 'modal', closeOnBackdropClick: true });
    expect(Object.isFrozen(base)).toBe(true);
    expect(Object.isFrozen(forked)).toBe(true);
  });

  it('applies the menu preset defaults', () => {
    const spec = Overlay.define(
      (b) => {
        b.content((c) => c.fromText());
      },
      coarMenuPreset
    );

    expect(spec.a11y.role).toBe('menu');
    expect(spec.scroll.strategy).toBe('close');
    expect(spec.dismiss.outsideClick).toBe(true);
    expect(spec.dismiss.escapeKey).toBe(true);
  });

  it('applies the modal preset size defaults', () => {
    const spec = Overlay.define(
      (b) => {
        b.content((c) => c.fromText());
      },
      coarModalPreset
    );

    expect(spec.size).toEqual({ mode: 'content-clamped', maxWidth: 'viewport', maxHeight: 'viewport' });
    expect(spec.position.placement).toBe('center');
    expect(spec.a11y.role).toBe('dialog');
  });

  it('applies the tooltip preset role', () => {
    const spec = Overlay.define(
      (b) => {
        b.content((c) => c.fromText());
      },
      coarTooltipPreset
    );

    expect(spec.a11y.role).toBe('tooltip');
  });
});
