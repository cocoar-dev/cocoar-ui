import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  NgZone,
  output,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from '../date/coar-date-marker';
import {
  coarCalculateIsoWeekNumber,
  coarDetectDateFormatPatternFromIntl,
  coarGetCalendarGridDates,
  coarGetLocalizedWeekdays,
} from '../date/coar-date-helpers';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';

import { CoarLocalizationService, CoarLocalizationDataStore } from '@cocoar/localization';

/**
 * Represents a single month view in the scrollable calendar.
 */
export interface CoarCalendarMonth {
  readonly yearMonth: Temporal.PlainYearMonth;
  readonly monthName: string;
  readonly year: number;
  readonly days: CoarCalendarDay[];
  readonly weekNumbers: number[];
}

/**
 * Represents a single day cell in the calendar.
 */
export interface CoarCalendarDay {
  readonly date: Temporal.PlainDate;
  readonly day: number;
  readonly isOutsideMonth: boolean;
  readonly isToday: boolean;
  readonly isSelected: boolean;
  readonly isDisabled: boolean;
  readonly isWeekend: boolean;
  readonly markers: CoarDateMarker[];
  readonly markerCssClass: string;
}

/**
 * Scrollable calendar component displaying multiple months vertically.
 *
 * Uses CSS `content-visibility: auto` for virtualization to optimize performance
 * when displaying many months. The calendar scrolls vertically and syncs with
 * an external month list for navigation.
 *
 * @example
 * ```html
 * <coar-scrollable-calendar
 *   [(value)]="selectedDate"
 *   [(activeMonth)]="visibleMonth"
 *   [min]="minDate"
 *   [max]="maxDate"
 * />
 * ```
 */
