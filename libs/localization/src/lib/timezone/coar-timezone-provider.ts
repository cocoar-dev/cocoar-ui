import { Observable } from 'rxjs';

/**
 * Provider interface for timezone resolution.
 *
 * Providers are resolved in priority order (config array → Browser Intl).
 * First non-null value wins.
 *
 * @example
 * ```ts
 * // Custom provider from user profile service
 * class ProfileTimeZoneProvider implements CoarTimeZoneProvider {
 *   constructor(private profileService: ProfileService) {}
 *
 *   get timeZone$(): Observable<string | null> {
 *     return this.profileService.settings$.pipe(
 *       map(settings => settings.timeZone ?? null)
 *     );
 *   }
 * }
 * ```
 */
export interface CoarTimeZoneProvider {
  /**
   * Observable stream of IANA timezone identifier.
   *
   * - Emit `string` (e.g., "America/New_York") when provider has a value
   * - Emit `null` when provider has no value (fallback to next provider)
   * - Must be reactive: changes should emit new values
   *
   * Examples of valid IANA identifiers:
   * - "America/New_York"
   * - "Europe/Paris"
   * - "Asia/Tokyo"
   * - "UTC"
   */
  readonly timeZone$: Observable<string | null>;
}
