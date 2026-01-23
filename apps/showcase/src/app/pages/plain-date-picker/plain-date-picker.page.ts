import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarPlainDatePickerComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  type DateFormatConfig,
  type CoarDateMarker,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-plain-date-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarPlainDatePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './plain-date-picker.page.html',
  styleUrl: './plain-date-picker.page.css',
})
export class PlainDatePickerPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  // Note: docs paths would be created when docs are generated
  protected readonly docsPath = '/docs/libs/ui-components/coar-plain-date-picker.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-plain-date-picker.api.md';

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

  // Localized display demo values
  germanDate = signal<Temporal.PlainDate | null>(null);
  frenchDate = signal<Temporal.PlainDate | null>(null);

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
  basicExample = `<coar-plain-date-picker
  label="Select a Date"
  [(value)]="selectedDate"
  placeholder="Pick a date..."
/>

// Type: Temporal.PlainDate | null
// Example value: 2025-06-15`;

  minMaxExample = `// In component - min/max are typed as Temporal.PlainDate
minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

// In template
<coar-plain-date-picker
  label="Booking Date"
  [(value)]="selectedDate"
  [min]="minDate"
  [max]="maxDate"
/>`;

  sizesExample = `<coar-plain-date-picker size="xs" label="Extra Small" [(value)]="date" />
<coar-plain-date-picker size="sm" label="Small" [(value)]="date" />
<coar-plain-date-picker size="md" label="Medium (default)" [(value)]="date" />
<coar-plain-date-picker size="lg" label="Large" [(value)]="date" />`;

  statesExample = `<coar-plain-date-picker
  label="Disabled"
  [(value)]="date"
  disabled
/>

<coar-plain-date-picker
  label="Readonly"
  [(value)]="date"
  readonly
/>

<coar-plain-date-picker
  label="Error State"
  [(value)]="date"
  error
  message="Please select a valid date"
/>

<coar-plain-date-picker
  label="Required"
  [(value)]="date"
  required
/>`;

  weekNumbersExample = `<!-- Display ISO week numbers on the left side of the calendar -->
<coar-plain-date-picker
  label="With Week Numbers"
  [(value)]="date"
  [showWeekNumbers]="true"
/>`;

  markersExample = `// Define markers in component
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
];

// In template
<coar-plain-date-picker
  label="With Holidays"
  [(value)]="date"
  [markers]="holidayMarkers"
/>`;

  typeComparisonExample = `// OLD: CoarDatePickerComponent
// - value: Temporal.PlainDate | Temporal.PlainDateTime | null
// - Could return either type depending on mode

// NEW: CoarPlainDatePickerComponent
// - value: Temporal.PlainDate | null (ONLY)
// - Strongly typed, no ambiguity
// - min/max are also Temporal.PlainDate | null

// For datetime, use CoarPlainDateTimePickerComponent
// - value: Temporal.PlainDateTime | null (ONLY)`;

  formatDate(date: Temporal.PlainDate | null): string {
    if (!date) return 'null';
    return date.toString();
  }
}
