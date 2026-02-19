import { Component, ChangeDetectionStrategy, signal, viewChild, TemplateRef } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import {
  CoarCodeBlockComponent,
  CoarCardComponent,
} from '@cocoar/ui/components';
import { CoarMenuComponent, CoarMenuItemComponent, CoarMenuDividerComponent } from '@cocoar/ui/menu';
import { coarMenuPreset, createOverlayBuilder, type OverlayRef } from '@cocoar/ui/overlay';

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

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
  joinDate: Date;
  isActive: boolean;
}

interface ProjectTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  icon: string;
  createdAt: Date;
}

@Component({
  selector: 'app-data-grid-page',
  standalone: true,
  imports: [
    CoarCodeBlockComponent,
    CoarCardComponent,
    AgGridAngular,
    CoarDataGridDirective,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent,
  ],
  templateUrl: './data-grid.page.html',
  styleUrl: './data-grid.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridPage {
  installCode = `pnpm add @cocoar/data-grid`;
  importCode = `import { CoarDataGridDirective, CoarGridBuilder } from '@cocoar/data-grid';`;

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

  // Sample employee data (richer types for factory demos)
  readonly employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000, joinDate: new Date('2020-03-15'), isActive: true },
    { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 72000, joinDate: new Date('2019-07-01'), isActive: true },
    { id: 3, name: 'Charlie Brown', department: 'Engineering', salary: 110000, joinDate: new Date('2018-01-20'), isActive: false },
    { id: 4, name: 'Diana Prince', department: 'HR', salary: 85000, joinDate: new Date('2021-06-10'), isActive: true },
    { id: 5, name: 'Eve Wilson', department: 'Engineering', salary: 102000, joinDate: new Date('2022-02-28'), isActive: true },
    { id: 6, name: 'Frank Miller', department: 'Sales', salary: 68000, joinDate: new Date('2023-09-05'), isActive: true },
    { id: 7, name: 'Grace Lee', department: 'Marketing', salary: 78000, joinDate: new Date('2017-11-12'), isActive: false },
    { id: 8, name: 'Henry Chen', department: 'Engineering', salary: 120000, joinDate: new Date('2016-04-22'), isActive: true },
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
  readonly selectedUser = signal<User | null>(null);

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
      this.selectedUser.set(event.data ?? null);
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

  // ============================================================
  // Column Factory Types Example
  // ============================================================
  readonly factoryGrid = CoarGridBuilder.create<Employee>()
    .columns([
      (col) => col.field('name').header('Name').flex(1).sortable(),
      (col) => col.field('department').header('Department').width(130).sortable(),
      (col) => col.date('joinDate', 'long').header('Join Date').width(180).sortable(),
      (col) => col.number('salary', 0).header('Salary (#)').width(120).sortable(),
      (col) => col.currency('salary', 'USD').header('Salary ($)').width(140).sortable(),
      (col) => col.boolean('isActive', { trueValue: 'Active', falseValue: 'Inactive' }).header('Status').width(100).sortable(),
    ])
    .rowData(this.employees)
    .rowId((params) => String(params.data?.id));

  readonly factoryCode = `// Use column factory methods for typed columns
readonly gridBuilder = CoarGridBuilder.create<Employee>()
  .columns([
    col => col.field('name').header('Name').flex(1).sortable(),
    col => col.field('department').header('Department').width(130).sortable(),
    col => col.date('joinDate', 'long').header('Join Date').width(180).sortable(),
    col => col.number('salary', 0).header('Salary (#)').width(120).sortable(),
    col => col.currency('salary', 'USD').header('Salary ($)').width(140).sortable(),
    col => col.boolean('isActive', { trueValue: 'Active', falseValue: 'Inactive' })
      .header('Status').width(100).sortable(),
  ])
  .rowData(employees)
  .rowId(params => String(params.data?.id));`;

  // ============================================================
  // Sorting & Default Sort Example
  // ============================================================
  readonly sortingGrid = CoarGridBuilder.create<Employee>()
    .columns([
      (col) => col.field('name').header('Name').flex(1).sortable()
        .comparator((a, b) => {
          const lastA = (a as string).split(' ').pop() ?? '';
          const lastB = (b as string).split(' ').pop() ?? '';
          return lastA.localeCompare(lastB);
        }),
      (col) => col.field('department').header('Department').width(130).sortable()
        .quickFilter(true),
      (col) => col.currency('salary', 'USD').header('Salary').width(140).sortable(),
      (col) => col.date('joinDate', 'short').header('Joined').width(130).sortable(),
    ])
    .rowData(this.employees)
    .rowId((params) => String(params.data?.id))
    .defaultSort('salary', 'desc');

  readonly sortingCode = `// Pre-sorted grid with custom name comparator
readonly gridBuilder = CoarGridBuilder.create<Employee>()
  .columns([
    col => col.field('name').header('Name').flex(1).sortable()
      .comparator((a, b) => {
        // Sort by last name
        const lastA = a.split(' ').pop() ?? '';
        const lastB = b.split(' ').pop() ?? '';
        return lastA.localeCompare(lastB);
      }),
    col => col.field('department').header('Department').width(130).sortable()
      .quickFilter(true),
    col => col.currency('salary', 'USD').header('Salary').width(140).sortable(),
    col => col.date('joinDate', 'short').header('Joined').width(130).sortable(),
  ])
  .rowData(employees)
  .rowId(params => String(params.data?.id))
  .defaultSort('salary', 'desc');`;

  // ============================================================
  // Editing Example
  // ============================================================
  readonly editingGrid = CoarGridBuilder.create<Employee>()
    .columns([
      (col) => col.field('name').header('Name').flex(1).option('editable', true),
      (col) => col.field('department').header('Department').width(150).option('editable', true),
      (col) => col.number('salary', 0).header('Salary').width(120).option('editable', true),
      (col) => col.boolean('isActive', { trueValue: 'Active', falseValue: 'Inactive' }).header('Status').width(100),
    ])
    .rowData(this.employees)
    .rowId((params) => String(params.data?.id))
    .fullRowEdit()
    .stopEditingWhenCellsLoseFocus();

  readonly editingCode = `// Enable full-row editing
readonly gridBuilder = CoarGridBuilder.create<Employee>()
  .columns([
    col => col.field('name').header('Name').flex(1).option('editable', true),
    col => col.field('department').header('Department').width(150)
      .option('editable', true),
    col => col.number('salary', 0).header('Salary').width(120)
      .option('editable', true),
    col => col.boolean('isActive').header('Status').width(100),
  ])
  .rowData(employees)
  .rowId(params => String(params.data?.id))
  .fullRowEdit()
  .stopEditingWhenCellsLoseFocus();`;

  // ============================================================
  // Cell Renderer Columns Example
  // ============================================================
  readonly tasks: ProjectTask[] = [
    { id: 1, title: 'Design landing page', status: 'Active', priority: 'High', icon: 'pencil', createdAt: new Date('2025-11-01') },
    { id: 2, title: 'Fix login bug', status: 'Completed', priority: 'Critical', icon: 'bug', createdAt: new Date('2025-10-15') },
    { id: 3, title: 'Write API docs', status: 'Active', priority: 'Medium', icon: 'file-text', createdAt: new Date('2025-12-03') },
    { id: 4, title: 'Deploy to staging', status: 'Blocked', priority: 'High', icon: 'cloud-upload', createdAt: new Date('2026-01-10') },
    { id: 5, title: 'Review pull request', status: 'Active', priority: 'Low', icon: 'git-pull-request', createdAt: new Date('2026-01-22') },
    { id: 6, title: 'Update dependencies', status: 'Completed', priority: 'Medium', icon: 'package', createdAt: new Date('2025-09-28') },
  ];

  readonly cellRendererGrid = CoarGridBuilder.create<ProjectTask>()
    .columns([
      (col) => col.field('title').header('Task').flex(1).sortable(),
      (col) => col.tag('status', {
        variantMap: { Active: 'success', Completed: 'info', Blocked: 'error' },
      }).header('Status').width(130),
      (col) => col.tag('priority', {
        variantMap: { Critical: 'error', High: 'warning', Medium: 'neutral', Low: 'accent' },
        size: 's',
      }).header('Priority').width(130),
      (col) => col.icon('icon', { size: 's' }).header('Type').fixedWidth(70),
      (col) => col.localDate('createdAt').header('Created').width(150).sortable(),
    ])
    .rowData(this.tasks)
    .rowId((params) => String(params.data?.id));

  readonly cellRendererCode = `// Cell renderer columns: tag, icon, localDate
readonly gridBuilder = CoarGridBuilder.create<ProjectTask>()
  .columns([
    col => col.field('title').header('Task').flex(1).sortable(),
    col => col.tag('status', {
      variantMap: { Active: 'success', Completed: 'info', Blocked: 'error' },
    }).header('Status').width(130),
    col => col.tag('priority', {
      variantMap: { Critical: 'error', High: 'warning', Medium: 'neutral', Low: 'accent' },
      size: 's',
    }).header('Priority').width(130),
    col => col.icon('icon', { size: 's' }).header('Type').fixedWidth(70),
    col => col.localDate('createdAt').header('Created').width(150).sortable(),
  ])
  .rowData(tasks)
  .rowId(params => String(params.data?.id));`;

  // ============================================================
  // Context Menu & Viewport Events Example
  // ============================================================
  readonly lastEvent = signal('');
  readonly contextMenuTarget = signal<User | null>(null);

  private readonly contextMenuTemplate = viewChild.required<TemplateRef<void>>('gridContextMenu');
  private readonly overlay = createOverlayBuilder();
  private contextMenuRef: OverlayRef | null = null;

  private openContextMenu(x: number, y: number): void {
    this.contextMenuRef?.close();
    this.contextMenuRef = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x, y })
      .fromTemplate(this.contextMenuTemplate())
      .open(undefined);
  }

  handleContextAction(action: string): void {
    const target = this.contextMenuTarget();
    this.lastEvent.set(`Action "${action}" on ${target ? target.name : 'viewport'}`);
    this.contextMenuRef?.close();
  }

  readonly eventsGrid = CoarGridBuilder.create<User>()
    .columns([
      (col) => col.field('name').header('Name').flex(1),
      (col) => col.field('email').header('Email').flex(1),
      (col) => col.field('role').header('Role').width(100),
    ])
    .rowData(this.users)
    .rowId((params) => String(params.data?.id))
    .onCellContextMenu((event) => {
      const mouseEvent = event.event as MouseEvent | undefined;
      if (!mouseEvent) return;
      mouseEvent.preventDefault();
      this.contextMenuTarget.set(event.data ?? null);
      this.lastEvent.set(`Right-clicked "${event.data?.name}" — ${event.colDef.headerName}`);
      this.openContextMenu(mouseEvent.clientX, mouseEvent.clientY);
    })
    .onViewportClick(() => {
      this.lastEvent.set('Viewport click (empty area)');
    })
    .onViewportContextMenu(($event) => {
      this.contextMenuTarget.set(null);
      this.lastEvent.set('Viewport context menu (empty area)');
      this.openContextMenu($event.clientX, $event.clientY);
    });

  readonly eventsCode = `// Open a context menu on right-click
private readonly contextMenuTemplate = viewChild.required<TemplateRef<void>>('gridContextMenu');
private readonly overlay = createOverlayBuilder();
private contextMenuRef: OverlayRef | null = null;

readonly gridBuilder = CoarGridBuilder.create<User>()
  .columns([...])
  .rowData(users)
  .onCellContextMenu(event => {
    const mouseEvent = event.event as MouseEvent;
    mouseEvent.preventDefault();
    this.contextMenuRef?.close();
    this.contextMenuRef = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x: mouseEvent.clientX, y: mouseEvent.clientY })
      .fromTemplate(this.contextMenuTemplate())
      .open(undefined);
  })
  .onViewportContextMenu(($event) => {
    this.contextMenuRef?.close();
    this.contextMenuRef = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x: $event.clientX, y: $event.clientY })
      .fromTemplate(this.contextMenuTemplate())
      .open(undefined);
  });`;
}
