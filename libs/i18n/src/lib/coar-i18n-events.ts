import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Optional events contract for language changes.
 *
 * Implementations SHOULD emit on languageChanged$ whenever the effective
 * language for translations changes (e.g. when Transloco switches languages).
 *
 * This allows components and pipes to react to runtime language changes
 * without page reload.
 */
export interface CoarI18nEvents {
  /**
   * Emits whenever the active language changes.
   * Consumers can subscribe to update UI at runtime.
   */
  languageChanged$: Observable<void>;
}

/**
 * Optional DI token for language change events.
 *
 * Consumers (components, pipes) should treat this as optional and
 * degrade gracefully when it is not provided.
 */
export const COAR_I18N_EVENTS = new InjectionToken<CoarI18nEvents>('COAR_I18N_EVENTS');
