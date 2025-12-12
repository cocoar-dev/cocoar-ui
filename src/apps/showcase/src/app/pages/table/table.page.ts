import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarTableComponent,
  ],
  templateUrl: './table.page.html',
  styleUrl: './table.page.css',
})
export class TablePage {
  activeTab = 'examples';

  // Sample data for demos
  sampleData = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ];

  // Code examples
  basicExample = `<coar-table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td>User</td>
    </tr>
  </tbody>
</coar-table>`;

  plainExample = `<coar-table variant="plain">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    @for (user of users; track user.email) {
      <tr>
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.status }}</td>
      </tr>
    }
  </tbody>
</coar-table>`;

  borderedExample = `<coar-table variant="bordered">
  ...
</coar-table>`;

  compactExample = `<coar-table [compact]="true">
  ...
</coar-table>`;

  apiTableExample = `<coar-table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>variant</code></td>
      <td><code class="type">'default' | 'plain' | 'bordered'</code></td>
      <td><code class="default">'default'</code></td>
      <td>Visual style of the table</td>
    </tr>
  </tbody>
</coar-table>`;

  // API properties
  tableProps = [
    {
      name: 'variant',
      type: "'default' | 'plain' | 'bordered'",
      required: false,
      default: "'default'",
      description:
        'Visual variant: default (zebra stripes), plain (no stripes), bordered (cell borders)',
    },
    {
      name: 'compact',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Whether to use compact padding for dense tables',
    },
    {
      name: 'hover',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Whether rows should highlight on hover',
    },
  ];

  cssClasses = [
    { name: '.type', description: 'Styles code as a type annotation (muted color)' },
    { name: '.default', description: 'Styles code as a default value (lighter color)' },
    { name: '.required-badge', description: 'Adds a warning-colored "Required" badge' },
    { name: '.text-right', description: 'Right-aligns cell content' },
    { name: '.text-center', description: 'Center-aligns cell content' },
    { name: '.nowrap', description: 'Prevents text wrapping in cell' },
  ];
}
