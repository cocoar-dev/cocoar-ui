import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';

export type CoarProgressBarVariant = 'accent' | 'success' | 'warning' | 'error';
export type CoarProgressBarSize = 's' | 'm' | 'l';

@Component({
  selector: 'coar-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './coar-progress-bar.component.html',
  styleUrl: './coar-progress-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class.coar-progress-bar--s]': 'size() === "s"',
    '[class.coar-progress-bar--m]': 'size() === "m"',
    '[class.coar-progress-bar--l]': 'size() === "l"',
    '[class.coar-progress-bar--accent]': 'variant() === "accent"',
    '[class.coar-progress-bar--success]': 'variant() === "success"',
    '[class.coar-progress-bar--warning]': 'variant() === "warning"',
    '[class.coar-progress-bar--error]': 'variant() === "error"',
    '[class.coar-progress-bar--indeterminate]': 'indeterminate()',
    '[attr.aria-valuenow]': 'indeterminate() ? null : percentage()',
    '[attr.aria-valuemin]': '"0"',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-label]': 'label() || null',
  },
})
export class CoarProgressBarComponent {
  /** Current progress value (0 to max) */
  value = input<number>(0);

  /** Maximum progress value */
  max = input<number>(100);

  /** Visual variant */
  variant = input<CoarProgressBarVariant>('accent');

  /** Bar height size */
  size = input<CoarProgressBarSize>('m');

  /** Whether to show an indeterminate animation */
  indeterminate = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Accessible label for the progress bar */
  label = input<string>('');

  /** Whether to display the percentage text */
  showValue = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Computed percentage clamped to 0-100 */
  protected percentage = computed(() => {
    const max = this.max();
    if (max <= 0) return 0;
    return Math.round(Math.min(100, Math.max(0, (this.value() / max) * 100)));
  });
}
