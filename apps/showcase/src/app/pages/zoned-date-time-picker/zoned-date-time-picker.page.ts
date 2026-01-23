import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarZonedDateTimePickerComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  type CoarDateMarker,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-zoned-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarZonedDateTimePickerComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './zoned-date-time-picker.page.html',
  styleUrl: './zoned-date-time-picker.page.css',
})
export class ZonedDateTimePickerPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  // Demo values - All using Temporal.ZonedDateTime
  basicZonedDateTime = signal<Temporal.ZonedDateTime | null>(null);

  // Pre-selected with Vienna timezone
  viennaDateTime = signal<Temporal.ZonedDateTime | null>(
    Temporal.ZonedDateTime.from('2025-06-15T14:30[Europe/Vienna]')
  );

  // Different timezones
  newYorkDateTime = signal<Temporal.ZonedDateTime | null>(
    Temporal.ZonedDateTime.from('2025-06-15T10:30[America/New_York]')
  );

  tokyoDateTime = signal<Temporal.ZonedDateTime | null>(
    Temporal.ZonedDateTime.from('2025-06-15T23:30[Asia/Tokyo]')
  );

  // Locked timezone demo
  lockedTzDateTime = signal<Temporal.ZonedDateTime | null>(null);

  // Instant output demo
  instantDemoDateTime = signal<Temporal.ZonedDateTime | null>(null);
  lastInstant = signal<Temporal.Instant | null>(null);

  // Markers
  markerDateTime = signal<Temporal.ZonedDateTime | null>(null);
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

  // Code examples
  basicExample = `<coar-zoned-date-time-picker
  label="Meeting Time"
  [(value)]="meetingDateTime"
  placeholder="Pick a date and time..."
/>

// Type: Temporal.ZonedDateTime | null
// Example value: 2025-06-15T14:30:00+02:00[Europe/Vienna]`;

  timezoneExample = `<!-- Explicit timezone -->
<coar-zoned-date-time-picker
  label="Vienna Meeting"
  [(value)]="viennaDateTime"
  [timeZone]="'Europe/Vienna'"
/>

<!-- Locked timezone (read-only) -->
<coar-zoned-date-time-picker
  label="Fixed Timezone"
  [(value)]="dateTime"
  [timeZone]="'America/New_York'"
  [timeZoneLocked]="true"
/>`;

  instantExample = `<coar-zoned-date-time-picker
  label="Event Time"
  [(value)]="eventDateTime"
  (instantChange)="onInstantChanged($event)"
/>

// In component:
onInstantChanged(instant: Temporal.Instant | null) {
  // Use instant for API calls or storage
  // instant.toString() → "2025-06-15T12:30:00Z"
}`;

  intentVsInstantExample = `// ZonedDateTime stores BOTH:
const meeting = Temporal.ZonedDateTime.from('2025-06-15T14:30[Europe/Vienna]');

// 1. User's INTENT (source of truth):
meeting.toPlainDateTime().toString(); // "2025-06-15T14:30:00"
meeting.timeZoneId;                   // "Europe/Vienna"

// 2. Derived INSTANT (for queries/ordering):
meeting.toInstant().toString();       // "2025-06-15T12:30:00Z"

// If DST rules change, you can recalculate the instant
// from the stored intent - no data corruption!`;

  // Helper methods
  formatZonedDateTime(val: Temporal.ZonedDateTime | null): string {
    if (!val) return 'null';
    const local = val.toPlainDateTime().toString().substring(0, 16);
    return `${local} [${val.timeZoneId}]`;
  }

  formatInstant(val: Temporal.Instant | null): string {
    if (!val) return 'null';
    return val.toString();
  }

  onInstantChanged(instant: Temporal.Instant | null): void {
    this.lastInstant.set(instant);
  }
}
