import { inject, Injectable, Signal, signal } from '@angular/core';
import { Observable, Subject, lastValueFrom } from 'rxjs';
import {
  COAR_LOCALIZATION_CONFIG,
  COAR_LOCALIZATION_DATA_LOADERS,
} from './provide-coar-localization';
import { CoarLocalizationDataStore } from './l10n/localization-data-store';
import { mergeLocalizationData } from './l10n/merge-localization-data';

/**
 * Core locale service responsible for language management.
 *
 * This service manages the current language state and notifies consumers
 * about language changes. It serves as the single source of truth for
 * the application's current language.
 *
 * Other systems (i18n, localization/formatting) can subscribe to language
 * changes and react accordingly.
 *
 * @example
 * ```typescript
 * import { inject } from '@angular/core';
 * import { CoarLocalizationService } from '@cocoar/localization';
 *
 * export class MyComponent {
 *   private readonly locale = inject(CoarLocalizationService);
 *
 *   constructor() {
 *     // Get current language
 *     console.log(this.locale.getCurrentLanguage());
 *
 *     // React to changes via Signal
 *     effect(() => {
 *       console.log('Language changed:', this.locale.language());
 *     });
 *
 *     // React to changes via Observable
 *     this.locale.languageChanged$.subscribe(lang => {
 *       console.log('Language changed:', lang);
 *     });
 *   }
 *
 *   changeLanguage() {
 *     this.locale.setLanguage('de');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CoarLocalizationService {
  private readonly config = inject(COAR_LOCALIZATION_CONFIG, { optional: true });
  private readonly localeDataStore = inject(CoarLocalizationDataStore);
  private readonly localeDataLoaders =
    inject(COAR_LOCALIZATION_DATA_LOADERS, { optional: true }) ?? [];
  private readonly languageSignal = signal<string>(this.config?.defaultLanguage ?? 'en');
  private readonly languageChangedSubject = new Subject<string>();

  /**
   * Signal containing the current language.
   * Updates automatically when the language changes.
   *
   * @example
   * ```typescript
   * const locale = inject(CoarLocalizationService);
   *
   * // Use in computed
   * const greeting = computed(() =>
   *   locale.language() === 'de' ? 'Hallo' : 'Hello'
   * );
   *
   * // Use in effect
   * effect(() => {
   *   console.log('Current language:', locale.language());
   * });
   * ```
   */
  readonly language: Signal<string> = this.languageSignal.asReadonly();

  /**
   * Observable that emits when the language changes.
   * Emits the new language code immediately after the change.
   *
   * @example
   * ```typescript
   * locale.languageChanged$.subscribe(newLang => {
   *   console.log('Language changed to:', newLang);
   *   // Reload translations, update formatting rules, etc.
   * });
   * ```
   */
  readonly languageChanged$: Observable<string> = this.languageChangedSubject.asObservable();

  /**
   * Get the current language code.
   *
   * @returns The current language code (e.g., 'en', 'de', 'en-US')
   *
   * @example
   * ```typescript
   * const currentLang = locale.getCurrentLanguage();
   * console.log(currentLang); // 'en'
   * ```
   */
  getCurrentLanguage(): string {
    return this.languageSignal();
  }

  /**
   * Set the current language.
   *
   * Automatically loads locale data from all configured sources (Intl, HTTP, etc.)
   * and deep-merges them in order. Later sources override earlier ones.
   *
   * Cached data is not reloaded, so switching back to a previous language is instant.
   *
   * @param language - The new language code (e.g., 'en', 'de', 'en-US')
   *
   * @example
   * ```typescript
   * // Change to German (loads from Intl + HTTP, merges overrides)
   * await locale.setLanguage('de');
   *
   * // Change back to English (uses cached data, instant)
   * await locale.setLanguage('en');
   * ```
   */
  async setLanguage(language: string): Promise<void> {
    const current = this.languageSignal();

    // Load locale data if not already loaded (cached)
    if (!this.localeDataStore.hasLocaleData(language)) {
      try {
        await this.loadAndmergeLocalizationData(language);
      } catch (error) {
        console.warn(
          `[CoarLocalizationService] Failed to load locale data for '${language}':`,
          error
        );
        // Continue with language switch even if locale data fails to load
        // Formatting pipes will use fallback values
      }
    }

    // Only notify if language actually changed
    if (current !== language) {
      this.languageSignal.set(language);
      this.languageChangedSubject.next(language);
    }
  }

  /**
   * Load locale data from all sources and deep-merge them.
   *
   * Sources are executed in order:
   * 1. Intl (always first, provides complete defaults)
   * 2. HTTP (if configured, merges business overrides)
   * 3. Custom sources (if provided, can add dynamic updates)
   *
   * @param language - Language code to load
   */
  private async loadAndmergeLocalizationData(language: string): Promise<void> {
    if (this.localeDataLoaders.length === 0) {
      return;
    }

    // Load from all sources in parallel
    const loadPromises = this.localeDataLoaders.map((loader) =>
      lastValueFrom(loader.loadLocaleData(language)).catch((err) => {
        console.warn(`[CoarLocale] Source failed to load '${language}':`, err);
        return null; // Return null for failed sources
      })
    );

    const results = await Promise.all(loadPromises);

    // Deep merge all sources (nulls are ignored)
    const merged = mergeLocalizationData(results.filter((r) => r !== null));

    if (merged) {
      this.localeDataStore.setLocaleData(language, merged);
    }
  }

  /**
   * Preload locale data for a language without switching to it.
   * Useful for avoiding UI flicker when switching languages.
   *
   * @param language - The language code to preload
   *
   * @example
   * ```typescript
   * // Preload German locale data before switching
   * await locale.preloadLocaleData('de');
   * await locale.setLanguage('de'); // Instant switch, no loading delay
   * ```
   */
  async preloadLocaleData(language: string): Promise<void> {
    // Skip if already loaded
    if (this.localeDataStore.hasLocaleData(language)) {
      return;
    }

    try {
      await this.loadAndmergeLocalizationData(language);
    } catch (error) {
      console.warn(
        `[CoarLocalizationService] Failed to preload locale data for '${language}':`,
        error
      );
      throw error;
    }
  }

  /**
   * Get the list of available languages configured for the application.
   *
   * @returns Array of available language codes, or empty array if not configured
   *
   * @example
   * ```typescript
   * const langs = locale.getAvailableLanguages(); // ['en', 'de', 'fr']
   * ```
   */
  getAvailableLanguages(): string[] {
    return this.config?.availableLanguages ?? [];
  }

  /**
   * Get the default language configured for the application.
   *
   * @returns The default language code
   *
   * @example
   * ```typescript
   * const defaultLang = locale.getDefaultLanguage(); // 'en'
   * ```
   */
  getDefaultLanguage(): string {
    return this.config?.defaultLanguage ?? 'en';
  }
}
