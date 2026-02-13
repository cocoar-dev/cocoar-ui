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
