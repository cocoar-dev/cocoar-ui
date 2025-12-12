import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';

export type CoarPasswordInputSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'coar-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule, CoarIconComponent],
  templateUrl: './coar-password-input.component.html',
  styleUrl: './coar-password-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-password-input--xs]': 'size() === "xs"',
    '[class.coar-password-input--sm]': 'size() === "sm"',
    '[class.coar-password-input--md]': 'size() === "md"',
    '[class.coar-password-input--lg]': 'size() === "lg"',
  },
})
export class CoarPasswordInputComponent {
  /** Label text displayed above the input */
  label = input<string>('');

  /** Placeholder text shown when input is empty */
  placeholder = input<string>('');

  /**
   * Current password value.
   * Using model() for two-way binding support.
   */
  value = model<string>('');

  /** Input size - matches other form elements for consistent layouts */
  size = input<CoarPasswordInputSize>('md');

  /** Disables the input (greyed out, not focusable) */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Makes the input read-only (focusable but not editable) */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Marks the input as required, shows asterisk on label */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error message to display below the input */
  error = input<string>('');

  /** Hint text displayed below the input */
  hint = input<string>('');

  /** Show clear button when input has value and is focused/hovered */
  clearable = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** HTML id attribute for the input element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** HTML autocomplete attribute for browser autofill */
  autocomplete = input<string>('current-password');

  /** Maximum character length */
  maxlength = input<number | undefined>(undefined);

  /** Emits when password value changes */
  valueChange = output<string>();

  /** Emits when input loses focus */
  blurred = output<FocusEvent>();

  /** Emits when input gains focus */
  focused = output<FocusEvent>();

  /** Emits when clear button is clicked */
  clear = output<void>();

  protected isFocused = signal(false);
  protected showPassword = signal(false);
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  protected inputType = computed(() => (this.showPassword() ? 'text' : 'password'));
  protected toggleIcon = computed(() => (this.showPassword() ? 'eye-open' : 'eye-closed'));
  protected toggleAriaLabel = computed(() =>
    this.showPassword() ? 'Hide password' : 'Show password'
  );

  protected showClearButton = computed(() => {
    // Show clear button when there's a value (dimmed when not focused, prominent when focused)
    return this.clearable() && this.value().length > 0 && !this.disabled() && !this.readonly();
  });

  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  protected inputId = computed(
    () => this.id() || `coar-password-input-${Math.random().toString(36).substr(2, 9)}`
  );
  protected messageId = computed(() => `${this.inputId()}-message`);

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.valueChange.emit(target.value);
  }

  protected onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focused.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.blurred.emit(event);
  }

  protected onClear(): void {
    this.value.set('');
    this.valueChange.emit('');
    this.clear.emit();
    this.inputRef()?.nativeElement.focus();
  }

  protected onLabelClick(): void {
    this.inputRef()?.nativeElement.focus();
  }

  protected togglePasswordVisibility(): void {
    if (!this.disabled() && !this.readonly()) {
      this.showPassword.update((v) => !v);
    }
  }
}
