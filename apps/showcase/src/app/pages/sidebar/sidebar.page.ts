import { Component } from '@angular/core';

import {
  CoarCodeBlockComponent,
  CoarSidebarComponent,
  CoarButtonComponent,
  CoarCardComponent,
} from '@cocoar/ui/components';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent,
  CoarMenuHeadingComponent,
} from '@cocoar/ui/menu';

@Component({
  selector: 'app-sidebar-page',
  standalone: true,
  imports: [
    CoarCodeBlockComponent,
    CoarSidebarComponent,
    CoarButtonComponent,
    CoarCardComponent,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent,
    CoarMenuHeadingComponent,
  ],
  templateUrl: './sidebar.page.html',
  styleUrl: './sidebar.page.css',
})
export class SidebarPage {
  importCode = `import { CoarSidebarComponent } from '@cocoar/ui/components';
import { CoarMenuComponent, CoarMenuItemComponent } from '@cocoar/ui/menu';`;

  basicExample = `<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Projects</coar-menu-item>
    <coar-menu-item>Settings</coar-menu-item>
  </coar-menu>
</coar-sidebar>`;

  withHeaderExample = `<coar-sidebar>
  <div coar-sidebar-header>
    <h2>My App</h2>
  </div>

  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Projects</coar-menu-item>
    <coar-menu-item>Settings</coar-menu-item>
  </coar-menu>
</coar-sidebar>`;

  withFooterExample = `<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Projects</coar-menu-item>
    <coar-menu-item>Reports</coar-menu-item>
  </coar-menu>

  <div coar-sidebar-footer>
    <coar-button variant="ghost">Logout</coar-button>
  </div>
</coar-sidebar>`;

  fullExample = `<coar-sidebar>
  <div coar-sidebar-header>
    <div style="display: flex; align-items: center; gap: 12px;">
      <coar-icon name="logo" size="32"></coar-icon>
      <h2>Dashboard</h2>
    </div>
  </div>

  <coar-menu borderless>
    <coar-menu-heading>Main</coar-menu-heading>
    <coar-menu-item>Dashboard</coar-menu-item>
    <coar-menu-item>Projects</coar-menu-item>
    <coar-menu-item>Team</coar-menu-item>

    <coar-menu-divider></coar-menu-divider>

    <coar-menu-heading>Settings</coar-menu-heading>
    <coar-menu-item>Profile</coar-menu-item>
    <coar-menu-item>Preferences</coar-menu-item>
  </coar-menu>

  <div coar-sidebar-footer>
    <div style="padding: 8px;">
      <strong>John Doe</strong>
      <div style="font-size: 12px; color: #999;">john@example.com</div>
    </div>
  </div>
</coar-sidebar>`;

  positionExample = `<!-- Left sidebar (default) -->
<coar-sidebar>
  <coar-menu borderless>
    <coar-menu-item>Home</coar-menu-item>
  </coar-menu>
</coar-sidebar>

<!-- Right sidebar -->
<coar-sidebar position="right">
  <coar-menu borderless>
    <coar-menu-item>Help</coar-menu-item>
  </coar-menu>
</coar-sidebar>`;

  collapsedExample = `<coar-sidebar collapsed>
  <coar-menu borderless>
    <coar-menu-item>🏠</coar-menu-item>
    <coar-menu-item>📁</coar-menu-item>
    <coar-menu-item>⚙️</coar-menu-item>
  </coar-menu>
</coar-sidebar>`;

  customContentExample = `<coar-sidebar>
  <div coar-sidebar-header>
    <h3>Filters</h3>
  </div>

  <!-- Custom content instead of menu -->
  <div style="padding: 8px;">
    <label>
      <input type="checkbox"> Option 1
    </label>
    <label>
      <input type="checkbox"> Option 2
    </label>
    <label>
      <input type="checkbox"> Option 3
    </label>
  </div>

  <div coar-sidebar-footer>
    <coar-button variant="primary" size="s">Apply</coar-button>
  </div>
</coar-sidebar>`;
}
