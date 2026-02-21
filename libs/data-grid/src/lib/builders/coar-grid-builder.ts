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
  GridSizeChangedEvent,
  CellContextMenuEvent,
  ColumnState,
  PostSortRowsParams,
} from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CoarGridColumnBuilder } from './coar-grid-column-builder';
import { CoarGridColumnFactory } from './coar-grid-column-factory';
import { cocoarTheme } from '../theme/cocoar-theme';

type ColumnBuilderLike<TData> = {
  build(): ColDef<TData>;
};

/** Column definition input - either a builder or a factory function */
export type ColumnDefinition<TData> =
  | ColumnBuilderLike<TData>
  | ((factory: CoarGridColumnFactory<TData>) => ColumnBuilderLike<TData>);

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

  // Deferred state (applied after grid ready)
  #columnState?: ColumnState[] | Observable<ColumnState[] | undefined>;
  #openRows$?: Observable<string[]>;
  #sortFilterTriggers: Observable<unknown>[] = [];
  #externalFilterTriggers: Observable<unknown>[] = [];

  // Viewport event handlers (wired by directive)
  #viewportClickHandler?: ($event: MouseEvent, api: GridApi<TData>) => void;
  #viewportContextMenuHandler?: ($event: MouseEvent, api: GridApi<TData>) => void;

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
      animateRows: true,
      rowSelection: undefined,
    };
  }

  #mergeOptions(options: GridOptions<TData>): void {
    this.#gridOptions = { ...this.#gridOptions, ...options };
  }

  #composeHandler<E>(
    existing: ((event: E) => void) | undefined,
    handler: (event: E) => void
  ): (event: E) => void {
    if (existing) {
      return (event: E) => {
        existing(event);
        handler(event);
      };
    }
    return handler;
  }

  // ============================================================
  // Column Configuration
  // ============================================================

  /** Define columns using builders or factory functions */
  columns(definitions: ColumnDefinition<TData>[]): this {
    const factory = new CoarGridColumnFactory<TData>();
    this.#columnDefs = definitions.map((def) => {
      if (typeof def === 'function') return def(factory).build();
      return def.build();
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
    const mapped = mode === 'single' ? 'singleRow' : 'multiRow';
    this.#mergeOptions({ rowSelection: { mode: mapped } });
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
  // Sorting
  // ============================================================

  /** Set initial sort column and direction */
  defaultSort(field: string, direction: 'asc' | 'desc'): this {
    this.#gridOptions.initialState = {
      ...this.#gridOptions.initialState,
      sort: {
        sortModel: [{ colId: field, sort: direction }],
      },
    };
    return this;
  }

  /** Set custom post-sort function to reorder rows after AG Grid sorts */
  sortFunction(fn: (params: PostSortRowsParams<TData>) => void): this {
    this.#mergeOptions({ postSortRows: fn });
    return this;
  }

  /** Re-trigger sort and filter when the given observable emits */
  updateSortAndFilterWhen(trigger: Observable<unknown>): this {
    this.#sortFilterTriggers.push(trigger);
    return this;
  }

  // ============================================================
  // Column State
  // ============================================================

  /** Merge column state to restore column widths, order, visibility */
  columnState(state: ColumnState[] | Observable<ColumnState[] | undefined>): this {
    this.#columnState = state;
    return this;
  }

  // ============================================================
  // Tree / Group Data
  // ============================================================

  /** Set which parent rows are expanded (observable of row IDs) */
  openRows(openRows$: Observable<string[]>): this {
    this.#openRows$ = openRows$;
    return this;
  }

  // ============================================================
  // Editing
  // ============================================================

  /** Enable full-row editing mode */
  fullRowEdit(value = true): this {
    this.#mergeOptions({ editType: value ? 'fullRow' : undefined });
    return this;
  }

  /** Stop cell editing when cells lose focus */
  stopEditingWhenCellsLoseFocus(value = true): this {
    this.#mergeOptions({ stopEditingWhenCellsLoseFocus: value });
    return this;
  }

  // ============================================================
  // Resize
  // ============================================================

  /** Enable shift-key column resize mode */
  shiftResizeMode(value = true): this {
    this.#mergeOptions({ colResizeDefault: value ? 'shift' : undefined });
    return this;
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  /** Handle grid ready event */
  onGridReady(handler: (event: GridReadyEvent<TData>) => void): this {
    this.#gridOptions.onGridReady = this.#composeHandler(this.#gridOptions.onGridReady, handler);
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

  /** Handle grid size changed event */
  onGridSizeChanged(handler: (event: GridSizeChangedEvent<TData>) => void): this {
    this.#gridOptions.onGridSizeChanged = this.#composeHandler(
      this.#gridOptions.onGridSizeChanged,
      handler
    );
    return this;
  }

  /** Handle cell context menu (right-click). Ctrl+click is passed through to the browser. */
  onCellContextMenu(handler: (event: CellContextMenuEvent<TData>) => void): this {
    this.#mergeOptions({
      onCellContextMenu: (event: CellContextMenuEvent<TData>) => {
        const mouseEvent = event.event as MouseEvent | undefined;
        if (mouseEvent?.ctrlKey) return;
        handler(event);
      },
    });
    return this;
  }

  /**
   * Handle click on the grid viewport (empty area outside cells).
   * Wired by the directive via HostListener.
   */
  onViewportClick(handler: ($event: MouseEvent, api: GridApi<TData>) => void): this {
    this.#viewportClickHandler = handler;
    return this;
  }

  /**
   * Handle context menu on the grid viewport (empty area outside cells).
   * Wired by the directive via HostListener.
   */
  onViewportContextMenu(handler: ($event: MouseEvent, api: GridApi<TData>) => void): this {
    this.#viewportContextMenuHandler = handler;
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

  /** Re-trigger external filter when the given observable emits */
  updateExternalFilterWhen(trigger: Observable<unknown>): this {
    this.#externalFilterTriggers.push(trigger);
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

      // Apply column state
      if (this.#columnState) {
        if (this.#columnState instanceof Observable) {
          (this.#columnState as Observable<ColumnState[] | undefined>)
            .pipe(takeUntil(this.#destroy$))
            .subscribe((state) => {
              if (state) {
                event.api.applyColumnState({ state, applyOrder: true });
              }
            });
        } else {
          event.api.applyColumnState({ state: this.#columnState, applyOrder: true });
        }
      }

      // Subscribe to sort/filter triggers
      for (const trigger of this.#sortFilterTriggers) {
        trigger.pipe(takeUntil(this.#destroy$)).subscribe(() => {
          event.api.onSortChanged();
          event.api.onFilterChanged();
        });
      }

      // Subscribe to external filter triggers
      for (const trigger of this.#externalFilterTriggers) {
        trigger.pipe(takeUntil(this.#destroy$)).subscribe(() => {
          event.api.onFilterChanged();
        });
      }

      // Subscribe to open rows
      if (this.#openRows$) {
        this.#openRows$.pipe(takeUntil(this.#destroy$)).subscribe((openRowIds) => {
          event.api.forEachNode((node) => {
            if (node.group || node.master) {
              const shouldBeOpen = openRowIds.includes(node.key ?? node.id ?? '');
              if (node.expanded !== shouldBeOpen) {
                node.setExpanded(shouldBeOpen);
              }
            }
          });
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

  /** @internal Get viewport click handler (for directive) */
  _getViewportClickHandler(): (($event: MouseEvent, api: GridApi<TData>) => void) | undefined {
    return this.#viewportClickHandler;
  }

  /** @internal Get viewport context menu handler (for directive) */
  _getViewportContextMenuHandler():
    | (($event: MouseEvent, api: GridApi<TData>) => void)
    | undefined {
    return this.#viewportContextMenuHandler;
  }

  /** @internal Check if a cell context menu handler is registered (for directive) */
  _hasCellContextMenuHandler(): boolean {
    return this.#gridOptions.onCellContextMenu != null;
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
