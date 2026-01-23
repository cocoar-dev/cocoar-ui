import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarDateTimePickerComponent,
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
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarDateTimePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './date-time-picker.page.html',
  styleUrl: './date-time-picker.page.css',
})
export class DateTimePickerPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-date-time-picker.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-date-time-picker.api.md';

  // ============================================================
  // Date-only mode demos
  // ============================================================

  basicDateOnly = signal<Temporal.PlainDate | null>(null);

  // ============================================================
  // DateTime mode demos
  // ============================================================

  basicDateTime = signal<Temporal.PlainDateTime | null>(null);
  preselectedDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-06-15T14:30')
  );

  // ============================================================
  // Time format demos
  // ============================================================

  time24h = signal<Temporal.PlainDateTime | null>(null);
  time12h = signal<Temporal.PlainDateTime | null>(null);

  // ============================================================
  // Minute step demos
  // ============================================================

  step1DateTime = signal<Temporal.PlainDateTime | null>(null);
  step5DateTime = signal<Temporal.PlainDateTime | null>(null);
  step15DateTime = signal<Temporal.PlainDateTime | null>(null);

  // ============================================================
  // Min/Max constraints
  // ============================================================

  constrainedDateTime = signal<Temporal.PlainDateTime | null>(null);
  minDateTime = Temporal.Now.plainDateISO().toPlainDateTime({ hour: 8, minute: 0 });
  maxDateTime = Temporal.Now.plainDateISO()
    .add({ months: 3 })
    .toPlainDateTime({ hour: 18, minute: 0 });

  // ============================================================
  // Size variants
  // ============================================================

  xsDateTime = signal<Temporal.PlainDateTime | null>(null);
  smDateTime = signal<Temporal.PlainDateTime | null>(null);
  mdDateTime = signal<Temporal.PlainDateTime | null>(null);
  lgDateTime = signal<Temporal.PlainDateTime | null>(null);

  // ============================================================
  // States
  // ============================================================

  disabledDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-01-01T09:00')
  );
  readonlyDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-12-25T12:00')
  );
  errorDateTime = signal<Temporal.PlainDateTime | null>(null);
  requiredDateTime = signal<Temporal.PlainDateTime | null>(null);

  // ============================================================
  // Locale demos
  // ============================================================

  germanDateTime = signal<Temporal.PlainDateTime | null>(null);
  usDateTime = signal<Temporal.PlainDateTime | null>(null);

  germanFormat: DateFormatConfig = { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
  usFormat: DateFormatConfig = { pattern: 'mm/dd/yyyy', firstDayOfWeek: 7 };

  // ============================================================
  // Markers demo
  // ============================================================

  markerDateTime = signal<Temporal.PlainDateTime | null>(null);
  fullFeaturedDateTime = signal<Temporal.PlainDateTime | null>(null);
  holidayMarkers: CoarDateMarker[] = [
    // New Year's Day - multiple events on same day
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: "New Year's Day",
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: 'Company Holiday',
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: "Alice's Birthday Party",
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: 'Annual Team Kickoff Meeting',
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: 'Project Alpha Review',
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: 'Budget Planning Session',
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-01'),
      description: 'New Year Fireworks',
    },
    {
      startDate: Temporal.PlainDate.from('2026-01-06'),
      description: 'Epiphany',
    },
    {
      startDate: Temporal.PlainDate.from('2026-02-14'),
      description: "Valentine's Day",
    },
    {
      startDate: Temporal.PlainDate.from('2026-02-14'),
      description: 'Dinner Reservation',
    },
    {
      startDate: Temporal.PlainDate.from('2026-04-05'),
      endDate: Temporal.PlainDate.from('2026-04-06'),
      description: 'Easter Weekend',
    },
    {
      startDate: Temporal.PlainDate.from('2026-04-05'),
      endDate: Temporal.PlainDate.from('2026-04-12'),
      description: 'Spring Vacation',
    },
    {
      startDate: Temporal.PlainDate.from('2026-12-24'),
      description: 'Christmas Eve',
    },
    {
      startDate: Temporal.PlainDate.from('2026-12-25'),
      endDate: Temporal.PlainDate.from('2026-12-26'),
      description: 'Christmas Holidays',
    },
    {
      startDate: Temporal.PlainDate.from('2026-12-24'),
      endDate: Temporal.PlainDate.from('2027-01-02'),
      description: 'Winter Break',
    },
  ];

  // ============================================================
  // Popup sizing demo
  // ============================================================

  popupShellDefault = signal<Temporal.PlainDateTime | null>(null);
  popupShellWithWeeks = signal<Temporal.PlainDateTime | null>(null);

  // ============================================================
  // Code examples
  // ============================================================

  basicDateOnlyExample = `<!-- Date-only mode (no time picker shown) -->
<coar-date-time-picker
  mode="date"
  label="Select a Date"
  [(value)]="selectedDate"
  placeholder="Pick a date..."
/>`;

  basicDateTimeExample = `<!-- DateTime mode (default) - includes time picker -->
<coar-date-time-picker
  mode="datetime"
  label="Appointment"
  [(value)]="appointmentDateTime"
  placeholder="Select date and time..."
/>`;

  timeFormatExample = `<!-- Force 24-hour format -->
<coar-date-time-picker
  label="24-Hour Format"
  [(value)]="dateTime"
  [use24Hour]="true"
/>

<!-- Force 12-hour format with AM/PM -->
<coar-date-time-picker
  label="12-Hour Format"
  [(value)]="dateTime"
  [use24Hour]="false"
/>

<!-- Auto-detect from locale (default) -->
<coar-date-time-picker
  label="Auto-detect"
  [(value)]="dateTime"
  use24Hour="auto"
/>`;

  minuteStepExample = `<!-- 1-minute steps (precise) -->
<coar-date-time-picker
  label="1-Minute Step"
  [(value)]="dateTime"
  [minuteStep]="1"
/>

<!-- 5-minute steps (default) -->
<coar-date-time-picker
  label="5-Minute Step"
  [(value)]="dateTime"
  [minuteStep]="5"
/>

<!-- 15-minute steps (appointments) -->
<coar-date-time-picker
  label="15-Minute Step"
  [(value)]="dateTime"
  [minuteStep]="15"
/>`;

  constraintsExample = `// In component
minDateTime = Temporal.Now.plainDateISO()
  .toPlainDateTime({ hour: 8, minute: 0 });
maxDateTime = Temporal.Now.plainDateISO()
  .add({ months: 3 })
  .toPlainDateTime({ hour: 18, minute: 0 });

// In template
<coar-date-time-picker
  label="Book Appointment"
  [(value)]="selectedDateTime"
  [min]="minDateTime"
  [max]="maxDateTime"
/>`;

  sizesExample = `<coar-date-time-picker size="xs" label="Extra Small" [(value)]="dateTime" />
<coar-date-time-picker size="sm" label="Small" [(value)]="dateTime" />
<coar-date-time-picker size="md" label="Medium (default)" [(value)]="dateTime" />
<coar-date-time-picker size="lg" label="Large" [(value)]="dateTime" />`;

  statesExample = `<coar-date-time-picker
  label="Disabled"
  [(value)]="dateTime"
  disabled
/>

<coar-date-time-picker
  label="Readonly"
  [(value)]="dateTime"
  readonly
/>

<coar-date-time-picker
  label="Error State"
  [(value)]="dateTime"
  error
  message="Please select a valid date and time"
/>

<coar-date-time-picker
  label="Required"
  [(value)]="dateTime"
  required
/>`;

  localeExample = `<!-- German locale with 24h format -->
<coar-date-time-picker
  label="German"
  locale="de-DE"
  [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }"
  [(value)]="dateTime"
/>

<!-- US locale with 12h format (auto-detected) -->
<coar-date-time-picker
  label="US English"
  locale="en-US"
  [dateFormatConfig]="{ pattern: 'mm/dd/yyyy', firstDayOfWeek: 7 }"
  [(value)]="dateTime"
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
<coar-date-time-picker
  label="With Holidays"
  [(value)]="dateTime"
  [markers]="holidayMarkers"
  [highlightWeekends]="true"
/>`;

  fullFeaturedExample = `<coar-date-time-picker
  label="Full Featured Calendar"
  [(value)]="dateTime"
  [markers]="holidayMarkers"
  [showWeekNumbers]="true"
  [highlightWeekends]="true"
  [minuteStep]="15"
/>`;

  // ============================================================
  // Helpers
  // ============================================================

  formatValue(value: Temporal.PlainDate | Temporal.PlainDateTime | null): string {
    if (!value) return 'null';
    return value.toString();
  }
}
