import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CoarTranslationLoader, CoarHttpTranslationLoader } from './coar-translation-loader';

/**
 * Configuration for HTTP translation source.
 */
export interface CoarI18nHttpSourceConfig {
  /**
   * URL generator function that returns the URL for a given language.
   *
   * @default (lang) => `/i18n/${lang}.json`
   *
   * @param language - Language code (e.g., 'en', 'de', 'en-US')
   * @returns URL to load translations from
   *
   * @example
   * ```ts
   * url: (lang) => `/i18n/${lang}.json`
   * url: (lang) => `/api/translations/${lang}.json`
   * url: (lang) => `https://cdn.example.com/i18n/${lang}.json`
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
 * Provides HTTP as a translation source.
 *
 * This loader fetches translation files from HTTP endpoints.
 * Typically used for standard i18n scenarios where translations are stored as JSON files.
 *
 * **Note:** The i18n system is automatically included by `provideCoarLocalization()`.
 * This function only registers the HTTP loader for loading translations.
 *
 * @example
 * ```ts
 * // Basic usage (default: /i18n/{lang}.json)
 * provideCoarI18nHttpSource()
 *
 * // Custom path
 * provideCoarI18nHttpSource({
 *   url: (lang) => `/assets/translations/${lang}.json`
 * })
 *
 * // With authentication
 * provideCoarI18nHttpSource({
 *   url: (lang) => `/api/translations/${lang}.json`,
 *   headers: {
 *     'Authorization': 'Bearer ' + getToken()
 *   }
 * })
 * ```
 *
 * Expected file structure:
 * ```
 * public/i18n/
 *   en.json  - English translations
 *   de.json  - German translations
 * ```
 *
 * JSON files should contain flat or nested translations:
 * ```json
 * {
 *   "app": {
 *     "title": "My App",
 *     "button": {
 *       "save": "Save",
 *       "cancel": "Cancel"
 *     }
 *   }
 * }
 * ```
 *
 * @param config - Optional configuration
 * @returns Angular environment providers
 *
 * @see {@link CoarI18nHttpSourceConfig} for configuration options
 */
export function provideCoarI18nHttpSource(config?: CoarI18nHttpSourceConfig): EnvironmentProviders {
  const urlFn = config?.url ?? ((lang: string) => `/i18n/${lang}.json`);
  const headers = config?.headers;

  return makeEnvironmentProviders([
    {
      provide: CoarTranslationLoader,
      useFactory: () => {
        const loader = new CoarHttpTranslationLoader();
        loader.urlFn = urlFn;
        loader.headers = headers;
        return loader;
      },
    },
  ]);
}
