import { Observable, of } from 'rxjs';
import { CoarLocalizationData, CoarDateFormatData } from './localization-data';
import { CoarLocalizationDataLoader } from './localization-data-loader';

/**
 * Locale data loader that detects formatting from browser's Intl API.
 *
 * This is the default loader and works for all locales without requiring JSON files.
 * Use this when you want formatting to match the user's browser locale automatically.
 *
 * For business-specific overrides (e.g., force Monday as first day of week),
 * use CoarHttpLocaleDataLoader to load custom JSON files.
 */
export class CoarIntlLocaleDataLoader extends CoarLocalizationDataLoader {
  loadLocaleData(locale: string): Observable<CoarLocalizationData> {
    return of(this.detectFromIntl(locale));
  }

  /**
   * Detect all locale formatting from browser Intl API.
   */
  private detectFromIntl(locale: string): CoarLocalizationData {
    return {
      code: locale,
      date: this.detectDateFormat(locale),
      number: this.detectNumberFormat(locale),
      currency: this.detectCurrencyFormat(locale),
      percent: this.detectPercentFormat(locale),
    };
  }

  /**
   * Detect date formatting from Intl.DateTimeFormat.
   */
  private detectDateFormat(locale: string): CoarDateFormatData {
    // Detect pattern and separator
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(new Date(2024, 11, 25)); // Dec 25, 2024
    const order: string[] = [];

    for (const part of parts) {
      if (part.type === 'day') order.push('d');
      else if (part.type === 'month') order.push('m');
      else if (part.type === 'year') order.push('y');
    }

    const orderStr = order.join('');
    const formatted = formatter.format(new Date(2024, 11, 25));
    const separator = formatted.match(/[.\-/]/)?.[0] ?? '.';

    let pattern: CoarDateFormatData['pattern'];
    if (orderStr === 'mdy') {
      pattern = 'mm/dd/yyyy';
    } else if (orderStr === 'ymd') {
      pattern = 'yyyy-mm-dd';
    } else if (separator === '/') {
      pattern = 'dd/mm/yyyy';
    } else {
      pattern = 'dd.mm.yyyy';
    }

    // Detect first day of week
    const sundayFirstLocales = ['en-US', 'en-CA', 'ja-JP', 'ko-KR', 'zh-TW', 'he-IL'];
    const baseLocale = locale.split('-')[0];
    const firstDayOfWeek = sundayFirstLocales.some(
      (l) => locale.startsWith(l) || (baseLocale === 'en' && locale.includes('US'))
    )
      ? 0 // Sunday
      : 1; // Monday

    // Generate month names
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const monthFormatterShort = new Intl.DateTimeFormat(locale, { month: 'short' });
    const monthNames: string[] = [];
    const monthNamesShort: string[] = [];
    for (let m = 0; m < 12; m++) {
      const date = new Date(2024, m, 1);
      monthNames.push(monthFormatter.format(date));
      monthNamesShort.push(monthFormatterShort.format(date));
    }

    // Generate day names (start from Monday)
    const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const dayFormatterShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const dayNames: string[] = [];
    const dayNamesShort: string[] = [];
    for (let d = 0; d < 7; d++) {
      // Jan 1, 2024 is Monday
      const date = new Date(2024, 0, 1 + d);
      dayNames.push(dayFormatter.format(date));
      dayNamesShort.push(dayFormatterShort.format(date));
    }

    // Detect AM/PM
    const amPmFormatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true });
    const amDate = new Date(2024, 0, 1, 9, 0);
    const pmDate = new Date(2024, 0, 1, 21, 0);
    const amFormatted = amPmFormatter.format(amDate);
    const pmFormatted = amPmFormatter.format(pmDate);
    const amPm: [string, string] = [
      amFormatted.replace(/\d+/g, '').trim() || 'AM',
      pmFormatted.replace(/\d+/g, '').trim() || 'PM',
    ];

    return {
      pattern,
      firstDayOfWeek,
      monthNames,
      monthNamesShort,
      dayNames,
      dayNamesShort,
      amPm,
    };
  }

  /**
   * Detect number formatting from Intl.NumberFormat.
   */
  private detectNumberFormat(locale: string) {
    const formatter = new Intl.NumberFormat(locale);
    const formatted = formatter.format(1234.56);

    // Extract decimal separator
    const decimal = formatted.match(/[.,]/)?.[0] ?? '.';

    // Extract group separator (find character between thousands)
    const formattedThousands = formatter.format(1234567);
    const groupMatch = formattedThousands.match(/1(.)234/);
    const group = groupMatch ? groupMatch[1] : ',';

    return {
      decimal,
      group,
      grouping: [3], // Standard grouping by 3 digits
    };
  }

  /**
   * Detect currency formatting from Intl.NumberFormat.
   */
  private detectCurrencyFormat(locale: string) {
    // Try to get default currency for the locale
    let defaultCurrency = 'USD';
    try {
      // Extract region from locale (e.g., 'US' from 'en-US')
      const region = locale.split('-')[1];
      if (region) {
        // Common currency mappings
        const currencyMap: Record<string, string> = {
          US: 'USD',
          GB: 'GBP',
          DE: 'EUR',
          FR: 'EUR',
          AT: 'EUR',
          JP: 'JPY',
          CN: 'CNY',
          IN: 'INR',
        };
        defaultCurrency = currencyMap[region] || 'USD';
      }
    } catch {
      // Fallback
    }

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: defaultCurrency,
    });
    const formatted = formatter.format(1234.56);

    // Detect symbol position
    const numberPart = formatted.match(/\d/)?.[0];
    const symbolIndex = formatted.indexOf(defaultCurrency.substring(0, 1));
    const numberIndex = formatted.indexOf(numberPart || '1');
    const position: 'before' | 'after' = symbolIndex < numberIndex ? 'before' : 'after';

    // Detect spacing
    const spacing = /\s/.test(formatted);

    // Get currency symbols
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
    };

    return {
      default: defaultCurrency,
      symbols,
      position,
      spacing,
      decimals: 2,
    };
  }

  /**
   * Detect percent formatting from Intl.NumberFormat.
   */
  private detectPercentFormat(locale: string) {
    const formatter = new Intl.NumberFormat(locale, { style: 'percent' });
    const formatted = formatter.format(0.25);

    // Detect spacing
    const spacing = /\d\s%/.test(formatted);

    return {
      symbol: '%',
      spacing,
      decimals: 0,
    };
  }
}
