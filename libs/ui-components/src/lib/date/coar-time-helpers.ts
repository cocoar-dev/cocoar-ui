/**
 * Time formatting and parsing utilities.
 *
 * Provides locale-aware time formatting with 12h/24h detection,
 * time parsing, and hour/minute manipulation with wrap-around support.
 */

/**
 * AM/PM period indicator.
 */
export type CoarTimePeriod = 'AM' | 'PM';

/**
 * Parsed time value with hours (0-23) and minutes (0-59).
 */
export interface CoarTimeValue {
  readonly hours: number;
  readonly minutes: number;
}

/**
 * Detects whether the given locale uses 12-hour time format.
 *
 * Uses Intl.DateTimeFormat to check if the locale's default time format
 * includes a dayPeriod (AM/PM indicator).
 *
 * @param locale - BCP 47 locale identifier (e.g., 'en-US', 'de-AT')
 * @returns true if locale uses 12-hour format, false for 24-hour format
 *
 * @example
 * ```ts
 * coarDetect12HourFormat('en-US'); // true (US uses 12h)
 * coarDetect12HourFormat('de-DE'); // false (Germany uses 24h)
 * coarDetect12HourFormat('en-GB'); // false (UK uses 24h)
 * ```
 */
export function coarDetect12HourFormat(locale: string): boolean {
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
    });

    const parts = formatter.formatToParts(new Date(2024, 0, 1, 14, 30));
    return parts.some((part) => part.type === 'dayPeriod');
  } catch {
    // Default to 24-hour format on error
    return false;
  }
}

/**
 * Formats a time value as a string.
 *
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param use24Hour - true for 24h format ("14:30"), false for 12h format ("2:30 PM")
 * @returns Formatted time string
 *
 * @example
 * ```ts
 * coarFormatTime(14, 30, true);  // "14:30"
 * coarFormatTime(14, 30, false); // "2:30 PM"
 * coarFormatTime(0, 5, true);    // "00:05"
 * coarFormatTime(0, 5, false);   // "12:05 AM"
 * ```
 */
