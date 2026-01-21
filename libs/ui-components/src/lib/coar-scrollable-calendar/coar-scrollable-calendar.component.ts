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
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import { createOverlayBuilder, type OverlayRef } from '@cocoar/ui-overlay';

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
  readonly markerTooltip: string | null;
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
   * @deprecated Use infinite scroll instead - this input is kept for backwards compatibility
   */
  monthRange = input<{ before: number; after: number }>({ before: 12, after: 12 });

  /**
   * Maximum number of months to keep in the DOM at once.
   * Default: 25 (roughly 2 years). Lower values improve performance but may cause
   * more frequent loading when scrolling quickly.
   */
  maxMonthsInDom = input<number>(25);

  /**
   * Number of months to load when reaching the edge of the current range.
   * Default: 6 (half a year at a time).
   */
  monthsToLoad = input<number>(6);

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

  /** Flag to prevent multiple concurrent infinite scroll loads */
  private isLoadingMonths = false;

  /** The earliest month currently in the DOM */
  private earliestMonth = signal<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth().subtract({ months: 12 })
  );

  /** The latest month currently in the DOM */
  private latestMonth = signal<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth().add({ months: 12 })
  );

  /** Signal-based months array for infinite scroll */
  protected months = signal<CoarCalendarMonth[]>([]);

  /** Overlay builder for marker tooltips */
  private readonly overlayBuilder = createOverlayBuilder();

  /** Current marker tooltip overlay reference */
  private markerTooltipRef: OverlayRef | null = null;

  /** Timeout for delayed tooltip show */
  private markerTooltipTimeout: ReturnType<typeof setTimeout> | null = null;

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

  // ============================================================
  // Constructor & Effects
  // ============================================================

  /** Flag to track pending scroll after month loading */
  private pendingScrollTarget: Temporal.PlainYearMonth | null = null;

  /** Track previous marker/value state to avoid unnecessary rebuilds */
  private lastMarkersLength = 0;
  private lastValueString = '';
  private lastHighlightWeekends = false;

  constructor() {
    // Initialize the months array
    this.initializeMonths();

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
        // Ensure the month is in the DOM before scrolling
        this.scrollToMonthWithLoad(month);
      }
    });

    // Rebuild months when markers, value, or highlightWeekends changes
    effect(() => {
      const markers = this.markers();
      const value = this.value();
      const highlightWeekends = this.highlightWeekends();

      // Check if anything actually changed
      const valueString = value?.toString() ?? '';
      const markersLength = markers.length;

      if (
        markersLength !== this.lastMarkersLength ||
        valueString !== this.lastValueString ||
        highlightWeekends !== this.lastHighlightWeekends
      ) {
        this.lastMarkersLength = markersLength;
        this.lastValueString = valueString;
        this.lastHighlightWeekends = highlightWeekends;

        // Only rebuild if we have months (after initialization)
        if (this.months().length > 0) {
          this.rebuildMonths();
        }
      }
    });
  }

  /**
   * Rebuilds all months to update day states (selected, markers, etc.)
   */
  private rebuildMonths(): void {
    const currentMonths = this.months();
    if (currentMonths.length === 0) return;

    const updatedMonths = currentMonths.map((month) => this.createCalendarMonth(month.yearMonth));
    this.months.set(updatedMonths);
  }

  /**
   * Scrolls to a month, loading it first if necessary.
   */
  private scrollToMonthWithLoad(targetMonth: Temporal.PlainYearMonth): void {
    const earliest = this.earliestMonth();
    const latest = this.latestMonth();

    // Check if month is already in range
    const isInRange =
      Temporal.PlainYearMonth.compare(targetMonth, earliest) >= 0 &&
      Temporal.PlainYearMonth.compare(targetMonth, latest) <= 0;

    if (isInRange) {
      // Month is already loaded, scroll to it instantly
      // Using instant scroll to avoid timing issues with infinite scroll detection
      // Smooth scroll could still be animating when the programmatic flag resets,
      // causing checkInfiniteScroll to trigger and load more months
      this.scrollToMonth(targetMonth, false);
    } else {
      // Need to load months first, then scroll
      // Block infinite scroll and scroll events during targeted navigation
      this.isScrollingProgrammatically = true;
      this.pendingScrollTarget = targetMonth;
      this.loadMonthsToReach(targetMonth);
    }
  }

  /**
   * Loads months to reach a target month that's outside the current range.
   */
  private loadMonthsToReach(targetMonth: Temporal.PlainYearMonth): void {
    const earliest = this.earliestMonth();
    const latest = this.latestMonth();

    if (Temporal.PlainYearMonth.compare(targetMonth, earliest) < 0) {
      // Target is before our range - load earlier months
      const monthsNeeded =
        (earliest.year - targetMonth.year) * 12 + (earliest.month - targetMonth.month);
      this.loadEarlierMonthsSync(monthsNeeded + 3); // Add buffer
    } else {
      // Target is after our range - load later months
      const monthsNeeded =
        (targetMonth.year - latest.year) * 12 + (targetMonth.month - latest.month);
      this.loadLaterMonthsSync(monthsNeeded + 3); // Add buffer
    }
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

  /**
   * Initializes the months array with an initial range around today.
   */
  private initializeMonths(): void {
    const baseMonth = this.today.toPlainYearMonth();
    const range = this.monthRange();

    // Set the range boundaries
    this.earliestMonth.set(baseMonth.subtract({ months: range.before }));
    this.latestMonth.set(baseMonth.add({ months: range.after }));

    // Generate initial months
    const initialMonths: CoarCalendarMonth[] = [];
    let current = this.earliestMonth();
    const end = this.latestMonth();

    while (Temporal.PlainYearMonth.compare(current, end) <= 0) {
      initialMonths.push(this.createCalendarMonth(current));
      current = current.add({ months: 1 });
    }

    this.months.set(initialMonths);
  }

  /**
   * Checks if we need to load more months based on scroll position.
   */
  private checkInfiniteScroll(): void {
    if (this.isLoadingMonths || this.isScrollingProgrammatically) {
      return;
    }

    const osInstance = this.scrollbarDirective()?.getInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport) return;

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    const threshold = 500; // pixels from edge to trigger load

    // Check if near top - load earlier months
    if (scrollTop < threshold) {
      this.loadEarlierMonths(this.monthsToLoad());
    }

    // Check if near bottom - load later months
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      this.loadLaterMonths(this.monthsToLoad());
    }
  }

  /**
   * Loads earlier months and maintains scroll position.
   */
  private loadEarlierMonths(count: number): void {
    if (this.isLoadingMonths) return;
    this.isLoadingMonths = true;

    const osInstance = this.scrollbarDirective()?.getInstance();
    const viewport = osInstance?.elements().viewport;
    const scrollHeightBefore = viewport?.scrollHeight ?? 0;

    // Generate new months
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.earliestMonth();

    for (let i = 0; i < count; i++) {
      current = current.subtract({ months: 1 });
      newMonths.unshift(this.createCalendarMonth(current));
    }

    this.earliestMonth.set(current);

    // Add new months to the beginning
    this.ngZone.run(() => {
      this.months.update((months: CoarCalendarMonth[]) => [...newMonths, ...months]);

      // Trim from the end if we have too many months
      this.trimMonthsFromEnd();
    });

    // Maintain scroll position after DOM update
    requestAnimationFrame(() => {
      if (viewport) {
        const scrollHeightAfter = viewport.scrollHeight;
        const addedHeight = scrollHeightAfter - scrollHeightBefore;
        viewport.scrollTop += addedHeight;
      }
      this.isLoadingMonths = false;
      this.checkPendingScroll();
    });
  }

  /**
   * Loads later months.
   */
  private loadLaterMonths(count: number): void {
    if (this.isLoadingMonths) return;
    this.isLoadingMonths = true;

    // Generate new months
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.latestMonth();

    for (let i = 0; i < count; i++) {
      current = current.add({ months: 1 });
      newMonths.push(this.createCalendarMonth(current));
    }

    this.latestMonth.set(current);

    // Add new months to the end
    this.ngZone.run(() => {
      this.months.update((months: CoarCalendarMonth[]) => [...months, ...newMonths]);

      // Trim from the beginning if we have too many months
      this.trimMonthsFromBeginning();
    });

    // Small delay to allow DOM to update
    requestAnimationFrame(() => {
      this.isLoadingMonths = false;
      this.checkPendingScroll();
    });
  }

  /**
   * Loads earlier months synchronously (for targeted navigation).
   * Does not maintain scroll position - caller handles scrolling.
   */
  private loadEarlierMonthsSync(count: number): void {
    // Generate new months
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.earliestMonth();

    for (let i = 0; i < count; i++) {
      current = current.subtract({ months: 1 });
      newMonths.unshift(this.createCalendarMonth(current));
    }

    this.earliestMonth.set(current);

    // Add new months to the beginning (no trimming for targeted navigation)
    this.months.update((months: CoarCalendarMonth[]) => [...newMonths, ...months]);

    // Schedule scroll after DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.checkPendingScroll();
      });
    });
  }

  /**
   * Loads later months synchronously (for targeted navigation).
   */
  private loadLaterMonthsSync(count: number): void {
    // Generate new months
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.latestMonth();

    for (let i = 0; i < count; i++) {
      current = current.add({ months: 1 });
      newMonths.push(this.createCalendarMonth(current));
    }

    this.latestMonth.set(current);

    // Add new months to the end (no trimming for targeted navigation)
    this.months.update((months: CoarCalendarMonth[]) => [...months, ...newMonths]);

    // Schedule scroll after DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.checkPendingScroll();
      });
    });
  }

  /**
   * Checks if there's a pending scroll target and scrolls to it if available.
   */
  private checkPendingScroll(): void {
    if (!this.pendingScrollTarget) return;

    const target = this.pendingScrollTarget;
    const earliest = this.earliestMonth();
    const latest = this.latestMonth();

    // Check if target is now in range
    const isInRange =
      Temporal.PlainYearMonth.compare(target, earliest) >= 0 &&
      Temporal.PlainYearMonth.compare(target, latest) <= 0;

    if (isInRange) {
      this.pendingScrollTarget = null;

      // Scroll to the target month (instant, no animation)
      const container = this.scrollContainerRef()?.nativeElement;
      if (container) {
        const monthId = this.getMonthElementId(target);
        const monthElement = container.querySelector(`#${monthId}`);
        if (monthElement) {
          monthElement.scrollIntoView({
            behavior: 'instant',
            block: 'start',
          });
        }
      }

      // Update activeMonth after instant scroll (onScroll won't fire for instant jumps)
      this.isUpdatingFromScroll = true;
      this.activeMonth.set(target);
      this.activeMonthChange.emit(target);

      // Reset flags after a short delay to allow any queued scroll events to be ignored
      setTimeout(() => {
        this.isScrollingProgrammatically = false;
        this.isUpdatingFromScroll = false;
      }, 100);
    }
  }

  /**
   * Trims months from the end of the array to stay within maxMonthsInDom.
   */
  private trimMonthsFromEnd(): void {
    const max = this.maxMonthsInDom();
    const currentMonths = this.months();

    if (currentMonths.length > max) {
      const trimCount = currentMonths.length - max;
      const trimmed = currentMonths.slice(0, -trimCount);
      this.months.set(trimmed);
      this.latestMonth.set(trimmed[trimmed.length - 1].yearMonth);
    }
  }

  /**
   * Trims months from the beginning of the array to stay within maxMonthsInDom.
   */
  private trimMonthsFromBeginning(): void {
    const max = this.maxMonthsInDom();
    const currentMonths = this.months();

    if (currentMonths.length > max) {
      const trimCount = currentMonths.length - max;
      const trimmed = currentMonths.slice(trimCount);
      this.months.set(trimmed);
      this.earliestMonth.set(trimmed[0].yearMonth);
    }
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
    if (this.isScrollingProgrammatically) {
      return;
    }

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

    // Check if we need to load more months (infinite scroll)
    this.checkInfiniteScroll();
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

    // Build tooltip from marker descriptions
    const markerTooltip =
      dateMarkers.length > 0
        ? dateMarkers
            .map((m) => m.description)
            .filter(Boolean)
            .join('\n') || null
        : null;

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
      markerTooltip,
    };
  }

  // ============================================================
  // Marker Tooltip Methods
  // ============================================================

  /** Tracks if mouse is currently over the tooltip */
  private isMouseOverTooltip = false;
  /** Timeout for delayed hide */
  private hideTooltipTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Shows the marker tooltip for a day with markers.
   */
  protected showMarkerTooltip(event: MouseEvent, day: CoarCalendarDay): void {
    if (day.markers.length === 0) return;

    // Capture element reference immediately (before setTimeout)
    const target = event.currentTarget as HTMLElement;

    // Clear any pending timeouts
    if (this.markerTooltipTimeout) {
      clearTimeout(this.markerTooltipTimeout);
    }
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
      this.hideTooltipTimeout = null;
    }

    // Close existing tooltip if showing a different day
    if (this.markerTooltipRef) {
      this.markerTooltipRef.close();
      this.markerTooltipRef = null;
    }

    this.isMouseOverTooltip = false;

    // Show tooltip with a small delay to avoid flicker
    this.markerTooltipTimeout = setTimeout(() => {
      // Verify element is still in the DOM before opening overlay
      if (!target.isConnected) {
        return;
      }

      this.markerTooltipRef = this.overlayBuilder
        .anchor({ kind: 'element', element: target })
        .position({ placement: ['right', 'left', 'top', 'bottom'], offset: 8 })
        .backdrop({ kind: 'none' })
        .dismiss({ outsideClick: false, escapeKey: false })
        .fromComponent(CoarMarkerTooltipComponent)
        .open({
          markers: day.markers,
        });

      // Add mouse listeners to the tooltip panel to keep it open when hovered
      const panelElement = this.markerTooltipRef.getPanelElement?.();
      if (panelElement) {
        panelElement.addEventListener('mouseenter', this.onTooltipMouseEnter);
        panelElement.addEventListener('mouseleave', this.onTooltipMouseLeave);
      }
    }, 150);
  }

  /**
   * Schedules hiding the marker tooltip (with delay to allow moving to tooltip).
   */
  protected scheduleHideMarkerTooltip(): void {
    // Don't hide if mouse is over the tooltip
    if (this.isMouseOverTooltip) return;

    // Clear any pending show timeout
    if (this.markerTooltipTimeout) {
      clearTimeout(this.markerTooltipTimeout);
      this.markerTooltipTimeout = null;
    }

    // Schedule hide with delay to allow mouse to move to tooltip
    this.hideTooltipTimeout = setTimeout(() => {
      if (!this.isMouseOverTooltip) {
        this.hideMarkerTooltip();
      }
    }, 100);
  }

  /**
   * Handler for mouse entering the tooltip.
   */
  private onTooltipMouseEnter = (): void => {
    this.isMouseOverTooltip = true;
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
      this.hideTooltipTimeout = null;
    }
  };

  /**
   * Handler for mouse leaving the tooltip.
   */
  private onTooltipMouseLeave = (): void => {
    this.isMouseOverTooltip = false;
    this.hideMarkerTooltip();
  };

  /**
   * Hides the marker tooltip immediately.
   */
  protected hideMarkerTooltip(): void {
    if (this.markerTooltipTimeout) {
      clearTimeout(this.markerTooltipTimeout);
      this.markerTooltipTimeout = null;
    }
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
      this.hideTooltipTimeout = null;
    }
    if (this.markerTooltipRef) {
      // Remove listeners before closing
      const panelElement = this.markerTooltipRef.getPanelElement?.();
      if (panelElement) {
        panelElement.removeEventListener('mouseenter', this.onTooltipMouseEnter);
        panelElement.removeEventListener('mouseleave', this.onTooltipMouseLeave);
      }
      this.markerTooltipRef.close();
      this.markerTooltipRef = null;
    }
    this.isMouseOverTooltip = false;
  }
}

