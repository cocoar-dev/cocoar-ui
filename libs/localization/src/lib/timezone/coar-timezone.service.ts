import { Injectable, Optional, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { CoarTimeZoneProvider } from './coar-timezone-provider';
import { BrowserTimeZoneProvider } from './browser-timezone-provider';
import { COAR_TIMEZONE_PROVIDERS } from './coar-timezone-providers.token';

/**
 * Service for timezone resolution with pluggable provider hierarchy.
 *
 * Resolution order:
 * 1. Custom providers (from config, in array order)
 * 2. Browser provider (Intl API, always present as guaranteed baseline)
 * 3. UTC safety net (if all providers return null)
 *
 * First non-null value wins. Changes propagate reactively.
 *
 * @example
 * ```ts
 * // In component
 * export class MyComponent {
 *   private timeZoneService = inject(CoarTimeZoneService);
 *
 *   // Reactive signal (updates when timezone changes)
 *   currentTimeZone = this.timeZoneService.currentTimeZone;
 *
 *   // Observable stream
 *   timeZone$ = this.timeZoneService.timeZone$;
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CoarTimeZoneService {
  private readonly browserProvider = inject(BrowserTimeZoneProvider);
  private readonly customProviders = inject(COAR_TIMEZONE_PROVIDERS, { optional: true }) ?? [];

  /**
   * Observable stream of the current timezone (IANA identifier).
   *
   * Emits when any provider in the hierarchy changes.
   * Uses `distinctUntilChanged()` to prevent unnecessary emissions.
   *
   * Resolution order: Custom providers → Browser → UTC
   */
  readonly timeZone$: Observable<string>;

  /**
   * Signal of the current timezone (IANA identifier).
   *
   * Automatically updates when timezone changes.
   * Use this in templates or reactive contexts.
   */
  readonly currentTimeZone;

  constructor() {
    // Build provider chain: Custom providers → Browser (always last)
    const allProviders: CoarTimeZoneProvider[] = [
      ...this.customProviders,
      this.browserProvider, // Browser is guaranteed baseline, always present
    ];

    // Combine all provider streams
    const providerStreams = allProviders.map((provider) => provider.timeZone$);

    this.timeZone$ = combineLatest(providerStreams).pipe(
      // Find first non-null value in priority order
      map((timeZones) => {
        const resolved = timeZones.find((tz) => tz !== null);
        // UTC as safety net if all providers return null (shouldn't happen)
        return resolved ?? 'UTC';
      }),
      // Prevent unnecessary emissions when value doesn't actually change
      distinctUntilChanged()
    );

    // Initialize signal after timeZone$ is set up
    this.currentTimeZone = toSignal(this.timeZone$, { requireSync: true });
  }
}
