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
  afterNextRender,
  TemplateRef,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarPopoverComponent } from '../coar-popover/coar-popover.component';
import { CoarPopoverGroupService } from '../coar-popover/coar-popover-group.service';
import {
  coarProvideValueAccessor,
  CoarControlValueAccessor,
} from '../forms/coar-control-value-accessor';
import { CoarLocalizationService, CoarLocalizationDataStore } from '@cocoar/localization';

/** Configuration for date formatting */
export interface DateFormatConfig {
  /** Date format pattern: 'dd.mm.yyyy', 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd' */
  readonly pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  /** First day of week: 1 = Monday, 7 = Sunday */
  readonly firstDayOfWeek: 1 | 7;
}
import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui-overlay';

export type CoarDatePickerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Represents a date marker for highlighting special dates (holidays, events, etc.)
 * Supports single dates or date ranges.
 */
export interface CoarDateMarker {
  /** Start date of the marker (or single date if no endDate) */
  startDate: Temporal.PlainDate;
  /** Optional end date for date ranges (inclusive) */
  endDate?: Temporal.PlainDate;
  /** Description shown as tooltip on hover */
  description: string;
  /** Optional custom CSS class for styling different marker types */
  cssClass?: string;
}

/**
 * Generate localized weekday names using Intl.DateTimeFormat.
 * Uses a reference week (Jan 2024 starts on Monday) for consistent day mapping.
 */
