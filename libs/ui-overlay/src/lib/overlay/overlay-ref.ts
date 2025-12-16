import { Observable } from 'rxjs';

export interface OverlayRef {
  close(result?: unknown): void;
  updatePosition(): void;
  readonly afterClosed$: Observable<unknown>;
}
