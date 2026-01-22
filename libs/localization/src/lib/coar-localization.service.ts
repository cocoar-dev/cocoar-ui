import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { ReadonlyState } from '@cocoar/ts-utils';
import {
  COAR_LOCALIZATION_CONFIG,
  COAR_LOCALIZATION_DATA_LOADERS,
} from './provide-coar-localization';
import { CoarLocalizationDataStore } from './l10n/localization-data-store';
import { mergeLocalizationData } from './l10n/merge-localization-data';

/**
 * Represents a pending language change that needs coordination with i18n.
 */
interface PendingLanguageChange {
  language: string;
  resolve: () => void;
}

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
 *     console.log(this.locale.languageState.value);
 *
 *     // React to changes via Observable
 *     this.locale.languageState.value$.subscribe(lang => {
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
  private readonly defaultLanguage = this.config?.defaultLanguage ?? 'en';

  private readonly languageSubject = new BehaviorSubject<string>(this.defaultLanguage);

  /**
   * Subject for coordinating language changes with i18n service.
   * The i18n service subscribes to this to load translations BEFORE the language change is emitted.
   * @internal
   */
  readonly pendingLanguageChange$ = new Subject<PendingLanguageChange>();

  /**
   * Canonical language state.
   *
   * - `languageState.value` gives synchronous access
   * - `languageState.value$` is the canonical stream (emits current value immediately)
   */
  readonly languageState = new ReadonlyState(this.languageSubject);

  constructor() {
    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (
        window as unknown as { __coarLocalizationStore?: CoarLocalizationDataStore }
      ).__coarLocalizationStore = this.localeDataStore;
    }

    // Load locale data for the default language on initialization
    // This ensures firstDayOfWeek and other formatting data is available immediately
    this.loadAndmergeLocalizationData(this.defaultLanguage).catch((error) => {
      console.warn(
        `[CoarLocalizationService] Failed to load initial locale data for '${this.defaultLanguage}':`,
        error
      );
    });
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
    const current = this.languageState.value;

    // Skip if language hasn't changed
    if (current === language) {
      return;
    }

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

    // Wait for i18n service to load translations before emitting language change
    // Use a timeout in case i18n service is not injected (e.g., in tests)
    await Promise.race([
      new Promise<void>((resolve) => {
        this.pendingLanguageChange$.next({ language, resolve });
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 100)), // Fallback timeout
    ]);

    // Now emit the language change (UI will react with translations ready)
    this.languageSubject.next(language);
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
    return this.defaultLanguage;
  }
}
