import { Type } from '@angular/core';
import type {
  ColDef,
  CellClassParams,
  CellStyle,
  ValueFormatterParams,
  ValueGetterFunc,
  CellDoubleClickedEvent,
  ITooltipParams,
} from 'ag-grid-community';

/**
 * Fluent builder for AG Grid column definitions.
 *
 * @example
 * ```ts
 * const column = new CoarGridColumnBuilder<User>('name')
 *   .header('Full Name')
 *   .sortable()
 *   .flex(1)
 *   .build();
 * ```
 */
export class CoarGridColumnBuilder<TData = unknown, TValue = unknown> {
  readonly #colDef: ColDef<TData, TValue>;

  constructor(field?: keyof TData | string) {
    this.#colDef = {
      field: field?.toString() as ColDef<TData, TValue>['field'],
      headerName: field?.toString(),
      resizable: true,
      sortable: false,
    };
  }

  // ============================================================
  // Basic Properties
  // ============================================================

  /** Set the field name (data property) */
  field(value: keyof TData | string): this {
    this.#colDef.field = value.toString() as ColDef<TData, TValue>['field'];
    this.#colDef.headerName = this.#colDef.headerName || value.toString();
    return this;
  }

  /** Set the column header text */
  header(value: string): this {
    this.#colDef.headerName = value;
    return this;
  }

  /** Set header tooltip */
  headerTooltip(value: string): this {
    this.#colDef.headerTooltip = value;
    return this;
  }

  // ============================================================
  // Sizing
  // ============================================================

  /** Set fixed width in pixels */
  width(value: number, minWidth?: number, maxWidth?: number): this {
    this.#colDef.width = value;
    if (minWidth !== undefined) this.#colDef.minWidth = minWidth;
    if (maxWidth !== undefined) this.#colDef.maxWidth = maxWidth;
    return this;
  }

  /** Set fixed width (min, max, and width all the same) */
  fixedWidth(value: number): this {
    this.#colDef.width = value;
    this.#colDef.minWidth = value;
    this.#colDef.maxWidth = value;
    return this;
  }

  /** Set minimum width */
  minWidth(value: number): this {
    this.#colDef.minWidth = value;
    return this;
  }

  /** Set maximum width */
  maxWidth(value: number): this {
    this.#colDef.maxWidth = value;
    return this;
  }

  /** Set flex grow factor for fluid width */
  flex(value = 1): this {
    this.#colDef.flex = value;
    return this;
  }

  // ============================================================
  // Behavior
  // ============================================================

  /** Enable/disable sorting */
  sortable(value = true): this {
    this.#colDef.sortable = value;
    return this;
  }

  /** Enable/disable resizing */
  resizable(value = true): this {
    this.#colDef.resizable = value;
    return this;
  }

  /** Hide/show column */
  hidden(value = true): this {
    this.#colDef.hide = value;
    return this;
  }

  /** Pin column to left or right */
  pinned(value: 'left' | 'right' | null): this {
    this.#colDef.pinned = value;
    return this;
  }

  /** Lock column position */
  lockPosition(value: boolean | 'left' | 'right' = true): this {
    this.#colDef.lockPosition = value;
    return this;
  }

  // ============================================================
  // Cell Rendering
  // ============================================================

  /** Set custom cell renderer component */
  cellRenderer(component: Type<unknown>, params?: Record<string, unknown>): this {
    this.#colDef.cellRenderer = component;
    if (params) {
      this.#colDef.cellRendererParams = { ...this.#colDef.cellRendererParams, ...params };
    }
    return this;
  }

  /** Set cell renderer parameters */
  cellRendererParams(params: Record<string, unknown>): this {
    this.#colDef.cellRendererParams = { ...this.#colDef.cellRendererParams, ...params };
    return this;
  }

  /** Set value formatter for display */
  valueFormatter(fn: (params: ValueFormatterParams<TData, TValue>) => string): this {
    this.#colDef.valueFormatter = fn;
    return this;
  }

  /** Set value getter to transform data before display */
  valueGetter(fn: ValueGetterFunc<TData, TValue>): this {
    this.#colDef.valueGetter = fn;
    return this;
  }

  // ============================================================
  // Styling
  // ============================================================

  /** Set CSS class for cells */
  cellClass(
    value: string | string[] | ((params: CellClassParams<TData, TValue>) => string | string[])
  ): this {
    this.#colDef.cellClass = value;
    return this;
  }

  /** Set CSS style for cells */
  cellStyle(
    value: CellStyle | ((params: CellClassParams<TData, TValue>) => CellStyle | null | undefined)
  ): this {
    this.#colDef.cellStyle = value;
    return this;
  }

  /** Add a conditional CSS class rule */
  classRule(
    className: string,
    condition: string | ((params: CellClassParams<TData, TValue>) => boolean)
  ): this {
    if (!this.#colDef.cellClassRules) {
      this.#colDef.cellClassRules = {};
    }
    this.#colDef.cellClassRules[className] = condition;
    return this;
  }

  // ============================================================
  // Tooltips
  // ============================================================

  /** Show tooltip with field value or custom function */
  tooltip(value?: string | ((params: ITooltipParams<TData, TValue>) => string)): this {
    if (value === undefined) {
      this.#colDef.tooltipField = this.#colDef.field;
    } else if (typeof value === 'string') {
      this.#colDef.tooltipField = value as ColDef<TData, TValue>['tooltipField'];
    } else {
      this.#colDef.tooltipValueGetter = value;
    }
    return this;
  }

  // ============================================================
  // Events
  // ============================================================

  /** Handle cell double-click */
  onCellDoubleClicked(handler: (event: CellDoubleClickedEvent<TData, TValue>) => void): this {
    this.#colDef.onCellDoubleClicked = handler;
    return this;
  }

  // ============================================================
  // Filtering
  // ============================================================

  /** Enable/disable filtering */
  filter(value: boolean | string = true): this {
    this.#colDef.filter = value;
    return this;
  }

  /** Set filter parameters */
  filterParams(params: Record<string, unknown>): this {
    this.#colDef.filterParams = params;
    return this;
  }

  // ============================================================
  // Advanced Options
  // ============================================================

  /** Set any AG Grid ColDef option directly */
  option<K extends keyof ColDef<TData, TValue>>(key: K, value: ColDef<TData, TValue>[K]): this {
    this.#colDef[key] = value;
    return this;
  }

  /** Apply custom modifications to the column definition */
  customize(fn: (colDef: ColDef<TData, TValue>) => void): this {
    fn(this.#colDef);
    return this;
  }

  // ============================================================
  // Build
  // ============================================================

  /** Build and return the AG Grid ColDef */
  build(): ColDef<TData, TValue> {
    return { ...this.#colDef };
  }
}
