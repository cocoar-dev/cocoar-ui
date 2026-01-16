import { Pipe, PipeTransform, inject } from '@angular/core';
import { CoarLocalizationDataStore } from './localization-data-store';
import { CoarLocalizationService } from '../coar-localization.service';

/**
 * Pipe for formatting currency using locale-specific configuration.
 *
 * @example
 * ```html
 * <span>{{ 1234.56 | coarCurrency }}</span>
 * <span>{{ 1234.56 | coarCurrency:'de':'EUR' }}</span>
 * ```
 */
@Pipe({
  name: 'coarCurrency',
  standalone: true,
  pure: false, // Impure to react to language changes
})
export class CoarCurrencyPipe implements PipeTransform {
  private readonly localeDataStore = inject(CoarLocalizationDataStore);
  private readonly localeService = inject(CoarLocalizationService);

  transform(value: number | null | undefined, locale?: string, currency?: string): string {
    if (value == null || isNaN(value)) return '';

    const effectiveLocale = locale ?? this.localeService.languageState.value;
    const localeData = this.localeDataStore.getLocaleData(effectiveLocale);

    if (!localeData) {
      // Fallback to standard formatting
      return `${currency ?? 'USD'} ${value.toFixed(2)}`;
    }

    const { decimal, group } = localeData.number;
    const currencyConfig = localeData.currency;
    const effectiveCurrency = currency ?? currencyConfig.default;
    const symbol = currencyConfig.symbols[effectiveCurrency] ?? effectiveCurrency;
    const decimals = currencyConfig.decimals;

    // Format number part
    const [integerPart, decimalPart = ''] = value.toFixed(decimals).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    const formattedNumber =
      decimals > 0 && decimalPart
        ? `${formattedInteger}${decimal}${decimalPart}`
        : formattedInteger;

    // Add currency symbol
    const space = currencyConfig.spacing ? '\u00A0' : '';
    if (currencyConfig.position === 'before') {
      return `${symbol}${space}${formattedNumber}`;
    } else {
      return `${formattedNumber}${space}${symbol}`;
    }
  }
}
