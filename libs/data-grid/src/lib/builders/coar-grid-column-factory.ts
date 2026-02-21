import { CoarGridColumnBuilder } from './coar-grid-column-builder';
import { CoarTagCellRendererComponent } from '../cell-renderers/tag-cell-renderer.component';
import { CoarIconCellRendererComponent } from '../cell-renderers/icon-cell-renderer.component';
import { CoarDateCellRendererComponent } from '../cell-renderers/date-cell-renderer.component';
import type { TagCellRendererConfig } from '../cell-renderers/tag-cell-renderer.models';
import type { IconCellRendererConfig } from '../cell-renderers/icon-cell-renderer.models';
import type { DateCellRendererConfig } from '../cell-renderers/date-cell-renderer.models';

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
 *     col => col.tag('status', { variantMap: { active: 'success' } }),
 *     col => col.icon('type', { size: 's' }),
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
   * Create a date column with standard or custom formatting.
   *
   * @param format - Preset name ('short' | 'long' | 'datetime'), Intl options object, or custom formatter function
   */
  date(
    fieldName: keyof TData | string,
    format: string | Intl.DateTimeFormatOptions | ((date: Date) => string) = 'short'
  ): CoarGridColumnBuilder<TData, Date | string> {
    const builder = new CoarGridColumnBuilder<TData, Date | string>(fieldName);

    builder.valueFormatter((params) => {
      const value = params.value;
      if (!value) return '';

      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return String(value);

      // Custom formatter function
      if (typeof format === 'function') {
        return format(date);
      }

      // Intl options object
      if (typeof format === 'object') {
        return new Intl.DateTimeFormat(undefined, format).format(date);
      }

      // Preset string
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

    // AG Grid infers `cellDataType: 'boolean'` by default, which uses a checkbox renderer.
    // For this factory we want the formatted label (Yes/No) to be displayed instead.
    builder.option('cellDataType', false);

    builder.valueFormatter((params) => {
      if (params.value === null || params.value === undefined) return '';
      return params.value ? trueValue : falseValue;
    });

    return builder;
  }

  /**
   * Create a tag column that renders values as `<coar-tag>` elements.
   *
   * Supports string (split by separator), array, and object array values.
   *
   * @param config - Tag rendering configuration (variantMap, size, i18nPrefix, etc.)
   */
  tag(
    fieldName: keyof TData | string,
    config?: TagCellRendererConfig
  ): CoarGridColumnBuilder<TData, string | string[]> {
    const builder = new CoarGridColumnBuilder<TData, string | string[]>(fieldName);
    builder.cellRendererConfig(CoarTagCellRendererComponent, config ?? {});
    builder.sortable();

    // Alphabetical comparator on joined tag labels
    const separator = config?.separator ?? ',';
    builder.comparator((valueA, valueB) => {
      const normalize = (v: unknown): string => {
        if (Array.isArray(v)) return v.map(String).sort().join(',');
        if (typeof v === 'string') return v.split(separator).map((s) => s.trim()).sort().join(',');
        return String(v ?? '');
      };
      return normalize(valueA).localeCompare(normalize(valueB));
    });

    return builder;
  }

  /**
   * Create an icon column that renders values as `<coar-icon>` elements.
   *
   * The cell value is used as the icon name.
   *
   * @param config - Icon rendering configuration (size, source, color, onClick)
   */
  icon(
    fieldName: keyof TData | string,
    config?: IconCellRendererConfig
  ): CoarGridColumnBuilder<TData, string> {
    const builder = new CoarGridColumnBuilder<TData, string>(fieldName);
    builder.cellRendererConfig(CoarIconCellRendererComponent, config ?? {});
    return builder;
  }

  /**
   * Create a date column with locale-aware rendering via `CoarDatePipe`.
   *
   * Unlike `date()`, this uses a cell renderer component for full locale integration.
   *
   * @param config - Date rendering configuration (showSeconds, customFormat)
   */
  localDate(
    fieldName: keyof TData | string,
    config?: DateCellRendererConfig
  ): CoarGridColumnBuilder<TData, Date | string> {
    const builder = new CoarGridColumnBuilder<TData, Date | string>(fieldName);
    builder.cellRendererConfig(CoarDateCellRendererComponent, config ?? {});
    builder.sortable();
    return builder;
  }
}