/**
 * Internal component for displaying marker tooltip content.
 */
@Component({
  selector: 'coar-marker-tooltip',
  standalone: true,
  template: `
    <div class="coar-marker-tooltip">
      <div class="coar-marker-tooltip__arrow"></div>
      <div class="coar-marker-tooltip__content">
        @for (marker of markers(); track marker.description) {
          <div class="coar-marker-tooltip__item">
            <span class="coar-marker-tooltip__dot"></span>
            <div class="coar-marker-tooltip__details">
              <span class="coar-marker-tooltip__text">{{ marker.description }}</span>
              @if (marker.endDate && !isSameDay(marker.startDate, marker.endDate)) {
                <span class="coar-marker-tooltip__dates">
                  {{ formatDate(marker.startDate) }} – {{ formatDate(marker.endDate) }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
      }

      .coar-marker-tooltip {
        position: relative;
        min-width: 160px;
        max-width: 260px;
        padding: var(--coar-spacing-xs) var(--coar-spacing-s);
        background: var(--coar-background-neutral-primary);
        border: 1px solid var(--coar-border-neutral-tertiary);
        border-radius: var(--coar-radius-sm);
      }

      /* Arrow - points left when tooltip is on the right of the anchor */
      .coar-marker-tooltip__arrow {
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--coar-background-neutral-primary);
        border: 1px solid var(--coar-border-neutral-tertiary);
        transform: rotate(45deg);
        left: -6px;
        top: 50%;
        margin-top: -5px;
        border-top: none;
        border-right: none;
      }

      .coar-marker-tooltip__content {
        display: flex;
        flex-direction: column;
        gap: var(--coar-spacing-2xs);
        max-height: 180px;
        overflow-y: auto;
      }

      .coar-marker-tooltip__item {
        display: flex;
        align-items: flex-start;
        gap: var(--coar-spacing-xs);
        padding: 2px 0;
      }

      .coar-marker-tooltip__details {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .coar-marker-tooltip__item:not(:last-child) {
        border-bottom: 1px solid var(--coar-border-neutral-quaternary);
        padding-bottom: var(--coar-spacing-2xs);
      }

      .coar-marker-tooltip__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--coar-background-semantic-error-bold);
        flex-shrink: 0;
      }

      .coar-marker-tooltip__text {
        font-family: var(--coar-body-small-base-family);
        font-size: var(--coar-body-small-base-size);
        color: var(--coar-text-neutral-primary);
        line-height: 1.4;
      }

      .coar-marker-tooltip__dates {
        font-family: var(--coar-body-small-base-family);
        font-size: 11px;
        color: var(--coar-text-neutral-secondary);
        line-height: 1.3;
      }

      .coar-marker-tooltip__dot {
        margin-top: 5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarMarkerTooltipComponent {
  /** The markers to display */
  markers = input<CoarDateMarker[]>([]);

  /** Check if two dates are the same day */
  isSameDay(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
    return a.equals(b);
  }

  /** Format a date for display */
  formatDate(date: Temporal.PlainDate): string {
    return `${date.day}/${date.month}`;
  }
}
