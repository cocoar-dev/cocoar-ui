import { InjectionToken } from '@angular/core';

/**
 * Core i18n provider interface for translation engines.
 *
 * Providers (Transloco, custom, etc.) only need to implement this minimal interface.
 * The CoarI18n service wraps this provider and adds convenience methods.
 */
export interface CoarI18nProvider {
  /**
   * Translate a key into a localized string.
   *
   * @param key i18n key, e.g. 'coar.datePicker.today'
   * @param params optional interpolation parameters for placeholders like {name}
   * @returns the translated and interpolated string
   */
  t(key: string, params?: Record<string, unknown>): string;
}

/**
 * Injection token for the i18n provider implementation.
 *
 * Apps should provide this token with their chosen i18n backend (Transloco, custom, etc.).
 */
export const COAR_I18N_PROVIDER = new InjectionToken<CoarI18nProvider>('COAR_I18N_PROVIDER');
