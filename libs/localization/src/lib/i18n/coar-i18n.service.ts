import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, tap, catchError, forkJoin } from 'rxjs';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarI18nProvider } from './coar-i18n-provider';
import { coarInterpolate } from './coar-interpolate';
import { COAR_TRANSLATION_LOADERS } from './coar-translation-loader';
import { CoarTranslationStore, CoarTranslations } from './coar-translation-store';

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
  private readonly loaders = inject(COAR_TRANSLATION_LOADERS, { optional: true }) ?? [];
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Coordination: Wait for pending language changes, load translations, then resolve
    // This ensures translations are ready BEFORE the language state changes
    this.locale.pendingLanguageChange$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ language, resolve }) => {
          // Load translations if not already loaded
          if (this.store.hasLanguage(language)) {
            resolve(); // Already loaded, resolve immediately
            return of(void 0);
          }

          // Load and then resolve
          return this.loadLanguage(language).pipe(
            tap(() => resolve()) // Signal that translations are ready
          );
        })
      )
      .subscribe();

    // Fallback: Auto-load translations when language changes without coordination
    // (for backwards compatibility if someone directly mutates the subject)
    this.locale.languageState.value$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lang) => {
      if (this.store.hasLanguage(lang)) {
        return;
      }

      this.loadLanguage(lang).subscribe();
    });
  }

  t(key: string, params?: Record<string, unknown>): string {
    const lang = this.locale.languageState.value;
    const translations = this.store.getTranslations(lang);

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
   * Loads translations from all sources and deep-merges them.
   *
   * Sources are executed in order:
   * 1. Intl (always first, provides common translations from browser APIs)
   * 2. HTTP (if configured, merges application-specific overrides)
   * 3. Custom sources (if provided, can add dynamic updates)
   *
   * Later sources override earlier sources at the key level.
   *
   * @param language - Language code to load
   * @returns Observable that completes when loading finishes
   */
  private loadLanguage(language: string): Observable<void> {
    // No loaders configured - mark as loaded with empty translations
    if (this.loaders.length === 0) {
      this.store.setTranslations(language, {});
      return of(void 0);
    }

    // Load from all sources in parallel
    const loadObservables = this.loaders.map((loader) =>
      loader.loadTranslations(language).pipe(
        catchError((err) => {
          console.warn(`[CoarI18n] Translation loader failed for '${language}':`, err);
          return of(null); // Return null for failed sources
        })
      )
    );

    return forkJoin(loadObservables).pipe(
      tap((results) => {
        // Deep merge all sources (nulls are ignored)
        const merged = this.mergeTranslations(
          results.filter((r) => r !== null) as CoarTranslations[]
        );
        this.store.setTranslations(language, merged);
      }),
      switchMap(() => of(void 0)),
      catchError((error) => {
        console.error(`[CoarI18n] Failed to load translations for '${language}':`, error);
        // Store empty translations to prevent repeated load attempts
        this.store.setTranslations(language, {});
        return of(void 0);
      })
    );
  }

  /**
   * Merges multiple translation sources.
   * Later sources override earlier sources at the key level.
   */
  private mergeTranslations(sources: CoarTranslations[]): CoarTranslations {
    const result: CoarTranslations = {};

    for (const source of sources) {
      if (!source) continue;

      // Merge all keys from this source
      for (const [key, value] of Object.entries(source)) {
        result[key] = value;
      }
    }

    return result;
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
