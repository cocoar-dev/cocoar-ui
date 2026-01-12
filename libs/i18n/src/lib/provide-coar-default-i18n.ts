import { Provider } from '@angular/core';
import { COAR_I18N_PROVIDER } from './coar-i18n-provider';
import { CoarDefaultI18n } from './coar-default-i18n';

/**
 * Provides the default i18n provider.
 *
 * This minimal provider returns keys unchanged with interpolation applied.
 * Use this as a fallback when no translation engine is configured.
 *
 * @example
 * ```ts
 * import { provideCoarDefaultI18n } from '@cocoar/i18n';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideCoarDefaultI18n()],
 * };
 * ```
 */
export function provideCoarDefaultI18n(): Provider {
  return {
    provide: COAR_I18N_PROVIDER,
    useClass: CoarDefaultI18n,
  };
}
