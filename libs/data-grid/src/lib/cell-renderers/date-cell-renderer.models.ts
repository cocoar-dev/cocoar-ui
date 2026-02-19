export interface DateCellRendererConfig {
  /** Include seconds in time display */
  showSeconds?: boolean;
  /** Custom Angular date format string (bypasses CoarDatePipe) */
  customFormat?: string;
}
