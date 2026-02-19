# @cocoar/data-grid

AG Grid wrapper for the Cocoar Design System. Provides a fluent builder API, typed column factories, built-in cell renderers, and a design-token theme that supports light and dark mode out of the box.

## Features

- **Fluent Grid Builder** — configure columns, data, selection, sorting, filtering, and events through a chainable `CoarGridBuilder` API
- **Typed Column Factory** — create date, number, currency, boolean, tag, icon, and locale-aware date columns with a single method call
- **Built-in Cell Renderers** — `<coar-tag>`, `<coar-icon>`, and locale-aware date renderers available via factory methods
- **Cocoar Theme** — `ag-theme-cocoar` maps AG Grid CSS variables to `--coar-*` design tokens with automatic light/dark mode
- **Directive Binding** — `CoarDataGridDirective` binds a builder to `ag-grid-angular`, applies the theme class, and wires viewport events
- **Observable Data** — bind row data from an `Observable` with automatic loading state
- **Column State Persistence** — restore column widths, order, and visibility from saved state
- **External Filtering** — apply filters outside of AG Grid with observable triggers
- **Full-Row Editing** — enable row-level editing with a single builder call
- **Escape Hatch** — `option()` and `options()` let you set any AG Grid option directly

## Installation

```bash
pnpm add @cocoar/data-grid ag-grid-community ag-grid-angular
```

### Peer Dependencies

| Package | Version |
|---------|---------|
| `@angular/core` | `^21.0.0` |
| `@cocoar/localization` | `^0.1.0` |
| `@cocoar/ui` | `^0.1.0` |
| `ag-grid-angular` | `^35.0.0` |
| `ag-grid-community` | `^35.0.0` |
| `rxjs` | `^7.8.0` |

## Quick Start

### 1. Register AG Grid Modules

In your component or `app.config.ts`:

