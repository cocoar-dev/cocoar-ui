import { InjectionToken, inject } from '@angular/core';
import type { OverlayRef } from '@cocoar/ui-overlay';
import { shouldDelaySubmenuSwitch, type CoarMenuAimPoint } from './coar-menu-aim';
import {
  COAR_MENU_AIM_CONFIG,
  DEFAULT_COAR_MENU_AIM_CONFIG,
  type CoarMenuAimConfigProvider,
} from './coar-menu-aim-config';

/**
 * CoarMenuCascade: Tracks parent-child and sibling relationships for menu hierarchies.
 *
 * Responsibilities:
 * - Track overlay refs for nested submenu parenting
 * - Track children to enable sibling closure (for inline menus without a common parent overlay)
 */
export class CoarMenuCascade {
  overlayRef: OverlayRef | null = null;
  private children = new Set<CoarMenuCascade>();

  private readonly aimConfig: CoarMenuAimConfigProvider | null = inject(COAR_MENU_AIM_CONFIG, {
    optional: true,
  });

  private activeChild: CoarMenuCascade | null = null;
  private pointerHistory: CoarMenuAimPoint[] = [];
  private pointerAbort: AbortController | null = null;

  private pendingSwitchTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingChild: CoarMenuCascade | null = null;
  private pendingActivate: (() => void) | null = null;
  private activePanelCleanup: (() => void) | null = null;

  constructor(readonly parent: CoarMenuCascade | null) {
    // Register with parent to enable sibling tracking
    if (parent) {
      parent.children.add(this);
    }
  }

  requestOpenFromChild(
    child: CoarMenuCascade,
    activate: () => void,
    pointer: { x: number; y: number }
  ): void {
    const aim = this.aimConfig?.getMenuAimConfig() ?? DEFAULT_COAR_MENU_AIM_CONFIG;
    if (!aim.enabled) {
      this.activateNow(child, activate);
      return;
    }

    if (typeof document === 'undefined') {
      this.activateNow(child, activate);
      return;
    }

    const now = Date.now();
    const point: CoarMenuAimPoint = { x: pointer.x, y: pointer.y, t: now };
    this.pushPointerPoint(point);

    if (!this.activeChild || this.activeChild === child) {
      this.activateNow(child, activate);
      return;
    }

    const submenuRect = this.getActiveChildSubmenuRect();
    if (!submenuRect) {
      this.activateNow(child, activate);
      return;
    }

    const previous =
      this.pointerHistory.length >= 2 ? this.pointerHistory[this.pointerHistory.length - 2] : null;
    const direction = this.inferSubmenuDirection(submenuRect, point);

    const shouldDelay = shouldDelaySubmenuSwitch(
      previous,
      point,
      submenuRect,
      direction,
      aim.sampleMaxAgeMs
    );

    this.emitAimDebugIfEnabled(
      aim.debugEnabled,
      shouldDelay,
      previous,
      point,
      submenuRect,
      direction
    );

    if (!shouldDelay) {
      this.activateNow(child, activate);
      return;
    }

    this.scheduleSwitch(child, activate, aim.switchDelayMs);
  }

  private emitAimDebugIfEnabled(
    debugEnabled: boolean,
    shouldDelay: boolean,
    previous: CoarMenuAimPoint | null,
    current: CoarMenuAimPoint,
    submenuRect: DOMRect,
    direction: 'right' | 'left'
  ): void {
    if (typeof window === 'undefined') return;

    // Backward-compatible global override for ad-hoc debugging.
    const w = window as unknown as { __COAR_MENU_AIM_DEBUG__?: boolean };
    if (!debugEnabled && !w.__COAR_MENU_AIM_DEBUG__) return;

    try {
      window.dispatchEvent(
        new CustomEvent('coar-menu-aim', {
          detail: {
            shouldDelay,
            previous,
            current,
            submenuRect: {
              left: submenuRect.left,
              top: submenuRect.top,
              right: submenuRect.right,
              bottom: submenuRect.bottom,
            },
            direction,
          },
        })
      );
    } catch {
      // ignore
    }
  }

