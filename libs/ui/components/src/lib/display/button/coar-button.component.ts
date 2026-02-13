import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  booleanAttribute,
} from '@angular/core';

import { CoarIconComponent, CoarIconSize } from '../icon/coar-icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 's' | 'm' | 'l';

@Component({
  selector: 'coar-button',
  standalone: true,
  imports: [CoarIconComponent],
  templateUrl: './coar-button.component.html',
  styleUrl: './coar-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-button-host]': 'true',
    '[class.coar-button--full-width]': 'fullWidth()',
  },
})
export class CoarButtonComponent {
  /** Button visual variant */
  variant = input<ButtonVariant>('primary');

  /** Button size */
  size = input<ButtonSize>('m');

  /** Whether the button is disabled */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the button is in loading state */
  loading = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Button type attribute */
  type = input<'button' | 'submit' | 'reset'>('button');

  /** Icon to display before the label */
  iconStart = input<string | undefined>(undefined);

  /** Icon to display after the label */
  iconEnd = input<string | undefined>(undefined);

  /** Whether the button should take full width */
  fullWidth = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Optional aria-label applied to the underlying <button> element */
  ariaLabel = input<string>('');

  /** Emitted when the button is clicked (not emitted when disabled or loading) */
  clicked = output<MouseEvent>();

  /** Maps button size to appropriate icon size */
  protected readonly iconSize = computed<CoarIconSize>(() => {
    const sizeMap: Record<ButtonSize, CoarIconSize> = {
      xs: 'xs',
      s: 's',
      m: 'm',
      l: 'l',
    };
    return sizeMap[this.size()];
  });

  protected onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