```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

### 2. Import Styles

Add the Cocoar AG Grid theme to your application styles:

```css
@import '@cocoar/data-grid/styles.css';
```

### 3. Use the Grid

```typescript
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CoarGridBuilder, CoarDataGridDirective } from '@cocoar/data-grid';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  imports: [AgGridAngular, CoarDataGridDirective],
  template: `
    <ag-grid-angular
      [coarDataGrid]="gridBuilder"
      style="height: 400px;"
    />
  `,
})
export class UsersGridComponent {
  readonly gridBuilder = CoarGridBuilder.create<User>()
    .columns([
      col => col.field('name').header('Name').flex(1).sortable(),
      col => col.field('email').header('Email').flex(1),
    ])
    .rowData([
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ])
    .rowId(params => String(params.data.id));
}
```

> The directive automatically applies the `ag-theme-cocoar` class and `display: flex` layout to the host element.

## Grid Builder API

`CoarGridBuilder` is the main entry point. Create an instance with `CoarGridBuilder.create<TData>()`.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `gridReady$` | `Observable<GridReadyEvent>` | Emits when the grid is ready |
| `api` | `GridApi \| undefined` | AG Grid API (available after grid ready) |

### Methods

#### Column Configuration

| Method | Description |
|--------|-------------|
| `columns(defs)` | Define columns using builders or factory functions |
| `defaultColDef(def)` | Set default column definition applied to all columns. Accepts an object or a builder function |

#### Data

| Method | Description |
|--------|-------------|
| `rowData(data)` | Set row data from a static array (or `null`) |
| `rowData$(data$)` | Set row data from an `Observable`. Emitting `null`/`undefined` shows the loading overlay |
| `rowId(fn)` | Set a `GetRowIdFunc` for immutable data updates |

#### Selection

| Method | Description |
|--------|-------------|
| `rowSelection(mode)` | Enable `'single'` or `'multiple'` row selection |

#### Row Styling

| Method | Description |
|--------|-------------|
| `rowClassRules(rules)` | Apply conditional CSS classes to rows |
| `rowClass(fn)` | Set a function that returns dynamic class name(s) per row |

#### Sorting

| Method | Description |
|--------|-------------|
| `defaultSort(field, direction)` | Set initial sort column and `'asc'` or `'desc'` direction |
| `sortFunction(fn)` | Set a custom post-sort function to reorder rows after AG Grid sorts |
| `updateSortAndFilterWhen(trigger$)` | Re-trigger sort and filter when the observable emits |

#### Column State

| Method | Description |
|--------|-------------|
| `columnState(state)` | Restore column widths, order, and visibility from an array or observable |

#### Tree / Group Data

| Method | Description |
|--------|-------------|
| `openRows(openRows$)` | Set which parent rows are expanded (observable of row IDs) |

#### Editing

| Method | Description |
|--------|-------------|
| `fullRowEdit()` | Enable full-row editing mode |
| `stopEditingWhenCellsLoseFocus()` | Stop editing when cells lose focus |

#### Resize

| Method | Description |
|--------|-------------|
| `shiftResizeMode()` | Enable shift-key column resize mode |

#### Animation

| Method | Description |
|--------|-------------|
| `animateRows()` | Enable row animation (enabled by default) |

#### Events

| Method | Description |
|--------|-------------|
| `onGridReady(handler)` | Handle grid ready event |
| `onRowClicked(handler)` | Handle row click |
| `onRowDoubleClicked(handler)` | Handle row double-click |
| `onCellClicked(handler)` | Handle cell click |
| `onCellDoubleClicked(handler)` | Handle cell double-click |
| `onCellContextMenu(handler)` | Handle cell right-click (Ctrl+click passes through to the browser) |
| `onViewportClick(handler)` | Handle click on empty grid area (wired by directive) |
| `onViewportContextMenu(handler)` | Handle right-click on empty grid area (wired by directive) |
| `onGridSizeChanged(handler)` | Handle grid size change |

#### External Filtering

| Method | Description |
|--------|-------------|
| `externalFilter(doesFilterPass, isFilterPresent?)` | Set an external filter function |
| `updateExternalFilterWhen(trigger$)` | Re-trigger the external filter when the observable emits |

#### Escape Hatch

| Method | Description |
|--------|-------------|
| `option(key, value)` | Set any single `GridOptions` property |
| `options(opts)` | Merge a partial `GridOptions` object |

## Column Builder API

`CoarGridColumnBuilder` configures individual columns with a fluent API. You rarely instantiate it directly — it is provided by the factory function in `columns()`.

| Method | Description |
|--------|-------------|
| `field(name)` | Set the data field name |
| `header(text)` | Set the column header text |
| `headerTooltip(text)` | Set header tooltip |
| `width(px, minWidth?, maxWidth?)` | Set width in pixels with optional min/max |
| `fixedWidth(px)` | Set width, minWidth, and maxWidth to the same value |
| `minWidth(px)` | Set minimum width |
| `maxWidth(px)` | Set maximum width |
| `flex(n)` | Set flex grow factor (default: `1`) |
| `sortable()` | Enable sorting |
| `resizable()` | Enable resizing (enabled by default) |
| `hidden()` | Hide the column |
| `pinned(side)` | Pin to `'left'`, `'right'`, or `null` |
| `lockPosition(value?)` | Lock column position |
| `cellRenderer(component, params?)` | Set a custom cell renderer Angular component |
| `cellRendererParams(params)` | Set cell renderer parameters |
| `cellRendererConfig(component, config)` | Set cell renderer with a `config` object |
| `valueFormatter(fn)` | Format the displayed value |
| `valueGetter(fn)` | Transform data before display |
| `cellClass(value)` | Set CSS class (string, array, or function) |
| `cellStyle(value)` | Set CSS style (object or function) |
| `classRule(className, condition)` | Add a conditional CSS class rule |
| `tooltip(value?)` | Show tooltip — field value by default, or a string/function |
| `onCellDoubleClicked(handler)` | Handle cell double-click |
| `filter(value?)` | Enable filtering (boolean or filter type string) |
| `filterParams(params)` | Set filter parameters |
| `quickFilter(fn)` | Set quick-filter text extractor, or `false` to exclude |
| `comparator(fn)` | Set a custom sort comparator |
| `rowDrag(value?)` | Enable row drag on this column |
| `option(key, value)` | Set any single `ColDef` property |
| `customize(fn)` | Apply custom modifications to the `ColDef` |
| `build()` | Build and return the AG Grid `ColDef` |

## Column Factory Methods

When you pass a function to `columns()`, it receives a `CoarGridColumnFactory<TData>`. The factory provides shorthand methods for common column types.

### `field(fieldName)`

Creates a plain column builder — identical to `new CoarGridColumnBuilder(fieldName)`.

```typescript
col => col.field('name').header('Name').flex(1).sortable()
```

### `date(fieldName, format?)`

Creates a date column with a `valueFormatter`. The `format` parameter accepts:

| Value | Output |
|-------|--------|
| `'short'` (default) | `date.toLocaleDateString()` |
| `'long'` | Full date with month name |
| `'datetime'` | `date.toLocaleString()` |
| `Intl.DateTimeFormatOptions` | Custom Intl formatting |
| `(date: Date) => string` | Custom formatter function |

```typescript
col => col.date('createdAt', 'long').header('Created').width(180)
```

### `number(fieldName, decimals?)`

Creates a right-aligned number column formatted with `toLocaleString`. Default `decimals` is `0`.

```typescript
col => col.number('score', 2).header('Score').width(100)
```

### `currency(fieldName, currency?)`

Creates a right-aligned currency column. Default currency is `'USD'`.

```typescript
col => col.currency('price', 'EUR').header('Price').width(120)
```

### `boolean(fieldName, options?)`

Creates a column that displays `'Yes'`/`'No'` (or custom values).

```typescript
col => col.boolean('active', { trueValue: 'Active', falseValue: 'Inactive' }).header('Status')
```

### `tag(fieldName, config?)`

Creates a column that renders values as `<coar-tag>` elements. Sortable by default.

Supports string values (split by separator), arrays, and object arrays.

**`TagCellRendererConfig`:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `separator` | `string` | `','` | Delimiter to split string values |
| `variant` | `TagVariant` | — | Default variant for all tags |
| `variantMap` | `Record<string, TagVariant>` | — | Map tag values to variants |
| `size` | `'s' \| 'm' \| 'l'` | `'s'` | Tag size |
| `i18nPrefix` | `string` | — | Prefix for i18n translation keys |
| `labelProperty` | `string` | — | Property name when values are objects |

```typescript
col => col.tag('roles', {
  separator: ',',
  size: 's',
  variantMap: { admin: 'primary', editor: 'info', viewer: 'neutral' },
})
```

### `icon(fieldName, config?)`

Creates a column that renders the cell value as a `<coar-icon>`.

**`IconCellRendererConfig`:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `CoarIconSize` | `'s'` | Icon size (`'xs'`, `'s'`, `'m'`, `'l'`, `'xl'`) |
| `source` | `string` | — | Icon source registry key |
| `color` | `string` | `'inherit'` | CSS color value |
| `onClick` | `(params) => void` | — | Click handler (makes the icon clickable) |

```typescript
col => col.icon('fileType', { size: 'm', color: 'var(--coar-color-primary)' })
```

### `localDate(fieldName, config?)`

Creates a date column that renders via `CoarDatePipe` from `@cocoar/localization` for full locale integration. Sortable by default.

**`DateCellRendererConfig`:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showSeconds` | `boolean` | — | Include seconds in time display |
| `customFormat` | `string` | — | Custom Angular date format string |

