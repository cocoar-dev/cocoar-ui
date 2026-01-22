import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  booleanAttribute,
  DestroyRef,
  TemplateRef,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui-overlay';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarMiniCalendarComponent } from '../coar-mini-calendar/coar-mini-calendar.component';
import {
  coarProvideValueAccessor,
  CoarControlValueAccessor,
} from '../forms/coar-control-value-accessor';
import { CoarLocalizationService, CoarLocalizationDataStore } from '@cocoar/localization';
import { of } from 'rxjs';

import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from './coar-date-picker.models';
import {
  coarDetectDateFormatPatternFromIntl,
  coarFormatPlainDate,
  coarGetDateSeparatorForPattern,
  coarParsePlainDateFromInput,
  coarTemporalPlainDateToDate,
} from '../date/coar-date-helpers';

export type CoarDatePickerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Date picker component using Temporal API.
 *
 * Supports Temporal.PlainDate values for timezone-independent date selection.
 * Uses ISO string format internally for forms compatibility.
 *
 * @example
 * ```html
 * <coar-date-picker
 *   label="Birth Date"
 *   [(value)]="birthDate"
 *   placeholder="Select date..."
 * />
 * ```
 */
@Component({
  selector: 'coar-date-picker',
  standalone: true,
  imports: [FormsModule, CoarIconComponent, CoarMiniCalendarComponent],
  templateUrl: './coar-date-picker.component.html',
  styleUrl: './coar-date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarDatePickerComponent)],
  host: {
    '[class.coar-date-picker--xs]': 'size() === "xs"',
    '[class.coar-date-picker--sm]': 'size() === "sm"',
    '[class.coar-date-picker--md]': 'size() === "md"',
    '[class.coar-date-picker--lg]': 'size() === "lg"',
    '[class.coar-date-picker--disabled]': 'isDisabled()',
    '[class.coar-date-picker--readonly]': 'readonly()',
    '[class.coar-date-picker--error]': 'hasError()',
    '[class.coar-date-picker--open]': 'isOpen()',
  },
})
export class CoarDatePickerComponent extends CoarControlValueAccessor<Temporal.PlainDate | null> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayBuilder = createOverlayBuilder();
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });
  private readonly localizationDataStore = inject(CoarLocalizationDataStore, { optional: true });

  private overlayRef: OverlayRef | null = null;

  /** Current language from localization service (reactive) */
  private readonly currentLanguage = toSignal(
    this.localizationService?.languageState.value$ ?? of(''),
    {
      initialValue: this.localizationService?.languageState.value ?? '',
    }
  );

  // ============================================================
  // Inputs
  // ============================================================

  /** Label text displayed above the input */
  label = input<string>('');

  /** Placeholder text when no date is selected */
  placeholder = input<string>('Select date...');

  /** Size variant */
  size = input<CoarDatePickerSize>('md');

  /** Whether the picker is readonly */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the picker is disabled */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the field is required */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error state */
  error = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Helper or error message */
  message = input<string>('');

  /** Minimum selectable date */
  min = input<Temporal.PlainDate | null>(null);

  /** Maximum selectable date */
  max = input<Temporal.PlainDate | null>(null);

  /**
   * Locale identifier for date formatting (e.g., 'de-AT', 'en-US').
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /**
   * Date format configuration (pattern and first day of week).
   * If not provided, uses locale service default or falls back to European format.
   */
  dateFormatConfig = input<DateFormatConfig>();

  /** Whether to show a "Today" button */
  showTodayButton = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether to show week numbers */
  showWeekNumbers = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether to highlight weekend days (Saturday/Sunday) with a subtle background */
  highlightWeekends = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Date markers for highlighting special dates (holidays, events, etc.) */
  markers = input<CoarDateMarker[]>([]);

  /** Whether to show a clear button when a date is selected (default: true for backward compatibility) */
  clearable = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === '' ? true : booleanAttribute(v)),
  });

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current selected date (two-way bindable with [(value)]) */
  value = model<Temporal.PlainDate | null>(null);

  /** Emitted when the selected date changes */
  valueChange = output<Temporal.PlainDate | null>();

  /** Emitted when the picker opens */
  opened = output<void>();

  /** Emitted when the picker closes */
  closed = output<void>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Unique ID counter for component instances */
  private static nextId = 0;

  /** Unique ID for this component instance */
  private readonly uid = `coar-date-picker-${CoarDatePickerComponent.nextId++}`;

  /** Maskito instance for input masking */
  private maskitoInstance?: Maskito;

  /** ID for the label element */
  protected labelId = computed(() => `${this.uid}-label`);

  /** ID for the input element */
  protected inputId = computed(() => `${this.uid}-input`);

  /** ID for the calendar dropdown */
  protected calendarId = computed(() => `${this.uid}-calendar`);

  /** Whether the calendar dropdown is open */
  protected isOpen = signal(false);

  /** Calendar dropdown position (chosen before opening) */
  protected calendarPosition = signal<'top' | 'bottom'>('bottom');

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.value() !== null && !this.isDisabled() && !this.readonly();
  });

  /** Display value for the input field */
  protected displayValue = signal('');

  /** Reference to the input element */
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Reference to the trigger element */
  protected triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  /** Reference to the calendar template (rendered via @cocoar/ui-overlay) */
  protected calendarTemplateRef = viewChild<TemplateRef<unknown>>('calendarTemplate');

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Effective date format configuration.
   * Priority: input dateFormatConfig > localization service > browser Intl detection > fallback
   */
  protected effectiveDateFormat = computed((): DateFormatConfig => {
    // 1. Direct config input takes highest priority
    const directConfig = this.dateFormatConfig();
    if (directConfig) {
      return directConfig;
    }

    // 2. Try to get from localization data store using the language key
    // The store uses language codes ('en', 'de') not full locales ('en-GB')
    // Read dataVersion to establish signal dependency for async loading
    const _version = this.localizationDataStore?.dataVersion();
    const language = this.currentLanguage();
    const localeData = language ? this.localizationDataStore?.getLocaleData(language) : undefined;
    if (localeData?.date) {
      // Convert 0-6 (Sun-Sat) format to ISO 1-7 (Mon-Sun) format
      const isoFirstDay = localeData.date.firstDayOfWeek === 0 ? 7 : localeData.date.firstDayOfWeek;
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: isoFirstDay as 1 | 7,
      };
    }

    // 3. Fallback to Intl detection (for components without localization service)
    const locale = this.effectiveLocale();
    const detectedPattern = coarDetectDateFormatPatternFromIntl(locale);
    return { pattern: detectedPattern ?? 'dd.mm.yyyy', firstDayOfWeek: 1 };
  });

  /** Get the date format pattern */
  protected dateFormat = computed(() => this.effectiveDateFormat().pattern);

  /** Get the first day of week */
  protected firstDayOfWeek = computed(() => this.effectiveDateFormat().firstDayOfWeek);

  /** Get the separator character for the current date format */
  protected separator = computed(() => {
    return coarGetDateSeparatorForPattern(this.dateFormat());
  });

  /** Get placeholder text based on date format */
  protected inputPlaceholder = computed(() => {
    return this.dateFormat().toUpperCase();
  });

  /**
   * Effective locale for calendar month/year display.
   * Priority: input locale > locale service language > browser locale
   */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  /** Whether the picker has an error state */
  protected hasError = computed(() => this.error());

  /** Whether the picker is disabled */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // ============================================================
  // Constructor & Lifecycle
  // ============================================================

  constructor() {
    super();

    // Sync view date and display value with selected value
    effect(() => {
      const val = this.value();
      if (val) {
        this.displayValue.set(coarFormatPlainDate(val, this.dateFormat()));
      } else {
        this.displayValue.set('');
      }
    });

    // Keep Maskito config in sync with date format + constraints.
    effect(() => {
      const inputElement = this.inputRef()?.nativeElement;
      if (!inputElement) {
        return;
      }

      this.maskitoInstance?.destroy();
      this.initializeMaskito(inputElement);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.maskitoInstance?.destroy();
      this.overlayRef?.close();
      this.overlayRef = null;
    });
  }

  // ============================================================
  // Public Methods
  // ============================================================

  /** Open the calendar dropdown */
  openCalendar(): void {
    if (this.isDisabled() || this.readonly()) return;
    if (this.overlayRef) return;

    const trigger = this.triggerRef()?.nativeElement;
    const template = this.calendarTemplateRef();
    if (!trigger || !template) return;

    const placement = this.resolvePlacement(trigger, this.estimatePanelHeight());
    this.calendarPosition.set(placement === 'top' ? 'top' : 'bottom');

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position({
        placement: placement === 'top' ? 'top-end' : 'bottom-end',
        offset: 4,
        flip: false,
        shift: false,
      })
      .scroll({ strategy: 'reposition' })
      .dismiss({ outsideClick: true, escapeKey: true })
      .size({ mode: 'content' })
      .fromTemplate(template)
      .open({});
    this.overlayRef = ref;

    this.isOpen.set(true);

    this.opened.emit();

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.isOpen.set(false);
      this.closed.emit();
    });
  }

  /** Close the calendar dropdown */
  closeCalendar(): void {
    if (!this.isOpen()) return;

    const ref = this.overlayRef;
    this.overlayRef = null;
    ref?.close();

    this.isOpen.set(false);
    this.closed.emit();
  }

  /** Toggle the calendar dropdown */
  toggleCalendar(): void {
    if (this.isOpen()) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  protected onMiniCalendarValueChange(date: Temporal.PlainDate | null): void {
    if (!date) return;
    if (this.isDateDisabled(date)) return;

    this.value.set(date);
    this.valueChange.emit(date);
    this.cvaOnChange(date);
    // Calendar stays open - closes via click outside, Tab, or Escape
  }

  /** Clear the selected date */
  clearDate(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: Temporal.PlainDate | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
    } else if (typeof value === 'string') {
      // Parse ISO string
      try {
        this.value.set(Temporal.PlainDate.from(value));
      } catch {
        this.value.set(null);
      }
    } else {
      this.value.set(value);
    }
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  protected onTriggerClick(): void {
    this.toggleCalendar();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.openCalendar();
    }
  }

  private resolvePlacement(trigger: HTMLElement, estimatedPanelHeight: number): Placement {
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const spaceBelow = Math.max(0, viewportHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);

    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  }

  private estimatePanelHeight(): number {
    const headerHeight = 56;
    const weekdayHeight = 28;
    const gridHeight = 6 * 36;
    const footerHeight = this.showTodayButton() ? 48 : 0;
    const padding = 32;
    const border = 2;

    return headerHeight + weekdayHeight + gridHeight + footerHeight + padding + border;
  }

  /**
   * Handle input changes from typed or pasted date values.
   *
   * Parses the masked input and updates the value if valid.
   * Invalid or incomplete dates do not update the model.
   */
  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;

    // Update display value signal (for syncing)
    this.displayValue.set(text);

    // Try to parse the date
    const parsed = this.parseDateFromInput(text);
    if (parsed) {
      this.value.set(parsed);
      this.cvaOnTouched();
      this.valueChange.emit(parsed);
    }
  }

  /**
   * Handle blur on the input field.
   *
   * If the input contains an invalid date, reset to the current value.
   */
  protected onInputBlur(): void {
    this.cvaOnTouched();

    const currentText = this.displayValue();
    const parsed = this.parseDateFromInput(currentText);

    if (!parsed && currentText.length > 0) {
      // Invalid date entered - reset to current value or clear
      const val = this.value();
      if (val) {
        this.displayValue.set(coarFormatPlainDate(val, this.dateFormat()));
      } else {
        this.displayValue.set('');
      }
    }
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  /**
   * Initialize Maskito for date input masking.
   *
   * Uses maskitoDateOptionsGenerator with the configured date format
   * to provide automatic formatting and validation while typing.
   */
  private initializeMaskito(inputElement: HTMLInputElement): void {
    const format = this.dateFormat();
    const separator = this.separator();

    // Convert our format to Maskito's mode format
    const modeMap: Record<DateFormatConfig['pattern'], 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy/mm/dd'> =
      {
        'dd.mm.yyyy': 'dd/mm/yyyy',
        'dd/mm/yyyy': 'dd/mm/yyyy',
        'mm/dd/yyyy': 'mm/dd/yyyy',
        'yyyy-mm-dd': 'yyyy/mm/dd',
      };

    const minDate = this.min();
    const maxDate = this.max();

    const options = maskitoDateOptionsGenerator({
      mode: modeMap[format],
      separator,
      min: minDate ? coarTemporalPlainDateToDate(minDate) : undefined,
      max: maxDate ? coarTemporalPlainDateToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }

  /**
   * Parse a date string in the configured format to Temporal.PlainDate.
   * Returns null if the string is incomplete or invalid.
   */
  private parseDateFromInput(text: string): Temporal.PlainDate | null {
    return coarParsePlainDateFromInput(text, this.dateFormat(), {
      min: this.min(),
      max: this.max(),
    });
  }

  private isDateDisabled(date: Temporal.PlainDate): boolean {
    const minDate = this.min();
    const maxDate = this.max();

    if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) {
      return true;
    }
    if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) {
      return true;
    }
    return false;
  }
}
