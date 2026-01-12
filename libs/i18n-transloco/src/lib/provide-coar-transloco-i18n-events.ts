import { Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { COAR_I18N_EVENTS, CoarI18nEvents } from '@cocoar/i18n';
import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Provides COAR_I18N_EVENTS backed by TranslocoService.langChanges$.
 *
 * This provider connects Transloco's language change notifications to
 * the Cocoar i18n events contract, enabling runtime language switching
 * in COAR UI components and pipes.
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
export function provideCoarTranslocoI18nEvents(): Provider {
  return {
    provide: COAR_I18N_EVENTS,
    useFactory: (transloco: TranslocoService): CoarI18nEvents => ({
      languageChanged$: merge(
        transloco.langChanges$,
        transloco.events$.pipe(
          filter(
            (event) =>
              event.type === 'translationLoadSuccess' || event.type === 'translationLoadFailure'
          )
        )
      ).pipe(map(() => void 0)),
    }),
    deps: [TranslocoService],
  };
}
