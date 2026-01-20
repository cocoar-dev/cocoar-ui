# Data Grid

A powerful data grid component powered by AG Grid with Cocoar theme integration and a fluent builder API.

## Installation

The `@cocoar/data-grid` package wraps [AG Grid Community](https://www.ag-grid.com/) with a fluent builder API and Cocoar design tokens.

```bash
npm install @cocoar/data-grid ag-grid-community ag-grid-angular
```

## Setup

### 1. Register AG Grid Modules

In your component or `app.config.ts`:

```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

### 2. Import Styles

Add the Cocoar AG Grid theme to your styles:

```css
@import '@cocoar/data-grid/styles.css';
```

### 3. Use the Grid

```typescript
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CoarGridBuilder, CoarDataGridDirective } from '@cocoar/data-grid';

@Component({
  imports: [AgGridAngular, CoarDataGridDirective],
  template: `
    <ag-grid-angular
      class="ag-theme-cocoar"
      [coarDataGrid]="gridBuilder"
      style="height: 400px;"
    />
  `
})
export class MyComponent {
  readonly gridBuilder = CoarGridBuilder.create<User>()
    .columns([
      col => col.field('name').header('Name').flex(1),
      col => col.field('email').header('Email').flex(1),
    ])
    .rowData(this.users);
}
```

## Builder API

### CoarGridBuilder

The main entry point for configuring a grid.

| Method | Description |
|--------|-------------|
| `columns(defs)` | Define columns using builder functions |
| `rowData(data)` | Set static row data array |
| `rowData$(obs)` | Set observable row data |
| `rowId(fn)` | Set row ID getter for immutable data updates |
| `rowSelection(mode)` | Enable `'single'` or `'multiple'` selection |
| `onRowClicked(fn)` | Handle row click events |
| `onRowDoubleClicked(fn)` | Handle row double-click events |
| `rowClassRules(rules)` | Apply conditional CSS classes to rows |

### CoarGridColumnBuilder

Configure individual columns with a fluent API.

| Method | Description |
|--------|-------------|
| `field(name)` | Set the data field name |
| `header(text)` | Set the column header text |
| `width(px)` | Set fixed width in pixels |
| `flex(n)` | Set flex grow factor |
| `sortable()` | Enable sorting |
| `resizable()` | Enable column resizing |
| `hidden()` | Hide the column |
| `pinned('left' \| 'right')` | Pin column to edge |
| `cellClass(cls)` | Apply CSS class to cells |
| `valueFormatter(fn)` | Format display values |

## Theming

The `ag-theme-cocoar` class applies Cocoar design tokens to AG Grid. It automatically supports:

- **Light/Dark mode** via `.light-mode` / `.dark-mode` parent classes
- **Cocoar typography** using `--coar-font-family-*` tokens
- **Cocoar colors** for backgrounds, borders, and text
- **Cocoar spacing** for consistent padding and gaps

## Examples

### Row Selection

```typescript
readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([...])
  .rowData(users)
  .rowSelection('single')
  .onRowClicked(event => {
    console.log('Selected:', event.data);
  });
```

### Conditional Row Styling

```typescript
readonly gridBuilder = CoarGridBuilder.create<Task>()
  .columns([...])
  .rowData(tasks)
  .rowClassRules({
    'high-priority': params => params.data?.priority === 'high',
    'completed': params => params.data?.status === 'done',
  });
```

### Observable Data

```typescript
readonly users$ = this.userService.getUsers();

readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([...])
  .rowData$(this.users$)
  .rowId(params => params.data?.id);
```
