import { Pipe, PipeTransform, inject } from '@angular/core';
import { CoarLocalizationDataStore } from './localization-data-store';
import { CoarLocalizationService } from '../coar-localization.service';

/**
 * Pipe for formatting numbers using locale-specific configuration.
 *
 * @example
 * ```html
 * <span>{{ 1234.56 | coarNumber }}</span>
 * <span>{{ 1234.56 | coarNumber:'de':2 }}</span>
 * ```
 */
@Pipe({
  name: 'coarNumber',
  standalone: true,
  pure: false, // Impure to react to language changes
})
export class CoarNumberPipe implements PipeTransform {
  private readonly localeDataStore = inject(CoarLocalizationDataStore);
  private readonly localeService = inject(CoarLocalizationService);

  transform(value: number | null | undefined, locale?: string, decimals = 2): string {
    if (value == null || isNaN(value)) return '';

    const effectiveLocale = locale ?? this.localeService.languageState.value;
    const localeData = this.localeDataStore.getLocaleData(effectiveLocale);

    if (!localeData) {
      // Fallback to standard formatting
      return value.toFixed(decimals);
    }

    const { decimal, group } = localeData.number;

    // Split into integer and decimal parts
    const [integerPart, decimalPart = ''] = value.toFixed(decimals).split('.');

    // Add thousand separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);

    // Combine with decimal separator
    if (decimals > 0 && decimalPart) {
      return `${formattedInteger}${decimal}${decimalPart}`;
    }

    return formattedInteger;
  }
}