```typescript
col => col.localDate('updatedAt', { showSeconds: false }).header('Updated')
```

## Directive

`CoarDataGridDirective` connects a `CoarGridBuilder` to an `ag-grid-angular` instance.

**Selector:** `ag-grid-angular[coarDataGrid]`
**Export:** `coarDataGrid`

**Host bindings applied automatically:**
- CSS class: `ag-theme-cocoar`
- Style: `display: flex; flex-direction: column; flex-grow: 1`

The directive also forwards viewport click and context-menu events from the grid's empty area to the builder's `onViewportClick` / `onViewportContextMenu` handlers.

```html
<ag-grid-angular
  [coarDataGrid]="gridBuilder"
  style="height: 500px;"
/>
```

## Theming

### CSS Theme

Import the theme CSS in your application styles:

```css
@import '@cocoar/data-grid/styles.css';
```

The `ag-theme-cocoar` class maps AG Grid CSS variables to Cocoar design tokens. Light mode is the default; dark mode activates when a `.dark-mode` class is present on the grid or a parent element.

**Key CSS variable mappings:**

| AG Grid Variable | Cocoar Token | Purpose |
|-----------------|-------------|---------|
| `--ag-background-color` | `--coar-background-neutral-primary` | Grid background |
| `--ag-header-background-color` | `--coar-background-neutral-secondary` | Header background |
| `--ag-row-hover-color` | `--coar-background-neutral-tertiary` | Row hover |
| `--ag-selected-row-background-color` | `--coar-background-accent-tertiary` | Selected row |
| `--ag-border-color` | `--coar-border-neutral-tertiary` | Borders |
| `--ag-foreground-color` | `--coar-text-neutral-primary` | Text |
| `--ag-header-foreground-color` | `--coar-text-neutral-secondary` | Header text |
| `--ag-font-family` | `--coar-font-family-body` | Typography |
| `--ag-checkbox-checked-color` | `--coar-background-accent-primary` | Checkbox |

