import { CoarLocalizationData } from './localization-data';

/**
 * Deep merge utility for locale data.
 * Later sources override earlier sources at the field level.
 *
 * @example
 * ```ts
 * const intl = { date: { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }, number: {...} };
 * const http = { date: { firstDayOfWeek: 0 } }; // Only override firstDayOfWeek
 *
 * const result = mergeLocalizationData([intl, http]);
 * // Result: { date: { pattern: 'dd.mm.yyyy', firstDayOfWeek: 0 }, number: {...} }
 * ```
 */
export function mergeLocalizationData(sources: Partial<CoarLocalizationData>[]): CoarLocalizationData | null {
  if (sources.length === 0) return null;

  const result: Partial<CoarLocalizationData> = {};

  for (const source of sources) {
    if (!source) continue;

    // Merge code
    if (source.code) {
      result.code = source.code;
    }

    // Deep merge date
    if (source.date) {
      result.date = { ...result.date, ...source.date };
    }

    // Deep merge number
    if (source.number) {
      result.number = { ...result.number, ...source.number };
    }

    // Deep merge currency
    if (source.currency) {
      result.currency = {
        ...result.currency,
        ...source.currency,
        symbols: { ...result.currency?.symbols, ...source.currency.symbols },
      };
    }

    // Deep merge percent
    if (source.percent) {
      result.percent = { ...result.percent, ...source.percent };
    }
  }

  // Ensure we have at least a code
  if (!result.code) return null;

  return result as CoarLocalizationData;
}
