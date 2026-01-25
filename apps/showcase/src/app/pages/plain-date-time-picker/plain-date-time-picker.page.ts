import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarPlainDateTimePickerComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  type CoarDateMarker,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-plain-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarPlainDateTimePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './plain-date-time-picker.page.html',
  styleUrl: './plain-date-time-picker.page.css',
})
export class PlainDateTimePickerPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-plain-date-time-picker.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-plain-date-time-picker.api.md';

  // Demo values - All using Temporal.PlainDateTime (the ONLY type this picker returns)
  basicDateTime = signal<Temporal.PlainDateTime | null>(null);
  preselectedDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-06-15T14:30')
  );

  // Time format demos
  time24h = signal<Temporal.PlainDateTime | null>(null);
  time12h = signal<Temporal.PlainDateTime | null>(null);

  // Minute step demos
  step1DateTime = signal<Temporal.PlainDateTime | null>(null);
  step5DateTime = signal<Temporal.PlainDateTime | null>(null);
  step15DateTime = signal<Temporal.PlainDateTime | null>(null);

  // Min/Max constraints - typed as Temporal.PlainDateTime
  constrainedDateTime = signal<Temporal.PlainDateTime | null>(null);
  minDateTime = Temporal.Now.plainDateISO().toPlainDateTime({ hour: 8, minute: 0 });
  maxDateTime = Temporal.Now.plainDateISO()
    .add({ months: 3 })
    .toPlainDateTime({ hour: 18, minute: 0 });

  // Size variants
  xsDateTime = signal<Temporal.PlainDateTime | null>(null);
  smDateTime = signal<Temporal.PlainDateTime | null>(null);
  mdDateTime = signal<Temporal.PlainDateTime | null>(null);
  lgDateTime = signal<Temporal.PlainDateTime | null>(null);

  // States
  disabledDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-01-01T09:00')
  );
  readonlyDateTime = signal<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from('2025-12-25T12:00')
  );
  errorDateTime = signal<Temporal.PlainDateTime | null>(null);
  requiredDateTime = signal<Temporal.PlainDateTime | null>(null);

  // Week numbers
  weekNumberDateTime = signal<Temporal.PlainDateTime | null>(null);

  // Markers
  markerDateTime = signal<Temporal.PlainDateTime | null>(null);
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

  // Full featured
  fullFeaturedDateTime = signal<Temporal.PlainDateTime | null>(null);

  // Code examples
  basicExample = `<coar-plain-date-time-picker
  label="Select Date & Time"
  [(value)]="selectedDateTime"
  placeholder="Pick a date and time..."
/>

// Type: Temporal.PlainDateTime | null
// Example value: 2025-06-15T14:30:00`;

  timeFormatExample = `<!-- 24-hour format (explicit) -->
<coar-plain-date-time-picker
  label="24-Hour Format"
  [(value)]="dateTime"
  [use24Hour]="true"
/>

<!-- 12-hour format with AM/PM -->
<coar-plain-date-time-picker
  label="12-Hour Format"
  [(value)]="dateTime"
  [use24Hour]="false"
/>

<!-- Auto-detect from locale (default) -->
<coar-plain-date-time-picker
  label="Auto (from locale)"
  [(value)]="dateTime"
  [use24Hour]="'auto'"
/>`;

  minuteStepExample = `<!-- 1-minute precision -->
<coar-plain-date-time-picker
  label="1 Minute Step"
  [(value)]="dateTime"
  [minuteStep]="1"
/>

<!-- 5-minute intervals (default) -->
<coar-plain-date-time-picker
  label="5 Minute Step"
  [(value)]="dateTime"
  [minuteStep]="5"
/>

<!-- 15-minute intervals -->
<coar-plain-date-time-picker
  label="15 Minute Step"
  [(value)]="dateTime"
  [minuteStep]="15"
/>`;

  minMaxExample = `// In component - min/max are typed as Temporal.PlainDateTime
minDateTime = Temporal.Now.plainDateISO().toPlainDateTime({ hour: 8, minute: 0 });
maxDateTime = Temporal.Now.plainDateISO()
  .add({ months: 3 })
  .toPlainDateTime({ hour: 18, minute: 0 });

// In template
<coar-plain-date-time-picker
  label="Business Hours Only"
  [(value)]="dateTime"
  [min]="minDateTime"
  [max]="maxDateTime"
/>`;

  sizesExample = `<coar-plain-date-time-picker size="xs" label="Extra Small" [(value)]="dateTime" />
<coar-plain-date-time-picker size="sm" label="Small" [(value)]="dateTime" />
<coar-plain-date-time-picker size="md" label="Medium (default)" [(value)]="dateTime" />
<coar-plain-date-time-picker size="lg" label="Large" [(value)]="dateTime" />`;

  statesExample = `<coar-plain-date-time-picker label="Disabled" [(value)]="dateTime" disabled />
<coar-plain-date-time-picker label="Readonly" [(value)]="dateTime" readonly />
<coar-plain-date-time-picker label="Error" [(value)]="dateTime" error="Invalid date/time" />
<coar-plain-date-time-picker label="Required" [(value)]="dateTime" required />`;

  formatDateTime(dateTime: Temporal.PlainDateTime | null): string {
    if (!dateTime) return 'null';
    return dateTime.toString();
  }
}