@Component({
  selector: 'coar-scrollable-calendar',
  standalone: true,
  imports: [CoarScrollbarDirective],
  templateUrl: './coar-scrollable-calendar.component.html',
  styleUrl: './coar-scrollable-calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarScrollableCalendarComponent {
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });
  private readonly localizationDataStore = inject(CoarLocalizationDataStore, { optional: true });
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  /** Current language from localization service (reactive) */
  private readonly currentLanguage = toSignal(
    this.localizationService?.languageState.value$ ?? of(''),
    {
      initialValue: this.localizationService?.languageState.value ?? '',
    }
  );

  // ============================================================
  // View References
  // ============================================================

  /** Reference to the scroll container */
  protected scrollContainerRef = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  /** Reference to the scrollbar directive */
  protected scrollbarDirective = viewChild(CoarScrollbarDirective);

  // ============================================================
  // Inputs
  // ============================================================

  /** Current selected date (two-way bindable with [(value)]) */
  value = model<Temporal.PlainDate | null>(null);

  /** Currently visible/active month (two-way bindable, syncs with scroll position) */
  activeMonth = model<Temporal.PlainYearMonth>(Temporal.Now.plainDateISO().toPlainYearMonth());

  /** Minimum selectable date */
  min = input<Temporal.PlainDate | null>(null);

  /** Maximum selectable date */
  max = input<Temporal.PlainDate | null>(null);

  /**
   * Locale identifier for date formatting (e.g., 'de-AT', 'en-US').
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /** Date format configuration (pattern and first day of week) */
  dateFormatConfig = input<DateFormatConfig>();

  /** Whether to show week numbers */
  showWeekNumbers = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether to highlight weekend days (Saturday/Sunday) with a subtle background */
  highlightWeekends = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Date markers for highlighting special dates (holidays, events, etc.) */
  markers = input<CoarDateMarker[]>([]);

  /**
   * Number of months to display before and after the current year.
   * Default: 12 months before, 12 months after (2 years total + current year).
   */
  monthRange = input<{ before: number; after: number }>({ before: 12, after: 12 });

  // ============================================================
  // Outputs
  // ============================================================

  /** Emitted when the selected date changes */
  valueChange = output<Temporal.PlainDate | null>();

  /** Emitted when the visible/active month changes due to scrolling */
  activeMonthChange = output<Temporal.PlainYearMonth>();

  /** Emitted when a date is clicked */
  dateSelected = output<Temporal.PlainDate>();

  // ============================================================
  // Internal State
  // ============================================================

  protected readonly today = Temporal.Now.plainDateISO();

  /** Flag to prevent scroll events while programmatically scrolling */
  private isScrollingProgrammatically = false;

  /** Flag to track when activeMonth is updated from scroll handler (prevents effect feedback loop) */
  private isUpdatingFromScroll = false;

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Effective locale for calendar display.
   * Priority: input locale > locale service language > browser locale
   */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  protected effectiveDateFormat = computed((): DateFormatConfig => {
    const directConfig = this.dateFormatConfig();
    if (directConfig) return directConfig;

    // Try to get from localization data store
    const storeLocale = this.effectiveLocale();
    const localeData = this.localizationDataStore?.getLocaleData(storeLocale);
    if (localeData?.date) {
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: localeData.date.firstDayOfWeek === 0 ? 7 : 1,
      };
    }

    // Fallback: detect pattern from Intl, default firstDayOfWeek to Monday
    const detectedPattern = coarDetectDateFormatPatternFromIntl(this.effectiveLocale());
    return { pattern: detectedPattern ?? 'dd.mm.yyyy', firstDayOfWeek: 1 };
  });

  protected firstDayOfWeek = computed(() => this.effectiveDateFormat().firstDayOfWeek);

  protected daysOfWeek = computed(() =>
    coarGetLocalizedWeekdays(this.effectiveLocale(), this.firstDayOfWeek())
  );

  /** All months to display in the scrollable view */
  protected months = computed((): CoarCalendarMonth[] => {
    const range = this.monthRange();
    const baseMonth = this.today.toPlainYearMonth();

    const months: CoarCalendarMonth[] = [];

    // Generate months from (baseMonth - before) to (baseMonth + after)
    for (let offset = -range.before; offset <= range.after; offset++) {
      const yearMonth = baseMonth.add({ months: offset });
      months.push(this.createCalendarMonth(yearMonth));
    }

    return months;
  });

  // ============================================================
  // Constructor & Effects
  // ============================================================

  constructor() {
    // Scroll to active month on initial render and set up scroll listener
    afterNextRender(() => {
      this.scrollToMonth(this.activeMonth(), false);
      this.setupScrollListener();
    });

    // Watch for external activeMonth changes and scroll to it
    effect(() => {
      const month = this.activeMonth();
      // Only scroll if not triggered by our own scroll handler or programmatic scroll
      if (!this.isScrollingProgrammatically && !this.isUpdatingFromScroll) {
        this.scrollToMonth(month, true);
      }
    });
  }

  /**
   * Sets up scroll listener on the OverlayScrollbars viewport element.
   * Native scroll events don't fire on the original element when using OverlayScrollbars.
   */
  private setupScrollListener(): void {
    // Wait a bit for OverlayScrollbars to initialize (it defers by default)
    setTimeout(() => {
      const osInstance = this.scrollbarDirective()?.getInstance();
      const viewport = osInstance?.elements().viewport;
      if (!viewport) return;

      // Listen to scroll events on the viewport element
      const scrollHandler = () => this.onScroll();
      this.ngZone.runOutsideAngular(() => {
        viewport.addEventListener('scroll', scrollHandler, { passive: true });
      });

      // Clean up on destroy
      this.destroyRef.onDestroy(() => {
        viewport.removeEventListener('scroll', scrollHandler);
      });
    }, 100);
  }

  // ============================================================
  // Public Methods
  // ============================================================

  /**
   * Scrolls to a specific month in the calendar.
   *
   * @param yearMonth - The month to scroll to
   * @param smooth - Whether to use smooth scrolling animation
   */
  scrollToMonth(yearMonth: Temporal.PlainYearMonth, smooth = true): void {
    const container = this.scrollContainerRef()?.nativeElement;
    if (!container) return;

    const monthId = this.getMonthElementId(yearMonth);
    const monthElement = container.querySelector(`#${monthId}`);
    if (!monthElement) return;

    this.isScrollingProgrammatically = true;

    monthElement.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start',
    });

    // Reset flag after scroll animation
    setTimeout(
      () => {
        this.isScrollingProgrammatically = false;
      },
      smooth ? 500 : 50
    );
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  /** Handle scroll events to update active month */
  protected onScroll(): void {
    if (this.isScrollingProgrammatically) return;

    const container = this.scrollContainerRef()?.nativeElement;
    if (!container) return;

    // Find the month element with the most visible area
    const monthElements = container.querySelectorAll('[data-year-month]');
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    let mostVisibleMonth: Temporal.PlainYearMonth | null = null;
    let maxVisibleArea = 0;

    for (let i = 0; i < monthElements.length; i++) {
      const element = monthElements[i];
      const rect = element.getBoundingClientRect();

      // Calculate visible portion of this month element
      const visibleTop = Math.max(rect.top, containerTop);
      const visibleBottom = Math.min(rect.bottom, containerBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleArea) {
        maxVisibleArea = visibleHeight;
        const yearMonthStr = element.getAttribute('data-year-month');
        if (yearMonthStr) {
          mostVisibleMonth = Temporal.PlainYearMonth.from(yearMonthStr);
        }
      }
    }

    if (mostVisibleMonth && !mostVisibleMonth.equals(this.activeMonth())) {
      // Set flag to prevent effect from triggering scroll
      this.isUpdatingFromScroll = true;
      // Run inside Angular zone since scroll listener runs outside
      this.ngZone.run(() => {
        this.activeMonth.set(mostVisibleMonth);
        this.activeMonthChange.emit(mostVisibleMonth);
      });
      // Reset flag after a microtask to ensure effect has run
      queueMicrotask(() => {
        this.isUpdatingFromScroll = false;
      });
    }
  }

  /** Handle date selection */
  protected selectDate(date: Temporal.PlainDate): void {
    if (this.isDateDisabled(date)) return;

    this.value.set(date);
    this.valueChange.emit(date);
    this.dateSelected.emit(date);
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /** Generate a unique element ID for a month */
  protected getMonthElementId(yearMonth: Temporal.PlainYearMonth): string {
    return `month-${yearMonth.year}-${yearMonth.month}`;
  }

  /** Check if a date is disabled (outside min/max range) */
  protected isDateDisabled(date: Temporal.PlainDate): boolean {
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

  /** Create a calendar month object */
  private createCalendarMonth(yearMonth: Temporal.PlainYearMonth): CoarCalendarMonth {
    const formatter = new Intl.DateTimeFormat(this.effectiveLocale(), { month: 'long' });
    const jsDate = new Date(yearMonth.year, yearMonth.month - 1, 1);
    const monthName = formatter.format(jsDate);

    const gridCells = coarGetCalendarGridDates(yearMonth, this.firstDayOfWeek());
    const days = gridCells.map((cell) => this.createCalendarDay(cell.date, cell.isOutsideMonth));

    // Calculate week numbers (one per row, 6 rows)
    const weekNumbers: number[] = [];
    for (let row = 0; row < 6; row++) {
      const firstDayOfRow = gridCells[row * 7];
      weekNumbers.push(coarCalculateIsoWeekNumber(firstDayOfRow.date));
    }

    return {
      yearMonth,
      monthName,
      year: yearMonth.year,
      days,
      weekNumbers,
    };
  }

  /** Create a calendar day object */
  private createCalendarDay(date: Temporal.PlainDate, isOutsideMonth: boolean): CoarCalendarDay {
    const selectedDate = this.value();
    const dayOfWeek = date.dayOfWeek; // 1=Mon, 7=Sun

    // Find markers for this date (check if date falls within marker range)
    const dateMarkers = this.markers().filter((marker) => {
      const afterStart = Temporal.PlainDate.compare(date, marker.startDate) >= 0;
      const beforeEnd = marker.endDate
        ? Temporal.PlainDate.compare(date, marker.endDate) <= 0
        : Temporal.PlainDate.compare(date, marker.startDate) === 0;
      return afterStart && beforeEnd;
    });

    // Get CSS class from first marker if available
    const markerCssClass = dateMarkers.length > 0 ? (dateMarkers[0].cssClass ?? '') : '';

    return {
      date,
      day: date.day,
      isOutsideMonth,
      isToday: Temporal.PlainDate.compare(date, this.today) === 0,
      isSelected: selectedDate ? Temporal.PlainDate.compare(date, selectedDate) === 0 : false,
      isDisabled: this.isDateDisabled(date),
      isWeekend: dayOfWeek === 6 || dayOfWeek === 7, // Saturday or Sunday
      markers: dateMarkers,
      markerCssClass,
    };
  }
}
