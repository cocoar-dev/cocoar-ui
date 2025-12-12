import { type AnchorSpec, type Placement, type PositionSpec } from './overlay-spec';

export interface ViewportRect {
  readonly width: number;
  readonly height: number;
}

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface OverlaySize {
  readonly width: number;
  readonly height: number;
}

export interface OverlayCoordinates {
  readonly left: number;
  readonly top: number;
  readonly placement: Placement;
}

export function getViewportRect(): ViewportRect {
  const docEl = document.documentElement;
  const width = docEl?.clientWidth || window.innerWidth;
  const height = docEl?.clientHeight || window.innerHeight;
  return { width, height };
}

export function getContainerRect(container: HTMLElement): Rect {
  return rectFromDom(container.getBoundingClientRect());
}

export function rectFromDom(domRect: DOMRect): Rect {
  return {
    left: domRect.left,
    top: domRect.top,
    right: domRect.right,
    bottom: domRect.bottom,
    width: domRect.width,
    height: domRect.height,
  };
}

export function getAnchorRect(anchor: AnchorSpec, viewport: ViewportRect): Rect {
  switch (anchor.kind) {
    case 'element':
      return rectFromDom(anchor.element.getBoundingClientRect());
    case 'point':
      return rectFromPoint(anchor, 0, 0);
    case 'virtual':
      return rectFromVirtual(anchor, viewport);
  }
}

export function rectFromPoint(point: Point, width: number, height: number): Rect {
  const left = point.x;
  const top = point.y;
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

export function rectFromVirtual(
  spec: Extract<AnchorSpec, { kind: 'virtual' }>,
  viewport: ViewportRect
): Rect {
  if (spec.placement === 'center') {
    const x = viewport.width / 2;
    const y = viewport.height / 2;
    return rectFromPoint({ x, y }, 0, 0);
  }

  if (spec.placement === 'top') {
    const x = viewport.width / 2;
    const y = 0;
    return rectFromPoint({ x, y }, 0, 0);
  }

  const x = viewport.width / 2;
  const y = viewport.height;
  return rectFromPoint({ x, y }, 0, 0);
}

export function getScrollParents(element: Element): Array<Element | Window> {
  const result: Array<Element | Window> = [];

  let current: Element | null = element;
  while (current && current.parentElement) {
    current = current.parentElement;
    const style = getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    const scrollable =
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowX === 'auto' ||
      overflowX === 'scroll';

    if (scrollable) {
      result.push(current);
    }
  }

  result.push(window);
  return result;
}

export function computeOverlayCoordinates(
  anchorRect: Rect,
  overlaySize: OverlaySize,
  position: PositionSpec,
  viewport: ViewportRect,
  boundaryRect?: Rect
): OverlayCoordinates {
  const placements: readonly Placement[] = Array.isArray(position.placement)
    ? position.placement
    : [position.placement];

  const offset = position.offset ?? 0;
  const allowFlip = position.flip ?? false;
  const allowShift = position.shift ?? false;

  // Use container boundaries if provided, otherwise use viewport
  const boundary = boundaryRect ?? { left: 0, top: 0, right: viewport.width, bottom: viewport.height, width: viewport.width, height: viewport.height };

  const candidates = placements.map((placement) => ({
    placement,
    coords: coordsForPlacement(anchorRect, overlaySize, placement, offset),
  }));

  if (allowFlip) {
    for (const candidate of candidates) {
      const fits = fitsInBoundary(candidate.coords, overlaySize, boundary);
      if (fits) {
        return allowShift
          ? { ...shiftIntoBoundary(candidate.coords, overlaySize, boundary), placement: candidate.placement }
          : { ...candidate.coords, placement: candidate.placement };
      }
    }
  }

  // Choose the candidate with the smallest total overflow.
  let best = candidates[0];
  let bestOverflow = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const overflow = totalOverflowFromBoundary(candidate.coords, overlaySize, boundary);
    if (overflow < bestOverflow) {
      best = candidate;
      bestOverflow = overflow;
    }
  }

  const chosen =
    best?.coords ??
    coordsForPlacement(anchorRect, overlaySize, placements[0] ?? 'bottom', offset);

  const shifted = allowShift ? shiftIntoBoundary(chosen, overlaySize, boundary) : chosen;
  return { ...shifted, placement: best?.placement ?? (placements[0] ?? 'bottom') };
}

function coordsForPlacement(
  anchorRect: Rect,
  overlaySize: OverlaySize,
  placement: Placement,
  offset: number
): { left: number; top: number } {
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;

  switch (placement) {
    case 'center':
      return {
        left: anchorCenterX - overlaySize.width / 2,
        top: anchorCenterY - overlaySize.height / 2,
      };

    case 'top':
      return {
        left: anchorCenterX - overlaySize.width / 2,
        top: anchorRect.top - overlaySize.height - offset,
      };
    case 'top-start':
      return {
        left: anchorRect.left,
        top: anchorRect.top - overlaySize.height - offset,
      };
    case 'top-end':
      return {
        left: anchorRect.right - overlaySize.width,
        top: anchorRect.top - overlaySize.height - offset,
      };

    case 'bottom':
      return {
        left: anchorCenterX - overlaySize.width / 2,
        top: anchorRect.bottom + offset,
      };
    case 'bottom-start':
      return {
        left: anchorRect.left,
        top: anchorRect.bottom + offset,
      };
    case 'bottom-end':
      return {
        left: anchorRect.right - overlaySize.width,
        top: anchorRect.bottom + offset,
      };

    case 'left':
      return {
        left: anchorRect.left - overlaySize.width - offset,
        top: anchorCenterY - overlaySize.height / 2,
      };
    case 'left-start':
      return {
        left: anchorRect.left - overlaySize.width - offset,
        top: anchorRect.top,
      };
    case 'left-end':
      return {
        left: anchorRect.left - overlaySize.width - offset,
        top: anchorRect.bottom - overlaySize.height,
      };

    case 'right':
      return {
        left: anchorRect.right + offset,
        top: anchorCenterY - overlaySize.height / 2,
      };
    case 'right-start':
      return {
        left: anchorRect.right + offset,
        top: anchorRect.top,
      };
    case 'right-end':
      return {
        left: anchorRect.right + offset,
        top: anchorRect.bottom - overlaySize.height,
      };
  }
}

function fitsInBoundary(
  coords: { left: number; top: number },
  overlaySize: OverlaySize,
  boundary: Rect
): boolean {
  return (
    coords.left >= boundary.left &&
    coords.top >= boundary.top &&
    coords.left + overlaySize.width <= boundary.right &&
    coords.top + overlaySize.height <= boundary.bottom
  );
}

function shiftIntoBoundary(
  coords: { left: number; top: number },
  overlaySize: OverlaySize,
  boundary: Rect
): { left: number; top: number } {
  const maxLeft = Math.max(boundary.left, boundary.right - overlaySize.width);
  const maxTop = Math.max(boundary.top, boundary.bottom - overlaySize.height);

  return {
    left: clamp(coords.left, boundary.left, maxLeft),
    top: clamp(coords.top, boundary.top, maxTop),
  };
}

function totalOverflowFromBoundary(
  coords: { left: number; top: number },
  overlaySize: OverlaySize,
  boundary: Rect
): number {
  const leftOverflow = Math.max(0, boundary.left - coords.left);
  const topOverflow = Math.max(0, boundary.top - coords.top);
  const rightOverflow = Math.max(0, coords.left + overlaySize.width - boundary.right);
  const bottomOverflow = Math.max(0, coords.top + overlaySize.height - boundary.bottom);

  return leftOverflow + topOverflow + rightOverflow + bottomOverflow;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
