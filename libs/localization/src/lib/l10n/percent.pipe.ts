import { Pipe, PipeTransform, inject } from '@angular/core';
import { CoarLocalizationDataStore } from './localization-data-store';
import { CoarLocalizationService } from '../coar-localization.service';

/**
 * Pipe for formatting percentages using locale-specific configuration.
 *
 * Expects a decimal value (0.25 = 25%).
 *
 * @example
 * ```html
 * <span>{{ 0.25 | coarPercent }}</span>
 * <span>{{ 0.25 | coarPercent:'de':1 }}</span>
 * ```
 */
@Pipe({
  name: 'coarPercent',
  standalone: true,
  pure: false, // Impure to react to language changes
})
export class CoarPercentPipe implements PipeTransform {
  private readonly localeDataStore = inject(CoarLocalizationDataStore);
  private readonly localeService = inject(CoarLocalizationService);

  transform(value: number | null | undefined, locale?: string, decimals?: number): string {
    if (value == null || isNaN(value)) return '';

    const effectiveLocale = locale ?? this.localeService.languageState.value;
    const localeData = this.localeDataStore.getLocaleData(effectiveLocale);

    if (!localeData) {
      // Fallback to standard formatting
      return `${(value * 100).toFixed(decimals ?? 0)}%`;
    }

    const { decimal, group } = localeData.number;
    const percentConfig = localeData.percent;
    const effectiveDecimals = decimals ?? percentConfig.decimals;

    // Convert to percentage (0.25 -> 25)
    const percentValue = value * 100;

    // Format number part
    const [integerPart, decimalPart = ''] = percentValue.toFixed(effectiveDecimals).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    const formattedNumber =
      effectiveDecimals > 0 && decimalPart
        ? `${formattedInteger}${decimal}${decimalPart}`
        : formattedInteger;

    // Add percent symbol
    const space = percentConfig.spacing ? '\u00A0' : '';
    return `${formattedNumber}${space}${percentConfig.symbol}`;
  }
}
