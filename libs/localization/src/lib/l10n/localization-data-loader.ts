import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';
import type { CoarLocalizationData } from './localization-data';
import { HttpClient } from '@angular/common/http';
import { mergeLocalizationData } from './merge-localization-data';

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
 * HTTP-based locale data loader with BCP 47 fallback.
 *
 * Loads locale data from JSON files via HTTP.
 * Typically used as a second source (after Intl) to provide business-specific overrides.
 *
 * When a full BCP 47 tag is used (e.g., `de-AT`), the loader:
 * 1. Loads the base language file (`de.json`)
 * 2. Tries to load the regional file (`de-AT.json`)
 * 3. Deep-merges them — regional fields override base fields
 *
 * If the regional file doesn't exist, the base file is used as-is.
 * If the base file doesn't exist either, the loader fails (propagated to caller).
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
 *
 * ## Expected file structure
 * ```
 * /locales/
 *   en.json       ← base English overrides
 *   en-AT.json    ← optional: Austrian-specific overrides on top of en.json
 *   de.json       ← base German overrides
 *   de-AT.json    ← optional: Austrian-specific overrides on top of de.json
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
    const baseLanguage = extractBaseLanguage(locale);

    if (baseLanguage) {
      // BCP 47 tag with region (e.g., 'de-AT'):
      // Load base ('de') first, then try regional ('de-AT'), deep-merge them.
      return forkJoin([
        this.loadFile(baseLanguage),
        this.loadFile(locale).pipe(catchError(() => of(null))),
      ]).pipe(
        map(([base, regional]) => {
          if (!regional) return base;
          return mergeLocalizationData([base, regional]) ?? base;
        })
      );
    }

    // Simple language code (e.g., 'de'): load directly.
    return this.loadFile(locale);
  }

  private loadFile(locale: string): Observable<CoarLocalizationData> {
    const url = this.urlFn(locale);
    return this.httpClient.get<CoarLocalizationData>(url, {
      headers: this.headers,
    });
  }
}

/**
 * Extract the base language from a BCP 47 tag.
 * Returns `null` if the tag has no region component.
 *
 * @example
 * extractBaseLanguage('de-AT') // → 'de'
 * extractBaseLanguage('en-US') // → 'en'
 * extractBaseLanguage('de')    // → null
 */
function extractBaseLanguage(language: string): string | null {
  const hyphenIndex = language.indexOf('-');
  return hyphenIndex > 0 ? language.substring(0, hyphenIndex) : null;
}
