import { Pipe, PipeTransform, inject } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';
import { CoarLocalizationDataStore } from './localization-data-store';
import { CoarLocalizationService } from '../coar-localization.service';

/**
 * Pipe for formatting dates using locale-specific configuration.
 *
 * @example
 * ```html
 * <span>{{ myDate | coarDate }}</span>
 * <span>{{ myDate | coarDate:'de' }}</span>
 * ```
 */
@Pipe({
  name: 'coarDate',
  standalone: true,
  pure: false, // Impure to react to language changes
})
export class CoarDatePipe implements PipeTransform {
  private readonly localeDataStore = inject(CoarLocalizationDataStore);
  private readonly localeService = inject(CoarLocalizationService);

  transform(value: Temporal.PlainDate | Date | string | null | undefined, locale?: string): string {
    if (!value) return '';

    // Convert to Temporal.PlainDate
    let date: Temporal.PlainDate;
    if (value instanceof Date) {
      date = Temporal.PlainDate.from({
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      });
    } else if (typeof value === 'string') {
      try {
        date = Temporal.PlainDate.from(value);
      } catch {
        return '';
      }
    } else {
      date = value;
    }

    const effectiveLocale = locale ?? this.localeService.getCurrentLanguage();
    const localeData = this.localeDataStore.getLocaleData(effectiveLocale);

    if (!localeData) {
      // Fallback to ISO format
      return date.toString();
    }

    const { pattern } = localeData.date;
    const sep = pattern.includes('.') ? '.' : pattern.includes('/') ? '/' : '-';

    const day = String(date.day).padStart(2, '0');
    const month = String(date.month).padStart(2, '0');
    const year = String(date.year);

    switch (pattern) {
      case 'dd.mm.yyyy':
      case 'dd/mm/yyyy':
        return `${day}${sep}${month}${sep}${year}`;
      case 'mm/dd/yyyy':
        return `${month}${sep}${day}${sep}${year}`;
      case 'yyyy-mm-dd':
        return `${year}${sep}${month}${sep}${day}`;
      default:
        return `${day}${sep}${month}${sep}${year}`;
    }
  }
}
