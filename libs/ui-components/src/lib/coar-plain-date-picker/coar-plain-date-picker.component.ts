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

export type CoarPlainDatePickerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Date picker component with scrollable calendar.
 *
 * Returns strongly-typed `Temporal.PlainDate` values (timezone-independent, date only).
 *
 * Features:
 * - Two-column layout: scrollable calendar on left, month list on right
 * - No time selection (use `coar-plain-date-time-picker` if time is needed)
 * - CSS-based virtualization for smooth scrolling through months
 *
 * @example
 * ```html
 * <coar-plain-date-picker
 *   [(value)]="birthDate"
 *   label="Date of Birth"
 * />
 * ```
 */
@Component({
  selector: 'coar-plain-date-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarScrollbarDirective,
  ],
  templateUrl: './coar-plain-date-picker.component.html',
  styleUrl: './coar-plain-date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarPlainDatePickerComponent)],
  host: {
    '[class.coar-plain-date-picker--xs]': 'size() === "xs"',
    '[class.coar-plain-date-picker--sm]': 'size() === "sm"',
    '[class.coar-plain-date-picker--md]': 'size() === "md"',
    '[class.coar-plain-date-picker--lg]': 'size() === "lg"',
    '[class.coar-plain-date-picker--disabled]': 'isDisabled()',
    '[class.coar-plain-date-picker--readonly]': 'readonly()',
    '[class.coar-plain-date-picker--error]': 'hasError()',
    '[class.coar-plain-date-picker--open]': 'isOpen()',
  },
})
export class CoarPlainDatePickerComponent extends CoarControlValueAccessor<Temporal.PlainDate | null> {
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
  placeholder = input<string>('');

  /** Size variant */
  size = input<CoarPlainDatePickerSize>('md');

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

  /**
   * Whether to show the current month button (floating action button that scrolls to current month).
   */
  showTodayMonthButton = input<boolean, unknown>(true, { transform: booleanAttribute });

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

  /** Whether to close the panel after selecting a date (default: false to allow viewing events) */
  closeOnSelect = input<boolean, unknown>(false, { transform: booleanAttribute });

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
  value = model<Temporal.PlainDate | null>(null);

  /** Emitted when the selected value changes */
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
  private readonly uid = `coar-plain-date-picker-${CoarPlainDatePickerComponent.nextId++}`;

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
  protected activeMonth = signal<Temporal.PlainYearMonth | null>(null);

  /** Resolved active month (uses value's month or today) */
  protected resolvedActiveMonth = computed((): Temporal.PlainYearMonth => {
    const explicit = this.activeMonth();
    if (explicit) return explicit;
    const val = this.value();
    if (val) return val.toPlainYearMonth();
    return Temporal.Now.plainDateISO().toPlainYearMonth();
  });