  notifyChildOpened(child: CoarMenuCascade): void {
    if (this.activeChild === child) {
      this.attachActivePanelListener();
    }
  }

  notifyChildClosed(child: CoarMenuCascade): void {
    if (this.activeChild === child) {
      this.activeChild = null;
      this.detachActivePanelListener();
      this.cancelPendingSwitch();
      this.stopPointerTracking();
    }
  }

  private activateNow(child: CoarMenuCascade, activate: () => void): void {
    this.cancelPendingSwitch();
    this.activeChild = child;
    this.ensurePointerTracking();
    activate();
  }

  private scheduleSwitch(child: CoarMenuCascade, activate: () => void, delayMs: number): void {
    this.cancelPendingSwitch();

    this.pendingChild = child;
    this.pendingActivate = activate;
    this.pendingSwitchTimer = setTimeout(() => {
      const pendingChild = this.pendingChild;
      const pendingActivate = this.pendingActivate;

      this.pendingChild = null;
      this.pendingActivate = null;
      this.pendingSwitchTimer = null;

      if (!pendingChild || !pendingActivate) return;
      this.activeChild = pendingChild;
      this.ensurePointerTracking();
      pendingActivate();
    }, delayMs);
  }

  private cancelPendingSwitch(): void {
    if (this.pendingSwitchTimer) {
      clearTimeout(this.pendingSwitchTimer);
      this.pendingSwitchTimer = null;
    }
    this.pendingChild = null;
    this.pendingActivate = null;
  }

  private ensurePointerTracking(): void {
    if (this.pointerAbort) return;
    if (typeof document === 'undefined') return;

    const abort = new AbortController();
    this.pointerAbort = abort;

    const onMove = (e: PointerEvent) => {
      this.pushPointerPoint({ x: e.clientX, y: e.clientY, t: Date.now() });
    };

    document.addEventListener('pointermove', onMove, { signal: abort.signal, passive: true });
  }

  private stopPointerTracking(): void {
    if (!this.pointerAbort) return;
    this.pointerAbort.abort();
    this.pointerAbort = null;
    this.pointerHistory = [];
  }

  private pushPointerPoint(point: CoarMenuAimPoint): void {
    this.pointerHistory.push(point);
    if (this.pointerHistory.length > 5) {
      this.pointerHistory = this.pointerHistory.slice(-5);
    }
  }

  private getActiveChildSubmenuRect(): DOMRect | null {
    const panelEl = this.activeChild?.overlayRef?.getPanelElement?.();
    if (!panelEl) return null;
    return panelEl.getBoundingClientRect();
  }

  private inferSubmenuDirection(rect: DOMRect, point: { x: number; y: number }): 'right' | 'left' {
    // If the submenu's left edge is to the right of the pointer, it's a right-opening flyout.
    // Otherwise, assume left.
    return rect.left >= point.x ? 'right' : 'left';
  }

  private attachActivePanelListener(): void {
    this.detachActivePanelListener();

    const panelEl = this.activeChild?.overlayRef?.getPanelElement?.();
    if (!panelEl) return;

    const onEnter = () => {
      // Once the user reaches the currently open submenu panel, don't allow a delayed switch
      // to steal focus/open another sibling submenu.
      this.cancelPendingSwitch();
    };

    panelEl.addEventListener('pointerenter', onEnter);
    this.activePanelCleanup = () => panelEl.removeEventListener('pointerenter', onEnter);
  }

  private detachActivePanelListener(): void {
    this.activePanelCleanup?.();
    this.activePanelCleanup = null;
  }

  /**
   * Close all sibling submenus at the cascade level.
   * Used for inline menus where siblings don't have a common parent overlay.
   */
  closeSiblings(): void {
    if (this.parent) {
      for (const sibling of this.parent.children) {
        if (sibling !== this && sibling.overlayRef) {
          sibling.overlayRef.close();
        }
      }
    }
  }

  destroy(): void {
    this.detachActivePanelListener();
    this.cancelPendingSwitch();
    this.stopPointerTracking();
    if (this.parent) {
      this.parent.children.delete(this);
    }
  }
}

export const COAR_MENU_CASCADE = new InjectionToken<CoarMenuCascade>('COAR_MENU_CASCADE');
