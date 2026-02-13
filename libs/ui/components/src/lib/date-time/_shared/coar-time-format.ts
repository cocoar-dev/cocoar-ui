/**
 * Shared time formatting configuration.
 *
 * Note: This config is intentionally small so it can be used by multiple UI components
 * (time picker, date-time picker, etc.) without pulling in Angular-only code.
 */
export interface TimeFormatConfig {
  /**
   * Whether to use 24-hour format (true) or 12-hour format with AM/PM (false).
   * When set to 'auto', the format is detected from the user's locale.
   */
  readonly use24Hour: boolean | 'auto';

  /**
   * Step interval for minute selection.
   * For example, 5 means minutes can only be 0, 5, 10, 15, etc.
   */
  readonly minuteStep: 1 | 5 | 10 | 15;
}

/**
 * Default time format configuration.
 */
export const COAR_DEFAULT_TIME_FORMAT: TimeFormatConfig = {
  use24Hour: 'auto',
  minuteStep: 5,
};
