import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
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
}
