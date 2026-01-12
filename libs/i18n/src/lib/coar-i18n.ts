import { Injectable, inject } from '@angular/core';
import { COAR_I18N_PROVIDER } from './coar-i18n-provider';
import { coarIsMissingTranslation } from './coar-is-missing-translation';
import { coarInterpolate } from './coar-interpolate';

/**
 * Core i18n service for the Cocoar Design System.
 *
 * This service wraps a CoarI18nProvider and adds convenience methods like tWithDefault.
 * Components inject this service directly to access translations.
 *
 * @example
 * ```ts
 * import { Component, inject } from '@angular/core';
 * import { CoarI18n } from '@cocoar/i18n';
 *
 * @Component({
 *   selector: 'app-example',
 *   template: `<button>{{ saveLabel }}</button>`,
 * })
 * export class ExampleComponent {
 *   private readonly i18n = inject(CoarI18n);
 *
 *   saveLabel = this.i18n.tWithDefault('coar.button.save', 'Save');
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CoarI18n {
  private readonly provider = inject(COAR_I18N_PROVIDER);

  /**
   * Translate a key into a localized string.
   *
   * @param key i18n key, e.g. 'coar.datePicker.today'
   * @param params optional interpolation parameters for placeholders like {name}
   * @returns the translated and interpolated string
   */
  t(key: string, params?: Record<string, unknown>): string {
    return this.provider.t(key, params);
  }

  /**
   * Translate a key with a fallback value if the translation is missing.
   *
   * @param key i18n key, e.g. 'coar.button.save'
   * @param fallback fallback text to use if translation is missing
   * @param params optional interpolation parameters
   * @returns the translated string, or fallback if missing
   */
  tWithDefault(key: string, fallback: string, params?: Record<string, unknown>): string {
    const result = this.provider.t(key, params);

    if (coarIsMissingTranslation(key, result)) {
      return coarInterpolate(fallback, params);
    }

    return result;
  }
}
