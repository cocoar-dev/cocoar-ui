/**
 * Shared date formatting configuration.
 *
 * Note: This config is intentionally small so it can be used by multiple UI components
 * (date picker, future calendar, etc.) without pulling in Angular-only code.
 */
export interface DateFormatConfig {
  /** Date format pattern: 'dd.mm.yyyy', 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd' */
  readonly pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

  /** First day of week: 1 = Monday, 7 = Sunday */
  readonly firstDayOfWeek: 1 | 7;
}

/**
 * Maps date format patterns to Maskito date modes.
 * Used by all picker components that initialize Maskito input masks.
 */
export const COAR_DATE_FORMAT_TO_MASKITO_MODE: Record<
  DateFormatConfig['pattern'],
  'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy/mm/dd'
> = {
  'dd.mm.yyyy': 'dd/mm/yyyy',
  'dd/mm/yyyy': 'dd/mm/yyyy',
  'mm/dd/yyyy': 'mm/dd/yyyy',
  'yyyy-mm-dd': 'yyyy/mm/dd',
};
