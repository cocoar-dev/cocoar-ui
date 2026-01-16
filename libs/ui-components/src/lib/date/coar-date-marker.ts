import { Temporal } from '@js-temporal/polyfill';

/**
 * Represents a date marker for highlighting special dates (holidays, events, etc.).
 * Supports single dates or date ranges.
 */
export interface CoarDateMarker {
  /** Start date of the marker (or single date if no endDate) */
  startDate: Temporal.PlainDate;
  /** Optional end date for date ranges (inclusive) */
  endDate?: Temporal.PlainDate;
  /** Description shown as tooltip on hover */
  description: string;
  /** Optional custom CSS class for styling different marker types */
  cssClass?: string;
}
