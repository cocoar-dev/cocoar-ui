import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { of } from 'rxjs';

import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui-overlay';
import { CoarLocalizationService, CoarLocalizationDataStore } from '@cocoar/localization';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../coar-scrollable-calendar/coar-scrollable-calendar.component';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
import { CoarTimePickerComponent } from '../coar-time-picker/coar-time-picker.component';
import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../forms/coar-control-value-accessor';
import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from '../date/coar-date-marker';
import {
  coarDetectDateFormatPatternFromIntl,
  coarFormatPlainDate,
  coarGetDateSeparatorForPattern,
  coarParsePlainDateFromInput,
  coarTemporalPlainDateToDate,
} from '../date/coar-date-helpers';
import {
  type CoarTimeValue,
  coarDetect12HourFormat,
  coarFormatTime,
  coarRoundMinutesToStep,
} from '../date/coar-time-helpers';

export type CoarDateTimePickerSize = 'xs' | 'sm' | 'md' | 'lg';
export type CoarDateTimePickerMode = 'date' | 'datetime';

/**
 * The value type for the date-time picker.
 *
 * In 'date' mode, returns Temporal.PlainDate.
 * In 'datetime' mode, returns Temporal.PlainDateTime.
 */
export type CoarDateTimePickerValue = Temporal.PlainDate | Temporal.PlainDateTime | null;

/**
 * Date-time picker component with scrollable calendar and optional time selection.
 *
 * Features:
 * - Two-column layout: scrollable calendar on left, month list + time picker on right
 * - Mode selection: 'date' (calendar only) or 'datetime' (calendar + time)
 * - Locale-aware time format (12h/24h auto-detection)
 * - CSS-based virtualization for smooth scrolling through months
 * - Consistent UI in both modes (no layout jumping)
 *
 * @example
 * ```html
 * <!-- Date only mode -->
 * <coar-date-time-picker
 *   mode="date"
 *   [(value)]="selectedDate"
 *   label="Birth Date"
 * />
 *
 * <!-- Date-time mode with 15-minute steps -->
 * <coar-date-time-picker
 *   mode="datetime"
 *   [(value)]="appointmentDateTime"
 *   label="Appointment"
 *   [minuteStep]="15"
 * />
 * ```
 */
@Component({
  selector: 'coar-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarScrollbarDirective,
    CoarTimePickerComponent,
  ],
  templateUrl: './coar-date-time-picker.component.html',
  styleUrl: './coar-date-time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarDateTimePickerComponent)],
  host: {
    '[class.coar-date-time-picker--xs]': 'size() === "xs"',
    '[class.coar-date-time-picker--sm]': 'size() === "sm"',
    '[class.coar-date-time-picker--md]': 'size() === "md"',
    '[class.coar-date-time-picker--lg]': 'size() === "lg"',
    '[class.coar-date-time-picker--disabled]': 'isDisabled()',
    '[class.coar-date-time-picker--readonly]': 'readonly()',
    '[class.coar-date-time-picker--error]': 'hasError()',
    '[class.coar-date-time-picker--open]': 'isOpen()',
  },
})
export class CoarDateTimePickerComponent extends CoarControlValueAccessor<CoarDateTimePickerValue> {
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

  /** Placeholder text when no date/time is selected */
  placeholder = input<string>('');

  /** Size variant */
  size = input<CoarDateTimePickerSize>('md');

  /** Picker mode: 'date' (calendar only) or 'datetime' (calendar + time) */
  mode = input<CoarDateTimePickerMode>('datetime');

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

  /** Minimum selectable date/datetime */
  min = input<Temporal.PlainDate | Temporal.PlainDateTime | null>(null);

  /** Maximum selectable date/datetime */
  max = input<Temporal.PlainDate | Temporal.PlainDateTime | null>(null);

  /**
   * Locale identifier for date/time formatting (e.g., 'de-AT', 'en-US').
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

  /** Whether to highlight weekend days */
  highlightWeekends = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Date markers for highlighting special dates */
  markers = input<CoarDateMarker[]>([]);

