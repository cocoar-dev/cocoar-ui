import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui-overlay';
import {
  CoarLocalizationService,
  CoarLocalizationDataStore,
  CoarTimeZoneService,
} from '@cocoar/localization';

import type { DateFormatConfig } from './coar-date-format';
import type { CoarDateMarker } from './coar-date-marker';
import {
  coarDetectDateFormatPatternFromIntl,
  coarGetDateSeparatorForPattern,
} from './coar-date-helpers';
import { CoarControlValueAccessor } from '../forms/coar-control-value-accessor';

/**
 * Shared size type for date/datetime pickers.
 */
export type CoarDatePickerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Month item structure for the month list.
 */
export interface CoarMonthItem {
  readonly month: number;
  readonly name: string;
  readonly isActive: boolean;
  readonly yearMonth: Temporal.PlainYearMonth;
}

/**
 * Base class for date and datetime picker components.
 *
 * Provides shared functionality:
 * - Localization service integration
 * - Date format configuration resolution
 * - Month list navigation
 * - Overlay management
 * - Common state computations
 *
 * @template T - The value type (PlainDate or PlainDateTime)
 */
@Directive()
export abstract class CoarDatePickerBase<T> extends CoarControlValueAccessor<T | null> {
  // ============================================================
  // Injected Services
  // ============================================================

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly overlayBuilder = createOverlayBuilder();
  protected readonly localizationService = inject(CoarLocalizationService, { optional: true });
  protected readonly localizationDataStore = inject(CoarLocalizationDataStore, { optional: true });
  protected readonly timeZoneService = inject(CoarTimeZoneService, { optional: true });

  protected overlayRef: OverlayRef | null = null;

  /** Current language from localization service (reactive) */
  protected readonly currentLanguage = toSignal(
    this.localizationService?.languageState.value$ ?? of(''),
    {
      initialValue: this.localizationService?.languageState.value ?? '',
    }
  );

  /**
   * Current timezone from timezone service (reactive).
   * Used for calculating "today" correctly across timezone boundaries and DST.
   */
  protected readonly currentTimeZone = this.timeZoneService?.currentTimeZone;

  /**
   * Today's date based on the configured timezone.
   *
   * This is a computed signal that reacts to timezone changes.
   * Uses the timezone service if available, otherwise falls back to system timezone.
   *
   * Important for DST: At 11 PM in Vienna on March 30th, it might already be
   * March 31st in New York. This computed ensures "today" is always correct
   * for the configured timezone.
   */
  protected readonly today = computed(() => {
    const tz = this.currentTimeZone?.();
    if (tz) {
      return Temporal.Now.plainDateISO(tz);
    }
    return Temporal.Now.plainDateISO();
  });

  // ============================================================
  // Common Inputs
  // ============================================================

  /** Label text displayed above the input */
  label = input<string>('');

  /** Placeholder text when no value is selected */
  placeholder = input<string>('');

  /** Size variant */
  size = input<CoarDatePickerSize>('md');

  /** Whether the picker is readonly */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the picker is disabled */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the field is required */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error message (empty string = no error) */
  error = input<string>('');

  /** Hint text displayed below the input */
  hint = input<string>('');

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
  // Common Outputs
  // ============================================================

  /** Emitted when the picker opens */
  opened = output<void>();

  /** Emitted when the picker closes */
  closed = output<void>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Whether the panel is open */
  protected isOpen = signal(false);

  /** Panel position (determined before opening) */
  protected panelPosition = signal<'top' | 'bottom'>('bottom');

  /** Display value for the input field */
  protected displayValue = signal('');

  /** Currently visible month in the calendar (synced with month list) */
  protected activeMonth = signal<Temporal.PlainYearMonth | null>(null);

  // ============================================================
  // Computed: Date Format Configuration
  // ============================================================

  /**
   * Effective date format configuration.
   * Resolution order:
   * 1. Explicit dateFormatConfig input
   * 2. Localization data store (based on current language)
   * 3. Intl.DateTimeFormat detection from locale
   * 4. Default: European format (dd.mm.yyyy)
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

  /**
   * Effective locale.
   * Resolution order:
   * 1. Explicit locale input
   * 2. Current language from localization service
   * 3. Browser's navigator.language
   */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  // ============================================================
  // Computed: Common State
  // ============================================================

  /** Whether the picker has an error state */
  protected hasError = computed(() => this.error().length > 0);

  /** The message to display (error takes priority over hint) */
  protected displayMessage = computed(() => this.error() || this.hint());

  /** Whether the picker is disabled (including CVA disabled state) */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Whether to show the clear button */
  protected showClearButton = computed(() => {
    return this.clearable() && this.getValue() !== null && !this.isDisabled() && !this.readonly();
  });

  // ============================================================
  // Abstract Methods (subclasses must implement)
  // ============================================================

  /**
   * Get the current value. Subclasses implement this to access their typed model.
   */
  protected abstract getValue(): T | null;

  /**
   * Get the resolved active month based on the current value.
   * For date picker: value?.toPlainYearMonth()
   * For datetime picker: value?.toPlainDate().toPlainYearMonth()
   */
  protected abstract resolvedActiveMonth(): Temporal.PlainYearMonth;

  // ============================================================
  // Computed: Month List
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
  protected monthItems = computed((): CoarMonthItem[] => {
    const year = this.currentYear();
    const currentMonth = this.currentMonthNumber();
    const locale = this.effectiveLocale();

    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });

    const items: CoarMonthItem[] = [];

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

  /** Direction for the "jump to today" FAB */
  protected todayMonthScrollDirection = computed((): 'up' | 'down' | 'hidden' => {
    const active = this.resolvedActiveMonth();
    const todayMonth = this.today().toPlainYearMonth();
    const comparison = Temporal.PlainYearMonth.compare(active, todayMonth);
    if (comparison === 0) return 'hidden';
    return comparison > 0 ? 'up' : 'down';
  });

  /** Whether to show the today month FAB */
  protected showTodayMonthFab = computed(() => {
    return this.showTodayMonthButton() && this.todayMonthScrollDirection() !== 'hidden';
  });

  // ============================================================
  // Month Navigation Methods
  // ============================================================

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
    this.activeMonth.set(this.today().toPlainYearMonth());
  }

  /** Handle active month change from calendar scroll */
  protected onActiveMonthChanged(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
  }

  // ============================================================
  // Overlay Helpers
  // ============================================================

  /**
   * Resolve overlay placement based on available viewport space.
   */
  protected resolvePlacement(trigger: HTMLElement, estimatedPanelHeight: number): Placement {
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const spaceBelow = Math.max(0, viewportHeight - rect.bottom);
    const spaceAbove = Math.max(0, rect.top);

    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  }

  /**
   * Close the picker panel.
   */
  closePanel(): void {
    if (!this.isOpen()) return;

    const ref = this.overlayRef;
    this.overlayRef = null;
    ref?.close();

    this.isOpen.set(false);
    this.closed.emit();
  }

  /**
   * Toggle the picker panel.
   */
  togglePanel(): void {
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  /**
   * Open the picker panel. Subclasses must implement the actual opening logic.
   */
  abstract openPanel(): void;

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
}
