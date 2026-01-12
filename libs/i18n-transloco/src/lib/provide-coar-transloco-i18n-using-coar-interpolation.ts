import { Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { COAR_I18N_PROVIDER, CoarI18nProvider, coarInterpolate } from '@cocoar/i18n';

/**
 * Provides COAR_I18N_PROVIDER backed by TranslocoService with strict Cocoar interpolation.
 *
 * This variant uses Cocoar's own placeholder interpolation ({name} syntax)
 * instead of Transloco's built-in interpolation. Use this if you want
 * consistent placeholder behavior across different i18n backends.
 *
 * @example
 * ```ts
 * import { provideTransloco } from '@jsverse/transloco';
 * import { provideCoarI18nUsingTranslocoWithCoarInterpolation } from '@cocoar/i18n-transloco';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideTransloco({ ... }),
 *     ...provideCoarI18nUsingTranslocoWithCoarInterpolation(),
 *   ],
 * };
 * ```
 */
export function provideCoarTranslocoI18nUsingCoarInterpolation(): Provider {
  return {
    provide: COAR_I18N_PROVIDER,
    useFactory: (transloco: TranslocoService): CoarI18nProvider => ({
      t(key: string, params?: Record<string, unknown>): string {
        const template = transloco.translate(key);
        return coarInterpolate(template, params);
      },
    }),
    deps: [TranslocoService],
  };
}
