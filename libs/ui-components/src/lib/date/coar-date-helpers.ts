import { Temporal } from '@js-temporal/polyfill';

import type { DateFormatConfig } from './coar-date-format';

export function coarDetectDateFormatPatternFromIntl(
  locale: string
): DateFormatConfig['pattern'] | null {
  try {
    const formatter = new Intl.DateTimeFormat(locale);
    const parts = formatter.formatToParts(new Date(2024, 0, 15));

    const dayIndex = parts.findIndex((p) => p.type === 'day');
    const monthIndex = parts.findIndex((p) => p.type === 'month');
    const yearIndex = parts.findIndex((p) => p.type === 'year');

    if (dayIndex === -1 || monthIndex === -1 || yearIndex === -1) {
      return null;
    }

    if (dayIndex < monthIndex && monthIndex < yearIndex) return 'dd.mm.yyyy';
    if (monthIndex < dayIndex && dayIndex < yearIndex) return 'mm/dd/yyyy';
    if (yearIndex < monthIndex && monthIndex < dayIndex) return 'yyyy-mm-dd';

    return null;
  } catch {
    return null;
  }
}

export function coarGetDateSeparatorForPattern(
  pattern: DateFormatConfig['pattern']
): '.' | '/' | '-' {
  if (pattern.includes('.')) return '.';
  if (pattern.includes('/')) return '/';
  return '-';
}

export function coarGetLocalizedWeekdays(locale: string, firstDayOfWeek: 1 | 7): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  // Jan 1, 2024 is a Monday - use this as reference for day mapping.
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, 1 + i);
    weekdays.push(formatter.format(date));
  }

  // weekdays is now [Mon, Tue, Wed, Thu, Fri, Sat, Sun].
  if (firstDayOfWeek === 7) {
    const sunday = weekdays.pop();
    if (sunday) {
      weekdays.unshift(sunday);
    }
  }

  return weekdays;
}

export function coarFormatPlainDate(
  date: Temporal.PlainDate,
  pattern: DateFormatConfig['pattern']
): string {
  const sep = coarGetDateSeparatorForPattern(pattern);
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

export function coarParsePlainDateFromInput(
  text: string,
  pattern: DateFormatConfig['pattern'],
  constraints?: {
    min?: Temporal.PlainDate | null;
    max?: Temporal.PlainDate | null;
  }
): Temporal.PlainDate | null {
  if (!text) return null;

  const sep = coarGetDateSeparatorForPattern(pattern);
  const parts = text.split(sep);
  if (parts.length !== 3) return null;

  if (parts.some((p) => p.length === 0 || !/^\d+$/.test(p))) return null;

  let year: number;
  let month: number;
  let day: number;

  try {
    switch (pattern) {
      case 'dd.mm.yyyy':
      case 'dd/mm/yyyy':
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        break;
      case 'mm/dd/yyyy':
        month = parseInt(parts[0], 10);
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        break;
      case 'yyyy-mm-dd':
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
        break;
      default:
        return null;
    }

    if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const date = Temporal.PlainDate.from({ year, month, day });

    const minDate = constraints?.min ?? null;
    const maxDate = constraints?.max ?? null;

    if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) {
      return null;
    }

    if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

export function coarTemporalPlainDateToDate(date: Temporal.PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

export function coarCalculateIsoWeekNumber(date: Temporal.PlainDate): number {
  const jsDate = coarTemporalPlainDateToDate(date);

  const dayOfWeek = jsDate.getDay() || 7;
  jsDate.setDate(jsDate.getDate() + 4 - dayOfWeek);

  const yearStart = new Date(jsDate.getFullYear(), 0, 1);
  return Math.ceil(((jsDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function coarClampPlainDate(
  date: Temporal.PlainDate,
  constraints?: {
    min?: Temporal.PlainDate | null;
    max?: Temporal.PlainDate | null;
  }
): Temporal.PlainDate {
  const minDate = constraints?.min ?? null;
  const maxDate = constraints?.max ?? null;

  if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) {
    return minDate;
  }

  if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) {
    return maxDate;
  }

  return date;
}

export interface CoarCalendarGridCell {
  readonly date: Temporal.PlainDate;
  readonly isOutsideMonth: boolean;
}

/**
 * Returns a fixed 6x7 calendar grid (42 cells) for the given month.
 * Includes leading/trailing days from adjacent months to fill the grid.
 */
export function coarGetCalendarGridDates(
  viewMonth: Temporal.PlainYearMonth,
  firstDayOfWeek: 1 | 7
): CoarCalendarGridCell[] {
  const firstDay = viewMonth.toPlainDate({ day: 1 });
  const daysInMonth = viewMonth.daysInMonth;

  const startDayOfWeek = firstDay.dayOfWeek; // Temporal: 1=Mon ... 7=Sun

  let daysFromPrevMonth: number;
  if (firstDayOfWeek === 1) {
    // Monday first: Monday=0, Tuesday=1, ..., Sunday=6
    daysFromPrevMonth = (startDayOfWeek - 1 + 7) % 7;
  } else {
    // Sunday first: Sunday=0, Monday=1, ..., Saturday=6
    // Temporal uses: Sunday=7, so we convert via modulo
    daysFromPrevMonth = startDayOfWeek % 7;
  }

  const cells: CoarCalendarGridCell[] = [];

  if (daysFromPrevMonth > 0) {
    const prevMonth = viewMonth.subtract({ months: 1 });
    const prevMonthDays = prevMonth.daysInMonth;
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonth.toPlainDate({ day: prevMonthDays - i });
      cells.push({ date: day, isOutsideMonth: true });
    }
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const day = viewMonth.toPlainDate({ day: d });
    cells.push({ date: day, isOutsideMonth: false });
  }

  const remainingDays = 42 - cells.length;
  const nextMonth = viewMonth.add({ months: 1 });
  for (let d = 1; d <= remainingDays; d++) {
    const day = nextMonth.toPlainDate({ day: d });
    cells.push({ date: day, isOutsideMonth: true });
  }

  return cells;
}
