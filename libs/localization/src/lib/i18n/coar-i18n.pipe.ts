import { ChangeDetectorRef, Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { CoarI18n } from './coar-i18n';
import { coarInterpolate } from './coar-interpolate';
import { BehaviorSubjectProxy } from '@cocoar/ts-utils';

@Pipe({
  name: 'coarI18n',
  standalone: true,
  pure: false, // Required because translations can change at runtime
})
export class CoarI18nPipe implements PipeTransform, OnDestroy {
  private readonly i18n = inject(CoarI18n, { optional: true });
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly subject = new BehaviorSubjectProxy<string>('');

  private lastKey?: string;
  private lastParamsJson?: string;
  private lastFallback?: string;

  transform(
    key: string | null | undefined,
    paramsOrFallback?: Record<string, unknown> | string,
    maybeFallbackOrParams?: string | Record<string, unknown>
  ): string {
    if (!key) {
      // If there's no key, return fallback if one exists
      if (typeof paramsOrFallback === 'string') {
        return paramsOrFallback;
      }
      if (typeof maybeFallbackOrParams === 'string') {
        return maybeFallbackOrParams;
      }
      return '';
    }

    // Normal param/fallback dispatching
    let params: Record<string, unknown> | undefined;
    let fallback: string | undefined;

    // Case A — first argument is fallback (string)
    if (typeof paramsOrFallback === 'string') {
      fallback = paramsOrFallback;
      if (maybeFallbackOrParams && typeof maybeFallbackOrParams === 'object') {
        params = maybeFallbackOrParams as Record<string, unknown>;
      }
    } else {
      // Case B — first argument is params (object)
      params = paramsOrFallback ?? undefined;
      if (typeof maybeFallbackOrParams === 'string') {
        fallback = maybeFallbackOrParams;
      }
    }

    // No i18n service available — return fallback or key
    if (!this.i18n) {
      return coarInterpolate(fallback ?? key, params);
    }

    // Compare inputs to determine if a new subscription is needed
    const paramsJson = params ? JSON.stringify(params) : undefined;

    if (
      key !== this.lastKey ||
      fallback !== this.lastFallback ||
      paramsJson !== this.lastParamsJson
    ) {
      this.lastKey = key;
      this.lastFallback = fallback;
      this.lastParamsJson = paramsJson;

      // Switch Observable completely using BehaviorSubjectProxy
      this.subject.next(this.i18n.t$(key, params, fallback));

      // Update the view when new translated values arrive
      this.subject.subscribe(() => {
        this.cdr.markForCheck();
      });
    }

    return this.subject.value;
  }

  ngOnDestroy(): void {
    this.subject.unsubscribe();
  }
}
