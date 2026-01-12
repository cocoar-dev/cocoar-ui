import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { CoarI18n } from './coar-i18n';
import { CoarI18nEvents } from './coar-i18n-events';
import { coarTWithDefault } from './coar-t-with-default';

/**
 * Observable-based helper for reactive translation usage.
 *
 * Returns an observable that emits the translated string whenever the language changes.
 * Uses the same missing-translation semantics as the coarI18n pipe.
 *
 * If no language change events are available, emits once with the current translation.
 *
 * @param i18n - The CoarI18n service instance
 * @param events - The CoarI18nEvents service (optional)
 * @param key - The translation key
 * @param params - Optional interpolation parameters
 * @param fallback - The fallback text to use if translation is missing (default: '')
 * @returns An observable that emits the translated string
 *
 * @example
 * ```ts
 * import { Component, inject } from '@angular/core';
 * import { toSignal } from '@angular/core/rxjs-interop';
 * import { CoarI18n, COAR_I18N_EVENTS, coarT$ } from '@cocoar/i18n';
 *
 * @Component({
 *   selector: 'app-example',
 *   template: `<h1>{{ title() }}</h1>`,
 * })
 * export class ExampleComponent {
 *   private readonly i18n = inject(CoarI18n);
 *   private readonly events = inject(COAR_I18N_EVENTS, { optional: true });
 *
 *   readonly title = toSignal(
 *     coarT$(this.i18n, this.events, 'coar.alert.errorTitle', undefined, 'Error')
 *   );
 * }
 * ```
 */
export function coarT$(
  i18n: CoarI18n,
  events: CoarI18nEvents | null | undefined,
  key: string,
  params?: Record<string, unknown>,
  fallback = ''
): Observable<string> {
  // If there are no language change events, just emit once
  if (!events) {
    return of(coarTWithDefault(i18n, key, fallback, params));
  }

  return events.languageChanged$.pipe(
    startWith<void>(undefined),
    map(() => coarTWithDefault(i18n, key, fallback, params)),
    distinctUntilChanged()
  );
}