export function coarFormatTime(hours: number, minutes: number, use24Hour: boolean): string {
  const paddedMinutes = String(minutes).padStart(2, '0');

  if (use24Hour) {
    const paddedHours = String(hours).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}`;
  }

  // 12-hour format
  const period: CoarTimePeriod = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  if (displayHours === 0) {
    displayHours = 12; // 0 and 12 both display as 12
  }

  return `${displayHours}:${paddedMinutes} ${period}`;
}

/**
 * Parses a time string into hours and minutes.
 *
 * Supports both 24-hour and 12-hour formats:
 * - 24h: "14:30", "08:00", "23:59"
 * - 12h: "2:30 PM", "12:00 AM", "11:59 pm"
 *
 * @param text - Time string to parse
 * @returns Parsed time value or null if invalid
 *
 * @example
 * ```ts
 * coarParseTimeInput("14:30");     // { hours: 14, minutes: 30 }
 * coarParseTimeInput("2:30 PM");   // { hours: 14, minutes: 30 }
 * coarParseTimeInput("12:00 AM");  // { hours: 0, minutes: 0 }
 * coarParseTimeInput("invalid");   // null
 * ```
 */
export function coarParseTimeInput(text: string): CoarTimeValue | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const trimmed = text.trim().toUpperCase();

  // Try 12-hour format first (e.g., "2:30 PM")
  const match12h = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = parseInt(match12h[2], 10);
    const period = match12h[3] as CoarTimePeriod;

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    // Convert to 24-hour format
    if (period === 'AM') {
      hours = hours === 12 ? 0 : hours;
    } else {
      // PM
      hours = hours === 12 ? 12 : hours + 12;
    }

    return { hours, minutes };
  }

  // Try 24-hour format (e.g., "14:30")
  const match24h = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24h) {
    const hours = parseInt(match24h[1], 10);
    const minutes = parseInt(match24h[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return { hours, minutes };
  }

  return null;
}

/**
 * Converts 24-hour format hours to 12-hour format.
 *
 * @param hours24 - Hours in 24-hour format (0-23)
 * @returns Object with 12-hour hours (1-12) and period (AM/PM)
 *
 * @example
 * ```ts
 * coarConvertTo12Hour(0);  // { hours: 12, period: 'AM' }
 * coarConvertTo12Hour(12); // { hours: 12, period: 'PM' }
 * coarConvertTo12Hour(14); // { hours: 2, period: 'PM' }
 * coarConvertTo12Hour(23); // { hours: 11, period: 'PM' }
 * ```
 */
export function coarConvertTo12Hour(hours24: number): { hours: number; period: CoarTimePeriod } {
  const period: CoarTimePeriod = hours24 >= 12 ? 'PM' : 'AM';
  let hours = hours24 % 12;
  if (hours === 0) {
    hours = 12;
  }
  return { hours, period };
}

/**
 * Converts 12-hour format to 24-hour format.
 *
 * @param hours12 - Hours in 12-hour format (1-12)
 * @param period - AM or PM
 * @returns Hours in 24-hour format (0-23)
 *
 * @example
 * ```ts
 * coarConvertTo24Hour(12, 'AM'); // 0
 * coarConvertTo24Hour(12, 'PM'); // 12
 * coarConvertTo24Hour(2, 'PM');  // 14
 * coarConvertTo24Hour(11, 'PM'); // 23
 * ```
 */
export function coarConvertTo24Hour(hours12: number, period: CoarTimePeriod): number {
  if (period === 'AM') {
    return hours12 === 12 ? 0 : hours12;
  }
  // PM
  return hours12 === 12 ? 12 : hours12 + 12;
}

/**
 * Increments hours with wrap-around.
 *
 * @param hours - Current hours (0-23)
 * @param delta - Amount to change (positive or negative)
 * @returns New hours value (0-23), wrapped around
 *
 * @example
 * ```ts
 * coarIncrementHours(23, 1);  // 0 (wraps from 23 to 0)
 * coarIncrementHours(0, -1);  // 23 (wraps from 0 to 23)
 * coarIncrementHours(14, 2);  // 16
 * ```
 */
export function coarIncrementHours(hours: number, delta: number): number {
  const newHours = (hours + delta) % 24;
  return newHours < 0 ? newHours + 24 : newHours;
}

/**
 * Increments minutes with wrap-around and optional hour carry.
 *
 * @param minutes - Current minutes (0-59)
 * @param delta - Amount to change (positive or negative)
 * @param step - Minute step interval (default: 1)
 * @returns Object with new minutes and hour delta (for carry-over)
 *
 * @example
 * ```ts
 * coarIncrementMinutes(55, 5);      // { minutes: 0, hourDelta: 1 }
 * coarIncrementMinutes(0, -5);       // { minutes: 55, hourDelta: -1 }
 * coarIncrementMinutes(30, 15, 15);  // { minutes: 45, hourDelta: 0 }
 * ```
 */
export function coarIncrementMinutes(
  minutes: number,
  delta: number,
  step = 1
): { minutes: number; hourDelta: number } {
  const actualDelta = delta * step;
  const totalMinutes = minutes + actualDelta;

  let hourDelta = 0;
  let newMinutes = totalMinutes;

  if (totalMinutes >= 60) {
    hourDelta = Math.floor(totalMinutes / 60);
    newMinutes = totalMinutes % 60;
  } else if (totalMinutes < 0) {
    // For negative values, we need to calculate proper wrap-around
    hourDelta = Math.floor(totalMinutes / 60); // This will be negative
    newMinutes = ((totalMinutes % 60) + 60) % 60;
  }

  return { minutes: newMinutes, hourDelta };
}

/**
 * Rounds minutes to the nearest step.
 *
 * @param minutes - Current minutes (0-59)
 * @param step - Minute step interval
 * @returns Rounded minutes value
 *
 * @example
 * ```ts
 * coarRoundMinutesToStep(7, 5);   // 5
 * coarRoundMinutesToStep(8, 5);   // 10
 * coarRoundMinutesToStep(22, 15); // 15
 * coarRoundMinutesToStep(23, 15); // 30
 * ```
 */
export function coarRoundMinutesToStep(minutes: number, step: number): number {
  return Math.round(minutes / step) * step;
}

/**
 * Gets valid minute values for a given step.
 *
 * @param step - Minute step interval (1, 5, 10, or 15)
 * @returns Array of valid minute values
 *
 * @example
 * ```ts
 * coarGetValidMinutes(15); // [0, 15, 30, 45]
 * coarGetValidMinutes(5);  // [0, 5, 10, 15, ..., 55]
 * coarGetValidMinutes(1);  // [0, 1, 2, ..., 59]
 * ```
 */
export function coarGetValidMinutes(step: 1 | 5 | 10 | 15): number[] {
  const values: number[] = [];
  for (let m = 0; m < 60; m += step) {
    values.push(m);
  }
  return values;
}
