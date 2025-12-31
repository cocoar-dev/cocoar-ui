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
  HostListener,
  afterNextRender,
  DestroyRef,
  inject,
  booleanAttribute,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CoarIconComponent, CoarIconSize } from '../coar-icon/coar-icon.component';
import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../forms/coar-control-value-accessor';
import { Maskito } from '@maskito/core';
import { maskitoNumberOptionsGenerator } from '@maskito/kit';
import {
  COAR_LOCALE_SERVICE,
  type ICoarLocaleService as _ICoarLocaleService,
  type NumberFormatConfig,
} from '../services/locale.service';

export type CoarNumberInputSize = 'xs' | 'sm' | 'md' | 'lg';
export type CoarNumberInputStepperButtons = 'none' | 'increment' | 'decrement' | 'both';

/**
 * Transform function for stepperButtons input.
 * Accepts boolean (attribute pattern) or explicit string values.
 * - true | '' (attribute present) → 'both'
 * - false | 'false' → 'none'
 * - 'increment' | 'decrement' | 'both' | 'none' → validated and passed through
 */
function transformStepperButtons(value: boolean | string): CoarNumberInputStepperButtons {
  // Boolean false or string 'false' → no buttons
  if (value === false || value === 'false') return 'none';

  // Boolean true or empty string (attribute present) → both buttons
  if (value === true || value === '' || value === 'true') return 'both';

  // Validate and pass through string values
  if (value === 'increment' || value === 'decrement' || value === 'both' || value === 'none') {
    return value;
  }

  // Invalid value → default to none
  return 'none';
}

