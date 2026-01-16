import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { CoarTranslations } from './coar-translation-store';
import { CoarTranslationLoader } from './coar-translation-loader';

/**
 * Translation loader that generates common translations from browser's Intl API.
 *
 * This loader provides default translations for common UI elements that can be
 * automatically localized using browser APIs, without requiring JSON files.
 *
 * Translations generated:
 * - Relative time labels (today, yesterday, tomorrow)
 * - Month names (full and abbreviated)
 * - Weekday names (full and abbreviated)
 * - Common date/time units
 *
 * These translations can be overridden by registering additional loaders
 * (e.g., HTTP loader) that provide custom values.
 *
 * @example
 * ```ts
 * // Automatic registration via provideCoarLocalization()
 * provideCoarLocalization({ defaultLanguage: 'en' })
 *
 * // Intl loader provides: { 'common.today': 'today' }
 * // HTTP loader can override: { 'common.today': 'Now' }
 * ```
 */
@Injectable()
export class CoarIntlTranslationLoader extends CoarTranslationLoader {
  loadTranslations(locale: string): Observable<CoarTranslations> {
    return of(this.generateFromIntl(locale));
  }

  /**
   * Generate translations from browser Intl API.
   */
  private generateFromIntl(locale: string): CoarTranslations {
    const translations: CoarTranslations = {};

    // Relative time labels (for date pickers, calendars, etc.)
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      translations['common.today'] = rtf.format(0, 'day');
      translations['common.yesterday'] = rtf.format(-1, 'day');
      translations['common.tomorrow'] = rtf.format(1, 'day');
    } catch {
      // Fallback for older browsers without RelativeTimeFormat
      translations['common.today'] = 'today';
      translations['common.yesterday'] = 'yesterday';
      translations['common.tomorrow'] = 'tomorrow';
    }

    // Month names (full)
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    for (let m = 0; m < 12; m++) {
      const date = new Date(2024, m, 1);
      const monthName = monthFormatter.format(date);
      translations[`common.month.${m + 1}`] = monthName;
    }

    // Month names (abbreviated)
    const monthFormatterShort = new Intl.DateTimeFormat(locale, { month: 'short' });
    for (let m = 0; m < 12; m++) {
      const date = new Date(2024, m, 1);
      const monthName = monthFormatterShort.format(date);
      translations[`common.month.short.${m + 1}`] = monthName;
    }

    // Weekday names (full) - Monday=1, Sunday=7
    const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    for (let d = 0; d < 7; d++) {
      // Jan 1, 2024 is Monday
      const date = new Date(2024, 0, 1 + d);
      const dayName = dayFormatter.format(date);
      translations[`common.weekday.${d + 1}`] = dayName;
    }

    // Weekday names (abbreviated)
    const dayFormatterShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    for (let d = 0; d < 7; d++) {
      const date = new Date(2024, 0, 1 + d);
      const dayName = dayFormatterShort.format(date);
      translations[`common.weekday.short.${d + 1}`] = dayName;
    }

    return translations;
  }
}
