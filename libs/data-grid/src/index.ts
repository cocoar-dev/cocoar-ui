// @cocoar/data-grid - AG Grid wrapper with Cocoar theme

// Builders (fluent API for grid configuration)
export {
  CoarGridBuilder,
  CoarGridColumnBuilder,
  CoarGridColumnFactory,
  type ColumnDefinition,
} from './lib/builders';

// Directive (connects builder to AG Grid)
export { CoarDataGridDirective } from './lib/directive';

// Theme (Cocoar-styled AG Grid theme)
export { cocoarTheme, createCocoarTheme } from './lib/theme/cocoar-theme';

// Types (re-exports from AG Grid + Cocoar extensions)
export * from './lib/models';

// Note: Theme CSS should be imported separately in your app's styles:
// @import '@cocoar/data-grid/lib/theme/ag-theme-cocoar.css';
// or include the path in angular.json styles array
