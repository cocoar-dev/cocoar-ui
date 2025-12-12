import { describe, expect, it } from 'vitest';

import {
  computeOverlayCoordinates,
  getAnchorRect,
} from './overlay-position';
import { type AnchorSpec, type PositionSpec } from './overlay-spec';

describe('overlay-position', () => {
  it('resolves virtual center anchor in viewport', () => {
    const viewport = { width: 1000, height: 800 };
    const anchor: AnchorSpec = { kind: 'virtual', placement: 'center' };
    const rect = getAnchorRect(anchor, viewport);
    expect(rect.left).toBe(500);
    expect(rect.top).toBe(400);
  });

  it('selects the first fitting placement when flip is enabled', () => {
    const viewport = { width: 300, height: 200 };
    const anchorRect = {
      left: 150,
      top: 10,
      right: 150,
      bottom: 10,
      width: 0,
      height: 0,
    };

    const overlaySize = { width: 120, height: 80 };
    const position: PositionSpec = {
      placement: ['top', 'bottom'],
      offset: 8,
      flip: true,
      shift: false,
    };

    // 'top' would be offscreen (10 - 80 - 8 < 0), so it should flip to 'bottom'.
    const coords = computeOverlayCoordinates(anchorRect, overlaySize, position, viewport);
    expect(coords.placement).toBe('bottom');
    expect(coords.top).toBe(18);
  });

  it("centers the overlay when placement is 'center'", () => {
    const viewport = { width: 300, height: 200 };
    const anchorRect = {
      left: 150,
      top: 100,
      right: 150,
      bottom: 100,
      width: 0,
      height: 0,
    };

    const overlaySize = { width: 120, height: 80 };
    const position: PositionSpec = {
      placement: 'center',
      offset: 0,
      flip: false,
      shift: false,
    };

    const coords = computeOverlayCoordinates(anchorRect, overlaySize, position, viewport);
    expect(coords.left).toBe(90);
    expect(coords.top).toBe(60);
    expect(coords.placement).toBe('center');
  });

  it('shifts into viewport when shift is enabled', () => {
    const viewport = { width: 200, height: 200 };
    const anchorRect = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 10,
      width: 0,
      height: 0,
    };

    const overlaySize = { width: 180, height: 100 };
    const position: PositionSpec = {
      placement: 'left',
      offset: 8,
      flip: false,
      shift: true,
    };

    // Left placement would push it negative; shift should clamp it to 0.
    const coords = computeOverlayCoordinates(anchorRect, overlaySize, position, viewport);
    expect(coords.left).toBe(0);
    expect(coords.top).toBe(0);
  });

  it('chooses best-fit placement when none fit fully', () => {
    const viewport = { width: 100, height: 60 };
    const anchorRect = {
      left: 50,
      top: 30,
      right: 50,
      bottom: 30,
      width: 0,
      height: 0,
    };

    const overlaySize = { width: 200, height: 120 };
    const position: PositionSpec = {
      placement: ['top', 'bottom', 'left', 'right'],
      offset: 0,
      flip: true,
      shift: false,
    };

    // None can fully fit, but algorithm should still return a deterministic candidate.
    const coords = computeOverlayCoordinates(anchorRect, overlaySize, position, viewport);
    expect(['top', 'bottom', 'left', 'right']).toContain(coords.placement);
    expect(Number.isFinite(coords.left)).toBe(true);
    expect(Number.isFinite(coords.top)).toBe(true);
  });
});
