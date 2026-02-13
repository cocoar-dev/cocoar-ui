import { Observable } from 'rxjs';

export interface OverlayRef {
  close(result?: unknown): void;
  updatePosition(): void;
  closeChildren(exclude?: OverlayRef): void;
  readonly afterClosed$: Observable<unknown>;
  readonly isClosed: boolean;

  /**
   * Get the root overlay in a parent-child tree (e.g., menu with submenus).
   * Returns this overlay if it has no parent.
   */
  getRoot(): OverlayRef;

  /**
   * Optional DOM access for advanced behaviors (e.g. menu-aim).
   * Implementations may return the inner panel element that contains the rendered content.
   */
  getPanelElement?(): HTMLElement;
}
