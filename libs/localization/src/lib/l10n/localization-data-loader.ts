import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { CoarLocalizationData } from './localization-data';
import { HttpClient } from '@angular/common/http';

/**
 * Abstract loader for locale data.
 * Implement this interface to load locale data from any source (HTTP, memory, database, etc.).
 */
@Injectable({ providedIn: 'root' })
export abstract class CoarLocalizationDataLoader {
  /**
   * Load locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @returns Observable that emits the locale data
   */
  abstract loadLocaleData(locale: string): Observable<CoarLocalizationData>;
}

/**
 * HTTP-based locale data loader.
 * Loads locale data from JSON files via HTTP.
 *
 * Supports custom URL patterns and headers for authentication/configuration.
 * Typically used as a second source (after Intl) to provide business-specific overrides.
 *
 * @example
 * ```typescript
 * // Simple base path
 * new CoarHttpLocaleDataLoader(httpClient, (lang) => `/locales/${lang}.json`)
 *
 * // Custom URL pattern
 * new CoarHttpLocaleDataLoader(httpClient, (lang) => `/api/config/intl-${lang}.json`)
 *
 * // With headers
 * new CoarHttpLocaleDataLoader(
 *   httpClient,
 *   (lang) => `/api/locales/${lang}.json`,
 *   { 'Authorization': 'Bearer token' }
 * )
 * ```
 */
export class CoarHttpLocaleDataLoader extends CoarLocalizationDataLoader {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly urlFn: (language: string) => string,
    private readonly headers?: Record<string, string>
  ) {
    super();
  }

  loadLocaleData(locale: string): Observable<CoarLocalizationData> {
    const url = this.urlFn(locale);

    return this.httpClient.get<CoarLocalizationData>(url, {
      headers: this.headers,
    });
  }
}
