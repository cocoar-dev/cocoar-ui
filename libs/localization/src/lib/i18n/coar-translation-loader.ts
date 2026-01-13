import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CoarTranslations } from './coar-translation-store';

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
 * Loads translation JSON files from a configurable base path.
 *
 * ## Default behavior
 * - Base path: `/i18n/`
 * - File pattern: `{language}.json`
 * - Example: `/i18n/en.json`, `/i18n/de.json`
 *
 * ## Custom path
 * ```ts
 * const loader = new CoarHttpTranslationLoader();
 * loader.basePath = '/assets/translations/';
 * // Loads: /assets/translations/en.json
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

  /** Base path for translation files */
  basePath = '/i18n/';

  loadTranslations(language: string): Observable<CoarTranslations> {
    const url = `${this.basePath}${language}.json`;
    return this.http.get<CoarTranslations>(url);
  }
}
