import {
  APP_INITIALIZER,
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
  Type,
  inject,
} from '@angular/core';
import { CoarLocalizationService } from '../coar-localization.service';
import { COAR_I18N_PROVIDER } from './coar-i18n-provider';
import { CoarI18nService } from './coar-i18n.service';
import { CoarTranslationLoader, CoarHttpTranslationLoader } from './coar-translation-loader';

/**
 * Configuration for Cocoar i18n system.
 */
export interface CoarI18nConfig {
  /**
   * Translation loader to use.
   *
   * Provide a class that implements `CoarTranslationLoader`.
   *
   * ## Built-in loaders
   * - `CoarHttpTranslationLoader` - Load from HTTP (default)
   *
   * ## Custom loader
   * ```ts
   * @Injectable()
   * class MyLoader implements CoarTranslationLoader {
   *   loadTranslations(lang: string): Observable<CoarTranslations> {
   *     // Your implementation
   *   }
   * }
   *
   * provideCoarI18n({ loader: MyLoader })
   * ```
   */
  loader?: Type<CoarTranslationLoader>;

  /**
   * Base path for HTTP loader.
   *
   * Only used when `loader` is `CoarHttpTranslationLoader`.
   *
   * @default '/i18n/'
   */
  basePath?: string;
}

/**
 * Provides complete Cocoar i18n system.
 *
 * Sets up translation loading, storage, and automatic language synchronization.
 *
 * ## Features
 * - Automatic translation loading when language changes
 * - Preloads initial language (prevents flash of untranslated content)
 * - Signal-based reactive updates
 * - Customizable loader (HTTP, SignalR, static, etc.)
 *
 * ## Basic usage
 * ```ts
 * import { provideCoarLocalization } from '@cocoar/localization';
 * import { provideCoarI18n } from '@cocoar/localization';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(),
 *     provideCoarLocalization({
 *       availableLanguages: ['en', 'de', 'fr'],
 *       defaultLanguage: 'en',
 *     }),
 *     provideCoarI18n(),
 *   ],
 * };
 * ```
 *
 * ## Custom HTTP path
 * ```ts
 * provideCoarI18n({
 *   basePath: '/assets/translations/',
 * })
 * ```
 *
 * ## Custom loader (e.g., SignalR)
 * ```ts
 * @Injectable()
 * class SignalRTranslationLoader implements CoarTranslationLoader {
 *   loadTranslations(lang: string): Observable<CoarTranslations> {
 *     return this.signalR.getTranslations(lang);
 *   }
 * }
 *
 * provideCoarI18n({
 *   loader: SignalRTranslationLoader,
 * })
 * ```
 *
 * @param config - Optional configuration
 * @returns Environment providers for the i18n system
 */
export function provideCoarI18n(config?: CoarI18nConfig): EnvironmentProviders {
  const loaderClass = config?.loader ?? CoarHttpTranslationLoader;
  const basePath = config?.basePath ?? '/i18n/';

  const providers: Provider[] = [
    // Provide the loader
    {
      provide: CoarTranslationLoader,
      useFactory: () => {
        const instance = new loaderClass();
        // For HTTP loader, set basePath
        if (instance instanceof CoarHttpTranslationLoader) {
          instance.basePath = basePath;
        }
        return instance;
      },
    },

    // Provide the i18n service as COAR_I18N_PROVIDER
    {
      provide: COAR_I18N_PROVIDER,
      useClass: CoarI18nService,
    },

    // Preload initial language to prevent flash of untranslated content
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const service = inject(COAR_I18N_PROVIDER) as CoarI18nService;
        const locale = inject(CoarLocalizationService);

        return async () => {
          const initialLanguage = locale.getCurrentLanguage();
          await service.preloadLanguage(initialLanguage);
        };
      },
    },
  ];

  return makeEnvironmentProviders(providers);
}
