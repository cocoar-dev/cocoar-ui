import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
  RowDoubleClickedEvent,
  CellClickedEvent,
  CellDoubleClickedEvent,
  GetRowIdFunc,
  RowClassParams,
  IRowNode,
  IsExternalFilterPresentParams,
} from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CoarGridColumnBuilder } from './coar-grid-column-builder';
import { CoarGridColumnFactory } from './coar-grid-column-factory';
import { cocoarTheme } from '../theme/cocoar-theme';

/** Column definition input - either a builder or a factory function */
export type ColumnDefinition<TData> =
  | CoarGridColumnBuilder<TData>
  | ((factory: CoarGridColumnFactory<TData>) => CoarGridColumnBuilder<TData>);

/**
 * Fluent builder for AG Grid configuration.
 *
 * @example
 * ```ts
 * const gridBuilder = CoarGridBuilder.create<User>()
 *   .columns([
 *     col => col.field('name').header('Name').flex(1),
 *     col => col.field('email').header('Email').flex(1),
 *     col => col.field('role').header('Role').width(100),
 *   ])
 *   .rowData(users)
 *   .rowId(user => user.id)
 *   .onRowClicked(event => console.log(event.data));
 * ```
 */
export class CoarGridBuilder<TData = unknown> {
  #grid?: AgGridAngular<TData>;
  #destroy$ = new Subject<void>();
  #gridReady$ = new Subject<GridReadyEvent<TData>>();

  #gridOptions: GridOptions<TData> = {};
  #columnDefs: ColDef<TData>[] = [];
  #rowData: TData[] | null = null;
  #rowData$?: Observable<TData[] | null | undefined>;

  /** Observable that emits when grid is ready */
  readonly gridReady$ = this.#gridReady$.asObservable();

  private constructor() {
    this.#gridOptions = this.#createDefaultOptions();
  }

  /** Create a new grid builder */
  static create<TData>(): CoarGridBuilder<TData> {
    return new CoarGridBuilder<TData>();
  }

  /** Get the AG Grid API (available after grid ready) */
  get api(): GridApi<TData> | undefined {
    return this.#grid?.api;
  }

  // ============================================================
  // Private helpers
  // ============================================================

