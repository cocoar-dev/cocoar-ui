import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Temporal } from '@js-temporal/polyfill';

import {
  CoarDateTimePickerPanelContentComponent,
  type CoarDateTimePickerMode,
  type CoarDateMarker,
  type CoarTimeValue,
  type DateFormatConfig,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-date-time-picker-panel-content',
  standalone: true,
  imports: [CoarDateTimePickerPanelContentComponent],
  templateUrl: './date-time-picker-panel-content.page.html',
  styleUrl: './date-time-picker-panel-content.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimePickerPanelContentPage {
  protected mode = signal<CoarDateTimePickerMode>('datetime');

  protected showWeekNumbers = signal(false);
  protected highlightWeekends = signal(true);

  protected locale = signal('de-DE');
  protected dateFormatConfig = signal<DateFormatConfig>({
    pattern: 'dd.mm.yyyy',
    firstDayOfWeek: 1,
  });

  protected selectedDate = signal<Temporal.PlainDate | null>(Temporal.Now.plainDateISO());
  protected selectedTime = signal<CoarTimeValue | null>({ hours: 9, minutes: 0 });

  protected activeMonth = signal(Temporal.Now.plainDateISO().toPlainYearMonth());

  protected currentYear = computed(() => this.activeMonth().year);
  protected currentMonthNumber = computed(() => this.activeMonth().month);

  protected monthItems = computed(() => {
    const year = this.currentYear();
    const currentMonth = this.currentMonthNumber();
    const formatter = new Intl.DateTimeFormat(this.locale(), { month: 'short' });

    const items: Array<{
      month: number;
      name: string;
      isActive: boolean;
      yearMonth: Temporal.PlainYearMonth;
    }> = [];

    for (let month = 1; month <= 12; month++) {
      const jsDate = new Date(year, month - 1, 1);
      items.push({
        month,
        name: formatter.format(jsDate),
        isActive: month === currentMonth,
        yearMonth: Temporal.PlainYearMonth.from({ year, month }),
      });
    }

    return items;
  });

  protected markers = signal<CoarDateMarker[]>([
    {
      startDate: Temporal.PlainDate.from('2026-01-22'),
      description: 'Today (demo marker)',
    },
    {
      startDate: Temporal.PlainDate.from('2026-02-14'),
      description: "Valentine's Day",
    },
    {
      startDate: Temporal.PlainDate.from('2026-04-05'),
      endDate: Temporal.PlainDate.from('2026-04-06'),
      description: 'Easter Weekend',
    },
  ]);

  protected selectedDateMarkers = computed((): CoarDateMarker[] => {
    const date = this.selectedDate();
    if (!date) return [];

    return this.markers().filter((marker) => {
      const afterStart = Temporal.PlainDate.compare(date, marker.startDate) >= 0;
      const beforeEnd = marker.endDate
        ? Temporal.PlainDate.compare(date, marker.endDate) <= 0
        : Temporal.PlainDate.compare(date, marker.startDate) === 0;
      return afterStart && beforeEnd;
    });
  });

  protected isPrevYearDisabled = signal(false);
  protected isNextYearDisabled = signal(false);

  protected onDateSelected(date: Temporal.PlainDate): void {
    this.selectedDate.set(date);

    if (this.mode() === 'datetime') {
      const time = this.selectedTime() ?? { hours: 9, minutes: 0 };
      this.selectedTime.set(time);
    }
  }

  protected onTimeChanged(time: CoarTimeValue | null): void {
    if (!time) return;
    this.selectedTime.set(time);
  }

  protected previousYear(): void {
    this.activeMonth.set(this.activeMonth().subtract({ years: 1 }));
  }

  protected nextYear(): void {
    this.activeMonth.set(this.activeMonth().add({ years: 1 }));
  }

  protected selectMonth(yearMonth: Temporal.PlainYearMonth): void {
    this.activeMonth.set(yearMonth);
  }
}
