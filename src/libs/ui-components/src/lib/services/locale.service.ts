import { Injectable, InjectionToken, signal } from '@angular/core';

/** Configuration for number formatting */
export interface NumberFormatConfig {
  readonly decimal: string;
  readonly thousand: string;
}

/** Configuration for date formatting (future use) */
export interface DateFormatConfig {
  readonly pattern: string;
  readonly firstDayOfWeek: number;
}

/** Complete locale configuration */
export interface LocaleConfig {
  readonly number: NumberFormatConfig;
  readonly date?: DateFormatConfig; // Reserved for future date picker support
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
      };
    } catch {
      // Fallback if locale is invalid
      return {
        number: {
          decimal: '.',
          thousand: ',',
        },
      };
    }
  }
}
