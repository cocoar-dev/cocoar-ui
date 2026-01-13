import {
  APP_INITIALIZER,
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { CoarLocalizationService } from './coar-localization.service';
import { CoarLocalizationDataLoader } from './l10n/localization-data-loader';
import { CoarLocalizationDataStore } from './l10n/localization-data-store';

/**
 * Configuration for the locale system.
 */
export interface CoarLocalizationConfig {
  /**
   * List of available languages in the application.
   */
  availableLanguages: string[];

  /**
   * Default language to use on initialization.
   */
  defaultLanguage: string;
}

/**
 * Injection token for locale configuration.
 */
export const COAR_LOCALIZATION_CONFIG = new InjectionToken<CoarLocalizationConfig>(
  'COAR_LOCALIZATION_CONFIG'
);

/**
 * Injection token for locale data loaders (multi-provider).
 * Loaders are executed in order and results are deep-merged.
 * Intl loader is always first (provides complete defaults).
 */
export const COAR_LOCALIZATION_DATA_LOADERS = new InjectionToken<CoarLocalizationDataLoader[]>(
  'COAR_LOCALIZATION_DATA_LOADERS'
);

/**
 * Provides the core locale system (language management).
 *
 * This only provides the language service - no locale data sources.
 * Add locale data sources separately with:
 * - `provideCoarIntlLocalizationSource()` - Browser Intl API (recommended as first source)
 * - `provideCoarHttpLocalizationSource()` - Load from JSON files
 * - Custom sources via `COAR_LOCALIZATION_DATA_LOADERS` multi-provider
 *
 * Sources are executed in registration order and deep-merged.
 *
 * @example
 * ```ts
 * // Minimal setup (no formatting data)
 * provideCoarLocalization({
 *   availableLanguages: ['en', 'de'],
 *   defaultLanguage: 'en',
 * })
 *
 * // With Intl defaults
 * provideCoarLocalization({...}),
 * provideCoarIntlLocalizationSource(),
 *
 * // With Intl + HTTP overrides
 * provideCoarLocalization({...}),
 * provideCoarIntlLocalizationSource(),
 * provideCoarHttpLocalizationSource({
 *   url: (lang) => `/locales/${lang}.json`
 * }),
 * ```
 */
export function provideCoarLocalization(config: CoarLocalizationConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: COAR_LOCALIZATION_CONFIG,
      useValue: config,
    },
    CoarLocalizationService,
    CoarLocalizationDataStore,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (service: CoarLocalizationService) => {
        return async () => {
          // Preload default language from all sources
          try {
            await service.setLanguage(config.defaultLanguage);
          } catch (error) {
            console.warn(
              `[CoarLocale] Failed to preload locale data for '${config.defaultLanguage}':`,
              error
            );
          }
        };
      },
      deps: [CoarLocalizationService],
    },
  ]);
}
