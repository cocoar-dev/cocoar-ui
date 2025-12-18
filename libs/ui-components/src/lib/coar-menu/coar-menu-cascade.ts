import { InjectionToken } from '@angular/core';
import type { OverlayRef } from '@cocoar/ui-overlay';

/**
 * CoarMenuCascade: Tracks parent-child and sibling relationships for menu hierarchies.
 *
 * Responsibilities:
 * - Track overlay refs for hover dismiss behavior
 * - Register cancel-close timers for hover tree dismissal
 * - Track children to enable sibling closure (for inline menus without parent overlays)
 * - Provide keepAlive mechanism to prevent premature closure
 */
export class CoarMenuCascade {
  overlayRef: OverlayRef | null = null;
  private cancelCloseTimer: (() => void) | null = null;
  private children = new Set<CoarMenuCascade>();

  constructor(readonly parent: CoarMenuCascade | null) {
    // Register with parent to enable sibling tracking
    if (parent) {
      parent.children.add(this);
    }
  }

  registerCancelCloseTimer(fn: () => void): void {
    this.cancelCloseTimer = fn;
  }

  keepAliveUpTree(): void {
    this.cancelCloseTimer?.();
    this.parent?.keepAliveUpTree();
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
    if (this.parent) {
      this.parent.children.delete(this);
    }
  }
}

export const COAR_MENU_CASCADE = new InjectionToken<CoarMenuCascade>('COAR_MENU_CASCADE');
