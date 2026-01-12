import { Provider } from '@angular/core';
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
    useFactory: (transloco: TranslocoService): CoarI18nProvider => ({
      t(key: string, params?: Record<string, unknown>): string {
        return transloco.translate(key, params);
      },
    }),
    deps: [TranslocoService],
  };
}
