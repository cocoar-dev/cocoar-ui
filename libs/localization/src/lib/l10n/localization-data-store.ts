import { signal, WritableSignal } from '@angular/core';
import type { CoarLocalizationData } from './localization-data';

/**
 * Signal-based storage for locale data.
 * Provides reactive access to loaded locale formatting rules.
 */
export class CoarLocalizationDataStore {
  private readonly store: WritableSignal<Map<string, CoarLocalizationData>> = signal(new Map());

  /**
   * Set locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @param data Locale data
   */
  setLocaleData(locale: string, data: CoarLocalizationData): void {
    console.debug('[CoarLocalizationDataStore] setLocaleData:', locale, data);
    const current = this.store();
    const updated = new Map(current);
    updated.set(locale, data);
    this.store.set(updated);
    console.debug(
      '[CoarLocalizationDataStore] Store now has',
      updated.size,
      'locales:',
      Array.from(updated.keys())
    );
  }

  /**
   * Get locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @returns Locale data or undefined if not loaded
   */
  getLocaleData(locale: string): CoarLocalizationData | undefined {
    const data = this.store().get(locale);
    console.debug(
      '[CoarLocalizationDataStore] getLocaleData:',
      locale,
      data ? 'found' : 'not found'
    );
    return data;
  }

  /**
   * Check if locale data is loaded for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @returns True if locale data is loaded
   */
  hasLocaleData(locale: string): boolean {
    const has = this.store().has(locale);
    console.debug('[CoarLocalizationDataStore] hasLocaleData:', locale, has);
    return has;
  }

  /**
   * Remove locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   */
  removeLocaleData(locale: string): void {
    const current = this.store();
    const updated = new Map(current);
    updated.delete(locale);
    this.store.set(updated);
  }

  /**
   * Clear all loaded locale data.
   */
  clear(): void {
    this.store.set(new Map());
  }
}
