import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarOverlayService, Overlay, coarMenuPreset } from '@cocoar/ui-overlay';
import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent,
  CoarSubmenuItemComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent,
    CoarSubmenuItemComponent,
  ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.css',
})
export class MenuPage {
  private readonly overlayService = inject(CoarOverlayService);

  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<unknown>;

  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  private contextMenuRef: ReturnType<typeof this.overlayService.open> | null = null;

  protected readonly docsPath = '/docs/components/menu/overview.md';
  protected readonly apiPath = '/docs/components/menu/api.md';

  handleMenuItemClick(_action: string) {
    // Menu item click handler
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // Close existing context menu if open
    this.contextMenuRef?.close();

    // Open context menu at mouse position
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.contextMenuTemplate));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom-start', offset: 4, flip: true });
    }, coarMenuPreset);

    this.contextMenuRef = this.overlayService.open(spec, undefined);
  }

  handleAction(_action: string): void {
    // Action handler - in real app would perform actual action
    this.contextMenuRef?.close();
  }

  // Code examples
  codeExamples = {
    basic: `<coar-menu>
  <coar-menu-item (itemClick)="handleMenuItemClick('new')">New File</coar-menu-item>
  <coar-menu-item (itemClick)="handleMenuItemClick('open')">Open...</coar-menu-item>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item (itemClick)="handleMenuItemClick('save')">Save</coar-menu-item>
  <coar-menu-item (itemClick)="handleMenuItemClick('saveAs')">Save As...</coar-menu-item>
</coar-menu>`,

    withIcons: `<coar-menu>
  <coar-menu-item icon="plus" (itemClick)="handleMenuItemClick('create')">Create New</coar-menu-item>
  <coar-menu-item icon="copy" (itemClick)="handleMenuItemClick('duplicate')">Duplicate</coar-menu-item>
  <coar-menu-item icon="clipboard" (itemClick)="handleMenuItemClick('copy')">Copy</coar-menu-item>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item icon="trash" (itemClick)="handleMenuItemClick('delete')">Delete</coar-menu-item>
</coar-menu>`,

    disabled: `<coar-menu>
  <coar-menu-item (itemClick)="handleMenuItemClick('cut')">Cut</coar-menu-item>
  <coar-menu-item (itemClick)="handleMenuItemClick('copy')">Copy</coar-menu-item>
  <coar-menu-item [disabled]="true" (itemClick)="handleMenuItemClick('paste')">Paste (disabled)</coar-menu-item>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item [disabled]="true" icon="trash" (itemClick)="handleMenuItemClick('delete')">Delete (disabled)</coar-menu-item>
</coar-menu>`,

    siblings: `<coar-menu>
  <coar-menu-item icon="file" (itemClick)="handleMenuItemClick('file')">File</coar-menu-item>
  <coar-submenu-item label="Export" icon="download" [submenuTemplate]="exportMenu" />
  <coar-submenu-item label="Share" icon="users" [submenuTemplate]="shareMenu" />
  <coar-submenu-item label="Settings" icon="settings" [submenuTemplate]="settingsMenu" />
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item icon="question" (itemClick)="handleMenuItemClick('help')">Help</coar-menu-item>
</coar-menu>

<ng-template #exportMenu>
  <coar-menu-item icon="file" (itemClick)="handleAction('exportPdf')">Export as PDF</coar-menu-item>
  <coar-menu-item icon="file" (itemClick)="handleAction('exportWord')">Export as Word</coar-menu-item>
  <coar-menu-item icon="file" (itemClick)="handleAction('exportExcel')">Export as Excel</coar-menu-item>
</ng-template>

<ng-template #shareMenu>
  <coar-menu-item icon="chat" (itemClick)="handleAction('shareEmail')">Share via Email</coar-menu-item>
  <coar-menu-item icon="link" (itemClick)="handleAction('shareLink')">Copy Link</coar-menu-item>
  <coar-menu-item icon="slack" (itemClick)="handleAction('shareSlack')">Share to Slack</coar-menu-item>
</ng-template>

<ng-template #settingsMenu>
  <coar-menu-item icon="palette" (itemClick)="handleAction('theme')">Change Theme</coar-menu-item>
  <coar-menu-item icon="globe" (itemClick)="handleAction('language')">Language</coar-menu-item>
  <coar-menu-item icon="bell" (itemClick)="handleAction('notifications')">Notifications</coar-menu-item>
</ng-template>`,

    contextMenu: `onContextMenu(event: MouseEvent): void {
  event.preventDefault();

  // Open context menu at click position
  const spec = Overlay.define((b) => {
    b.content((c) => c.fromTemplate(this.contextMenuTemplate));
    b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
    b.position({ placement: 'bottom-start', offset: 4 });
  }, coarMenuPreset);

  this.contextMenuRef = this.overlayService.open(spec, undefined);
}

// In the template, use <coar-submenu-item> with [submenuTemplate] to define flyouts.
// Hover dismissal and multi-level behavior are handled by the overlay system (hoverTree).`,
  };
}
