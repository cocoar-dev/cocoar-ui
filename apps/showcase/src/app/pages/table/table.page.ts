import { Component } from '@angular/core';

import {
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarTableComponent
],
  templateUrl: './table.page.html',
  styleUrl: './table.page.css',
})
export class TablePage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/CoarTableComponent/overview.md';
  protected readonly apiPath = '/docs/libs/ui-components/CoarTableComponent/api.md';

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
}
