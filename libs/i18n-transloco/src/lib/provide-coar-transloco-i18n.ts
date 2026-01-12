import { ErrorHandler, Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { COAR_I18N_PROVIDER, CoarI18nProvider } from '@cocoar/i18n';

/**
 * Provides COAR_I18N_PROVIDER backed by TranslocoService.
 *
 * This provider bridges the Cocoar i18n contract to Transloco,
 * allowing COAR UI components to use Transloco for translations.
 * Transloco's own interpolation is used for placeholder replacement.
 *
 * @example
 * ```ts
 * import { provideTransloco } from '@jsverse/transloco';
 * import { provideCoarI18nUsingTransloco } from '@cocoar/i18n-transloco';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideTransloco({ ... }),
 *     ...provideCoarI18nUsingTransloco(),
 *   ],
 * };
 * ```
 */
export function provideCoarTranslocoI18n(): Provider {
  return {
    provide: COAR_I18N_PROVIDER,
    useFactory: (transloco: TranslocoService, errorHandler: ErrorHandler): CoarI18nProvider => {
      const loadedLangs = new Set<string>();

      const ensureActiveLanguageLoaded = (): void => {
        const lang = transloco.getActiveLang();
        if (loadedLangs.has(lang)) {
          return;
        }

        loadedLangs.add(lang);
        transloco.load(lang).subscribe({
          error: (err) => errorHandler.handleError(err),
        });
      };

      return {
        t(key: string): string {
          // Transloco's `translate()` is sync and does not trigger loading.
          // We proactively load the active language so consumers (like CoarI18nPipe)
          // can render translations without requiring TranslocoPipe/directives.
          ensureActiveLanguageLoaded();
          // CoarI18n always applies Cocoar interpolation (`{name}`) on top.
          // Passing params into Transloco here would mix interpolation semantics.
          return transloco.translate(key);
        },
      };
    },
    deps: [TranslocoService, ErrorHandler],
  };
}
