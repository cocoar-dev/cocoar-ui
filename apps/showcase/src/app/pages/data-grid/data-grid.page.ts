import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import {
  CoarCodeBlockComponent,
  CoarCardComponent,
} from '@cocoar/ui-components';

import { CoarGridBuilder, CoarDataGridDirective } from '@cocoar/data-grid';

// Register all AG Grid community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Guest';
  status: 'Active' | 'Inactive';
  age: number;
}

@Component({
  selector: 'app-data-grid-page',
  standalone: true,
  imports: [
    CoarCodeBlockComponent,
    CoarCardComponent,
    AgGridAngular,
    CoarDataGridDirective,
  ],
  templateUrl: './data-grid.page.html',
  styleUrl: './data-grid.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridPage {

  // Sample user data
  readonly users: User[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Admin',
      status: 'Active',
      age: 32,
    },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active', age: 28 },
    {
      id: 3,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'User',
      status: 'Inactive',
      age: 45,
    },
    {
      id: 4,
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'Admin',
      status: 'Active',
      age: 35,
    },
    {
      id: 5,
      name: 'Eve Wilson',
      email: 'eve@example.com',
      role: 'Guest',
      status: 'Active',
      age: 29,
    },
    {
      id: 6,
      name: 'Frank Miller',
      email: 'frank@example.com',
      role: 'User',
      status: 'Active',
      age: 41,
    },
    {
      id: 7,
      name: 'Grace Lee',
      email: 'grace@example.com',
      role: 'User',
      status: 'Inactive',
      age: 26,
    },
    {
      id: 8,
      name: 'Henry Chen',
      email: 'henry@example.com',
      role: 'Admin',
      status: 'Active',
      age: 38,
    },
    {
      id: 9,
      name: 'Ivy Martinez',
      email: 'ivy@example.com',
      role: 'User',
      status: 'Active',
      age: 31,
    },
    {
      id: 10,
      name: 'Jack Thompson',
      email: 'jack@example.com',
      role: 'Guest',
      status: 'Active',
      age: 44,
    },
  ];

  // ============================================================
  // Basic Grid Example
  // ============================================================
  readonly basicGrid = CoarGridBuilder.create<User>()
    .columns([
      (col) => col.field('name').header('Name').flex(1).sortable(),
      (col) => col.field('email').header('Email').flex(1).sortable(),
      (col) => col.field('role').header('Role').width(100).sortable(),
      (col) => col.field('status').header('Status').width(100).sortable(),
      (col) => col.field('age').header('Age').width(80).sortable(),
    ])
    .rowData(this.users)
    .rowId((params) => String(params.data?.id));

  readonly basicCode = `// Define grid with fluent builder API
readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([
    col => col.field('name').header('Name').flex(1).sortable(),
    col => col.field('email').header('Email').flex(1).sortable(),
    col => col.field('role').header('Role').width(100).sortable(),
    col => col.field('status').header('Status').width(100).sortable(),
    col => col.field('age').header('Age').width(80).sortable(),
  ])
  .rowData(users)
  .rowId(params => String(params.data?.id));`;

  readonly basicHtml = `<!-- Use with AG Grid component and directive -->
<ag-grid-angular
  class="ag-theme-cocoar"
  [coarDataGrid]="gridBuilder"
  style="height: 400px;"
/>`;

  // ============================================================
  // Row Selection Example
  // ============================================================
  selectedUser: User | null = null;

  readonly selectionGrid = CoarGridBuilder.create<User>()
    .columns([
      (col) => col.field('name').header('Name').flex(1),
      (col) => col.field('email').header('Email').flex(1),
      (col) => col.field('role').header('Role').width(100),
    ])
    .rowData(this.users)
    .rowId((params) => String(params.data?.id))
    .rowSelection('single')
    .onRowClicked((event) => {
      this.selectedUser = event.data ?? null;
    });

  readonly selectionCode = `// Enable row selection
readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([...])
  .rowData(users)
  .rowSelection('single')
  .onRowClicked(event => {
    this.selectedUser = event.data;
  });`;

  // ============================================================
  // Styling Example
  // ============================================================
  readonly styledGrid = CoarGridBuilder.create<User>()
    .columns([
      (col) => col.field('name').header('Name').flex(1),
      (col) =>
        col
          .field('status')
          .header('Status')
          .width(100)
          .cellClass((params) => (params.value === 'Active' ? 'status-active' : 'status-inactive')),
      (col) => col.field('age').header('Age').width(80),
    ])
    .rowData(this.users)
    .rowId((params) => String(params.data?.id))
    .rowClassRules({
      'row-inactive': (params) => params.data?.status === 'Inactive',
    });

  readonly styledCode = `// Apply conditional styling
readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([
    col => col.field('name').header('Name').flex(1),
    col => col.field('status').header('Status').width(100)
      .cellClass(params => params.value === 'Active' ? 'status-active' : 'status-inactive'),
    col => col.field('age').header('Age').width(80),
  ])
  .rowClassRules({
    'row-inactive': params => params.data?.status === 'Inactive',
  });`;

  readonly styledCss = `/* Custom row/cell styling */
.row-inactive {
  opacity: 0.6;
}

.status-active {
  color: var(--coar-text-semantic-success-bold);
}

.status-inactive {
  color: var(--coar-text-semantic-error-bold);
}`;
}
