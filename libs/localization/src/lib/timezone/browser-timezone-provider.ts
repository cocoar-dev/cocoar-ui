import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoarTimeZoneProvider } from './coar-timezone-provider';

/**
 * Built-in timezone provider using browser's Intl API.
 *
 * Always present as guaranteed baseline fallback.
 * Returns the user's operating system timezone.
 *
 * Note: This is a one-time snapshot. If user changes OS timezone
 * while app is running, this will not update (browser limitation).
 *
 * @internal
 */
@Injectable()
export class BrowserTimeZoneProvider implements CoarTimeZoneProvider {
  readonly timeZone$: Observable<string | null>;

  constructor() {
    // Detect browser timezone using Intl API
    // This is a one-time snapshot (browser doesn't provide reactive updates)
    const browserTimeZone = this.detectBrowserTimeZone();
    this.timeZone$ = of(browserTimeZone);
  }

  private detectBrowserTimeZone(): string {
    try {
      // Use Intl API to get user's timezone
      // Example return values: "America/New_York", "Europe/Paris", "Asia/Tokyo"
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Fallback to UTC if browser returns undefined (shouldn't happen in modern browsers)
      return timeZone || 'UTC';
    } catch {
      // Fallback to UTC if Intl API fails
      return 'UTC';
    }
  }
}
