import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  signal,
  computed,
  booleanAttribute,
} from '@angular/core';

import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../_base/coar-control-value-accessor';

export type CoarSwitchSize = 's' | 'm' | 'l';

@Component({
  selector: 'coar-switch',
  standalone: true,
  imports: [],
  templateUrl: './coar-switch.component.html',
  styleUrl: './coar-switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarSwitchComponent)],
  host: {
    '[class.coar-switch--s]': 'size() === "s"',
    '[class.coar-switch--m]': 'size() === "m"',
    '[class.coar-switch--l]': 'size() === "l"',
    '[class.coar-switch--disabled]': 'isDisabled()',
    '[class.coar-switch--readonly]': 'readonly()',
    '[class.coar-switch--checked]': 'checked()',
  },
})
export class CoarSwitchComponent extends CoarControlValueAccessor<boolean> {
  /** Label text displayed next to the switch */
  label = input<string>('');

  /** Switch checked state */
  checked = model<boolean>(false);

  /** Disables the switch */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Prevents changes but keeps normal appearance */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Switch size */
  size = input<CoarSwitchSize>('m');

  /** HTML id attribute */
  id = input<string>('');

  /** HTML name attribute */
  name = input<string>('');

  /** Label position relative to the switch */
  labelPosition = input<'before' | 'after'>('after');

  protected isFocused = signal(false);

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly autoId = `coar-switch-${cryptoRandomId()}`;
  protected inputId = computed(() => this.id() || this.autoId);

  public writeValue(value: boolean | null): void {
    this.checked.set(value ?? false);
  }

  protected onToggle(event: Event): void {
    if (this.readonly()) {
      event.preventDefault();
      const target = event.target as HTMLInputElement;
      target.checked = this.checked();
      return;
    }

    const target = event.target as HTMLInputElement;
    const newState = target.checked;

    this.checked.set(newState);
    this.cvaOnChange(newState);
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.cvaOnTouched();
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
