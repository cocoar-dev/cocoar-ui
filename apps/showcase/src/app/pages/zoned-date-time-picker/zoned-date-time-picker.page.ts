import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import {
  CoarZonedDateTimePickerComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
  CoarNoteComponent,
  type CoarDateMarker,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-zoned-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarZonedDateTimePickerComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
    CoarNoteComponent,
  ],
  templateUrl: './zoned-date-time-picker.page.html',
  styleUrl: './zoned-date-time-picker.page.css',
})
export class ZonedDateTimePickerPage {
  importCode = `import { CoarZonedDateTimePickerComponent } from '@cocoar/ui/components';`;

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
/>`;

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
}
