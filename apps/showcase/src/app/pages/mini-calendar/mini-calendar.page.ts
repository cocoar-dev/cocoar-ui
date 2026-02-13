import { Component, signal } from '@angular/core';

import { Temporal } from '@js-temporal/polyfill';
import {
  CoarMiniCalendarComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarNoteComponent,
  type CoarDateMarker,
  type DateFormatConfig,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [
    CoarMiniCalendarComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
    CoarNoteComponent,
  ],
  templateUrl: './mini-calendar.page.html',
  styleUrl: './mini-calendar.page.css',
})
export class MiniCalendarPage {
  importCode = `import { CoarMiniCalendarComponent } from '@cocoar/ui/components';`;

  selectedDate = signal<Temporal.PlainDate | null>(Temporal.Now.plainDateISO());
  weekNumberDate = signal<Temporal.PlainDate | null>(Temporal.Now.plainDateISO());
  constrainedDate = signal<Temporal.PlainDate | null>(null);
  localizedDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));
  markerDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));

  minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
  maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

  mondayFirst: DateFormatConfig = { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
  sundayFirst: DateFormatConfig = { pattern: 'mm/dd/yyyy', firstDayOfWeek: 7 };

  holidayMarkers: CoarDateMarker[] = [
    {
      startDate: Temporal.PlainDate.from('2025-12-24'),
      description: 'Christmas Eve',
    },
    {
      startDate: Temporal.PlainDate.from('2025-12-25'),
      endDate: Temporal.PlainDate.from('2025-12-26'),
      description: 'Christmas Holidays',
    },
    {
      startDate: Temporal.PlainDate.from('2025-12-31'),
      description: "New Year's Eve",
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: "New Year's Day",
    },
  ];

  codeExamples = {
    basic: `<coar-mini-calendar [(value)]="selectedDate" />`,

    constraints: `minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

<coar-mini-calendar [(value)]="date" [min]="minDate" [max]="maxDate" />`,

    weekNumbers: `<coar-mini-calendar [(value)]="date" [showWeekNumbers]="true" />`,

    locale: `<coar-mini-calendar
  [(value)]="date"
  locale="de-DE"
  [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }"
  [showWeekNumbers]="true"
  [highlightWeekends]="true"
  [showTodayButton]="true"
/>`,

    markers: `holidayMarkers: CoarDateMarker[] = [
  { startDate: Temporal.PlainDate.from('2025-12-24'), description: 'Christmas Eve' },
  { startDate: Temporal.PlainDate.from('2025-12-25'), endDate: Temporal.PlainDate.from('2025-12-26'), description: 'Christmas Holidays' },
];

<coar-mini-calendar [(value)]="date" [markers]="holidayMarkers" />`,
  };

  formatDate(date: Temporal.PlainDate | null): string {
    return date?.toString() ?? 'null';
  }
}
