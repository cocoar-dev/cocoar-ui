import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { COAR_LOCALIZATION_DATA_LOADERS } from '../provide-coar-localization';
import { CoarHttpLocaleDataLoader } from './localization-data-loader';

/**
 * Configuration for HTTP locale data source.
 */
export interface CoarHttpLocaleSourceConfig {
  /**
   * URL generator function that returns the URL for a given language.
   *
   * @default (lang) => `/locales/${lang}.json`
   *
   * @param language - Language code (e.g., 'en', 'de', 'en-US')
   * @returns URL to load locale data from
   *
   * @example
   * ```ts
   * url: (lang) => `/locales/${lang}.json`
   * url: (lang) => `/api/config/intl-${lang}.json`
   * url: (lang) => `https://cdn.example.com/locales/${lang}.json`
   * ```
   */
  url?: (language: string) => string;

  /**
   * Optional HTTP headers to include in requests.
   *
   * @example
   * ```ts
   * headers: {
   *   'Authorization': 'Bearer token123',
   *   'X-Custom-Header': 'value'
   * }
   * ```
   */
  headers?: Record<string, string>;
}

/**
 * Provides HTTP as a locale data source.
 *
 * This loader fetches locale data from JSON files via HTTP.
 * Typically used as a second source (after Intl) to provide business-specific
 * overrides like forced firstDayOfWeek, custom separators, etc.
 *
 * @example
 * ```ts
 * // Basic usage (default: /locales/{lang}.json)
 * provideCoarL10nHttpSource()
 *
 * // Custom URL pattern
 * provideCoarL10nHttpSource({
 *   url: (lang) => `/api/config/intl-${lang}.json`
 * })
 *
 * // With authentication
 * provideCoarL10nHttpSource({
 *   url: (lang) => `/api/locales/${lang}.json`,
 *   headers: {
 *     'Authorization': 'Bearer ' + getToken()
 *   }
 * })
 * ```
 *
 * Expected file structure:
 * ```
 * public/locales/
 *   en.json  - English overrides
 *   de.json  - German overrides
 * ```
 *
 * JSON files should contain partial CoarLocalizationData:
 * ```json
 * {
 *   "code": "de",
 *   "date": {
 *     "firstDayOfWeek": 1
 *   }
 * }
 * ```
 */
export function provideCoarL10nHttpSource(
  config?: CoarHttpLocaleSourceConfig
): EnvironmentProviders {
  const urlFn = config?.url ?? ((lang: string) => `/locales/${lang}.json`);
  const headers = config?.headers;

  return makeEnvironmentProviders([
    {
      provide: COAR_LOCALIZATION_DATA_LOADERS,
      multi: true,
      useFactory: (http: HttpClient) => {
        return new CoarHttpLocaleDataLoader(http, urlFn, headers);
      },
      deps: [HttpClient],
    },
  ]);
}
