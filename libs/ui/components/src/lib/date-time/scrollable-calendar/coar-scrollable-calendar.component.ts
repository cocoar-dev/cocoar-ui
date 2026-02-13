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

import type { DateFormatConfig } from '../_shared/coar-date-format';
import type { CoarDateMarker } from '../_shared/coar-date-marker';
import {
  coarCalculateIsoWeekNumber,
  coarDetectDateFormatPatternFromIntl,
  coarGetCalendarGridDates,
  coarGetLocalizedWeekdays,
} from '../_shared/coar-date-helpers';
import { CoarScrollbarDirective } from '../../display/scrollbar/coar-scrollbar.directive';

import {
  CoarLocalizationService,
  CoarLocalizationDataStore,
  CoarTimeZoneService,
} from '@cocoar/localization';

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
  private readonly timeZoneService = inject(CoarTimeZoneService, { optional: true });
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

  /**
   * Today's date based on the configured timezone.
   * Reactive: updates when timezone changes.
   */
  protected readonly today = computed(() => {
    const tz = this.timeZoneService?.currentTimeZone();
    if (tz) {
      return Temporal.Now.plainDateISO(tz);
    }
    return Temporal.Now.plainDateISO();
  });

  /** Flag to prevent scroll events while programmatically scrolling */
  private isScrollingProgrammatically = false;

  /** Flag to track when activeMonth is updated from scroll handler (prevents effect feedback loop) */
  private isUpdatingFromScroll = false;

  /** Flag to prevent multiple concurrent infinite scroll loads */
  private isLoadingMonths = false;

  /** Becomes true once the actual scroll viewport element is available (OverlayScrollbars initialized). */
  private readonly scrollViewportReady = signal(false);

  /** Becomes true once the calendar is properly scrolled to the active month. Prevents visible flickering. */
  protected readonly isScrollPositioned = signal(false);

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

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Minimum month boundary derived from min date input.
   * Infinite scroll will not load months before this.
   */
  private minMonth = computed(() => {
    const minDate = this.min();
    return minDate ? minDate.toPlainYearMonth() : null;
  });

  /**
   * Maximum month boundary derived from max date input.
   * Infinite scroll will not load months after this.
   */
  private maxMonth = computed(() => {
    const maxDate = this.max();
    return maxDate ? maxDate.toPlainYearMonth() : null;
  });

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

    // Try to get from localization data store using the language key
    // The store uses language codes ('en', 'de') not full locales ('en-GB')
    // Read dataVersion to establish signal dependency for async loading
    const _version = this.localizationDataStore?.dataVersion();
    const language = this.currentLanguage();
    const localeData = language ? this.localizationDataStore?.getLocaleData(language) : undefined;
    if (localeData?.date) {
      // Convert 0-6 (Sun-Sat) format to ISO 1-7 (Mon-Sun) format
      // 0 (Sun) -> 7, 1 (Mon) -> 1, 2 (Tue) -> 2, ..., 6 (Sat) -> 6
      const isoFirstDay = localeData.date.firstDayOfWeek === 0 ? 7 : localeData.date.firstDayOfWeek;
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: isoFirstDay as 1 | 7,
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

  /**
   * Weekday headers with weekend flag for styling.
   * Returns array of { name, isWeekend } for each day.
   */
  protected weekdayHeaders = computed(() => {
    const names = this.daysOfWeek();
    const firstDay = this.firstDayOfWeek();

    return names.map((name, index) => {
      // Calculate which ISO day of week this is (1=Mon, 7=Sun)
      // If firstDayOfWeek is 1 (Monday): index 0=Mon(1), index 5=Sat(6), index 6=Sun(7)
      // If firstDayOfWeek is 7 (Sunday): index 0=Sun(7), index 1=Mon(1), index 6=Sat(6)
      let isoDayOfWeek: number;
      if (firstDay === 1) {
        isoDayOfWeek = index + 1; // 0->1(Mon), 5->6(Sat), 6->7(Sun)
      } else {
        isoDayOfWeek = index === 0 ? 7 : index; // 0->7(Sun), 1->1(Mon), 6->6(Sat)
      }
      const isWeekend = isoDayOfWeek === 6 || isoDayOfWeek === 7;
      return { name, isWeekend };
    });
  });

  // ============================================================
  // Constructor & Effects
  // ============================================================

  /** Flag to track pending scroll after month loading */
  private pendingScrollTarget: Temporal.PlainYearMonth | null = null;

  /** Track previous marker/value/min/max state to avoid unnecessary rebuilds */
  private lastMarkersLength = 0;
  private lastValueString = '';
  private lastHighlightWeekends = false;
  private lastMinString = '';
  private lastMaxString = '';

  private readonly monthScrollTopInsetPx = 0;

  constructor() {
    // Initialize the months array
    this.initializeMonths();

    // Scroll to active month on initial render and set up scroll listener
    afterNextRender(() => {
      this.setupScrollListener();
    });

    // Watch for external activeMonth changes and scroll to it
    effect(() => {
      const isViewportReady = this.scrollViewportReady();
      const month = this.activeMonth();

      if (!isViewportReady) return;
      // Only scroll if not triggered by our own scroll handler or programmatic scroll
      if (!this.isScrollingProgrammatically && !this.isUpdatingFromScroll) {
        // Ensure the month is in the DOM before scrolling
        this.scrollToMonthWithLoad(month);
      }
    });

    // Rebuild months when markers, value, highlightWeekends, or min/max changes
    // Min/max affects the isDisabled state of individual days
    effect(() => {
      const markers = this.markers();
      const value = this.value();
      const highlightWeekends = this.highlightWeekends();
      const min = this.min();
      const max = this.max();

      // Check if anything actually changed
      const valueString = value?.toString() ?? '';
      const markersLength = markers.length;
      const minString = min?.toString() ?? '';
      const maxString = max?.toString() ?? '';

      if (
        markersLength !== this.lastMarkersLength ||
        valueString !== this.lastValueString ||
        highlightWeekends !== this.lastHighlightWeekends ||
        minString !== this.lastMinString ||
        maxString !== this.lastMaxString
      ) {
        this.lastMarkersLength = markersLength;
        this.lastValueString = valueString;
        this.lastHighlightWeekends = highlightWeekends;
        this.lastMinString = minString;
        this.lastMaxString = maxString;

        // Only rebuild if we have months (after initialization)
        if (this.months().length > 0) {
          this.rebuildMonths();
        }
      }
    });

    // Watch for min/max input changes and constrain months array
    // This is needed because inputs are not available in the constructor
    effect(() => {
      const minMonth = this.minMonth();
      const maxMonth = this.maxMonth();
      const currentMonths = this.months();

      // Only run if we have months (after initialization)
      if (currentMonths.length === 0) return;

      this.constrainMonthsToRange(minMonth, maxMonth);
    });
  }

  /**
   * Constrains the months array to respect min/max boundaries.
   * Removes months outside the allowed range and updates boundary signals.
   */
  private constrainMonthsToRange(
    minMonth: Temporal.PlainYearMonth | null,
    maxMonth: Temporal.PlainYearMonth | null
  ): void {
    const currentMonths = this.months();
    if (currentMonths.length === 0) return;

    const currentEarliest = this.earliestMonth();
    const currentLatest = this.latestMonth();

    // Determine new boundaries
    let newEarliest = currentEarliest;
    let newLatest = currentLatest;

    if (minMonth && Temporal.PlainYearMonth.compare(newEarliest, minMonth) < 0) {
      newEarliest = minMonth;
    }
    if (maxMonth && Temporal.PlainYearMonth.compare(newLatest, maxMonth) > 0) {
      newLatest = maxMonth;
    }

    // Check if we need to trim the months array
    const needsTrim =
      Temporal.PlainYearMonth.compare(newEarliest, currentEarliest) !== 0 ||
      Temporal.PlainYearMonth.compare(newLatest, currentLatest) !== 0;

    if (!needsTrim) return;

    // Filter months to only include those within the new boundaries
    const filteredMonths = currentMonths.filter((month) => {
      const ym = month.yearMonth;
      const afterOrAtMin = Temporal.PlainYearMonth.compare(ym, newEarliest) >= 0;
      const beforeOrAtMax = Temporal.PlainYearMonth.compare(ym, newLatest) <= 0;
      return afterOrAtMin && beforeOrAtMax;
    });

    // Update boundary signals and months array
    this.earliestMonth.set(newEarliest);
    this.latestMonth.set(newLatest);
    this.months.set(filteredMonths);
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
    const maxAttempts = 50;
    const attemptDelayMs = 50;
    let attempts = 0;

    const tryAttach = () => {
      const osInstance = this.scrollbarDirective()?.getInstance();
      const viewport = osInstance?.elements().viewport;
      if (!viewport) {
        attempts++;
        if (attempts <= maxAttempts) {
          setTimeout(tryAttach, attemptDelayMs);
        }
        return;
      }

      this.scrollViewportReady.set(true);

      // Listen to scroll events on the actual scroll viewport element.
      // Native scroll events won't fire on the host element when using OverlayScrollbars.
      const scrollHandler = () => this.onScroll();
      this.ngZone.runOutsideAngular(() => {
        viewport.addEventListener('scroll', scrollHandler, { passive: true });
      });

      this.destroyRef.onDestroy(() => {
        viewport.removeEventListener('scroll', scrollHandler);
      });

      // OverlayScrollbars initialization can reset the scroll position.
      // Re-align after the viewport exists (effect already triggered by scrollViewportReady).
      this.ensureMonthAlignedInViewport(this.activeMonth());
    };

    tryAttach();
  }

  private getScrollViewportElement(): HTMLElement | null {
    const osViewport = this.scrollbarDirective()?.getInstance()?.elements().viewport;
    if (osViewport) return osViewport;

    const container = this.scrollContainerRef()?.nativeElement ?? null;
    if (!container) return null;

    const firstChild = container.firstElementChild as HTMLElement | null;
    if (firstChild && firstChild.scrollHeight > firstChild.clientHeight) return firstChild;
    if (container.scrollHeight > container.clientHeight) return container;

    return firstChild ?? container;
  }

  private ensureMonthAlignedInViewport(targetMonth: Temporal.PlainYearMonth): void {
    let attempts = 0;
    const maxAttempts = 40;

    this.isScrollingProgrammatically = true;

    const tryAlign = () => {
      attempts++;

      const container = this.scrollContainerRef()?.nativeElement;
      const viewport = this.getScrollViewportElement();
      if (!container || !viewport) {
        if (attempts < maxAttempts) requestAnimationFrame(tryAlign);
        else {
          this.isScrollingProgrammatically = false;
          // Show calendar even if alignment failed to avoid permanent invisible state
          this.isScrollPositioned.set(true);
        }
        return;
      }

      const monthId = this.getMonthElementId(targetMonth);
      const monthElement = container.querySelector(`#${monthId}`) as HTMLElement | null;
      if (!monthElement) {
        if (attempts < maxAttempts) requestAnimationFrame(tryAlign);
        else {
          this.isScrollingProgrammatically = false;
          this.isScrollPositioned.set(true);
        }
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const monthRect = monthElement.getBoundingClientRect();
      const offset = monthRect.top - viewportRect.top - this.monthScrollTopInsetPx;

      if (Math.abs(offset) > 1) {
        viewport.scrollTop = viewport.scrollTop + offset;
      }

      // Calendar is now visible at correct position - show it immediately on first successful alignment
      if (!this.isScrollPositioned()) {
        this.isScrollPositioned.set(true);
      }

      if (attempts < maxAttempts) {
        requestAnimationFrame(tryAlign);
        return;
      }

      setTimeout(() => {
        this.isScrollingProgrammatically = false;
      }, 50);
    };

    requestAnimationFrame(tryAlign);
  }

  private scrollMonthElementToTop(monthElement: HTMLElement, smooth: boolean): void {
    const viewport = this.getScrollViewportElement();

    if (viewport) {
      const viewportRect = viewport.getBoundingClientRect();
      const monthRect = monthElement.getBoundingClientRect();
      const currentScrollTop = viewport.scrollTop;
      const targetScrollTop =
        currentScrollTop + (monthRect.top - viewportRect.top) - this.monthScrollTopInsetPx;

      this.isScrollingProgrammatically = true;
      viewport.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? 'smooth' : 'auto',
      });

      setTimeout(
        () => {
          this.isScrollingProgrammatically = false;
        },
        smooth ? 500 : 50
      );
      return;
    }

    this.isScrollingProgrammatically = true;
    monthElement.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start',
    });

    setTimeout(
      () => {
        this.isScrollingProgrammatically = false;
      },
      smooth ? 500 : 50
    );
  }

  /**
   * Initializes the months array with an initial range around today.
   * Respects min/max date constraints when setting boundaries.
   */
  private initializeMonths(): void {
    const baseMonth = this.today().toPlainYearMonth();
    const range = this.monthRange();
    const minMonth = this.minMonth();
    const maxMonth = this.maxMonth();

    // Calculate initial range boundaries
    let earliest = baseMonth.subtract({ months: range.before });
    let latest = baseMonth.add({ months: range.after });

    // Clamp to min/max constraints
    if (minMonth && Temporal.PlainYearMonth.compare(earliest, minMonth) < 0) {
      earliest = minMonth;
    }
    if (maxMonth && Temporal.PlainYearMonth.compare(latest, maxMonth) > 0) {
      latest = maxMonth;
    }

    // Set the range boundaries
    this.earliestMonth.set(earliest);
    this.latestMonth.set(latest);

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
   * Respects min/max constraints - won't load beyond boundaries.
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

    const minMonth = this.minMonth();
    const maxMonth = this.maxMonth();
    const currentEarliest = this.earliestMonth();
    const currentLatest = this.latestMonth();

    // Check if near top - load earlier months (only if not at min boundary)
    const canLoadEarlier =
      !minMonth || Temporal.PlainYearMonth.compare(currentEarliest, minMonth) > 0;
    if (scrollTop < threshold && canLoadEarlier) {
      this.loadEarlierMonths(this.monthsToLoad());
    }

    // Check if near bottom - load later months (only if not at max boundary)
    const canLoadLater = !maxMonth || Temporal.PlainYearMonth.compare(currentLatest, maxMonth) < 0;
    if (scrollHeight - scrollTop - clientHeight < threshold && canLoadLater) {
      this.loadLaterMonths(this.monthsToLoad());
    }
  }

  /**
   * Loads earlier months and maintains scroll position.
   * Respects min date constraint - won't load beyond minMonth.
   */
  private loadEarlierMonths(count: number): void {
    if (this.isLoadingMonths) return;

    const minMonth = this.minMonth();
    const currentEarliest = this.earliestMonth();

    // Check if already at min boundary
    if (minMonth && Temporal.PlainYearMonth.compare(currentEarliest, minMonth) <= 0) {
      return;
    }

    this.isLoadingMonths = true;

    const osInstance = this.scrollbarDirective()?.getInstance();
    const viewport = osInstance?.elements().viewport;
    const scrollHeightBefore = viewport?.scrollHeight ?? 0;

    // Generate new months, stopping at min boundary
    const newMonths: CoarCalendarMonth[] = [];
    let current = currentEarliest;

    for (let i = 0; i < count; i++) {
      const nextMonth = current.subtract({ months: 1 });

      // Stop if we've reached the min boundary
      if (minMonth && Temporal.PlainYearMonth.compare(nextMonth, minMonth) < 0) {
        break;
      }

      current = nextMonth;
      newMonths.unshift(this.createCalendarMonth(current));
    }

    // Only proceed if we have months to add
    if (newMonths.length === 0) {
      this.isLoadingMonths = false;
      return;
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
   * Respects max date constraint - won't load beyond maxMonth.
   */
  private loadLaterMonths(count: number): void {
    if (this.isLoadingMonths) return;

    const maxMonth = this.maxMonth();
    const currentLatest = this.latestMonth();

    // Check if already at max boundary
    if (maxMonth && Temporal.PlainYearMonth.compare(currentLatest, maxMonth) >= 0) {
      return;
    }

    this.isLoadingMonths = true;

    // Generate new months, stopping at max boundary
    const newMonths: CoarCalendarMonth[] = [];
    let current = currentLatest;

    for (let i = 0; i < count; i++) {
      const nextMonth = current.add({ months: 1 });

      // Stop if we've exceeded the max boundary
      if (maxMonth && Temporal.PlainYearMonth.compare(nextMonth, maxMonth) > 0) {
        break;
      }

      current = nextMonth;
      newMonths.push(this.createCalendarMonth(current));
    }

    // Only proceed if we have months to add
    if (newMonths.length === 0) {
      this.isLoadingMonths = false;
      return;
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
   * Respects min date constraint.
   */
  private loadEarlierMonthsSync(count: number): void {
    const minMonth = this.minMonth();

    // Generate new months, respecting min constraint
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.earliestMonth();

    for (let i = 0; i < count; i++) {
      const nextMonth = current.subtract({ months: 1 });

      // Stop if we've reached the min boundary
      if (minMonth && Temporal.PlainYearMonth.compare(nextMonth, minMonth) < 0) {
        break;
      }

      current = nextMonth;
      newMonths.unshift(this.createCalendarMonth(current));
    }

    if (newMonths.length === 0) return;

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
   * Respects max date constraint.
   */
  private loadLaterMonthsSync(count: number): void {
    const maxMonth = this.maxMonth();

    // Generate new months, respecting max constraint
    const newMonths: CoarCalendarMonth[] = [];
    let current = this.latestMonth();

    for (let i = 0; i < count; i++) {
      const nextMonth = current.add({ months: 1 });

      // Stop if we've exceeded the max boundary
      if (maxMonth && Temporal.PlainYearMonth.compare(nextMonth, maxMonth) > 0) {
        break;
      }

      current = nextMonth;
      newMonths.push(this.createCalendarMonth(current));
    }

    if (newMonths.length === 0) return;

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
          this.scrollMonthElementToTop(monthElement as HTMLElement, false);
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

    this.scrollMonthElementToTop(monthElement as HTMLElement, smooth);
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

    const viewport = this.getScrollViewportElement() ?? container;

    // Find the month element with the most visible area
    const monthElements = container.querySelectorAll('[data-year-month]');
    const viewportRect = viewport.getBoundingClientRect();
    const containerTop = viewportRect.top;
    const containerBottom = viewportRect.bottom;

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
      isToday: Temporal.PlainDate.compare(date, this.today()) === 0,
      isSelected: selectedDate ? Temporal.PlainDate.compare(date, selectedDate) === 0 : false,
      isDisabled: this.isDateDisabled(date),
      isWeekend: dayOfWeek === 6 || dayOfWeek === 7, // Saturday or Sunday
      markers: dateMarkers,
      markerCssClass,
      markerTooltip,
    };
  }
}
