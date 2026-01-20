/**
 * Cocoar Theme for AG Grid
 *
 * Creates a customized AG Grid theme using the v33+ theming API.
 * Maps Cocoar design tokens to AG Grid parameters.
 */
import { themeQuartz, type Theme } from 'ag-grid-community';

/**
 * Creates the Cocoar AG Grid theme
 *
 * @example
 * ```typescript
 * import { createCocoarTheme } from '@cocoar/data-grid';
 *
 * const gridOptions = {
 *   theme: createCocoarTheme(),
 *   // ...
 * };
 * ```
 */
export function createCocoarTheme(): Theme {
  return themeQuartz.withParams({
    // Typography - Use CSS variables from Cocoar tokens
    fontFamily: 'var(--coar-font-family-body, Poppins, sans-serif)',
    fontSize: 14,

    // Spacing
    spacing: 4,
    cellHorizontalPadding: 16,
    rowHeight: 40,
    headerHeight: 40,

    // Colors (use CSS vars for light/dark mode support)
    backgroundColor: 'var(--coar-color-surface, #ffffff)',
    foregroundColor: 'var(--coar-color-text-primary, #1a1a1a)',
    borderColor: 'var(--coar-color-border, #e5e7eb)',

    // Header
    headerBackgroundColor: 'var(--coar-color-surface-alt, #f9fafb)',
    headerTextColor: 'var(--coar-color-text-primary, #1a1a1a)',
    headerFontWeight: 600,

    // Rows
    oddRowBackgroundColor: 'var(--coar-color-surface, #ffffff)',
    rowHoverColor: 'var(--coar-color-surface-hover, #f3f4f6)',

    // Selection
    selectedRowBackgroundColor: 'var(--coar-color-primary-light, #e0e7ff)',
    rangeSelectionBackgroundColor: 'var(--coar-color-primary-light, #e0e7ff)',

    // Borders
    borderRadius: 6,
    wrapperBorder: false,
    columnBorder: true,
    rowBorder: true,
  });
}

/**
 * Pre-configured Cocoar theme instance
 *
 * @example
 * ```typescript
 * import { cocoarTheme } from '@cocoar/data-grid';
 *
 * <ag-grid-angular [theme]="cocoarTheme" />
 * ```
 */
export const cocoarTheme = createCocoarTheme();
