import { Provider } from '@angular/core';
import { CoarI18n } from '@cocoar/i18n';

import { provideCoarTranslocoI18n } from './provide-coar-transloco-i18n';
import { provideCoarTranslocoI18nEvents } from './provide-coar-transloco-i18n-events';
import { provideCoarTranslocoI18nUsingCoarInterpolation } from './provide-coar-transloco-i18n-using-coar-interpolation';

/**
 * Convenience providers to wire Cocoar i18n to Transloco.
 *
 * Includes:
 * - `COAR_I18N_PROVIDER`
 * - `COAR_I18N_EVENTS`
 * - `CoarI18n`
 */
export function provideCoarI18nUsingTransloco(): Provider[] {
  return [provideCoarTranslocoI18n(), provideCoarTranslocoI18nEvents(), CoarI18n];
}

/**
 * Same as `provideCoarI18nUsingTransloco()`, but uses Cocoar's `{name}` interpolation
 * instead of Transloco's interpolation.
 */
export function provideCoarI18nUsingTranslocoWithCoarInterpolation(): Provider[] {
  return [
    provideCoarTranslocoI18nUsingCoarInterpolation(),
    provideCoarTranslocoI18nEvents(),
    CoarI18n,
  ];
}