  /** Whether to show a clear button when a value is selected */
  clearable = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === '' ? true : booleanAttribute(v)),
  });

  /**
   * Whether to use 24-hour time format.
   * - true: Always use 24h format
   * - false: Always use 12h format with AM/PM
   * - 'auto': Detect from locale (default)
   */
  use24Hour = input<boolean | 'auto'>('auto');

  /** Step interval for minute selection (1, 5, 10, or 15) */
  minuteStep = input<1 | 5 | 10 | 15>(5);

  /**
   * Default time to use when selecting a date without existing time.
   * Only used in 'datetime' mode.
   */
  defaultTime = input<CoarTimeValue>({ hours: 9, minutes: 0 });

  /**
   * Minimum year in the year stepper.
   * Default: current year - 100
   */
  minYear = input<number>(Temporal.Now.plainDateISO().year - 100);

  /**
   * Maximum year in the year stepper.
   * Default: current year + 50
   */
  maxYear = input<number>(Temporal.Now.plainDateISO().year + 50);

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current selected value (two-way bindable with [(value)]) */
  value = model<CoarDateTimePickerValue>(null);

  /** Emitted when the selected value changes */
  valueChange = output<CoarDateTimePickerValue>();

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
  private readonly uid = `coar-date-time-picker-${CoarDateTimePickerComponent.nextId++}`;

  /** Maskito instance for input masking */
  private maskitoInstance?: Maskito;

  /** ID for the label element */
  protected labelId = computed(() => `${this.uid}-label`);

  /** ID for the input element */
  protected inputId = computed(() => `${this.uid}-input`);

  /** ID for the panel */
  protected panelId = computed(() => `${this.uid}-panel`);

  /** Whether the panel is open */
  protected isOpen = signal(false);

  /** Panel position (determined before opening) */
  protected panelPosition = signal<'top' | 'bottom'>('bottom');

  /** Display value for the input field */
  protected displayValue = signal('');

  /** Currently visible month in the calendar (synced with month list) */
  protected activeMonth = signal<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth()
  );

  /** Pending time value (stored until a date is selected) */
  protected pendingTime = signal<CoarTimeValue | null>(null);

  /** Reference to the input element */
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Reference to the trigger element */
  protected triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  /** Reference to the panel template */
  protected panelTemplateRef = viewChild<TemplateRef<unknown>>('panelTemplate');

  /** Reference to the scrollable calendar */
  protected scrollableCalendarRef = viewChild(CoarScrollableCalendarComponent);

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Effective date format configuration.
   */
  protected effectiveDateFormat = computed((): DateFormatConfig => {
    const directConfig = this.dateFormatConfig();
    if (directConfig) return directConfig;

    const storeLocale = this.locale() ?? this.currentLanguage();
    const localeData = storeLocale
      ? this.localizationDataStore?.getLocaleData(storeLocale)
      : undefined;
    if (localeData?.date) {
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: localeData.date.firstDayOfWeek === 0 ? 7 : 1,
      };
    }

    const locale = this.effectiveLocale();
    const detectedPattern = coarDetectDateFormatPatternFromIntl(locale);
    return { pattern: detectedPattern ?? 'dd.mm.yyyy', firstDayOfWeek: 1 };
  });

  /** Get the date format pattern */
  protected dateFormat = computed(() => this.effectiveDateFormat().pattern);

  /** Get the separator character */
  protected separator = computed(() => coarGetDateSeparatorForPattern(this.dateFormat()));

  /** Get placeholder text based on date format and mode */
  protected inputPlaceholder = computed(() => {
    const datePart = this.dateFormat().toUpperCase();
    if (this.mode() === 'datetime') {
      const use24h = this.effectiveUse24Hour();
      return use24h ? `${datePart} HH:MM` : `${datePart} HH:MM AM/PM`;
    }
    return datePart;
  });

  /** Effective locale */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  /** Whether to use 24-hour time format */
  protected effectiveUse24Hour = computed(() => {
    const setting = this.use24Hour();
    if (setting === true) return true;
    if (setting === false) return false;
    return !coarDetect12HourFormat(this.effectiveLocale());
  });

  /** Whether the picker has an error state */
  protected hasError = computed(() => this.error());

  /** Whether the picker is disabled */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.value() !== null && !this.isDisabled() && !this.readonly();
  });

  /** Extract date portion from value */
  protected selectedDate = computed((): Temporal.PlainDate | null => {
    const val = this.value();
    if (!val) return null;
    if (val instanceof Temporal.PlainDateTime) {
      return val.toPlainDate();
    }
    return val;
  });

  /** Extract time portion from value */
  protected selectedTime = computed((): CoarTimeValue | null => {
    const val = this.value();
    if (!val) return this.pendingTime();
    if (val instanceof Temporal.PlainDateTime) {
      return { hours: val.hour, minutes: val.minute };
    }
    return this.pendingTime();
  });

  /** Min date for calendar constraints */
  protected minDate = computed((): Temporal.PlainDate | null => {
    const val = this.min();
    if (!val) return null;
    if (val instanceof Temporal.PlainDateTime) {
      return val.toPlainDate();
    }
    return val;
  });

  /** Max date for calendar constraints */
  protected maxDate = computed((): Temporal.PlainDate | null => {
    const val = this.max();
    if (!val) return null;
    if (val instanceof Temporal.PlainDateTime) {
      return val.toPlainDate();
    }
    return val;
  });

  /**
   * Direction indicator for the Today button.
   * Returns 'up' if viewing future months, 'down' if viewing past months,
   * or 'hidden' if the current month (today's month) is in view.
   */
  protected todayButtonDirection = computed((): 'up' | 'down' | 'hidden' => {
    const active = this.activeMonth();
    const todayMonth = Temporal.Now.plainDateISO().toPlainYearMonth();
    const comparison = Temporal.PlainYearMonth.compare(active, todayMonth);
    if (comparison === 0) return 'hidden';
    return comparison > 0 ? 'up' : 'down';
  });

  // ============================================================
  // Month List Computed Values
  // ============================================================

  /** Current year from activeMonth */
  protected currentYear = computed(() => this.activeMonth().year);

  /** Current month number from activeMonth (1-12) */
  protected currentMonthNumber = computed(() => this.activeMonth().month);

  /** Whether previous year button is disabled */
  protected isPrevYearDisabled = computed(() => this.currentYear() <= this.minYear());

  /** Whether next year button is disabled */
  protected isNextYearDisabled = computed(() => this.currentYear() >= this.maxYear());

  /** List of month items for display */
  protected monthItems = computed(() => {
    const year = this.currentYear();
    const currentMonth = this.currentMonthNumber();
    const locale = this.effectiveLocale();

    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });

    const items: Array<{
      month: number;
      name: string;
      isActive: boolean;
      yearMonth: Temporal.PlainYearMonth;
    }> = [];

    for (let m = 1; m <= 12; m++) {
      const jsDate = new Date(year, m - 1, 1);
      const name = formatter.format(jsDate);
      const yearMonth = Temporal.PlainYearMonth.from({ year, month: m });

      items.push({
        month: m,
        name,
        isActive: m === currentMonth,
        yearMonth,
      });
    }

    return items;
  });

  // ============================================================
  // Constructor & Lifecycle
  // ============================================================

  constructor() {
    super();

    // Sync display value with selected value
    effect(() => {
      const val = this.value();
      if (val) {
        this.displayValue.set(this.formatValue(val));
      } else {
        this.displayValue.set('');
      }
    });

    // Sync active month with selected date
    effect(() => {
      const date = this.selectedDate();
      if (date) {
        this.activeMonth.set(date.toPlainYearMonth());
      }
    });

    // Keep Maskito config in sync
    effect(() => {
      const inputElement = this.inputRef()?.nativeElement;
      if (!inputElement) return;

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

  /** Open the picker panel */
  openPanel(): void {
    if (this.isDisabled() || this.readonly()) return;
    if (this.overlayRef) return;

    const trigger = this.triggerRef()?.nativeElement;
    const template = this.panelTemplateRef();
    if (!trigger || !template) return;

    const placement = this.resolvePlacement(trigger, this.estimatePanelHeight());
    this.panelPosition.set(placement === 'top' ? 'top' : 'bottom');

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

  /** Close the picker panel */
  closePanel(): void {
    if (!this.isOpen()) return;

    const ref = this.overlayRef;
    this.overlayRef = null;
    ref?.close();

    this.isOpen.set(false);
    this.closed.emit();
  }

  /** Toggle the picker panel */
  togglePanel(): void {
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  /** Clear the selected value */
  clearValue(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.pendingTime.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // Calendar Event Handlers
  // ============================================================

  /** Handle date selection from calendar */
  protected onDateSelected(date: Temporal.PlainDate): void {
    if (this.mode() === 'date') {
      // Date-only mode: set date directly
      this.value.set(date);
      this.valueChange.emit(date);
      this.cvaOnChange(date);
    } else {
      // DateTime mode: combine date with time
      const time = this.selectedTime() ?? this.defaultTime();
      const dateTime = date.toPlainDateTime({
        hour: time.hours,
        minute: coarRoundMinutesToStep(time.minutes, this.minuteStep()),
      });
      this.value.set(dateTime);
      this.valueChange.emit(dateTime);
      this.cvaOnChange(dateTime);
    }
  }

  /** Handle time changes from time picker */
  protected onTimeChanged(time: CoarTimeValue | null): void {
    if (!time) return;

    const currentDate = this.selectedDate();
    if (currentDate) {
      // Have a date - create datetime
      const dateTime = currentDate.toPlainDateTime({
        hour: time.hours,
        minute: time.minutes,
      });
      this.value.set(dateTime);
      this.valueChange.emit(dateTime);
      this.cvaOnChange(dateTime);
    } else {
      // No date yet - store as pending
      this.pendingTime.set(time);
    }
  }

  /** Handle month selection from month list */
  protected onMonthSelected(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
  }

  /** Navigate to previous year */
  protected previousYear(): void {
    if (this.isPrevYearDisabled()) return;
    const current = this.activeMonth();
    this.activeMonth.set(current.subtract({ years: 1 }));
  }

  /** Navigate to next year */
  protected nextYear(): void {
    if (this.isNextYearDisabled()) return;
    const current = this.activeMonth();
    this.activeMonth.set(current.add({ years: 1 }));
  }

  /** Select a month from the list */
  protected selectMonth(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
    this.scrollableCalendarRef()?.scrollToMonth(yearMonth, true);
  }

  /** Handle Today button click */
  protected selectToday(): void {
    const today = Temporal.Now.plainDateISO();
    this.onDateSelected(today);
  }

  /** Scroll to today's date without selecting it */
  protected scrollToToday(): void {
    const today = Temporal.Now.plainDateISO();
    const yearMonth = today.toPlainYearMonth();
    this.activeMonth.set(yearMonth);
    this.scrollableCalendarRef()?.scrollToMonth(yearMonth, true);
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: CoarDateTimePickerValue | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
      this.pendingTime.set(null);
    } else if (typeof value === 'string') {
      // Parse ISO string
      try {
        if (value.includes('T')) {
          this.value.set(Temporal.PlainDateTime.from(value));
        } else {
          this.value.set(Temporal.PlainDate.from(value));
        }
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
    this.togglePanel();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    this.displayValue.set(text);

    const parsed = this.parseValueFromInput(text);
    if (parsed) {
      this.value.set(parsed);
      this.cvaOnTouched();
      this.valueChange.emit(parsed);
    }
  }

  protected onInputBlur(): void {
    this.cvaOnTouched();

    const currentText = this.displayValue();
    const parsed = this.parseValueFromInput(currentText);

    if (!parsed && currentText.length > 0) {
      // Invalid - reset to current value
      const val = this.value();
      if (val) {
        this.displayValue.set(this.formatValue(val));
      } else {
        this.displayValue.set('');
      }
    }
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private resolvePlacement(trigger: HTMLElement, estimatedPanelHeight: number): Placement {
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const spaceBelow = Math.max(0, viewportHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);

    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  }

  private estimatePanelHeight(): number {
    // Two-column layout is taller than single calendar
    return 400;
  }

  private formatValue(val: CoarDateTimePickerValue): string {
    if (!val) return '';

    if (val instanceof Temporal.PlainDateTime) {
      const datePart = coarFormatPlainDate(val.toPlainDate(), this.dateFormat());
      const timePart = coarFormatTime(val.hour, val.minute, this.effectiveUse24Hour());
      return `${datePart} ${timePart}`;
    }

    return coarFormatPlainDate(val, this.dateFormat());
  }

  private parseValueFromInput(text: string): CoarDateTimePickerValue {
    if (!text) return null;

    if (this.mode() === 'date') {
      return coarParsePlainDateFromInput(text, this.dateFormat(), {
        min: this.minDate(),
        max: this.maxDate(),
      });
    }

    // DateTime mode: try to parse date and time
    // Format: "DD.MM.YYYY HH:MM" or "DD.MM.YYYY HH:MM AM/PM"
    const parts = text.split(' ');
    if (parts.length < 2) return null;

    const datePart = parts[0];
    const date = coarParsePlainDateFromInput(datePart, this.dateFormat(), {
      min: this.minDate(),
      max: this.maxDate(),
    });

    if (!date) return null;

    // Parse time part
    const timePart = parts.slice(1).join(' ');
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3]?.toUpperCase();

    if (period) {
      // 12-hour format
      if (hours < 1 || hours > 12) return null;
      if (period === 'AM') {
        hours = hours === 12 ? 0 : hours;
      } else {
        hours = hours === 12 ? 12 : hours + 12;
      }
    } else {
      // 24-hour format
      if (hours < 0 || hours > 23) return null;
    }

    if (minutes < 0 || minutes > 59) return null;

    return date.toPlainDateTime({ hour: hours, minute: minutes });
  }

  private initializeMaskito(inputElement: HTMLInputElement): void {
    const format = this.dateFormat();
    const separator = this.separator();

    const modeMap: Record<DateFormatConfig['pattern'], 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy/mm/dd'> =
      {
        'dd.mm.yyyy': 'dd/mm/yyyy',
        'dd/mm/yyyy': 'dd/mm/yyyy',
        'mm/dd/yyyy': 'mm/dd/yyyy',
        'yyyy-mm-dd': 'yyyy/mm/dd',
      };

    const minDate = this.minDate();
    const maxDate = this.maxDate();

    // For datetime mode, we only mask the date part
    // Time is handled separately or as plain text
    const options = maskitoDateOptionsGenerator({
      mode: modeMap[format],
      separator,
      min: minDate ? coarTemporalPlainDateToDate(minDate) : undefined,
      max: maxDate ? coarTemporalPlainDateToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }
}
