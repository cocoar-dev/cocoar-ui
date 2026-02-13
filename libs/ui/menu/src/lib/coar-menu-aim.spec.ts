import { describe, expect, it } from 'vitest';
import { shouldDelaySubmenuSwitch } from './coar-menu-aim';

describe('shouldDelaySubmenuSwitch', () => {
  it('returns false when there is no previous point', () => {
    const rect = new DOMRect(200, 0, 200, 400);
    const now = Date.now();
    expect(shouldDelaySubmenuSwitch(null, { x: 100, y: 100, t: now }, rect, 'right')).toBe(false);
  });

  it('returns false for mostly vertical movement (no clear x movement toward submenu)', () => {
    const rect = new DOMRect(200, 0, 200, 400);
    const t0 = Date.now();
    expect(
      shouldDelaySubmenuSwitch(
        { x: 100, y: 100, t: t0 },
        { x: 101, y: 180, t: t0 + 16 },
        rect,
        'right'
      )
    ).toBe(false);
  });

  it('returns true when moving diagonally into the submenu wedge (right)', () => {
    // Submenu panel is to the right.
    const rect = new DOMRect(250, 50, 200, 300);
    const t0 = Date.now();

    // Moving from inside the parent menu toward the submenu.
    expect(
      shouldDelaySubmenuSwitch(
        { x: 100, y: 120, t: t0 },
        { x: 240, y: 150, t: t0 + 16 },
        rect,
        'right'
      )
    ).toBe(true);
  });

  it('returns false when the last movement is stale', () => {
    const rect = new DOMRect(250, 50, 200, 300);
    const t0 = Date.now();

    expect(
      shouldDelaySubmenuSwitch(
        { x: 100, y: 120, t: t0 },
        { x: 160, y: 140, t: t0 + 1000 },
        rect,
        'right',
        200
      )
    ).toBe(false);
  });
});