**Utility CSS classes** available inside `ag-theme-cocoar`:
- `.clickable` — pointer cursor with accent color
- `.text-right` — right-aligned cell content
- `.text-center` — center-aligned cell content

### JavaScript Theme

The library also exports a JavaScript theme for AG Grid's v33+ theming API (based on `themeQuartz`):

```typescript
import { cocoarTheme, createCocoarTheme } from '@cocoar/data-grid';

// Use the pre-configured instance (applied by the builder automatically)
const theme = cocoarTheme;

// Or create a customized instance
const custom = createCocoarTheme();
```

The builder applies `cocoarTheme` by default — you only need this export if you use AG Grid directly without the builder.

## Examples

### Row Selection

```typescript
const grid = CoarGridBuilder.create<User>()
  .columns([
    col => col.field('name').header('Name').flex(1),
    col => col.field('email').header('Email').flex(1),
  ])
  .rowData(users)
  .rowSelection('single')
  .onRowClicked(event => {
    console.log('Selected:', event.data);
  });
```

### Conditional Row and Cell Styling

```typescript
const grid = CoarGridBuilder.create<Task>()
  .columns([
    col => col.field('title').header('Title').flex(1),
    col => col.field('priority').header('Priority').width(100)
      .classRule('high-priority', params => params.value === 'high')
      .cellStyle(params =>
        params.value === 'high' ? { fontWeight: '600' } : null
      ),
  ])
  .rowData(tasks)
  .rowClassRules({
    'overdue': params => params.data?.dueDate < new Date(),
  });
```

### Typed Columns

```typescript
const grid = CoarGridBuilder.create<Invoice>()
  .columns([
    col => col.field('number').header('#').fixedWidth(80),
    col => col.date('issuedAt', 'long').header('Issued').width(180),
    col => col.number('quantity', 0).header('Qty').width(80),
    col => col.currency('total', 'EUR').header('Total').width(120),
    col => col.boolean('paid').header('Paid').width(80),
  ])
  .rowData(invoices);
```

### Tag and Icon Cell Renderers

```typescript
const grid = CoarGridBuilder.create<User>()
  .columns([
    col => col.field('name').header('Name').flex(1),
    col => col.tag('roles', {
      variantMap: { admin: 'primary', editor: 'info', viewer: 'neutral' },
      size: 's',
    }).header('Roles').flex(1),
    col => col.icon('status', {
      size: 's',
      onClick: params => alert(`Clicked ${params.data.name}`),
    }).header('').fixedWidth(50),
  ])
  .rowData(users);
```

### Observable Data Binding

```typescript
readonly users$ = inject(UserService).getUsers();

readonly grid = CoarGridBuilder.create<User>()
  .columns([
    col => col.field('name').header('Name').flex(1),
    col => col.field('email').header('Email').flex(1),
  ])
  .rowData$(this.users$)
  .rowId(params => String(params.data.id));
```

### Sorting and Custom Comparators

```typescript
const grid = CoarGridBuilder.create<Item>()
  .columns([
    col => col.field('name').header('Name').flex(1).sortable()
      .comparator((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    col => col.field('priority').header('Priority').width(120).sortable()
      .comparator((a, b) => priorityOrder[a] - priorityOrder[b]),
  ])
  .rowData(items)
  .defaultSort('priority', 'asc');
```

### Context Menu Integration

```typescript
const grid = CoarGridBuilder.create<File>()
  .columns([...])
  .rowData(files)
  .onCellContextMenu(event => {
    const mouseEvent = event.event as MouseEvent;
    openContextMenu(mouseEvent, event.data);
  })
  .onViewportContextMenu(($event, api) => {
    openBackgroundMenu($event);
  });
```

### Full-Row Editing

```typescript
const grid = CoarGridBuilder.create<Record>()
  .columns([
    col => col.field('name').header('Name').flex(1).option('editable', true),
    col => col.field('value').header('Value').flex(1).option('editable', true),
  ])
  .rowData(records)
  .fullRowEdit()
  .stopEditingWhenCellsLoseFocus();
```

### External Filtering

```typescript
readonly searchTerm = signal('');

readonly grid = CoarGridBuilder.create<Item>()
  .columns([...])
  .rowData(items)
  .externalFilter(node => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return true;
    return node.data.name.toLowerCase().includes(term);
  })
  .updateExternalFilterWhen(toObservable(this.searchTerm));
```

## License

Apache-2.0
