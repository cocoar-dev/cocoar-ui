import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarDatePickerComponent,
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
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarDatePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './date-picker.page.html',
  styleUrl: './date-picker.page.css',
})
export class DatePickerPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-date-picker.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-date-picker.api.md';

  // Demo values
  basicDate = signal<Temporal.PlainDate | null>(null);
  preselectedDate = signal<Temporal.PlainDate | null>(Temporal.PlainDate.from('2025-06-15'));
  minMaxDate = signal<Temporal.PlainDate | null>(null);

  // Min/max constraints
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
  spanishDate = signal<Temporal.PlainDate | null>(null);

  // Locale formats for localized display
  germanFormat: DateFormatConfig = { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
  frenchFormat: DateFormatConfig = { pattern: 'dd/mm/yyyy', firstDayOfWeek: 1 };
  spanishFormat: DateFormatConfig = { pattern: 'dd/mm/yyyy', firstDayOfWeek: 1 };

  // Week numbers demo values
  weekNumberDate = signal<Temporal.PlainDate | null>(null);
  weekNumberDateAlt = signal<Temporal.PlainDate | null>(null);

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
    {
      startDate: Temporal.PlainDate.from('2025-10-26'),
      description: 'Austrian National Day',
    },
  ];

  // Full featured markers (same as above for the "Full Featured" example)
  fullFeaturedMarkers = this.holidayMarkers;

  // Code examples
  basicExample = `<coar-date-picker
  label="Select a Date"
  [(value)]="selectedDate"
  placeholder="Pick a date..."
/>`;

  minMaxExample = `// In component
minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
maxDate = Temporal.Now.plainDateISO().add({ months: 3 });

// In template
<coar-date-picker
  label="Date Range"
  [(value)]="selectedDate"
  [min]="minDate"
  [max]="maxDate"
/>`;

  sizesExample = `<coar-date-picker size="xs" label="Extra Small" [(value)]="date" />
<coar-date-picker size="sm" label="Small" [(value)]="date" />
<coar-date-picker size="md" label="Medium (default)" [(value)]="date" />
<coar-date-picker size="lg" label="Large" [(value)]="date" />`;

  statesExample = `<coar-date-picker
  label="Disabled"
  [(value)]="date"
  disabled
/>

<coar-date-picker
  label="Readonly"
  [(value)]="date"
  readonly
/>

<coar-date-picker
  label="Error State"
  [(value)]="date"
  error
  message="Please select a valid date"
/>

<coar-date-picker
  label="Required"
  [(value)]="date"
  required
/>`;

  localeExample = `// Configure locale service at application level
import { COAR_LOCALIZATION_SERVICE } from '@cocoar/ui-components';

// In app.config.ts or module providers
providers: [
  {
    provide: COAR_LOCALIZATION_SERVICE,
    useFactory: () => {
      const service = new CoarLocalizationService();
      service.setDefaultLocale('de-AT'); // Sets application-wide default
      return service;
    }
  }
]

// Per-component locale override - affects both input format AND calendar display
<coar-date-picker
  label="German Calendar"
  locale="de-DE"
  [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }"
  [(value)]="date"
/>

// The locale input controls:
// - Weekday names: Mo, Di, Mi, Do, Fr, Sa, So (German)
// - Month names: Januar, Februar, März... (German)
// - Uses browser's Intl.DateTimeFormat - no translation files needed!`;

  weekNumbersExample = `<!-- Display ISO week numbers on the left side of the calendar -->
<coar-date-picker
  label="With Week Numbers"
  [(value)]="date"
  [showWeekNumbers]="true"
/>`;

  fullFeaturedExample = `<!-- All features enabled -->
<coar-date-picker
  label="Full Featured"
  [(value)]="date"
  [showWeekNumbers]="true"
  [highlightWeekends]="true"
  [showTodayButton]="true"
  [markers]="holidayMarkers"
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
    description: 'Christmas Holidays', // Date range
  },
  {
    startDate: Temporal.PlainDate.from('2025-10-26'),
    description: 'Austrian National Day',
  },
];

// In template
<coar-date-picker
  label="With Holidays"
  [(value)]="date"
  [markers]="holidayMarkers"
/>`;

  formatDate(date: Temporal.PlainDate | null): string {
    if (!date) return 'null';
    return date.toString();
  }
}
