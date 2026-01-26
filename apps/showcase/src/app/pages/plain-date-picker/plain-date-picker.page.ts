import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarPlainDatePickerComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarNoteComponent,
  type DateFormatConfig,
  type CoarDateMarker,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-plain-date-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarPlainDatePickerComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
    CoarNoteComponent,
  ],
  templateUrl: './plain-date-picker.page.html',
  styleUrl: './plain-date-picker.page.css',
})
export class PlainDatePickerPage {
  // Demo values - All using Temporal.PlainDate (the ONLY type this picker returns)
  basicDate = signal<Temporal.PlainDate | null>(null);
  preselectedDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-06-15'));
  minMaxDate = signal<Temporal.PlainDate | null>(null);

  // Min/max constraints - typed as PlainDate
  minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
  maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

  // Size demo values
  xsDate = signal<Temporal.PlainDate | null>(null);
  smDate = signal<Temporal.PlainDate | null>(null);
  mdDate = signal<Temporal.PlainDate | null>(null);
  lgDate = signal<Temporal.PlainDate | null>(null);

  // State demo values
  disabledDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-01-01'));
  readonlyDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));
  errorDate = signal<Temporal.PlainDate | null>(null);
  requiredDate = signal<Temporal.PlainDate | null>(null);

  // Locale demo values
  europeanDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));
  usDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));
  isoDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-12-25'));

  // Locale format configs
  europeanFormat: DateFormatConfig = { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
  usFormat: DateFormatConfig = { pattern: 'mm/dd/yyyy', firstDayOfWeek: 7 };
  isoFormat: DateFormatConfig = { pattern: 'yyyy-mm-dd', firstDayOfWeek: 1 };

  // Week numbers demo values
  weekNumberDate = signal<Temporal.PlainDate | null>(null);

  // Full featured demo value
  fullFeaturedDate = signal<Temporal.PlainDate | null>(null);

  // Markers demo
  markerDate = signal<Temporal.PlainDate | null>(null);
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

  // Code examples
  codeExamples = {
    basic: `<coar-plain-date-picker
  label="Select a Date"
  [(value)]="selectedDate"
  placeholder="Pick a date..."
/>

// Type: Temporal.PlainDate | null`,

    minMax: `// In component
minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

// In template
<coar-plain-date-picker
  label="Booking Date"
  [(value)]="selectedDate"
  [min]="minDate"
  [max]="maxDate"
/>`,

    sizes: `<coar-plain-date-picker size="xs" label="Extra Small" [(value)]="date" />
<coar-plain-date-picker size="sm" label="Small" [(value)]="date" />
<coar-plain-date-picker size="md" label="Medium (default)" [(value)]="date" />
<coar-plain-date-picker size="lg" label="Large" [(value)]="date" />`,

    states: `<coar-plain-date-picker label="Disabled" [(value)]="date" disabled />
<coar-plain-date-picker label="Readonly" [(value)]="date" readonly />
<coar-plain-date-picker label="Error State" [(value)]="date" error="Please select a valid date" />
<coar-plain-date-picker label="Required" [(value)]="date" required />`,

    weekNumbers: `<coar-plain-date-picker
  label="With Week Numbers"
  [(value)]="date"
  [showWeekNumbers]="true"
/>`,

    markers: `holidayMarkers: CoarDateMarker[] = [
  {
    startDate: Temporal.PlainDate.from('2025-12-24'),
    description: 'Christmas Eve',
  },
  {
    startDate: Temporal.PlainDate.from('2025-12-25'),
    endDate: Temporal.PlainDate.from('2025-12-26'),
    description: 'Christmas Holidays',
  },
];

<coar-plain-date-picker
  label="With Holidays"
  [(value)]="date"
  [markers]="holidayMarkers"
/>`,
  };

  formatDate(date: Temporal.PlainDate | null): string {
    if (!date) return 'null';
    return date.toString();
  }
}
