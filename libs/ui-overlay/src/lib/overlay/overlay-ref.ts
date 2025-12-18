import { Observable } from 'rxjs';

export interface OverlayRef {
  close(result?: unknown): void;
  updatePosition(): void;
  closeChildren(exclude?: OverlayRef): void;
  readonly afterClosed$: Observable<unknown>;
  readonly isClosed: boolean;

  /**
   * Optional DOM access for advanced behaviors (e.g. menu-aim).
   * Implementations may return the inner panel element that contains the rendered content.
   */
  getPanelElement?(): HTMLElement;
}
