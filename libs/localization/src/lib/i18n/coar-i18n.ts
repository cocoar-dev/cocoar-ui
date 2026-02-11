import { Injectable, Signal, inject } from '@angular/core';
import { COAR_I18N_PROVIDER } from './coar-i18n-provider';
import { coarIsMissingTranslation } from './coar-is-missing-translation';
import { coarInterpolate } from './coar-interpolate';
import { distinctUntilChanged, map, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoarLocalizationService } from '../coar-localization.service';

@Injectable()
export class CoarI18n {
  private readonly provider = inject(COAR_I18N_PROVIDER, { optional: true });
  private readonly locale = inject(CoarLocalizationService, { optional: true });

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
  t(key: string, fallbackOrParams?: string | Record<string, unknown>, maybeParams?: Record<string, unknown>): string {
    let fallback: string | undefined;
    let params: Record<string, unknown> | undefined;

    if (typeof fallbackOrParams === 'string') {
      // t(key, 'Fallback') or t(key, 'Fallback', params)
      fallback = fallbackOrParams;
      params = maybeParams;
    } else {
      // t(key) or t(key, params)
      params = fallbackOrParams;
      fallback = undefined;
    }

    if (!this.provider) {
      return coarInterpolate(fallback ?? key, params);
    }

    const raw = this.provider.t(key, params);

    const base = coarIsMissingTranslation(key, raw) ? (fallback ?? key) : (raw ?? '');

    // Important: the fallback (and even the key) may contain {placeholders}
    return coarInterpolate(base, params);
  }

  /**
   * Reactive variant that updates when the language changes.
   * Uses CoarLocalizationService to detect language changes.
   */
  t$(key: string, params?: Record<string, unknown>, fallback?: string): Observable<string> {
    if (!this.locale) {
      return of(this.callT(key, params, fallback));
    }

    // Re-evaluate on every language change from CoarLocalizationService
    return this.locale.languageState.value$.pipe(
      map(() => this.callT(key, params, fallback)),
      distinctUntilChanged()
    );
  }

  /**
   * Signal variant that updates when the language changes.
   * Uses CoarLocalizationService to detect language changes.
   */
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
