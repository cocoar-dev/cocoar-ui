import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CoarLocalizationService } from '../coar-localization.service';

/**
 * Context service providing i18n-related information to translation providers.
 *
 * This service acts as a coordination layer between the core locale system
 * and translation provider implementations (e.g., Transloco, custom providers).
 *
 * Providers should inject this service to:
 * - Get the current language
 * - Subscribe to language changes
 * - Access future i18n-related features (caching, preloading, etc.)
 *
 * This abstraction decouples providers from direct CoarLocalizationService dependency,
 * making the system more maintainable and testable.
 *
 * @example
 * ```typescript
 * // In a translation provider implementation
 * export function provideMyI18nBackend(): Provider {
 *   return {
 *     provide: COAR_I18N_PROVIDER,
 *     useFactory: (context: CoarI18nContext, backend: MyBackend) => {
 *       // Subscribe to language changes
 *       context.language$.subscribe(lang => {
 *         backend.switchLanguage(lang);
 *       });
 *
 *       return {
 *         t(key: string): string {
 *           return backend.translate(key);
 *         }
 *       };
 *     },
 *     deps: [CoarI18nContext, MyBackend],
 *   };
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CoarI18nContext {
  private readonly localeService = inject(CoarLocalizationService);

  /**
   * Observable that emits whenever the language changes.
   *
   * Translation providers should subscribe to this observable to stay
   * synchronized with the current language state.
   *
   * @example
   * ```typescript
   * context.language$.subscribe(newLang => {
   *   console.log('Language changed to:', newLang);
   *   translationBackend.loadLanguage(newLang);
   * });
   * ```
   */
  readonly language$: Observable<string> = this.localeService.languageChanged$;

  /**
   * Get the current language code.
   *
   * @returns The current language code (e.g., 'en', 'de', 'en-US')
   *
   * @example
   * ```typescript
   * const currentLang = context.getCurrentLanguage();
   * console.log(currentLang); // 'en'
   * ```
   */
  getCurrentLanguage(): string {
    return this.localeService.getCurrentLanguage();
  }

  // Future additions:
  // - Translation cache management
  // - Preloaded language files
  // - Fallback language chain configuration
  // - Missing translation tracking/reporting
  // - Translation loading state
}