function getLocalizedWeekdays(locale: string, firstDayOfWeek: 1 | 7): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // Jan 1, 2024 is a Monday - use this as reference for day mapping
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    // Start from Monday (Jan 1) and go through the week
    const date = new Date(2024, 0, 1 + i);
    weekdays.push(formatter.format(date));
  }
  // weekdays is now [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  if (firstDayOfWeek === 7) {
    // Rotate to start with Sunday
    const sunday = weekdays.pop();
    if (sunday) {
      weekdays.unshift(sunday);
    }
  }
  return weekdays;
}

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
  imports: [FormsModule, CoarIconComponent, CoarPopoverComponent],
  templateUrl: './coar-date-picker.component.html',
  styleUrl: './coar-date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarDatePickerComponent), CoarPopoverGroupService],
  host: {
    '[class.coar-date-picker--xs]': 'size() === "xs"',
    '[class.coar-date-picker--sm]': 'size() === "sm"',
    '[class.coar-date-picker--md]': 'size() === "md"',
    '[class.coar-date-picker--lg]': 'size() === "lg"',
    '[class.coar-date-picker--disabled]': 'isDisabled()',
    '[class.coar-date-picker--readonly]': 'readonly()',
    '[class.coar-date-picker--error]': 'hasError()',
    '[class.coar-date-picker--open]': 'isOpen()',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class CoarDatePickerComponent extends CoarControlValueAccessor<Temporal.PlainDate | null> {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayBuilder = createOverlayBuilder();
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });
  private readonly localizationDataStore = inject(CoarLocalizationDataStore, { optional: true });

  private overlayRef: OverlayRef | null = null;

  /** Current language from localization service (reactive) */
  private readonly currentLanguage = computed(() => {
    // Use the language Signal from service if available, otherwise undefined
    const lang = this.localizationService?.language();
    console.debug('[CoarDatePicker] currentLanguage computed:', lang);
    return lang;
  });

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

  // ============================================================
  // Marker Popover Rendering
  // ============================================================

  /** Maximum number of lines shown in the marker popover (including "+N" line). */
  protected readonly markerPopoverMaxLines = 5;

  /**
   * Visible markers before switching to "+N other events".
   * With a max of 5 lines, we show 4 markers + one summary line.
   */
  protected readonly markerPopoverVisibleMarkers = 4;

  protected getVisibleMarkers(markers: CoarDateMarker[]): CoarDateMarker[] {
    if (markers.length <= this.markerPopoverMaxLines) {
      return markers;
    }
    return markers.slice(0, this.markerPopoverVisibleMarkers);
  }

  protected getHiddenMarkerCount(markers: CoarDateMarker[]): number {
    if (markers.length <= this.markerPopoverMaxLines) {
      return 0;
    }
    return Math.max(0, markers.length - this.markerPopoverVisibleMarkers);
  }

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

  /** Currently viewed month/year in the calendar */
  protected viewDate = signal<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth()
  );

  /** Focused date in the calendar (for keyboard navigation) */
  protected focusedDate = signal<Temporal.PlainDate | null>(null);

  /** Display value for the input field */
  protected displayValue = signal('');

  /** Days of week header (localized based on locale and firstDayOfWeek) */
  protected daysOfWeek = computed(() => {
    const locale = this.effectiveLocale();
    const firstDay = this.firstDayOfWeek();
    const days = getLocalizedWeekdays(locale, firstDay);
    console.debug(
      '[CoarDatePicker] daysOfWeek - locale:',
      locale,
      'firstDay:',
      firstDay,
      'days:',
      days
    );
    return days;
  });

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

    // 2. Try to get from localization data store (which uses Intl with proper firstDayOfWeek detection)
    const currentLang = this.localizationService?.getCurrentLanguage();
    const localeData = currentLang
      ? this.localizationDataStore?.getLocaleData(currentLang)
      : undefined;
    if (localeData?.date) {
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: localeData.date.firstDayOfWeek === 0 ? 7 : 1, // Convert 0=Sunday to 7, keep 1=Monday
      };
    }

    // 3. Fallback to Intl detection (for components without localization service)
    const locale = this.effectiveLocale();
    try {
      const formatter = new Intl.DateTimeFormat(locale);
      const parts = formatter.formatToParts(new Date(2024, 0, 15));
      const dayIndex = parts.findIndex((p) => p.type === 'day');
      const monthIndex = parts.findIndex((p) => p.type === 'month');
      const yearIndex = parts.findIndex((p) => p.type === 'year');

      let pattern: DateFormatConfig['pattern'] = 'dd.mm.yyyy';
      if (dayIndex < monthIndex && monthIndex < yearIndex) pattern = 'dd.mm.yyyy';
      else if (monthIndex < dayIndex && dayIndex < yearIndex) pattern = 'mm/dd/yyyy';
      else if (yearIndex < monthIndex && monthIndex < dayIndex) pattern = 'yyyy-mm-dd';

      return { pattern, firstDayOfWeek: 1 };
    } catch {
      // 4. Final fallback
      return { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
    }
  });

  /** Get the date format pattern */
  protected dateFormat = computed(() => this.effectiveDateFormat().pattern);

  /** Get the first day of week */
  protected firstDayOfWeek = computed(() => this.effectiveDateFormat().firstDayOfWeek);

  /** Get the separator character for the current date format */
  protected separator = computed(() => {
    const format = this.dateFormat();
    if (format.includes('.')) return '.';
    if (format.includes('/')) return '/';
    return '-';
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
    const localeInput = this.locale();
    const currentLang = this.currentLanguage();
    const effective = localeInput ?? currentLang ?? navigator.language;
    console.debug(
      '[CoarDatePicker] effectiveLocale - input:',
      localeInput,
      'currentLang:',
      currentLang,
      'effective:',
      effective
    );
    return effective;
  });

  /** Whether the picker has an error state */
  protected hasError = computed(() => this.error());

  /** Whether the picker is disabled */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Calendar grid for current view month */
  protected calendarDays = computed(() => {
    const viewMonth = this.viewDate();
    const firstDay = viewMonth.toPlainDate({ day: 1 });
    const daysInMonth = viewMonth.daysInMonth;

    // Find what day of week the month starts on (1 = Monday, 7 = Sunday in Temporal)
    const startDayOfWeek = firstDay.dayOfWeek;
    const firstDayOfWeekSetting = this.firstDayOfWeek();

    // Calculate days from previous month to show
    // If firstDayOfWeek is 1 (Monday): offset from Monday
    // If firstDayOfWeek is 7 (Sunday): offset from Sunday
    let daysFromPrevMonth: number;
    if (firstDayOfWeekSetting === 1) {
      // Monday first: Monday=0, Tuesday=1, ..., Sunday=6
      daysFromPrevMonth = (startDayOfWeek - 1 + 7) % 7;
    } else {
      // Sunday first: Sunday=0, Monday=1, ..., Saturday=6
      // Temporal uses: Sunday=7, so we convert
      daysFromPrevMonth = startDayOfWeek % 7;
    }

    const days: CalendarDay[] = [];

    // Previous month days
    if (daysFromPrevMonth > 0) {
      const prevMonth = viewMonth.subtract({ months: 1 });
      const prevMonthDays = prevMonth.daysInMonth;
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const day = prevMonth.toPlainDate({ day: prevMonthDays - i });
        days.push(this.createCalendarDay(day, true));
      }
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const day = viewMonth.toPlainDate({ day: d });
      days.push(this.createCalendarDay(day, false));
    }

    // Next month days to fill the grid (6 rows * 7 days = 42)
    const remainingDays = 42 - days.length;
    const nextMonth = viewMonth.add({ months: 1 });
    for (let d = 1; d <= remainingDays; d++) {
      const day = nextMonth.toPlainDate({ day: d });
      days.push(this.createCalendarDay(day, true));
    }

    return days;
  });

  /** Month name for calendar header */
  protected viewMonth = computed(() => {
    const viewMonth = this.viewDate();
    const locale = this.effectiveLocale();
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    });
    const jsDate = new Date(viewMonth.year, viewMonth.month - 1, 1);
    const monthName = formatter.format(jsDate);
    console.debug(
      '[CoarDatePicker] viewMonth - locale:',
      locale,
      'month:',
      viewMonth.month,
      'name:',
      monthName
    );
    return monthName;
  });

  /** Year for calendar header */
  protected viewYear = computed(() => {
    return this.viewDate().year;
  });

  /** Week numbers for each row (6 rows) */
  protected weekNumbers = computed(() => {
    const days = this.calendarDays();
    const weeks: number[] = [];

    // Get the first day of each week (every 7 days)
    for (let i = 0; i < 6; i++) {
      const firstDayOfWeek = days[i * 7];
      if (firstDayOfWeek) {
        // weekOfYear may be undefined in some Temporal implementations
        const weekNum =
          firstDayOfWeek.date.weekOfYear ?? this.calculateISOWeek(firstDayOfWeek.date);
        weeks.push(weekNum);
      }
    }

    return weeks;
  });

  /** Today's date */
  protected today = Temporal.Now.plainDateISO();

  // ============================================================
  // Constructor & Lifecycle
  // ============================================================

  constructor() {
    super();

    // Sync view date and display value with selected value
    effect(() => {
      const val = this.value();
      if (val) {
        this.displayValue.set(this.formatDateForDisplay(val));
        if (!this.isOpen()) {
          this.viewDate.set(val.toPlainYearMonth());
        }
      } else {
        this.displayValue.set('');
      }
    });

    // Initialize Maskito after render
    afterNextRender(() => {
      const inputElement = this.inputRef()?.nativeElement;
      if (inputElement) {
        this.initializeMaskito(inputElement);
      }
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

    // Set initial focus date
    const current = this.value() ?? this.today;
    this.focusedDate.set(current);
    this.viewDate.set(current.toPlainYearMonth());

    this.opened.emit();

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.isOpen.set(false);
      this.focusedDate.set(null);
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
    this.focusedDate.set(null);
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

  /** Select a date */
  selectDate(date: Temporal.PlainDate): void {
    if (this.isDateDisabled(date)) return;

    this.value.set(date);
    this.valueChange.emit(date);
    this.cvaOnChange(date);
    // Move keyboard focus to selected date
    this.focusedDate.set(date);
    // Calendar stays open - closes via click outside, Tab, or Escape
  }

  /** Select today's date */
  selectToday(): void {
    this.selectDate(this.today);
  }

  /** Clear the selected date */
  clearDate(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  /** Navigate to previous month */
  previousMonth(): void {
    this.viewDate.update((d) => d.subtract({ months: 1 }));
  }

  /** Navigate to next month */
  nextMonth(): void {
    this.viewDate.update((d) => d.add({ months: 1 }));
  }

  /** Navigate to previous year */
  previousYear(): void {
    this.viewDate.update((d) => d.subtract({ years: 1 }));
  }

  /** Navigate to next year */
  nextYear(): void {
    this.viewDate.update((d) => d.add({ years: 1 }));
  }

  /** Go to today's month */
  goToToday(): void {
    this.viewDate.set(this.today.toPlainYearMonth());
    this.focusedDate.set(this.today);
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

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeCalendar();
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const focused = this.focusedDate();
        if (focused) {
          this.selectDate(focused);
        }
        break;
      }
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocus(-1, 'day');
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocus(1, 'day');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-7, 'day');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(7, 'day');
        break;
      case 'PageUp':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocus(-1, 'year');
        } else {
          this.moveFocus(-1, 'month');
        }
        break;
      case 'PageDown':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocus(1, 'year');
        } else {
          this.moveFocus(1, 'month');
        }
        break;
      case 'Home':
        event.preventDefault();
        this.goToToday();
        break;
    }
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
      this.viewDate.set(parsed.toPlainYearMonth());
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
        this.displayValue.set(this.formatDateForDisplay(val));
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
      min: minDate ? this.temporalToDate(minDate) : undefined,
      max: maxDate ? this.temporalToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }

  /**
   * Convert Temporal.PlainDate to native Date for Maskito compatibility.
   */
  private temporalToDate(temporal: Temporal.PlainDate): Date {
    return new Date(temporal.year, temporal.month - 1, temporal.day);
  }

  /**
   * Calculate ISO week number for a date.
   * ISO weeks start on Monday and week 1 contains the first Thursday of the year.
   */
  private calculateISOWeek(date: Temporal.PlainDate): number {
    const jsDate = this.temporalToDate(date);
    const dayOfWeek = jsDate.getDay() || 7; // Convert Sunday (0) to 7
    // Set to nearest Thursday (ISO week date algorithm)
    jsDate.setDate(jsDate.getDate() + 4 - dayOfWeek);
    const yearStart = new Date(jsDate.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    return Math.ceil(((jsDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Format a Temporal.PlainDate for display according to the configured format.
   */
  private formatDateForDisplay(date: Temporal.PlainDate): string {
    const format = this.dateFormat();
    const sep = this.separator();
    const day = String(date.day).padStart(2, '0');
    const month = String(date.month).padStart(2, '0');
    const year = String(date.year);

    switch (format) {
      case 'dd.mm.yyyy':
      case 'dd/mm/yyyy':
        return `${day}${sep}${month}${sep}${year}`;
      case 'mm/dd/yyyy':
        return `${month}${sep}${day}${sep}${year}`;
      case 'yyyy-mm-dd':
        return `${year}${sep}${month}${sep}${day}`;
      default:
        return `${day}${sep}${month}${sep}${year}`;
    }
  }

  /**
   * Parse a date string in the configured format to Temporal.PlainDate.
   * Returns null if the string is incomplete or invalid.
   */
  private parseDateFromInput(text: string): Temporal.PlainDate | null {
    if (!text) return null;

    const sep = this.separator();
    const parts = text.split(sep);
    if (parts.length !== 3) return null;

    // Check all parts are complete numbers
    if (parts.some((p) => p.length === 0 || !/^\d+$/.test(p))) return null;

    const format = this.dateFormat();
    let year: number, month: number, day: number;

    try {
      switch (format) {
        case 'dd.mm.yyyy':
        case 'dd/mm/yyyy':
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
          break;
        case 'mm/dd/yyyy':
          month = parseInt(parts[0], 10);
          day = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
          break;
        case 'yyyy-mm-dd':
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
          break;
        default:
          return null;
      }

      // Validate ranges before creating Temporal.PlainDate
      if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }

      const date = Temporal.PlainDate.from({ year, month, day });

      // Check against min/max bounds
      const minDate = this.min();
      const maxDate = this.max();
      if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) {
        return null;
      }
      if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) {
        return null;
      }

      return date;
    } catch {
      // Invalid date (e.g., Feb 30)
      return null;
    }
  }

  private createCalendarDay(date: Temporal.PlainDate, isOutsideMonth: boolean): CalendarDay {
    const selected = this.value();
    const focused = this.focusedDate();
    // Temporal dayOfWeek: 1=Monday ... 6=Saturday, 7=Sunday
    const dayOfWeek = date.dayOfWeek;

    const markers = this.getMarkersForDate(date);

    return {
      date,
      day: date.day,
      isOutsideMonth,
      isToday: Temporal.PlainDate.compare(date, this.today) === 0,
      isSelected: selected ? Temporal.PlainDate.compare(date, selected) === 0 : false,
      isFocused: focused ? Temporal.PlainDate.compare(date, focused) === 0 : false,
      isDisabled: this.isDateDisabled(date),
      isWeekend: dayOfWeek === 6 || dayOfWeek === 7,
      markers,
      markerCssClass: markers[0]?.cssClass ?? null,
    };
  }

  /**
   * Find all markers that apply to the given date.
   * Checks if date falls within any marker's range.
   */
  private getMarkersForDate(date: Temporal.PlainDate): CoarDateMarker[] {
    const markers = this.markers();
    const matches: CoarDateMarker[] = [];
    for (const marker of markers) {
      const start = marker.startDate;
      const end = marker.endDate ?? marker.startDate;

      // Check if date is within marker range (inclusive)
      if (
        Temporal.PlainDate.compare(date, start) >= 0 &&
        Temporal.PlainDate.compare(date, end) <= 0
      ) {
        matches.push(marker);
      }
    }
    return matches;
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

  private moveFocus(amount: number, unit: 'day' | 'month' | 'year'): void {
    const current = this.focusedDate() ?? this.value() ?? this.today;
    let newDate: Temporal.PlainDate;

    switch (unit) {
      case 'day':
        newDate = current.add({ days: amount });
        break;
      case 'month':
        newDate = current.add({ months: amount });
        break;
      case 'year':
        newDate = current.add({ years: amount });
        break;
    }

    // Check bounds
    const minDate = this.min();
    const maxDate = this.max();
    if (minDate && Temporal.PlainDate.compare(newDate, minDate) < 0) {
      newDate = minDate;
    }
    if (maxDate && Temporal.PlainDate.compare(newDate, maxDate) > 0) {
      newDate = maxDate;
    }

    this.focusedDate.set(newDate);
    this.viewDate.set(newDate.toPlainYearMonth());
  }
}

/** Internal type for calendar day rendering */
interface CalendarDay {
  date: Temporal.PlainDate;
  day: number;
  isOutsideMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  /** Markers applied to this date (if any) */
  markers: CoarDateMarker[];
  /** Optional CSS class from the first marker for styling */
  markerCssClass: string | null;
}
