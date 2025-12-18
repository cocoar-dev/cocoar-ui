import { Observable } from 'rxjs';

export interface OverlayRef {
  close(result?: unknown): void;
  updatePosition(): void;
  closeChildren(exclude?: OverlayRef): void;
  readonly afterClosed$: Observable<unknown>;
}