@Component({
  selector: 'coar-number-input',
  standalone: true,
  imports: [FormsModule, CoarIconComponent],
  templateUrl: './coar-number-input.component.html',
  styleUrl: './coar-number-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarNumberInputComponent)],
  host: {
    '[class.coar-number-input--xs]': 'size() === "xs"',
    '[class.coar-number-input--sm]': 'size() === "sm"',
    '[class.coar-number-input--md]': 'size() === "md"',
    '[class.coar-number-input--lg]': 'size() === "lg"',
  },
})
export class CoarNumberInputComponent extends CoarControlValueAccessor<number | null> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly localeService = inject(COAR_LOCALE_SERVICE, { optional: true });
  private maskitoInstance?: Maskito;

  /** Label text displayed above the input */
  label = input<string>('');

  /** Placeholder text shown when input is empty */
  placeholder = input<string>('');

  /**
   * Current numeric value.
   * Using model() for two-way binding support.
   */
  value = model<number | null>(null);

  /** Input size - matches button/checkbox sizes for consistent layouts */
  size = input<CoarNumberInputSize>('md');

  /** Minimum allowed value */
  min = input<number | undefined>(undefined);

  /** Maximum allowed value */
  max = input<number | undefined>(undefined);

  /** Step increment for arrows and keyboard */
  step = input<number>(1);

  /** Number of decimal places to display */
  decimals = input<number>(0);

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

  /**
   * Controls visibility of increment/decrement stepper buttons.
   * Supports both boolean attribute pattern and granular string control:
   * - No attribute → no buttons
   * - `stepperButtons` (attribute) → both buttons
   * - `stepperButtons="increment"` → only increment
   * - `stepperButtons="decrement"` → only decrement
   * - `stepperButtons="both"` → both buttons (explicit)
   * - `stepperButtons="none"` → no buttons (explicit)
   */
  stepperButtons = input<CoarNumberInputStepperButtons, boolean | string>('none', {
    transform: transformStepperButtons,
  });

  /** Text or symbol displayed before the input value */
  prefix = input<string>('');

  /** Text or symbol displayed after the input value */
  suffix = input<string>('');

  /**
   * Locale identifier for number formatting (e.g., 'de-AT', 'en-US').
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /**
   * Number format configuration (decimal and thousand separators).
   * If not provided, uses locale service default or falls back to { decimal: '.', thousand: '' }.
   */
  numberFormat = input<NumberFormatConfig>();

  /** HTML id attribute for the input element */
  id = input<string>('');

  /** HTML name attribute for form submission */
  name = input<string>('');

  /** Emits when input value changes */
  valueChange = output<number | null>();

  /** Emits when input loses focus */
  blurred = output<FocusEvent>();

  /** Emits when input gains focus */
  focused = output<FocusEvent>();

  /** Emits when clear button is clicked */
  clear = output<void>();

  protected displayValue = signal<string>('');
  protected isFocused = signal(false);
  protected isDragging = signal(false);
  protected dragStartX = signal(0);
  protected dragStartValue = signal(0);
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected showClearButton = computed(() => {
    // Show clear button when there's a value (dimmed when not focused, prominent when focused)
    return this.clearable() && this.value() !== null && !this.isDisabled() && !this.readonly();
  });

  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  protected inputId = computed(
    () => this.id() || `coar-number-input-${Math.random().toString(36).substr(2, 9)}`
  );
  protected messageId = computed(() => `${this.inputId()}-message`);

  protected iconSize = computed<CoarIconSize>(() => {
    const sizeMap: Record<CoarNumberInputSize, CoarIconSize> = {
      xs: 'xs',
      sm: 'xs',
      md: 'sm',
      lg: 'md',
    };
    return sizeMap[this.size()];
  });

  protected showIncrementButton = computed(() => {
    const mode = this.stepperButtons();
    return mode === 'increment' || mode === 'both';
  });

  protected showDecrementButton = computed(() => {
    const mode = this.stepperButtons();
    return mode === 'decrement' || mode === 'both';
  });

  protected canDecrement = computed(() => {
    const val = this.value();
    const minVal = this.min();
    if (val === null) return true;
    if (minVal === undefined) return true;
    return val > minVal;
  });

  protected canIncrement = computed(() => {
    const val = this.value();
    const maxVal = this.max();
    if (val === null) return true;
    if (maxVal === undefined) return true;
    return val < maxVal;
  });

  constructor() {
    super();
    // Sync displayValue when value changes from outside
    effect(() => {
      const newValue = this.value();
      this.displayValue.set(this.formatValue(newValue));
    });

    // Initialize Maskito for number validation
    afterNextRender(() => {
      const inputElement = this.inputRef()?.nativeElement;
      if (inputElement) {
        this.initializeMaskito(inputElement);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.maskitoInstance?.destroy();
    });
  }

  /**
   * Resolve number format configuration with priority chain:
   * 1. numberFormat input (explicit config object)
   * 2. localeService.getNumberFormat(locale) (service with locale override)
   * 3. localeService.getNumberFormat() (service with default locale)
   * 4. Hardcoded fallback { decimal: '.', thousand: '' }
   */
  private resolveNumberFormat(): NumberFormatConfig {
    // Priority 1: Explicit config object
    const format = this.numberFormat();
    if (format) {
      return format;
    }

    // Priority 2 & 3: Locale service (with optional locale override)
    if (this.localeService) {
      return this.localeService.getNumberFormat(this.locale());
    }

    // Priority 4: Fallback
    return { decimal: '.', thousand: '' };
  }

  private initializeMaskito(inputElement: HTMLInputElement): void {
    const format = this.resolveNumberFormat();

    const maskOptions = maskitoNumberOptionsGenerator({
      decimalSeparator: format.decimal,
      thousandSeparator: format.thousand,
      maximumFractionDigits: this.decimals(),
      min: this.min(),
      max: this.max(),
    });

    this.maskitoInstance = new Maskito(inputElement, maskOptions);
  }

  protected formatValue(value: number | null): string {
    if (value === null) return '';
    const format = this.resolveNumberFormat();
    // Format with locale-specific decimal separator
    const formatted = value.toFixed(this.decimals());
    // Replace period with the configured decimal separator
    return formatted.replace('.', format.decimal);
  }

  /**
   * Parse locale-formatted string (respects component's decimal/thousand separators).
   * Used when user types or pastes into the input field.
   */
  protected parseValue(str: string): number | null {
    if (str.trim() === '') return null;
    const format = this.resolveNumberFormat();
    // Remove thousand separators first (before converting decimal)
    const withoutThousands = format.thousand
      ? str.replace(new RegExp(`\\${format.thousand}`, 'g'), '')
      : str;
    // Replace locale-specific decimal separator with period for parseFloat
    const normalized = withoutThousands.replace(format.decimal, '.');
    const parsed = parseFloat(normalized);
    if (isNaN(parsed)) return null;
    return parsed;
  }

  protected clampValue(value: number): number {
    const minVal = this.min();
    const maxVal = this.max();
    let clamped = value;
    if (minVal !== undefined && clamped < minVal) clamped = minVal;
    if (maxVal !== undefined && clamped > maxVal) clamped = maxVal;
    return clamped;
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.displayValue.set(target.value);
  }

  protected onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focused.emit(event);
  }

  protected onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.commitValue();
    this.cvaOnTouched();
    this.blurred.emit(event);
  }

  protected commitValue(): void {
    const parsed = this.parseValue(this.displayValue());
    if (parsed !== null) {
      const clamped = this.clampValue(parsed);
      const rounded = parseFloat(clamped.toFixed(this.decimals()));
      this.value.set(rounded);
      // Don't reformat - Maskito already has the value formatted correctly
      // this.displayValue.set(this.formatValue(rounded));
      this.valueChange.emit(rounded);
      this.cvaOnChange(rounded);
    } else {
      this.value.set(null);
      this.displayValue.set('');
      this.valueChange.emit(null);
      this.cvaOnChange(null);
    }
  }

  public writeValue(value: number | null): void {
    this.value.set(value);
  }

  protected onClear(): void {
    this.value.set(null);
    this.displayValue.set('');
    this.valueChange.emit(null);
    this.cvaOnChange(null);
    this.clear.emit();
    this.inputRef()?.nativeElement.focus();
  }

  protected onLabelClick(): void {
    this.inputRef()?.nativeElement.focus();
  }

  protected increment(): void {
    if (this.isDisabled() || this.readonly() || !this.canIncrement()) return;
    const current = this.value() ?? 0;
    const newValue = this.clampValue(current + this.step());
    const rounded = parseFloat(newValue.toFixed(this.decimals()));
    this.value.set(rounded);
    this.displayValue.set(this.formatValue(rounded));
    this.valueChange.emit(rounded);
    this.cvaOnChange(rounded);
  }

  protected decrement(): void {
    if (this.isDisabled() || this.readonly() || !this.canDecrement()) return;
    const current = this.value() ?? 0;
    const newValue = this.clampValue(current - this.step());
    const rounded = parseFloat(newValue.toFixed(this.decimals()));
    this.value.set(rounded);
    this.displayValue.set(this.formatValue(rounded));
    this.valueChange.emit(rounded);
    this.cvaOnChange(rounded);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  // Figma-style drag to change value
  protected onDragStart(event: MouseEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    event.preventDefault();
    this.isDragging.set(true);
    this.dragStartX.set(event.clientX);
    this.dragStartValue.set(this.value() ?? 0);
    document.body.style.cursor = 'ew-resize';
  }

  @HostListener('document:mousemove', ['$event'])
  protected onDragMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    const deltaX = event.clientX - this.dragStartX();
    // Sensitivity: 1 step per 10 pixels
    const sensitivity = 10;
    const stepCount = Math.round(deltaX / sensitivity);
    const newValue = this.clampValue(this.dragStartValue() + stepCount * this.step());
    const rounded = parseFloat(newValue.toFixed(this.decimals()));
    this.value.set(rounded);
    this.displayValue.set(this.formatValue(rounded));
    this.valueChange.emit(rounded);
    this.cvaOnChange(rounded);
  }

  @HostListener('document:mouseup')
  protected onDragEnd(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      document.body.style.cursor = '';
    }
  }
}
