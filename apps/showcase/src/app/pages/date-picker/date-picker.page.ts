import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarDatePickerComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
  type DateFormatConfig,
  type CoarDateMarker,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoarDatePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './date-picker.page.html',
  styleUrl: './date-picker.page.css',
})
export class DatePickerPage {
  activeTab = 'examples';

  // Demo values
  basicDate = signal<Temporal.PlainDate | null>(null);
  preselectedDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-06-15')
  );
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
  disabledDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-01-01')
  );
  readonlyDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-12-25')
  );
  errorDate = signal<Temporal.PlainDate | null>(null);
  requiredDate = signal<Temporal.PlainDate | null>(null);

  // Locale demo values
  europeanDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-12-25')
  );
  usDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-12-25')
  );
  isoDate = signal<Temporal.PlainDate | null>(
    Temporal.PlainDate.from('2025-12-25')
  );

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
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';

// In app.config.ts or module providers
providers: [
  {
    provide: COAR_LOCALE_SERVICE,
    useFactory: () => {
      const service = new CoarLocaleService();
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

  // API table data
  inputsData = [
    { name: 'label', type: 'string', default: "''", description: 'Label text displayed above the input' },
    { name: 'placeholder', type: 'string', default: "'Select date...'", description: 'Placeholder text when no date is selected' },
    { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Size variant of the picker' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Whether the picker is readonly' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Whether the field is required' },
    { name: 'error', type: 'boolean', default: 'false', description: 'Error state styling' },
    { name: 'message', type: 'string', default: "''", description: 'Helper or error message text' },
    { name: 'min', type: 'Temporal.PlainDate | null', default: 'null', description: 'Minimum selectable date' },
    { name: 'max', type: 'Temporal.PlainDate | null', default: 'null', description: 'Maximum selectable date' },
    { name: 'locale', type: 'string', default: 'undefined', description: 'Locale for formatting (uses locale service default if not set)' },
    { name: 'dateFormatConfig', type: 'DateFormatConfig', default: 'undefined', description: 'Date format config (uses locale service if not set)' },
    { name: 'showTodayButton', type: 'boolean', default: 'true', description: 'Whether to show a "Today" button' },
    { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Display ISO week numbers on the left side of the calendar' },
    { name: 'highlightWeekends', type: 'boolean', default: 'false', description: 'Highlight Saturday/Sunday with a subtle background' },
    { name: 'markers', type: 'CoarDateMarker[]', default: '[]', description: 'Date markers for holidays/events (shows dot indicator and tooltip)' },
  ];

  outputsData = [
    { name: 'valueChange', type: 'Temporal.PlainDate | null', description: 'Emitted when the selected date changes' },
    { name: 'opened', type: 'void', description: 'Emitted when the calendar opens' },
    { name: 'closed', type: 'void', description: 'Emitted when the calendar closes' },
  ];

  formatDate(date: Temporal.PlainDate | null): string {
    if (!date) return 'null';
    return date.toString();
  }
}