  #createDefaultOptions(): GridOptions<TData> {
    return {
      theme: cocoarTheme,
      suppressPropertyNamesCheck: true,
      animateRows: true,
      rowSelection: undefined,
    };
  }

  #mergeOptions(options: GridOptions<TData>): void {
    this.#gridOptions = { ...this.#gridOptions, ...options };
  }

  // ============================================================
  // Column Configuration
  // ============================================================

  /** Define columns using builders or factory functions */
  columns(definitions: ColumnDefinition<TData>[]): this {
    const factory = new CoarGridColumnFactory<TData>();
    this.#columnDefs = definitions.map((def) => {
      if (def instanceof CoarGridColumnBuilder) {
        return def.build();
      }
      return def(factory).build();
    });
    return this;
  }

  /** Set default column definition applied to all columns */
  defaultColDef(
    definition:
      | Partial<ColDef<TData>>
      | ((builder: CoarGridColumnBuilder<TData>) => CoarGridColumnBuilder<TData>)
  ): this {
    if (typeof definition === 'function') {
      const builder = new CoarGridColumnBuilder<TData>();
      this.#gridOptions.defaultColDef = definition(builder).build();
    } else {
      this.#gridOptions.defaultColDef = definition;
    }
    return this;
  }

  // ============================================================
  // Data Configuration
  // ============================================================

  /** Set row data (static array) */
  rowData(data: TData[] | null): this {
    this.#rowData = data;
    this.#rowData$ = undefined;
    return this;
  }

  /** Set row data (observable) */
  rowData$(data$: Observable<TData[] | null | undefined>): this {
    this.#rowData$ = data$;
    this.#rowData = null;
    return this;
  }

  /** Set row ID getter for immutable data updates */
  rowId(getRowId: GetRowIdFunc<TData>): this {
    this.#gridOptions.getRowId = getRowId;
    return this;
  }

  // ============================================================
  // Row Selection
  // ============================================================

  /** Enable row selection */
  rowSelection(mode: 'single' | 'multiple'): this {
    this.#mergeOptions({ rowSelection: mode });
    return this;
  }

  // ============================================================
  // Row Styling
  // ============================================================

  /** Set row class rules */
  rowClassRules(
    rules: Record<string, ((params: RowClassParams<TData>) => boolean) | string>
  ): this {
    this.#mergeOptions({ rowClassRules: rules });
    return this;
  }

  /** Set dynamic row class */
  rowClass(fn: (params: RowClassParams<TData>) => string | string[] | undefined): this {
    this.#mergeOptions({ getRowClass: fn });
    return this;
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  /** Handle grid ready event */
  onGridReady(handler: (event: GridReadyEvent<TData>) => void): this {
    const existing = this.#gridOptions.onGridReady;
    this.#gridOptions.onGridReady = (event) => {
      existing?.(event);
      handler(event);
    };
    return this;
  }

  /** Handle row click */
  onRowClicked(handler: (event: RowClickedEvent<TData>) => void): this {
    this.#mergeOptions({ onRowClicked: handler });
    return this;
  }

  /** Handle row double-click */
  onRowDoubleClicked(handler: (event: RowDoubleClickedEvent<TData>) => void): this {
    this.#mergeOptions({ onRowDoubleClicked: handler });
    return this;
  }

  /** Handle cell click */
  onCellClicked(handler: (event: CellClickedEvent<TData>) => void): this {
    this.#mergeOptions({ onCellClicked: handler });
    return this;
  }

  /** Handle cell double-click */
  onCellDoubleClicked(handler: (event: CellDoubleClickedEvent<TData>) => void): this {
    this.#mergeOptions({ onCellDoubleClicked: handler });
    return this;
  }

  // ============================================================
  // External Filtering
  // ============================================================

  /** Set external filter */
  externalFilter(
    doesFilterPass: (node: IRowNode<TData>) => boolean,
    isFilterPresent?: (params: IsExternalFilterPresentParams<TData>) => boolean
  ): this {
    this.#mergeOptions({
      isExternalFilterPresent: isFilterPresent ?? (() => true),
      doesExternalFilterPass: doesFilterPass,
    });
    return this;
  }

  // ============================================================
  // Grid Options
  // ============================================================

  /** Enable row animation */
  animateRows(value = true): this {
    this.#mergeOptions({ animateRows: value });
    return this;
  }

  /** Set any AG Grid option directly */
  option<K extends keyof GridOptions<TData>>(key: K, value: GridOptions<TData>[K]): this {
    this.#gridOptions[key] = value;
    return this;
  }

  /** Merge additional grid options */
  options(options: GridOptions<TData>): this {
    this.#mergeOptions(options);
    return this;
  }

  // ============================================================
  // Internal - Used by directive
  // ============================================================

  /** @internal Called by the directive to bind to AG Grid */
  _bind(grid: AgGridAngular<TData>): void {
    this.#grid = grid;

    // Set grid options
    grid.gridOptions = this.#gridOptions;
    grid.columnDefs = this.#columnDefs;

    // Set static row data if provided
    if (this.#rowData !== null) {
      grid.rowData = this.#rowData;
    }

    // Subscribe to grid ready
    grid.gridReady.pipe(takeUntil(this.#destroy$)).subscribe((event) => {
      this.#gridReady$.next(event);

      // Subscribe to observable row data if provided
      if (this.#rowData$) {
        this.#rowData$.pipe(takeUntil(this.#destroy$)).subscribe((data) => {
          if (data === null || data === undefined) {
            event.api.setGridOption('rowData', []);
            event.api.setGridOption('loading', true);
          } else {
            event.api.setGridOption('rowData', data);
            event.api.setGridOption('loading', false);
          }
        });
      }
    });
  }

  /** @internal Called by the directive on destroy */
  _destroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
    this.#gridReady$.complete();
  }

  /** Get column definitions (for directive) */
  _getColumnDefs(): ColDef<TData>[] {
    return this.#columnDefs;
  }

  /** Get grid options (for directive) */
  _getGridOptions(): GridOptions<TData> {
    return this.#gridOptions;
  }

  /** Get static row data (for directive) */
  _getRowData(): TData[] | null {
    return this.#rowData;
  }
}
