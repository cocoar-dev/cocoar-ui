import { describe, expect, it } from 'vitest';

import { Temporal } from '@js-temporal/polyfill';

import {
  coarCalculateIsoWeekNumber,
  coarDetectDateFormatPatternFromIntl,
  coarFormatPlainDate,
  coarGetCalendarGridDates,
  coarGetDateSeparatorForPattern,
  coarParsePlainDateFromInput,
} from './coar-date-helpers';

describe('coar-date-helpers', () => {
  it('detects a date format pattern from Intl (best effort)', () => {
    // We only assert this does not throw and returns a supported pattern (or null).
    const pattern = coarDetectDateFormatPatternFromIntl('en-US');
    if (pattern !== null) {
      expect(['dd.mm.yyyy', 'dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd']).toContain(pattern);
    }
  });

  it('returns the correct separator for patterns', () => {
    expect(coarGetDateSeparatorForPattern('dd.mm.yyyy')).toBe('.');
    expect(coarGetDateSeparatorForPattern('dd/mm/yyyy')).toBe('/');
    expect(coarGetDateSeparatorForPattern('mm/dd/yyyy')).toBe('/');
    expect(coarGetDateSeparatorForPattern('yyyy-mm-dd')).toBe('-');
  });

  it('formats Temporal.PlainDate for supported patterns', () => {
    const date = Temporal.PlainDate.from('2025-12-03');

    expect(coarFormatPlainDate(date, 'dd.mm.yyyy')).toBe('03.12.2025');
    expect(coarFormatPlainDate(date, 'dd/mm/yyyy')).toBe('03/12/2025');
    expect(coarFormatPlainDate(date, 'mm/dd/yyyy')).toBe('12/03/2025');
    expect(coarFormatPlainDate(date, 'yyyy-mm-dd')).toBe('2025-12-03');
  });

  it('parses a date string and enforces min/max constraints', () => {
    const min = Temporal.PlainDate.from('2025-12-10');
    const max = Temporal.PlainDate.from('2025-12-20');

    expect(coarParsePlainDateFromInput('12/15/2025', 'mm/dd/yyyy', { min, max })?.toString()).toBe(
      '2025-12-15'
    );

    expect(coarParsePlainDateFromInput('12/05/2025', 'mm/dd/yyyy', { min, max })).toBeNull();
    expect(coarParsePlainDateFromInput('12/25/2025', 'mm/dd/yyyy', { min, max })).toBeNull();
  });

  it('builds a fixed 42-cell calendar grid', () => {
    const month = Temporal.PlainYearMonth.from('2024-01');

    const mondayFirst = coarGetCalendarGridDates(month, 1);
    expect(mondayFirst).toHaveLength(42);
    expect(mondayFirst[0]?.date.toString()).toBe('2024-01-01'); // Jan 2024 starts on Monday

    const sundayFirst = coarGetCalendarGridDates(month, 7);
    expect(sundayFirst).toHaveLength(42);
    expect(sundayFirst[0]?.date.toString()).toBe('2023-12-31');
  });

  it('calculates ISO week numbers (sanity check)', () => {
    // 2024-01-01 is ISO week 1
    expect(coarCalculateIsoWeekNumber(Temporal.PlainDate.from('2024-01-01'))).toBe(1);
  });
});
