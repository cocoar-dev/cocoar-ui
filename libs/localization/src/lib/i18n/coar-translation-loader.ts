import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
 * HTTP-based translation loader.
 *
 * Loads translation JSON files from a configurable URL function.
 *
 * ## Usage
 * ```ts
 * const loader = new CoarHttpTranslationLoader();
 * loader.urlFn = (lang) => `/i18n/${lang}.json`;
 * loader.headers = { 'Authorization': 'Bearer token' };
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
    const url = this.urlFn(language);
    return this.http.get<CoarTranslations>(url, {
      headers: this.headers,
    });
  }
}
