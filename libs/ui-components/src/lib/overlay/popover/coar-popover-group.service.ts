import { Injectable } from '@angular/core';

/**
 * Local coordination for popovers inside the same container (e.g. a date picker panel).
 *
 * Provided by a parent component to ensure only one popover in that scope is open at a time.
 */
@Injectable()
export class CoarPopoverGroupService {
  private activeId: string | null = null;
  private activeClose: (() => void) | null = null;

  requestOpen(id: string, close: () => void): void {
    if (this.activeId && this.activeId !== id) {
      this.activeClose?.();
    }

    this.activeId = id;
    this.activeClose = close;
  }

  notifyClosed(id: string): void {
    if (this.activeId === id) {
      this.activeId = null;
      this.activeClose = null;
    }
  }
}
