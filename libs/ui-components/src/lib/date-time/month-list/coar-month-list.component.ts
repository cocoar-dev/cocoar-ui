import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { CoarScrollbarDirective } from '../../display/scrollbar/coar-scrollbar.directive';
import { CoarLocalizationService } from '@cocoar/localization';

/**
 * Month list component for date/time picker navigation.
 *
 * Displays a vertical list of month names with a year stepper at the top.
 * The list height adapts to its container and becomes scrollable if all
 * 12 months don't fit.
 *
 * @example
 * ```html
 * <coar-month-list
 *   [(activeMonth)]="visibleMonth"
 *   [minYear]="1920"
 *   [maxYear]="2100"
 *   (monthSelected)="onMonthSelected($event)"
 * />
 * ```
 */
@Component({
  selector: 'coar-month-list',
  standalone: true,
  imports: [CoarIconComponent, CoarScrollbarDirective],
  templateUrl: './coar-month-list.component.html',
  styleUrl: './coar-month-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarMonthListComponent {
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });

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

  /** Reference to the months container */
  private monthsContainerRef = viewChild<ElementRef<HTMLElement>>('monthsContainer');

  /** Reference to the scrollbar directive for programmatic scrolling */
  private scrollbarDirective = viewChild(CoarScrollbarDirective);

  // ============================================================
  // Inputs
  // ============================================================

  /** Currently active/visible month (two-way bindable) */
  activeMonth = model<Temporal.PlainYearMonth>(Temporal.Now.plainDateISO().toPlainYearMonth());

  /**
   * Locale identifier for month name formatting.
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /**
   * Minimum year that can be selected.
   * Default: current year - 100
   */
  minYear = input<number>(Temporal.Now.plainDateISO().year - 100);

  /**
   * Maximum year that can be selected.
   * Default: current year + 50
   */
  maxYear = input<number>(Temporal.Now.plainDateISO().year + 50);

  // ============================================================
  // Outputs
  // ============================================================

  /** Emitted when a month is selected from the list */
  monthSelected = output<Temporal.PlainYearMonth>();

  /** Emitted when the year changes via stepper */
  yearChanged = output<number>();

  // ============================================================
  // Constructor
  // ============================================================

  constructor() {
    // Scroll to center the active month initially (with delay for OverlayScrollbars init)
    afterNextRender(() => {
      // OverlayScrollbars defers initialization, so we need a small delay
      setTimeout(() => this.scrollToActiveMonth(), 150);
    });

    // Scroll to active month when it changes
    effect(() => {
      // Read the active month to track changes
      this.activeMonth();
      // Scroll to make the active month visible (with small delay for DOM update)
      setTimeout(() => this.scrollToActiveMonth(), 0);
    });
  }

  // ============================================================
  // Computed Values
  // ============================================================

  /** Effective locale for month name formatting */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

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
  // Public Methods
  // ============================================================

  /** Navigate to previous year */
  previousYear(): void {
    if (this.isPrevYearDisabled()) return;

    const current = this.activeMonth();
    const newYear = current.year - 1;
    const newMonth = Temporal.PlainYearMonth.from({
      year: newYear,
      month: current.month,
    });

    this.activeMonth.set(newMonth);
    this.yearChanged.emit(newYear);
  }

  /** Navigate to next year */
  nextYear(): void {
    if (this.isNextYearDisabled()) return;

    const current = this.activeMonth();
    const newYear = current.year + 1;
    const newMonth = Temporal.PlainYearMonth.from({
      year: newYear,
      month: current.month,
    });

    this.activeMonth.set(newMonth);
    this.yearChanged.emit(newYear);
  }

  /** Select a specific month */
  selectMonth(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
    this.monthSelected.emit(yearMonth);
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * Scrolls the month list to make the active month visible.
   * Works with OverlayScrollbars by scrolling its viewport element directly.
   */
  private scrollToActiveMonth(): void {
    // Get the OverlayScrollbars instance and its viewport
    const osInstance = this.scrollbarDirective()?.getInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport) return;

    // Find the active month button within the viewport's content
    const activeButton = viewport.querySelector('.coar-month-list__month--active') as HTMLElement;
    if (!activeButton) return;

    // Calculate scroll position to make the active month visible
    const buttonTop = activeButton.offsetTop;
    const buttonHeight = activeButton.offsetHeight;
    const viewportHeight = viewport.clientHeight;
    const currentScrollTop = viewport.scrollTop;

    // Check if button is above the visible area
    if (buttonTop < currentScrollTop) {
      viewport.scrollTop = buttonTop;
    }
    // Check if button is below the visible area
    else if (buttonTop + buttonHeight > currentScrollTop + viewportHeight) {
      viewport.scrollTop = buttonTop + buttonHeight - viewportHeight;
    }
    // Otherwise it's already visible, no scroll needed
  }
}
