import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { CoarI18n } from '@cocoar/i18n';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { provideCoarTranslocoI18n } from './provide-coar-transloco-i18n';
import { provideCoarTranslocoI18nEvents } from './provide-coar-transloco-i18n-events';

function provideCoarTranslocoActiveLanguagePreload(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (transloco: TranslocoService, errorHandler: ErrorHandler) => {
      return () => {
        const lang = transloco.getActiveLang();
        return firstValueFrom(transloco.load(lang)).catch((err) => {
          errorHandler.handleError(err);
        });
      };
    },
    deps: [TranslocoService, ErrorHandler],
  };
}

/**
 * Convenience providers to wire Cocoar i18n to Transloco.
 *
 * Includes:
 * - `COAR_I18N_PROVIDER`
 * - `COAR_I18N_EVENTS`
 * - `CoarI18n`
 */
export function provideCoarI18nUsingTransloco(): Provider[] {
  return [
    provideCoarTranslocoActiveLanguagePreload(),
    provideCoarTranslocoI18n(),
    provideCoarTranslocoI18nEvents(),
    CoarI18n,
  ];
}
