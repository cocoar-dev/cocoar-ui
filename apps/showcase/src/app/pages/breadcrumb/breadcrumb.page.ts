import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarBreadcrumbComponent,
  CoarBreadcrumbItemComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-breadcrumb-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarBreadcrumbComponent,
    CoarBreadcrumbItemComponent,
  ],
  templateUrl: './breadcrumb.page.html',
  styleUrl: './breadcrumb.page.css',
})
export class BreadcrumbPage {
  importCode = `import { CoarBreadcrumbComponent, CoarBreadcrumbItemComponent } from '@cocoar/ui/components';`;

  basicExample = `<coar-breadcrumb>
  <coar-breadcrumb-item><a href="/home">Home</a></coar-breadcrumb-item>
  <coar-breadcrumb-item><a href="/users">Users</a></coar-breadcrumb-item>
  <coar-breadcrumb-item [active]="true">John Doe</coar-breadcrumb-item>
</coar-breadcrumb>`;

  customSeparatorExample = `<coar-breadcrumb separator=">">
  <coar-breadcrumb-item><a href="/">Dashboard</a></coar-breadcrumb-item>
  <coar-breadcrumb-item><a href="/settings">Settings</a></coar-breadcrumb-item>
  <coar-breadcrumb-item [active]="true">Profile</coar-breadcrumb-item>
</coar-breadcrumb>`;

  singleItemExample = `<coar-breadcrumb>
  <coar-breadcrumb-item [active]="true">Home</coar-breadcrumb-item>
</coar-breadcrumb>`;
}
