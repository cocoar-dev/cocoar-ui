import { Injectable, InjectionToken, signal } from '@angular/core';

/** Configuration for number formatting */
export interface NumberFormatConfig {
  readonly decimal: string;
  readonly thousand: string;
}

/** Configuration for date formatting */
export interface DateFormatConfig {
  /** Date format pattern: 'dd.mm.yyyy', 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd' */
  readonly pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  /** First day of week: 1 = Monday, 7 = Sunday */
  readonly firstDayOfWeek: 1 | 7;
}

/** Complete locale configuration */
export interface LocaleConfig {
  readonly number: NumberFormatConfig;
  readonly date: DateFormatConfig;
}

/**
 * Service contract for locale-aware formatting.
 * Provides formatting rules (not translations) for numbers, dates, etc.
 *
 * This handles "how to display" (1.000,50 vs 1,000.50),
 * not "what text to show" (that's translation/i18n).
 */
export interface ICoarLocaleService {
  /**
   * Get number format configuration for a specific locale.
   * @param locale - Optional locale identifier (e.g., 'de-AT', 'en-US'). If not provided, uses default locale.
   * @returns Number format configuration with decimal and thousand separators
   */
  getNumberFormat(locale?: string): NumberFormatConfig;

  /**
   * Get date format configuration for a specific locale.
   * @param locale - Optional locale identifier (e.g., 'de-AT', 'en-US'). If not provided, uses default locale.
   * @returns Date format configuration with pattern and first day of week
   */
  getDateFormat(locale?: string): DateFormatConfig;

  /**
   * Get the current default locale identifier.
   * @returns Current default locale (e.g., 'de-AT', 'en-US')
   */
  getDefaultLocale(): string;

  /**
   * Set the default locale used when no locale is explicitly specified.
   * @param locale - Locale identifier (e.g., 'de-AT', 'en-US')
   */
  setDefaultLocale(locale: string): void;

  /**
   * Register a custom locale configuration.
   * Useful for specialized formats (e.g., financial reports with space as thousand separator).
   * @param id - Custom locale identifier (e.g., 'custom-finance')
   * @param config - Partial locale configuration (only specify what you want to override)
   */
  registerLocale(id: string, config: Partial<LocaleConfig>): void;
}

/**
 * Injection token for the locale service.
 * Use this to inject the locale service in components.
 *
 * @example
 * ```typescript
 * private localeService = inject(COAR_LOCALE_SERVICE, { optional: true });
 * ```
 */
export const COAR_LOCALE_SERVICE = new InjectionToken<ICoarLocaleService>('CoarLocaleService', {
  providedIn: 'root',
  factory: () => new CoarLocaleService(),
});

/**
 * Default implementation of locale service.
 * Uses browser's Intl.NumberFormat API for standard locales,
 * with support for custom locale registration.
 */
@Injectable()
export class CoarLocaleService implements ICoarLocaleService {
  private defaultLocale = signal<string>('en-US');
  private customLocales = new Map<string, LocaleConfig>();

  getDefaultLocale(): string {
    return this.defaultLocale();
  }

  setDefaultLocale(locale: string): void {
    this.defaultLocale.set(locale);
  }

  registerLocale(id: string, config: Partial<LocaleConfig>): void {
    const defaults = this.getDefaults(id);
    this.customLocales.set(id, {
      number: config.number ?? defaults.number,
      date: config.date ?? defaults.date,
    });
  }

  getNumberFormat(locale?: string): NumberFormatConfig {
    const targetLocale = locale ?? this.defaultLocale();

    // Check custom locales first
    if (this.customLocales.has(targetLocale)) {
      return this.customLocales.get(targetLocale)!.number;
    }

    // Fall back to Intl.NumberFormat
    return this.getDefaults(targetLocale).number;
  }

  getDateFormat(locale?: string): DateFormatConfig {
    const targetLocale = locale ?? this.defaultLocale();

    // Check custom locales first
    if (this.customLocales.has(targetLocale)) {
      return this.customLocales.get(targetLocale)!.date;
    }

    // Fall back to detected defaults
    return this.getDefaults(targetLocale).date;
  }

  /**
   * Extract default formatting rules from browser's Intl API
   */
  private getDefaults(locale: string): LocaleConfig {
    try {
      const formatter = new Intl.NumberFormat(locale);
      const parts = formatter.formatToParts(1000.1);

      return {
        number: {
          decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
          thousand: parts.find((p) => p.type === 'group')?.value ?? ',',
        },
        date: this.detectDateFormat(locale),
      };
    } catch {
      // Fallback if locale is invalid
      return {
        number: {
          decimal: '.',
          thousand: ',',
        },
        date: {
          pattern: 'dd.mm.yyyy',
          firstDayOfWeek: 1,
        },
      };
    }
  }

  /**
   * Detect date format based on locale.
   *
   * Uses Intl.DateTimeFormat to determine the date order for the locale,
   * then maps to one of our supported patterns.
   */
  private detectDateFormat(locale: string): DateFormatConfig {
    try {
      // Use Intl.DateTimeFormat to get locale-specific date order
      const formatter = new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Format a test date to detect the order
      const parts = formatter.formatToParts(new Date(2024, 11, 25)); // Dec 25, 2024
      const order: string[] = [];

      for (const part of parts) {
        if (part.type === 'day') order.push('d');
        else if (part.type === 'month') order.push('m');
        else if (part.type === 'year') order.push('y');
      }

      const orderStr = order.join('');

      // Detect separator from the formatted string
      const formatted = formatter.format(new Date(2024, 11, 25));
      const separator = formatted.match(/[.\-/]/)?.[0] ?? '.';

      // Map detected order to our supported patterns
      let pattern: DateFormatConfig['pattern'];
      if (orderStr === 'mdy') {
        pattern = 'mm/dd/yyyy';
      } else if (orderStr === 'ymd') {
        pattern = 'yyyy-mm-dd';
      } else if (separator === '/') {
        pattern = 'dd/mm/yyyy';
      } else {
        pattern = 'dd.mm.yyyy';
      }

      // Detect first day of week (Monday vs Sunday)
      // US, Canada, Japan typically use Sunday; most others use Monday
      const sundayFirstLocales = ['en-US', 'en-CA', 'ja-JP', 'ko-KR', 'zh-TW', 'he-IL'];
      const baseLocale = locale.split('-')[0];
      const firstDayOfWeek: 1 | 7 = sundayFirstLocales.some(
        (l) => locale.startsWith(l) || (baseLocale === 'en' && locale.includes('US'))
      )
        ? 7
        : 1;

      return { pattern, firstDayOfWeek };
    } catch {
      // Fallback to European format
      return {
        pattern: 'dd.mm.yyyy',
        firstDayOfWeek: 1,
      };
    }
  }
}
