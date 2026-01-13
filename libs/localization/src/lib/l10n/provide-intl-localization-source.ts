import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { COAR_LOCALIZATION_DATA_LOADERS } from '../provide-coar-localization';
import { CoarIntlLocaleDataLoader } from './intl-localization-data-loader';

/**
 * Provides browser Intl API as a locale data source.
 *
 * This loader detects date/number formatting from the browser's Intl API
 * and provides complete locale data for any language without requiring JSON files.
 *
 * **Recommended as the first source** to provide complete defaults that other
 * sources can override.
 *
 * @example
 * ```ts
 * // Intl only (pure browser defaults)
 * provideCoarLocalization({ defaultLanguage: 'en', availableLanguages: ['en', 'de'] }),
 * provideCoarIntlLocalizationSource(),
 *
 * // Intl + HTTP overrides (recommended)
 * provideCoarLocalization({...}),
 * provideCoarIntlLocalizationSource(), // First source (complete defaults)
 * provideCoarHttpLocalizationSource({  // Second source (business overrides)
 *   url: (lang) => `/locales/${lang}.json`
 * }),
 * ```
 */
export function provideCoarIntlLocalizationSource(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: COAR_LOCALIZATION_DATA_LOADERS,
      multi: true,
      useClass: CoarIntlLocaleDataLoader,
    },
  ]);
}
