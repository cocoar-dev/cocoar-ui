export interface CoarMenuAimPoint {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export type CoarMenuAimDirection = 'right' | 'left';

export function shouldDelaySubmenuSwitch(
  previous: CoarMenuAimPoint | null,
  current: CoarMenuAimPoint,
  submenuRect: DOMRect,
  direction: CoarMenuAimDirection,
  sampleMaxAgeMs = 200
): boolean {
  if (!previous) return false;

  // If submenu rect is not measurable, don't delay.
  if (!Number.isFinite(submenuRect.left) || submenuRect.width <= 0 || submenuRect.height <= 0) {
    return false;
  }

  // If the last movement was long ago, don't apply aim heuristics.
  if (current.t - previous.t > sampleMaxAgeMs) return false;

  const dx = current.x - previous.x;

  // Require clear horizontal intent toward the submenu.
  if (direction === 'right' && dx <= 2) return false;
  if (direction === 'left' && dx >= -2) return false;

  // Use the NEAR edge of the submenu panel (closest to the parent menu).
  // This matches the classic "menu aim" wedge used to detect intent to enter the open submenu.
  // Right-opening submenu: use left edge; left-opening submenu: use right edge.
  const edgeX = direction === 'right' ? submenuRect.left : submenuRect.right;

  // Expand wedge slightly to be forgiving.
  const padY = 8;
  const cornerA = { x: edgeX, y: submenuRect.top - padY };
  const cornerB = { x: edgeX, y: submenuRect.bottom + padY };

  return pointInTriangle(current, previous, cornerA, cornerB);
}

function pointInTriangle(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): boolean {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

function sign(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