  /** Reference to the input element */
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Reference to the trigger element */
  protected triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  /** Reference to the panel template */
  protected panelTemplateRef = viewChild<TemplateRef<unknown>>('panelTemplate');

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Effective date format configuration.
   */
  protected effectiveDateFormat = computed((): DateFormatConfig => {
    const directConfig = this.dateFormatConfig();
    if (directConfig) return directConfig;

    // Try to get from localization data store using the language key
    const _version = this.localizationDataStore?.dataVersion();
    const language = this.currentLanguage();
    const localeData = language ? this.localizationDataStore?.getLocaleData(language) : undefined;
    if (localeData?.date) {
      const isoFirstDay = localeData.date.firstDayOfWeek === 0 ? 7 : localeData.date.firstDayOfWeek;
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: isoFirstDay as 1 | 7,
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

  /** Get placeholder text based on date format */
  protected inputPlaceholder = computed(() => {
    return this.dateFormat().toUpperCase();
  });

  /** Effective locale */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  /** Whether the picker has an error state */
  protected hasError = computed(() => this.error());

  /** Whether the picker is disabled */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.value() !== null && !this.isDisabled() && !this.readonly();
  });

  // ============================================================
  // Month List Computed Values
  // ============================================================

  /** Current year from activeMonth */
  protected currentYear = computed(() => this.resolvedActiveMonth().year);

  /** Current month number from activeMonth (1-12) */
  protected currentMonthNumber = computed(() => this.resolvedActiveMonth().month);

  /** Whether previous year button is disabled */
  protected isPrevYearDisabled = computed(() => this.currentYear() <= this.minYear());

  /** Whether next year button is disabled */
  protected isNextYearDisabled = computed(() => this.currentYear() >= this.maxYear());

  /**
   * Month list items for the current year.
   */
  protected monthItems = computed(() => {
    const year = this.currentYear();
    const currentMonth = this.currentMonthNumber();
    const locale = this.effectiveLocale();

    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });

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

  /**
   * Markers for the currently selected date.
   */
  protected selectedDateMarkers = computed((): CoarDateMarker[] => {
    const date = this.value();
    if (!date) return [];

    return this.markers().filter((marker) => {
      const afterStart = Temporal.PlainDate.compare(date, marker.startDate) >= 0;
      const beforeEnd = marker.endDate
        ? Temporal.PlainDate.compare(date, marker.endDate) <= 0
        : Temporal.PlainDate.compare(date, marker.startDate) === 0;
      return afterStart && beforeEnd;
    });
  });

  /** Direction for the "jump to today" FAB */
  protected todayMonthScrollDirection = computed((): 'up' | 'down' | 'hidden' => {
    const active = this.resolvedActiveMonth();
    const todayMonth = Temporal.Now.plainDateISO().toPlainYearMonth();
    const comparison = Temporal.PlainYearMonth.compare(active, todayMonth);
    if (comparison === 0) return 'hidden';
    return comparison > 0 ? 'up' : 'down';
  });

  /** Whether to show the today month FAB */
  protected showTodayMonthFab = computed(() => {
    return this.showTodayMonthButton() && this.todayMonthScrollDirection() !== 'hidden';
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
        this.displayValue.set(coarFormatPlainDate(val, this.dateFormat()));
      } else {
        this.displayValue.set('');
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

    const verticalPlacement = this.resolvePlacement(trigger, this.estimatePanelHeight());
    this.panelPosition.set(verticalPlacement === 'top' ? 'top' : 'bottom');

    const triggerWidth = trigger.getBoundingClientRect().width;
    const panelMinWidth = this.showWeekNumbers() ? 528 : 480;

    const horizontalAlignment = triggerWidth >= panelMinWidth ? '-end' : '';
    const placement = `${verticalPlacement}${horizontalAlignment}` as Placement;

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position({
        placement,
        offset: 4,
        flip: false,
        shift: true,
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
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // Calendar Event Handlers
  // ============================================================

  /** Handle date selection from calendar */
  protected onDateSelected(date: Temporal.PlainDate): void {
    this.value.set(date);
    this.valueChange.emit(date);
    this.cvaOnChange(date);

    if (this.closeOnSelect()) {
      this.closePanel();
    }
  }

  /** Handle active month change from calendar scroll */
  protected onActiveMonthChanged(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
  }

  /** Navigate to previous year */
  protected previousYear(): void {
    if (this.isPrevYearDisabled()) return;
    const current = this.resolvedActiveMonth();
    this.activeMonth.set(current.subtract({ years: 1 }));
  }

  /** Navigate to next year */
  protected nextYear(): void {
    if (this.isNextYearDisabled()) return;
    const current = this.resolvedActiveMonth();
    this.activeMonth.set(current.add({ years: 1 }));
  }

  /** Select a month from the list */
  protected selectMonth(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
  }

  /** Scroll to today's month */
  protected scrollToTodayMonth(): void {
    const today = Temporal.Now.plainDateISO();
    this.activeMonth.set(today.toPlainYearMonth());
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: Temporal.PlainDate | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
    } else if (typeof value === 'string') {
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

    const parsed = coarParsePlainDateFromInput(text, this.dateFormat(), {
      min: this.min(),
      max: this.max(),
    });
    if (parsed) {
      this.value.set(parsed);
      this.cvaOnTouched();
      this.valueChange.emit(parsed);
    }
  }

  protected onInputBlur(): void {
    this.cvaOnTouched();

    const currentText = this.displayValue();
    const parsed = coarParsePlainDateFromInput(currentText, this.dateFormat(), {
      min: this.min(),
      max: this.max(),
    });

    if (!parsed && currentText.length > 0) {
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

  private resolvePlacement(trigger: HTMLElement, estimatedPanelHeight: number): Placement {
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const spaceBelow = Math.max(0, viewportHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);

    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  }

  private estimatePanelHeight(): number {
    return 340;
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
}
