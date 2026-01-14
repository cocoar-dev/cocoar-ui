import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { Observable, of, switchMap, tap, catchError } from 'rxjs';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarI18nProvider } from './coar-i18n-provider';
import { coarInterpolate } from './coar-interpolate';
import { CoarTranslationLoader } from './coar-translation-loader';
import { CoarTranslationStore } from './coar-translation-store';

/**
 * Core i18n service implementation.
 *
 * Integrates:
 * - `CoarLocalizationService` - Language state management
 * - `CoarTranslationStore` - Translation storage
 * - `CoarTranslationLoader` - Translation loading
 * - `CoarI18nContext` - Coordination layer
 *
 * ## Features
 * - Automatic translation loading when language changes
 * - Missing translation detection
 * - Parameter interpolation
 * - Reactive Signal-based API
 *
 * ## Usage
 * Use `provideCoarLocalization()` + `provideCoarI18nHttpSource()` to configure.
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCoarLocalization({
 *       defaultLanguage: 'en',
 *     }),
 *     provideCoarI18nHttpSource(),
 *   ],
 * };
 * ```
 */
@Injectable()
export class CoarI18nService implements CoarI18nProvider {
  private readonly locale = inject(CoarLocalizationService);
  private readonly store = inject(CoarTranslationStore);
  private readonly loader = inject(CoarTranslationLoader);

  /**
   * Signal containing all translations for the current language.
   *
   * Returns undefined if language not yet loaded.
   */
  private readonly currentTranslations = computed(() => {
    const lang = this.locale.language();
    return this.store.getTranslations(lang);
  });

  constructor() {
    // Auto-load translations when language changes
    effect(
      () => {
        const lang = this.locale.language();

        // If language already loaded, do nothing
        if (untracked(() => this.store.hasLanguage(lang))) {
          return;
        }

        // Load translations for new language
        this.loadLanguage(lang).subscribe();
      },
      { allowSignalWrites: true }
    );
  }

  t(key: string, params?: Record<string, unknown>): string {
    const translations = this.currentTranslations();

    // Language not loaded yet - return key
    if (!translations) {
      return key;
    }

    const value = translations.get(key);

    // Missing translation - return key
    if (value === undefined) {
      return key;
    }

    // No params - return value as-is
    if (!params) {
      return value;
    }

    // Interpolate params
    return coarInterpolate(value, params);
  }

  /**
   * Loads translations for a specific language.
   *
   * Called automatically when language changes via effect.
   * Can also be called manually to preload languages.
   *
   * @param language - Language code to load
   * @returns Observable that completes when loading finishes
   */
  private loadLanguage(language: string): Observable<void> {
    return this.loader.loadTranslations(language).pipe(
      tap((translations) => {
        this.store.setTranslations(language, translations);
      }),
      switchMap(() => of(void 0)),
      catchError((error) => {
        console.error(`Failed to load translations for language: ${language}`, error);
        // Store empty translations to prevent repeated load attempts
        this.store.setTranslations(language, {});
        return of(void 0);
      })
    );
  }

  /**
   * Preloads translations for a specific language.
   *
   * Used by APP_INITIALIZER to prevent flash of untranslated content.
   *
   * @param language - Language code to preload
   * @returns Promise that resolves when loading completes
   */
  preloadLanguage(language: string): Promise<void> {
    // Already loaded - return immediately
    if (this.store.hasLanguage(language)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.loadLanguage(language).subscribe(() => resolve());
    });
  }
}
