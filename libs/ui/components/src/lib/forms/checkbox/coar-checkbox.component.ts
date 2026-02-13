import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../_base/coar-control-value-accessor';

export type CoarCheckboxSize = 'xs' | 's' | 'm' | 'l';

@Component({
  selector: 'coar-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './coar-checkbox.component.html',
  styleUrl: './coar-checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarCheckboxComponent)],
  host: {
    '[class.coar-checkbox--xs]': 'size() === "xs"',
    '[class.coar-checkbox--s]': 'size() === "s"',
    '[class.coar-checkbox--m]': 'size() === "m"',
    '[class.coar-checkbox--l]': 'size() === "l"',
    '[class.coar-checkbox--disabled]': 'isDisabled()',
    '[class.coar-checkbox--readonly]': 'readonly()',
    '[class.coar-checkbox--error]': 'hasError()',
  },
})
export class CoarCheckboxComponent extends CoarControlValueAccessor<boolean | undefined> {
  /** Label text displayed next to the checkbox */
  label = input<string>('');

  /**
   * Checkbox checked state: true for checked, false for unchecked, undefined for pristine.
   * Using model() for two-way binding support.
   */
  checked = model<boolean | undefined>(undefined);

  /**
   * Sets the checkbox to indeterminate state (visual only).
   * Typically used for "select all" checkboxes when some children are selected.
   * The indeterminate state is cleared when the user clicks the checkbox.
   */
  indeterminate = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Disables the checkbox (greyed out, not focusable) */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Prevents changes but keeps normal appearance and focus */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Marks as required, shows asterisk on label */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error message to display below the checkbox */
  error = input<string>('');

  /** Hint text displayed below the checkbox */
  hint = input<string>('');

  /** Checkbox size - matches input/button heights for consistent layouts */
  size = input<CoarCheckboxSize>('m');

  /** HTML id attribute for the checkbox element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** Value submitted with form when checked */
  value = input<string>('');

  // Note: checkedChange output is implicitly provided by the model() declaration above.
  // Use [(checked)] for two-way binding or (checkedChange) to listen for changes.

  protected isFocused = signal(false);
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('checkboxElement');

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected isChecked = computed(() => this.checked() === true);
  protected isIndeterminate = computed(() => this.indeterminate());
  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  private readonly autoId = `coar-checkbox-${cryptoRandomId()}`;
  protected inputId = computed(() => this.id() || this.autoId);
  protected messageId = computed(() => `${this.inputId()}-message`);

  constructor() {
    super();
    // Set indeterminate state on native input element
    effect(() => {
      const inputEl = this.inputRef()?.nativeElement;
      if (inputEl) {
        inputEl.indeterminate = this.isIndeterminate();
      }
    });
  }

  public writeValue(value: boolean | undefined | null): void {
    this.checked.set(value ?? undefined);
  }

  protected onChange(event: Event): void {
    if (this.readonly()) {
      event.preventDefault();
      const target = event.target as HTMLInputElement;
      target.checked = this.isChecked();
      return;
    }

    const target = event.target as HTMLInputElement;
    const newState = target.checked;

    this.checked.set(newState); // This also emits through the implicit checkedChange output
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
