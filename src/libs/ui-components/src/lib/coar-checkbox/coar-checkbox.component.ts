import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../forms/coar-control-value-accessor';

export type CoarCheckboxSize = 'xs' | 'sm' | 'md' | 'lg';
export type CoarCheckboxState = 'checked' | 'unchecked' | 'indeterminate';

@Component({
  selector: 'coar-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coar-checkbox.component.html',
  styleUrl: './coar-checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarCheckboxComponent)],
  host: {
    '[class.coar-checkbox--xs]': 'size() === "xs"',
    '[class.coar-checkbox--sm]': 'size() === "sm"',
    '[class.coar-checkbox--md]': 'size() === "md"',
    '[class.coar-checkbox--lg]': 'size() === "lg"',
    '[class.coar-checkbox--disabled]': 'isDisabled()',
    '[class.coar-checkbox--readonly]': 'readonly()',
    '[class.coar-checkbox--error]': 'hasError()',
  },
})
export class CoarCheckboxComponent extends CoarControlValueAccessor<CoarCheckboxState | undefined> {
  /** Label text displayed next to the checkbox */
  label = input<string>('');

  /**
   * Checkbox state: 'checked', 'unchecked', 'indeterminate', or undefined (pristine).
   * Using model() for two-way binding support.
   */
  checked = model<CoarCheckboxState | undefined>(undefined);

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
  size = input<CoarCheckboxSize>('md');

  /** HTML id attribute for the checkbox element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** Value submitted with form when checked */
  value = input<string>('');

  /** Emits when state changes: 'checked' or 'unchecked' */
  checkedChange = output<CoarCheckboxState>();

  protected isFocused = signal(false);
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('checkboxElement');

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected isChecked = computed(() => this.checked() === 'checked');
  protected isIndeterminate = computed(() => this.checked() === 'indeterminate');
  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  protected inputId = computed(
    () => this.id() || `coar-checkbox-${Math.random().toString(36).substr(2, 9)}`
  );
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

  public writeValue(value: CoarCheckboxState | undefined | null): void {
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
    const newState: CoarCheckboxState = target.checked ? 'checked' : 'unchecked';

    this.checked.set(newState);
    this.checkedChange.emit(newState);
    this.cvaOnChange(newState);
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.cvaOnTouched();
  }

  protected onLabelClick(): void {
    if (!this.isDisabled()) {
      this.inputRef()?.nativeElement.click();
    }
  }
}
