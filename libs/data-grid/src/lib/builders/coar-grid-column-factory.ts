import { CoarGridColumnBuilder } from './coar-grid-column-builder';

/**
 * Factory for creating typed column builders.
 * Provides convenient methods for common column types.
 *
 * @example
 * ```ts
 * // In column definitions:
 * CoarGridBuilder.create<User>()
 *   .columns([
 *     col => col.field('name').header('Name').flex(1),
 *     col => col.field('createdAt').header('Created').width(150),
 *   ])
 * ```
 */
export class CoarGridColumnFactory<TData = unknown> {
  /**
   * Create a column builder for the given field
   */
  field<TValue = unknown>(fieldName: keyof TData | string): CoarGridColumnBuilder<TData, TValue> {
    return new CoarGridColumnBuilder<TData, TValue>(fieldName);
  }

  /**
   * Create a date column with standard formatting
   */
  date(
    fieldName: keyof TData | string,
    format = 'short'
  ): CoarGridColumnBuilder<TData, Date | string> {
    const builder = new CoarGridColumnBuilder<TData, Date | string>(fieldName);

    // Add basic date formatting
    builder.valueFormatter((params) => {
      const value = params.value;
      if (!value) return '';

      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return String(value);

      // Use Intl for locale-aware formatting
      switch (format) {
        case 'short':
          return date.toLocaleDateString();
        case 'long':
          return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        case 'datetime':
          return date.toLocaleString();
        default:
          return date.toLocaleDateString();
      }
    });

    return builder;
  }

  /**
   * Create a number column with standard formatting
   */
  number(fieldName: keyof TData | string, decimals = 0): CoarGridColumnBuilder<TData, number> {
    const builder = new CoarGridColumnBuilder<TData, number>(fieldName);

    builder.valueFormatter((params) => {
      const value = params.value;
      if (value === null || value === undefined) return '';
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    });

    // Right-align numbers
    builder.cellClass('text-right');

    return builder;
  }

  /**
   * Create a currency column
   */
  currency(
    fieldName: keyof TData | string,
    currency = 'USD'
  ): CoarGridColumnBuilder<TData, number> {
    const builder = new CoarGridColumnBuilder<TData, number>(fieldName);

    builder.valueFormatter((params) => {
      const value = params.value;
      if (value === null || value === undefined) return '';
      return value.toLocaleString(undefined, {
        style: 'currency',
        currency,
      });
    });

    // Right-align currency
    builder.cellClass('text-right');

    return builder;
  }

  /**
   * Create a boolean column (displays Yes/No or custom values)
   */
  boolean(
    fieldName: keyof TData | string,
    options: { trueValue?: string; falseValue?: string } = {}
  ): CoarGridColumnBuilder<TData, boolean> {
    const { trueValue = 'Yes', falseValue = 'No' } = options;
    const builder = new CoarGridColumnBuilder<TData, boolean>(fieldName);

    builder.valueFormatter((params) => {
      if (params.value === null || params.value === undefined) return '';
      return params.value ? trueValue : falseValue;
    });

    return builder;
  }
}
