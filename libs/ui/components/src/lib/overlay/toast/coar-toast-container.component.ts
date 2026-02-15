import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChildren,
  signal,
} from '@angular/core';

import { CoarToastComponent } from './coar-toast.component';
import { type CoarToastVariant } from './coar-toast.types';

export interface InternalToast {
  id: number;
  variant: CoarToastVariant;
  title: string;
  message: string;
  duration: number;
  dismissible: boolean;
  showProgress: boolean;
  action: { label: string; callback: () => void } | null;
  onDismiss: () => void;
}

@Component({
  selector: 'coar-toast-container',
  standalone: true,
  imports: [CoarToastComponent],
  templateUrl: './coar-toast-container.component.html',
  styleUrl: './coar-toast-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"coar-toast-container--" + position()',
  },
})
export class CoarToastContainerComponent {
  @ViewChildren(CoarToastComponent) toastComponents!: QueryList<CoarToastComponent>;

  readonly toasts = signal<InternalToast[]>([]);
  readonly position = signal<string>('top-right');

  private pendingAutoClose = new Set<number>();

  addToast(toast: InternalToast): void {
    const current = this.toasts();
    // Limit to 5 visible toasts max
    const limited = current.length >= 5 ? current.slice(1) : current;
    this.toasts.set([...limited, toast]);

    if (toast.duration > 0) {
      this.pendingAutoClose.add(toast.id);
    }
  }

  removeToast(id: number): void {
    this.pendingAutoClose.delete(id);
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  removeAll(): void {
    this.pendingAutoClose.clear();
    this.toasts.set([]);
  }

  onDismissed(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (toast) {
      toast.onDismiss();
    }
    this.removeToast(id);
  }

  startAutoCloseForLatest(): void {
    // Use setTimeout to let the view update before querying view children
    setTimeout(() => {
      const components = this.toastComponents?.toArray() ?? [];
      for (const comp of components) {
        comp.startAutoClose();
      }
    });
  }
}
