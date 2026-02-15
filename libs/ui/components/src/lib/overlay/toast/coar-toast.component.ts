import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { type CoarToastVariant } from './coar-toast.types';

const ICON_MAP: Record<CoarToastVariant, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

@Component({
  selector: 'coar-toast',
  standalone: true,
  imports: [CoarIconComponent],
  templateUrl: './coar-toast.component.html',
  styleUrl: './coar-toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-toast--no-title]': '!title()',
  },
})
export class CoarToastComponent {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private startTime = 0;
  private remaining = 0;

  readonly variant = input<CoarToastVariant>('info');
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly duration = input<number>(5000);
  readonly dismissible = input<boolean>(true);
  readonly showProgress = input<boolean>(true);
  readonly action = input<{ label: string; callback: () => void } | null>(null);

  readonly dismissed = output<void>();
  readonly actionClicked = output<void>();

  readonly isPaused = signal(false);

  readonly iconName = computed(() => ICON_MAP[this.variant()]);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimer();
    });
  }

  startAutoClose(): void {
    const dur = this.duration();
    if (dur <= 0) return;

    this.remaining = dur;
    this.startTime = Date.now();
    this.timer = setTimeout(() => {
      this.dismissed.emit();
    }, this.remaining);
  }

  onMouseEnter(): void {
    if (this.duration() <= 0) return;
    this.isPaused.set(true);

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.remaining = Math.max(0, this.remaining - (Date.now() - this.startTime));
    }
  }

  onMouseLeave(): void {
    if (this.duration() <= 0) return;
    this.isPaused.set(false);

    if (this.remaining > 0) {
      this.startTime = Date.now();
      this.timer = setTimeout(() => {
        this.dismissed.emit();
      }, this.remaining);
    }
  }

  onDismiss(): void {
    this.clearTimer();
    this.dismissed.emit();
  }

  onAction(): void {
    const actionFn = this.action();
    if (actionFn) {
      actionFn.callback();
    }
    this.actionClicked.emit();
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
