/**
 * Minimal type definitions for @cocoar/data-grid
 * Re-exports commonly used AG Grid types and adds Cocoar-specific extensions
 */

// Re-export commonly used AG Grid types
export type {
  ColDef,
  GridOptions,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  RowDoubleClickedEvent,
  CellClickedEvent,
  CellDoubleClickedEvent,
  ColumnState,
  GetRowIdFunc,
  RowClassParams,
  ValueFormatterParams,
  ValueGetterParams,
  CellClassParams,
  ICellRendererParams,
  IRowNode,
} from 'ag-grid-community';

/**
 * Extended column definition with Cocoar-specific properties
 */
export interface CoarColDef<TData = unknown> {
  /** AG Grid field name */
  field?: string;
  /** Column header text */
  headerName?: string;
  /** Fixed width in pixels */
  width?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Flex grow factor for fluid columns */
  flex?: number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Whether column is hidden */
  hide?: boolean;
  /** Pin column to left or right */
  pinned?: 'left' | 'right' | null;
  /** Custom cell renderer component */
  cellRenderer?: unknown;
  /** Parameters for cell renderer */
  cellRendererParams?: Record<string, unknown>;
  /** Value formatter function */
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;
  /** Value getter function */
  valueGetter?: (params: ValueGetterParams<TData>) => unknown;
  /** CSS class for cells */
  cellClass?: string | string[] | ((params: CellClassParams<TData>) => string | string[]);
  /** CSS style for cells */
  cellStyle?:
    | Record<string, string>
    | ((params: CellClassParams<TData>) => Record<string, string> | null | undefined);
  /** Filter type */
  filter?: boolean | string;
}

import type { ValueFormatterParams, ValueGetterParams, CellClassParams } from 'ag-grid-community';
