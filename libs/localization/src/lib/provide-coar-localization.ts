import {
  APP_INITIALIZER,
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { CoarLocalizationService } from './coar-localization.service';
import { CoarLocalizationDataLoader } from './l10n/localization-data-loader';
import { CoarLocalizationDataStore } from './l10n/localization-data-store';
import { CoarIntlLocaleDataLoader } from './l10n/intl-localization-data-loader';
import { COAR_I18N_PROVIDER } from './i18n/coar-i18n-provider';
import { CoarI18nService } from './i18n/coar-i18n.service';

/**
 * Configuration for the locale system.
 */
export interface CoarLocalizationConfig {
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
 * Provides the core localization system (language management + L10n + i18n).
 *
 * Automatically includes:
 * - Language management (CoarLocalizationService)
 * - L10n: Browser Intl API for number/date formatting (always first source)
 * - i18n: Translation system (CoarI18nService + CoarTranslationStore)
 *
 * Add optional data sources with:
 * - `provideCoarL10nHttpSource()` - Load L10n overrides from JSON files
 * - `provideCoarI18nHttpSource()` - Load i18n translations from JSON files
 * - Custom sources via multi-providers
 *
 * Sources are executed in registration order and deep-merged.
 *
 * @example
 * ```ts
 * // Basic setup (Intl formatting only, no i18n loader)
 * provideCoarLocalization({
 *   defaultLanguage: 'en',
 * })
 *
 * // With L10n overrides and i18n translations
 * provideCoarLocalization({ defaultLanguage: 'en' }),
 * provideCoarL10nHttpSource({
 *   url: (lang) => `/locales/${lang}.json`
 * }),
 * provideCoarI18nHttpSource(),  // Defaults to /i18n/{lang}.json
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

    // L10n: Auto-include Intl source as first loader (provides complete defaults)
    {
      provide: COAR_LOCALIZATION_DATA_LOADERS,
      multi: true,
      useClass: CoarIntlLocaleDataLoader,
    },

    // i18n: Provide the i18n service (translations)
    {
      provide: COAR_I18N_PROVIDER,
      useClass: CoarI18nService,
    },

    // APP_INITIALIZER: Preload default language (L10n + i18n if loader registered)
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const localeService = inject(CoarLocalizationService);
        const i18nService = inject(COAR_I18N_PROVIDER) as CoarI18nService;

        return async () => {
          // Preload L10n data for default language
          try {
            await localeService.setLanguage(config.defaultLanguage);
          } catch (error) {
            console.warn(
              `[CoarLocale] Failed to preload locale data for '${config.defaultLanguage}':`,
              error
            );
          }

          // Preload i18n translations if loader is available
          try {
            await i18nService.preloadLanguage(config.defaultLanguage);
          } catch (error) {
            // Silently ignore if no loader is registered
            // This allows using L10n without i18n
          }
        };
      },
    },
  ]);
}
