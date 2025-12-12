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
import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../forms/coar-control-value-accessor';

export type CoarTextInputSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'coar-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule, CoarIconComponent],
  templateUrl: './coar-text-input.component.html',
  styleUrl: './coar-text-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarTextInputComponent)],
  host: {
    '[class.coar-text-input--xs]': 'size() === "xs"',
    '[class.coar-text-input--sm]': 'size() === "sm"',
    '[class.coar-text-input--md]': 'size() === "md"',
    '[class.coar-text-input--lg]': 'size() === "lg"',
    '[class.coar-text-input--multiline]': 'isMultiline()',
  },
})
export class CoarTextInputComponent extends CoarControlValueAccessor<string> {
  /** Label text displayed above the input */
  label = input<string>('');

  /** Placeholder text shown when input is empty */
  placeholder = input<string>('');

  /** Current input value (two-way bindable with [(value)]) */
  value = model<string>('');

  /** Input size - matches button/checkbox sizes for consistent layouts */
  size = input<CoarTextInputSize>('md');

  /** Number of visible text rows (1 = single-line input, 2+ = textarea) */
  rows = input<number>(1);

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

  /** Text or symbol displayed before the input value */
  prefix = input<string>('');

  /** Text or symbol displayed after the input value */
  suffix = input<string>('');

  /** HTML id attribute for the input element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** HTML autocomplete attribute */
  autocomplete = input<string>('');

  /** Maximum character length */
  maxlength = input<number | undefined>(undefined);

  /** Emits when input value changes */
  valueChange = output<string>();

  /** Emits when input loses focus */
  blurred = output<FocusEvent>();

  /** Emits when input gains focus */
  focused = output<FocusEvent>();

  /** Emits when clear button is clicked */
  clear = output<void>();

  protected isFocused = signal(false);
  protected inputRef =
    viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputElement');

  protected isMultiline = computed(() => this.rows() > 1);

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected showClearButton = computed(() => {
    // Show clear button when there's a value (dimmed when not focused, prominent when focused)
    return this.clearable() && this.value().length > 0 && !this.isDisabled() && !this.readonly();
  });

  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  protected inputId = computed(
    () => this.id() || `coar-text-input-${Math.random().toString(36).substr(2, 9)}`
  );
  protected messageId = computed(() => `${this.inputId()}-message`);

  public writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.valueChange.emit(newValue);
    this.onChange(newValue);
  }

  protected onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focused.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blurred.emit(event);
  }

  protected onClear(): void {
    this.value.set('');
    this.valueChange.emit('');
    this.onChange('');
    this.clear.emit();
    this.inputRef()?.nativeElement.focus();
  }

  protected onLabelClick(): void {
    this.inputRef()?.nativeElement.focus();
  }
}
