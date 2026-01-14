import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

/**
 * Translation storage for a single language.
 * Maps translation keys to their values.
 */
export type CoarTranslations = Record<string, string>;

/**
 * Flattens nested translation objects into dot notation.
 *
 * Supports both flat and nested JSON structures:
 * - Flat: { "app.title": "My App" }
 * - Nested: { "app": { "title": "My App" } }
 *
 * Both produce: { "app.title": "My App" }
 *
 * @example
 * Input: { app: { title: 'My App', subtitle: 'Welcome' } }
 * Output: { 'app.title': 'My App', 'app.subtitle': 'Welcome' }
 */
function flattenTranslations(obj: unknown, prefix = ''): CoarTranslations {
  const result: CoarTranslations = {};

  if (typeof obj !== 'object' || obj === null) {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenTranslations(value, newKey));
    } else if (typeof value === 'string') {
      // Store string values
      result[newKey] = value;
    }
    // Skip non-string primitive values (numbers, booleans, arrays)
  }

  return result;
}

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
   * Automatically flattens nested objects into dot notation.
   *
   * @param language - Language code (e.g., 'en', 'de')
   * @param translations - Translation key-value pairs (flat or nested)
   *
   * @example
   * ```ts
   * // Flat format
   * store.setTranslations('en', { 'hello': 'Hello', 'app.title': 'My App' });
   *
   * // Nested format (auto-flattened)
   * store.setTranslations('en', { app: { title: 'My App' }, hello: 'Hello' });
   * // Both produce the same result
   * ```
   */
  setTranslations(
    language: string,
    translations: CoarTranslations | Record<string, unknown>
  ): void {
    // Flatten nested structures into dot notation
    const flattened = flattenTranslations(translations);
    const translationMap = new Map<string, string>(Object.entries(flattened));

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
   * Automatically flattens nested objects into dot notation.
   *
   * @param language - Language code
   * @param partialTranslations - Partial translation key-value pairs to merge (flat or nested)
   *
   * @example
   * ```ts
   * // Flat format
   * // Existing: { 'hello': 'Hello', 'goodbye': 'Goodbye' }
   * store.updateTranslations('en', { 'hello': 'Hi' });
   * // Result: { 'hello': 'Hi', 'goodbye': 'Goodbye' }
   * ```
   *
   * @example
   * ```ts
   * // Nested format (auto-flattened)
   * store.updateTranslations('en', { app: { title: 'New Title' } });
   * // Updates 'app.title' key
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
  updateTranslations(
    language: string,
    partialTranslations: CoarTranslations | Record<string, unknown>
  ): void {
    // Flatten nested structures into dot notation
    const flattened = flattenTranslations(partialTranslations);

    this.storage.update((current) => {
      const next = new Map(current);
      const langMap = next.get(language) ?? new Map<string, string>();
      const updatedLangMap = new Map(langMap);

      // Merge partial updates into existing translations
      for (const [key, value] of Object.entries(flattened)) {
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
