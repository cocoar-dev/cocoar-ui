import { Injectable } from '@angular/core';
import { CoarI18nProvider } from './coar-i18n-provider';
import { coarInterpolate } from './coar-interpolate';

/**
 * Default/fallback implementation of CoarI18nProvider.
 *
 * This is a minimal passthrough implementation that returns the key unchanged,
 * with placeholder interpolation applied if params are provided.
 *
 * Used when the app does not provide a custom i18n provider.
 * The CoarI18n service wraps this and adds the tWithDefault method.
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
@Injectable()
export class CoarDefaultI18n implements CoarI18nProvider {
  t(key: string, params?: Record<string, unknown>): string {
    // Return the key as-is with interpolation applied
    return coarInterpolate(key, params);
  }
}
