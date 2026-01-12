import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoarI18n } from './coar-i18n';
import { COAR_I18N_EVENTS } from './coar-i18n-events';
import { coarIsMissingTranslation } from './coar-is-missing-translation';

/**
 * Angular pipe for translating i18n keys in templates.
 *
 * Supports runtime language changes when COAR_I18N_EVENTS is provided.
 * The pipe is impure to react to language changes and parameter changes.
 *
 * @example
 * ```html
 * <!-- Simple key -->
 * <span>{{ 'coar.datePicker.today' | coarI18n }}</span>
 *
 * <!-- With fallback default -->
 * <span>{{ 'coar.button.save' | coarI18n:'Save' }}</span>
 *
 * <!-- With parameters -->
 * <span>{{ 'coar.items.count' | coarI18n:{ count: items.length } }}</span>
 *
 * <!-- With parameters and fallback -->
 * <span>{{ 'coar.items.count' | coarI18n:{ count: items.length }:'You have {count} items.' }}</span>
 *
 * <!-- Chaining with other pipes -->
 * <h2>{{ 'coar.alert.title' | coarI18n:'Alert' | uppercase }}</h2>
 * ```
 */
@Pipe({
  name: 'coarI18n',
  standalone: true,
  pure: false, // Allows reaction to language changes and param changes
})
export class CoarI18nPipe implements PipeTransform, OnDestroy {
  private readonly i18n = inject(CoarI18n);
  private readonly events = inject(COAR_I18N_EVENTS, { optional: true });
  private readonly cdr = inject(ChangeDetectorRef);
  private langSub?: Subscription;

  constructor() {
    // Subscribe to language changes if events are available
    if (this.events) {
      this.langSub = this.events.languageChanged$.subscribe(() => {
        // Mark view for check so Angular re-evaluates the pipe
        this.cdr.markForCheck();
      });
    }
  }

  transform(
    key: string | null | undefined,
    paramsOrFallback?: Record<string, unknown> | string,
    maybeFallback?: string
  ): string {
    if (!key) {
      // No key provided → use fallback if available
      if (typeof paramsOrFallback === 'string') {
        return paramsOrFallback;
      }
      return maybeFallback ?? '';
    }

    let params: Record<string, unknown> | undefined;
    let fallback: string | undefined;

    // Determine if first argument is params or fallback
    if (typeof paramsOrFallback === 'string') {
      fallback = paramsOrFallback;
    } else {
      params = paramsOrFallback;
      fallback = maybeFallback;
    }

    // Call the appropriate overload based on params being defined
    const result = params !== undefined ? this.i18n.t(key, params) : this.i18n.t(key);

    // Use unified missing-translation semantics
    if (coarIsMissingTranslation(key, result)) {
      return fallback ?? result ?? '';
    }

    return result;
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }
}
