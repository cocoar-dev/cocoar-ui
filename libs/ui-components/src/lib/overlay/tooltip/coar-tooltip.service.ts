import { Injectable } from '@angular/core';

type TooltipOpenReason = 'hover' | 'focus';

interface ActiveTooltip {
  id: string;
  closeImmediate: () => void;
  closeOnHoverLost: () => void;
  trigger: HTMLElement;
  reason: TooltipOpenReason;
}

@Injectable({ providedIn: 'root' })
export class CoarTooltipService {
  private active: ActiveTooltip | null = null;

  private trackingCleanup: (() => void) | null = null;

  requestOpen(
    id: string,
    closeImmediate: () => void,
    closeOnHoverLost: () => void,
    trigger: HTMLElement,
    reason: TooltipOpenReason
  ): void {
    const previous = this.active;

    if (previous && previous.id !== id) {
      previous.closeImmediate();
    }

    this.active = { id, closeImmediate, closeOnHoverLost, trigger, reason };

    if (reason === 'hover') {
      this.ensurePointerTracking();
    } else {
      this.stopPointerTracking();
    }
  }

  notifyClosed(id: string): void {
    if (this.active?.id !== id) return;
    this.active = null;
    this.stopPointerTracking();
  }

  private ensurePointerTracking(): void {
    if (this.trackingCleanup) return;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const capture = true;

    const closeIfHoverLost = (): void => {
      if (!this.active) return;
      if (this.active.reason !== 'hover') return;
      this.active.closeImmediate();
    };

    const onPointerMove = (event: PointerEvent | MouseEvent): void => {
      if (!this.active) return;
      if (this.active.reason !== 'hover') return;

      // Prefer hit-testing when available, but fall back to geometry checks for environments
      // that don't implement elementFromPoint (e.g. certain test runners).
      if (typeof document.elementFromPoint === 'function') {
        const el = document.elementFromPoint(event.clientX, event.clientY);
        if (el && this.active.trigger.contains(el)) return;
        this.active.closeOnHoverLost();
        return;
      }

      const rect = this.active.trigger.getBoundingClientRect();
      const withinX = event.clientX >= rect.left && event.clientX <= rect.right;
      const withinY = event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (withinX && withinY) return;
      this.active.closeOnHoverLost();
    };

    const onScroll = (): void => closeIfHoverLost();
    const onBlur = (): void => closeIfHoverLost();
    const onVisibilityChange = (): void => {
      if (document.hidden) {
        closeIfHoverLost();
      }
    };

    document.addEventListener('pointermove', onPointerMove, { capture, passive: true });
    window.addEventListener('scroll', onScroll, { capture, passive: true });
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);

    this.trackingCleanup = () => {
      document.removeEventListener('pointermove', onPointerMove, capture);
      window.removeEventListener('scroll', onScroll, capture);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      this.trackingCleanup = null;
    };
  }

  private stopPointerTracking(): void {
    this.trackingCleanup?.();
  }
}
