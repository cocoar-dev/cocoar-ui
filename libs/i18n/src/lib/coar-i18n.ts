import { Injectable, Signal, inject } from '@angular/core';
import { COAR_I18N_PROVIDER } from './coar-i18n-provider';
import { coarIsMissingTranslation } from './coar-is-missing-translation';
import { coarInterpolate } from './coar-interpolate';
import { distinctUntilChanged, map, Observable, of, startWith } from 'rxjs';
import { COAR_I18N_EVENTS } from './coar-i18n-events';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class CoarI18n {
  private readonly provider = inject(COAR_I18N_PROVIDER);
  private readonly events = inject(COAR_I18N_EVENTS, { optional: true });

  /**
   * Translate a key into a localized string.
   *
   * Overloads:
   *  - t(key)
   *  - t(key, fallback)
   *  - t(key, params)
   *  - t(key, fallback, params)
   */
  t(key: string): string;
  t(key: string, fallback: string): string;
  t(key: string, params: Record<string, unknown>): string;
  t(key: string, fallback: string, params?: Record<string, unknown>): string;
  t(
    key: string,
    fallbackOrParams?: string | Record<string, unknown>,
    maybeParams?: Record<string, unknown>
  ): string {
    let fallback: string | undefined;
    let params: Record<string, unknown> | undefined;

    if (typeof fallbackOrParams === 'string') {
      // t(key, 'Fallback') oder t(key, 'Fallback', params)
      fallback = fallbackOrParams;
      params = maybeParams;
    } else {
      // t(key) oder t(key, params)
      params = fallbackOrParams;
      fallback = undefined;
    }

    const raw = this.provider.t(key, params);

    const base = coarIsMissingTranslation(key, raw) ? (fallback ?? key) : (raw ?? '');

    // Important: the fallback (and even the key) may contain {placeholders}
    return coarInterpolate(base, params);
  }

  /**
   * Reactive variant that updates when the language changes (if events are wired).
   */
  t$(key: string, params?: Record<string, unknown>, fallback?: string): Observable<string> {
    // No events → evaluate once
    if (!this.events) {
      return of(this.callT(key, params, fallback));
    }

    // With events → re-evaluate on every language change
    return this.events.languageChanged$.pipe(
      startWith<void>(undefined),
      map(() => this.callT(key, params, fallback)),
      distinctUntilChanged()
    );
  }

  tSignal(key: string, params?: Record<string, unknown>, fallback?: string): Signal<string> {
    const obs$ = this.t$(key, params, fallback);
    return toSignal(obs$, {
      initialValue: this.callT(key, params, fallback),
    });
  }

  // Small helper so t$ doesn't need to replicate the overload matrix.
  private callT(key: string, params?: Record<string, unknown>, fallback?: string): string {
    if (params && fallback !== undefined) {
      // t(key, fallback, params)
      return this.t(key, fallback, params);
    }

    if (params) {
      // t(key, params)
      return this.t(key, params);
    }

    if (fallback !== undefined) {
      // t(key, fallback)
      return this.t(key, fallback);
    }

    // t(key)
    return this.t(key);
  }
}
