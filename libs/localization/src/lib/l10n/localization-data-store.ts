import { computed, signal, Signal, WritableSignal } from '@angular/core';
import type { CoarLocalizationData } from './localization-data';

/**
 * Signal-based storage for locale data.
 * Provides reactive access to loaded locale formatting rules.
 */
export class CoarLocalizationDataStore {
  private readonly store: WritableSignal<Map<string, CoarLocalizationData>> = signal(new Map());

  /**
   * Reactive signal that changes whenever any locale data is updated.
   * Use this in computed() to ensure reactivity to data loading.
   */
  readonly dataVersion: Signal<number> = computed(() => {
    // Reading store() creates the signal dependency
    return this.store().size;
  });

  /**
   * Set locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @param data Locale data
   */
  setLocaleData(locale: string, data: CoarLocalizationData): void {
    const current = this.store();
    const updated = new Map(current);
    updated.set(locale, data);
    this.store.set(updated);
  }

  /**
   * Get locale data for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @returns Locale data or undefined if not loaded
   */
  getLocaleData(locale: string): CoarLocalizationData | undefined {
    return this.store().get(locale);
  }

  /**
   * Check if locale data is loaded for a specific locale.
   * @param locale Locale code (e.g., 'en', 'de', 'en-US')
   * @returns True if locale data is loaded
   */
  hasLocaleData(locale: string): boolean {
    return this.store().has(locale);
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
