import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';


export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';

@Component({
  selector: 'coar-badge',
  standalone: true,
  imports: [],
  templateUrl: './coar-badge.component.html',
  styleUrl: './coar-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-badge-host]': 'true',
    '[class.coar-badge-host--auto]': 'size() === "auto"',
    '[class.coar-badge-host--pulse]': 'pulse()',
  },
})
export class CoarBadgeComponent {
  /** Content to display in the badge (number, text, or icon) */
  content = input<string | number>('');

  /** Badge visual variant */
  variant = input<BadgeVariant>('primary');

  /** Badge size */
  size = input<BadgeSize>('md');

  /** Whether the badge should pulse/animate (for notifications) */
  pulse = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether to show as a dot without content */
  dot = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Maximum number to display (shows "99+" if exceeded) */
  max = input<number | null>(null);

  /** Whether to show a border around the badge */
  bordered = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Computed display value */
  protected displayValue = computed(() => {
    if (this.dot()) {
      return '';
    }

    const content = this.content();
    const max = this.max();

    if (typeof content === 'number' && max !== null && content > max) {
      return `${max}+`;
    }

    return String(content);
  });
}
