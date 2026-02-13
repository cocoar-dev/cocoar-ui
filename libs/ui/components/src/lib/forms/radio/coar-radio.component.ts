import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import { CoarRadioGroupComponent } from './coar-radio-group.component';

/**
 * Individual radio button, must be used inside a coar-radio-group.
 *
 * @example
 * ```html
 * <coar-radio value="option1">Option 1</coar-radio>
 * ```
 */
@Component({
  selector: 'coar-radio',
  standalone: true,
  imports: [],
  templateUrl: './coar-radio.component.html',
  styleUrl: './coar-radio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-radio--checked]': 'isChecked()',
    '[class.coar-radio--disabled]': 'isDisabled()',
    '[class.coar-radio--focused]': 'isFocused()',
    '[class.coar-radio--s]': 'groupSize() === "s"',
    '[class.coar-radio--m]': 'groupSize() === "m"',
    '[class.coar-radio--l]': 'groupSize() === "l"',
    '[class.coar-radio--error]': 'groupHasError()',
    '(click)': 'onClick($event)',
  },
})
export class CoarRadioComponent<T = unknown> {
  private readonly group = inject(CoarRadioGroupComponent, { optional: true });

  /** Value of this radio option */
  value = input.required<T>();

  /** Disables this specific radio button */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('radioInput');
  protected isFocused = signal(false);

  protected isChecked = computed(() => {
    if (!this.group) return false;
    return this.group.isSelected(this.value());
  });

  protected isDisabled = computed(() => {
    return this.disabled() || (this.group?.isGroupDisabled() ?? false);
  });

  protected groupSize = computed(() => this.group?.size() ?? 'm');
  protected groupHasError = computed(() => (this.group?.error() ?? '').length > 0);

  protected radioName = computed(() => {
    return this.group?.name() ?? '';
  });

  private readonly autoId = `coar-radio-${cryptoRandomId()}`;
  protected inputId = computed(() => this.autoId);

  protected onClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }
    this.select();
  }

  protected onInputChange(): void {
    if (this.isDisabled()) return;
    this.select();
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
  }

  private select(): void {
    if (this.group && !this.isChecked()) {
      this.group.selectValue(this.value());
    }
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
