/**
 * Locale data structure for date and number formatting.
 * 
 * This data can be loaded from various sources:
 * - Browser Intl API (CoarIntlLocaleDataLoader) - default
 * - JSON files (CoarHttpLocaleDataLoader) - for overrides
 * - SignalR (future) - for dynamic backend-controlled formatting
 */

/**
 * Complete locale data for a specific language/region.
 */
export interface CoarLocalizationData {
  /** Locale code (e.g., 'en', 'de', 'en-US', 'de-DE') */
  code: string;

  /** Date formatting configuration */
  date: CoarDateFormatData;

  /** Number formatting configuration */
  number: CoarNumberFormatData;

  /** Currency formatting configuration */
  currency: CoarCurrencyFormatData;

  /** Percent formatting configuration */
  percent: CoarPercentFormatData;
}

/**
 * Date formatting configuration.
 */
export interface CoarDateFormatData {
  /** 
   * Date format pattern: 'dd.mm.yyyy', 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'
   */
  pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

  /** 
   * First day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   */
  firstDayOfWeek: number;

  /** Localized month names (full) */
  monthNames: string[];

  /** Localized month names (short) */
  monthNamesShort: string[];

  /** Localized day names (full) */
  dayNames: string[];

  /** Localized day names (short) */
  dayNamesShort: string[];

  /** AM/PM labels */
  amPm: [string, string];
}

/**
 * Number formatting configuration.
 */
export interface CoarNumberFormatData {
  /** Decimal separator (e.g., "." for English, "," for German) */
  decimal: string;

  /** Thousands/group separator (e.g., "," for English, "." for German) */
  group: string;

  /** Grouping pattern ([3] means group every 3 digits) */
  grouping: number[];
}

/**
 * Currency formatting configuration.
 */
export interface CoarCurrencyFormatData {
  /** Default currency code (e.g., "USD", "EUR") */
  default: string;

  /** Currency symbols map (e.g., { "USD": "$", "EUR": "€" }) */
  symbols: Record<string, string>;

  /** Symbol position: 'before' ($1,234) or 'after' (1,234 €) */
  position: 'before' | 'after';

  /** Space between symbol and number */
  spacing: boolean;

  /** Decimal places for currency display */
  decimals: number;
}

/**
 * Percent formatting configuration.
 */
export interface CoarPercentFormatData {
  /** Percent symbol (usually "%") */
  symbol: string;

  /** Space between number and symbol (e.g., "25%" vs "25 %") */
  spacing: boolean;

  /** Decimal places for percent display */
  decimals: number;
}
