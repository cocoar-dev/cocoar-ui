import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  booleanAttribute,
} from '@angular/core';

import { Temporal } from '@js-temporal/polyfill';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../coar-scrollable-calendar/coar-scrollable-calendar.component';

import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from '../date/coar-date-marker';

@Component({
  selector: 'coar-date-time-picker-calendar-column',
  standalone: true,
  imports: [CoarScrollableCalendarComponent, CoarIconComponent],
  templateUrl: './coar-date-time-picker-calendar-column.component.html',
  styleUrl: './coar-date-time-picker-calendar-column.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarDateTimePickerCalendarColumnComponent {
  value = input<Temporal.PlainDate | null>(null);

  activeMonth = model<Temporal.PlainYearMonth>(Temporal.Now.plainDateISO().toPlainYearMonth());
  activeMonthChange = output<Temporal.PlainYearMonth>();

  min = input<Temporal.PlainDate | null>(null);
  max = input<Temporal.PlainDate | null>(null);

  locale = input<string>('');
  dateFormatConfig = input<DateFormatConfig>();

  showWeekNumbers = input<boolean, unknown>(false, { transform: booleanAttribute });
  highlightWeekends = input<boolean, unknown>(false, { transform: booleanAttribute });
  markers = input<CoarDateMarker[]>([]);

  showTodayMonthButton = input<boolean, unknown>(true, { transform: booleanAttribute });

  dateSelected = output<Temporal.PlainDate>();

  protected todayMonthScrollDirection = computed((): 'up' | 'down' | 'hidden' => {
    const active = this.activeMonth();
    const todayMonth = Temporal.Now.plainDateISO().toPlainYearMonth();
    const comparison = Temporal.PlainYearMonth.compare(active, todayMonth);
    if (comparison === 0) return 'hidden';
    return comparison > 0 ? 'up' : 'down';
  });

  protected showTodayMonthFab = computed(() => {
    return this.showTodayMonthButton() && this.todayMonthScrollDirection() !== 'hidden';
  });

  protected onActiveMonthChanged(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
    this.activeMonthChange.emit(yearMonth);
  }

  /**
   * Scrolls the calendar to the month that contains the provided date.
   * Note: This does not change the selected date.
   */
  scrollToDateMonth(day: number, month: number, year: number): void {
    try {
      const date = Temporal.PlainDate.from({ year, month, day });
      const yearMonth = date.toPlainYearMonth();
      this.activeMonth.set(yearMonth);
      this.activeMonthChange.emit(yearMonth);
    } catch {
      // Ignore invalid date inputs
    }
  }

  /**
   * Scrolls the calendar to today's month.
   * Note: This does not change the selected date.
   */
  scrollToTodayMonth(): void {
    const today = Temporal.Now.plainDateISO();
    this.scrollToDateMonth(today.day, today.month, today.year);
  }
}
