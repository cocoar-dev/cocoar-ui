import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';
import type { CoarTranslations } from './coar-translation-store';

/**
 * Injection token for translation loaders (multi-provider).
 * Loaders are executed in order and results are deep-merged.
 * Intl loader is always first (provides common defaults from browser Intl API).
 */
export const COAR_TRANSLATION_LOADERS = new InjectionToken<CoarTranslationLoader[]>(
  'COAR_TRANSLATION_LOADERS'
);

/**
 * Abstract loader for translation data.
 *
 * Implement this interface to load translations from any source:
 * - HTTP endpoints
 * - SignalR real-time updates
 * - Static imports
 * - IndexedDB
 * - etc.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class MyCustomLoader implements CoarTranslationLoader {
 *   loadTranslations(language: string): Observable<CoarTranslations> {
 *     // Load from your custom source
 *     return this.myService.getTranslations(language);
 *   }
 * }
 * ```
 */
export abstract class CoarTranslationLoader {
  /**
   * Loads translation data for a specific language.
   *
   * @param language - Language code to load (e.g., 'en', 'de')
   * @returns Observable that emits translation key-value pairs
   */
  abstract loadTranslations(language: string): Observable<CoarTranslations>;
}

/**
 * HTTP-based translation loader with BCP 47 fallback.
 *
 * Loads translation JSON files from a configurable URL function.
 *
 * When a full BCP 47 tag is used (e.g., `de-AT`), the loader:
 * 1. Loads the base language file (`de.json`)
 * 2. Tries to load the regional file (`de-AT.json`)
 * 3. Merges them — regional keys override base keys
 *
 * If the regional file doesn't exist, the base file is used as-is.
 * If the base file doesn't exist either, the loader fails (propagated to caller).
 *
 * This means `en.json` serves all English variants. An optional `en-AT.json`
 * only needs to contain keys that differ from the base.
 *
 * ## Usage
 * ```ts
 * const loader = new CoarHttpTranslationLoader();
 * loader.urlFn = (lang) => `/i18n/${lang}.json`;
 * loader.headers = { 'Authorization': 'Bearer token' };
 * ```
 *
 * ## Expected file structure
 * ```
 * /i18n/
 *   en.json       ← base English (used for en-US, en-GB, en-AT, etc.)
 *   en-AT.json    ← optional: only keys that differ from en.json
 *   de.json       ← base German
 *   de-AT.json    ← optional: Austrian overrides (if any)
 * ```
 *
 * ## Expected JSON format
 * ```json
 * {
 *   "hello": "Hello",
 *   "goodbye": "Goodbye",
 *   "welcome": "Welcome, {{name}}!"
 * }
 * ```
 */
@Injectable()
export class CoarHttpTranslationLoader implements CoarTranslationLoader {
  private readonly http = inject(HttpClient);

  /** URL generator function */
  urlFn: (language: string) => string = (lang) => `/i18n/${lang}.json`;

  /** Optional HTTP headers */
  headers?: Record<string, string>;

  loadTranslations(language: string): Observable<CoarTranslations> {
    const baseLanguage = extractBaseLanguage(language);

    if (baseLanguage) {
      // BCP 47 tag with region (e.g., 'de-AT'):
      // Load base ('de') first, then try regional ('de-AT'), merge them.
      return forkJoin([
        this.loadFile(baseLanguage),
        this.loadFile(language).pipe(catchError(() => of(null))),
      ]).pipe(
        map(([base, regional]) => ({
          ...base,
          ...(regional ?? {}),
        }))
      );
    }

    // Simple language code (e.g., 'de'): load directly.
    return this.loadFile(language);
  }

  private loadFile(language: string): Observable<CoarTranslations> {
    const url = this.urlFn(language);
    return this.http.get<CoarTranslations>(url, {
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
