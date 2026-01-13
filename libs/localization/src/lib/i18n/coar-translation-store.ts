import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

/**
 * Translation storage for a single language.
 * Maps translation keys to their values.
 */
export type CoarTranslations = Record<string, string>;

/**
 * Reactive store for translation data.
 *
 * Stores translations for multiple languages in memory and provides
 * Signal-based API for reactive updates.
 *
 * ## Features
 * - Signal-based reactive API
 * - Language-scoped storage
 * - Simple Map-based implementation
 * - Zero dependencies beyond Angular core
 *
 * @example
 * ```ts
 * const store = inject(CoarTranslationStore);
 *
 * // Load translations
 * store.setTranslations('en', { 'hello': 'Hello' });
 * store.setTranslations('de', { 'hello': 'Hallo' });
 *
 * // Check if language is loaded
 * if (store.hasLanguage('en')) {
 *   const translations = store.getTranslations('en');
 * }
 *
 * // Get specific translation
 * const value = store.getTranslation('en', 'hello'); // 'Hello'
 *
 * // Check for missing keys
 * const missing = store.getTranslation('en', 'unknown'); // undefined
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CoarTranslationStore {
  /**
   * Internal storage: Map<language, Map<key, translation>>
   *
   * Why nested Maps instead of Record:
   * - Faster lookups for large translation sets
   * - No prototype chain pollution
   * - Clear separation between languages
   */
  private readonly storage: WritableSignal<Map<string, Map<string, string>>> = signal(new Map());

  /**
   * Set of all loaded languages.
   * Used for quick existence checks.
   */
  readonly loadedLanguages: Signal<Set<string>> = computed(() => {
    const map = this.storage();
    return new Set(map.keys());
  });

  /**
   * Stores all translations for a specific language.
   *
   * Replaces any existing translations for that language.
   *
   * @param language - Language code (e.g., 'en', 'de')
   * @param translations - Translation key-value pairs
   *
   * @example
   * ```ts
   * // HTTP: Load entire language at once
   * store.setTranslations('en', { 'hello': 'Hello', 'goodbye': 'Goodbye' });
   * ```
   */
  setTranslations(language: string, translations: CoarTranslations): void {
    const translationMap = new Map<string, string>(Object.entries(translations));

    this.storage.update((current) => {
      const next = new Map(current);
      next.set(language, translationMap);
      return next;
    });
  }

  /**
   * Updates a single translation key for a specific language.
   *
   * Creates the language if it doesn't exist.
   * Useful for real-time updates via SignalR.
   *
   * @param language - Language code
   * @param key - Translation key
   * @param value - Translation value
   *
   * @example
   * ```ts
   * // SignalR: Update single key in real-time
   * signalR.on('TranslationUpdated', ({ lang, key, value }) => {
   *   store.setTranslation(lang, key, value);
   * });
   * ```
   */
  setTranslation(language: string, key: string, value: string): void {
    this.storage.update((current) => {
      const next = new Map(current);
      const langMap = next.get(language) ?? new Map<string, string>();
      const updatedLangMap = new Map(langMap);
      updatedLangMap.set(key, value);
      next.set(language, updatedLangMap);
      return next;
    });
  }

  /**
   * Merges partial translations into an existing language.
   *
   * Only updates/adds the provided keys, keeps existing keys intact.
   * Creates the language if it doesn't exist.
   *
   * @param language - Language code
   * @param partialTranslations - Partial translation key-value pairs to merge
   *
   * @example
   * ```ts
   * // Existing: { 'hello': 'Hello', 'goodbye': 'Goodbye' }
   * store.updateTranslations('en', { 'hello': 'Hi' });
   * // Result: { 'hello': 'Hi', 'goodbye': 'Goodbye' }
   * ```
   *
   * @example
   * ```ts
   * // SignalR: Batch update multiple keys
   * signalR.on('TranslationsBatchUpdated', ({ lang, updates }) => {
   *   store.updateTranslations(lang, updates);
   * });
   * ```
   */
  updateTranslations(language: string, partialTranslations: CoarTranslations): void {
    this.storage.update((current) => {
      const next = new Map(current);
      const langMap = next.get(language) ?? new Map<string, string>();
      const updatedLangMap = new Map(langMap);

      // Merge partial updates into existing translations
      for (const [key, value] of Object.entries(partialTranslations)) {
        updatedLangMap.set(key, value);
      }

      next.set(language, updatedLangMap);
      return next;
    });
  }

  /**
   * Checks if translations for a language are loaded.
   *
   * @param language - Language code to check
   * @returns True if language is loaded
   */
  hasLanguage(language: string): boolean {
    return this.storage().has(language);
  }

  /**
   * Gets all translations for a specific language.
   *
   * @param language - Language code
   * @returns Translation map, or undefined if language not loaded
   */
  getTranslations(language: string): Map<string, string> | undefined {
    return this.storage().get(language);
  }

  /**
   * Gets a specific translation value.
   *
   * @param language - Language code
   * @param key - Translation key
   * @returns Translation value, or undefined if not found
   */
  getTranslation(language: string, key: string): string | undefined {
    return this.storage().get(language)?.get(key);
  }

  /**
   * Clears all translations from the store.
   *
   * Used primarily for testing.
   */
  clear(): void {
    this.storage.set(new Map());
  }
}
