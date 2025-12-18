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
  @ViewChild('submenuTemplate') submenuTemplate!: TemplateRef<unknown>;
  @ViewChild('subSubmenuTemplate') subSubmenuTemplate!: TemplateRef<unknown>;

  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  private contextMenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  private submenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  private submenuCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private subSubmenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  private subSubmenuCloseTimer: ReturnType<typeof setTimeout> | null = null;

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

    // Close submenu when context menu closes
    this.contextMenuRef.afterClosed$.subscribe(() => {
      this.contextMenuRef = null;
      this.submenuRef?.close();
      this.submenuRef = null;
    });
  }

  openShareSubmenu(event: Event): void {
    // Cancel any pending close timer
    if (this.submenuCloseTimer) {
      clearTimeout(this.submenuCloseTimer);
      this.submenuCloseTimer = null;
    }

    // If submenu already exists, don't recreate it
    if (this.submenuRef) {
      return;
    }

    // Open submenu as child of context menu
    if (this.contextMenuRef) {
      // Get the element that triggered the hover
      const shareMenuItem = event.target as HTMLElement;

      if (shareMenuItem) {
        const spec = Overlay.define<void>((b) => {
          b.content((c) => c.fromTemplate(this.submenuTemplate));
          b.anchor({ kind: 'element', element: shareMenuItem });
          b.position({ placement: 'right-start', offset: -4, flip: true });
        }, coarMenuPreset);

        this.submenuRef = this.overlayService.openChild(this.contextMenuRef, spec, undefined);
      }
    }
  }

  handleAction(_action: string): void {
    // Action handler - in real app would perform actual action
    this.contextMenuRef?.close();
  }

  onShareMenuLeave(): void {
    // Start timer to close submenu after delay
    this.submenuCloseTimer = setTimeout(() => {
      this.submenuRef?.close();
      this.submenuRef = null;
      this.submenuCloseTimer = null;
    }, 300); // 300ms delay before closing
  }

  onSubmenuEnter(): void {
    // Cancel close timer when mouse enters submenu
    if (this.submenuCloseTimer) {
      clearTimeout(this.submenuCloseTimer);
      this.submenuCloseTimer = null;
    }
  }

  onSubmenuLeave(): void {
    // Start timer to close submenu after delay (allows moving to sub-submenu)
    this.submenuCloseTimer = setTimeout(() => {
      this.submenuRef?.close();
      this.submenuRef = null;
      this.submenuCloseTimer = null;
      // Also close sub-submenu
      this.subSubmenuRef?.close();
      this.subSubmenuRef = null;
    }, 300);
  }

  openSubSubmenu(event: Event): void {
    // Cancel any pending close timer
    if (this.subSubmenuCloseTimer) {
      clearTimeout(this.subSubmenuCloseTimer);
      this.subSubmenuCloseTimer = null;
    }

    // If sub-submenu already exists, don't recreate it
    if (this.subSubmenuRef) {
      return;
    }

    // Open sub-submenu as child of submenu
    if (this.submenuRef) {
      const linkMenuItem = event.target as HTMLElement;

      if (linkMenuItem) {
        const spec = Overlay.define<void>((b) => {
          b.content((c) => c.fromTemplate(this.subSubmenuTemplate));
          b.anchor({ kind: 'element', element: linkMenuItem });
          b.position({ placement: 'right-start', offset: 4, flip: true });
        }, coarMenuPreset);

        this.subSubmenuRef = this.overlayService.openChild(this.submenuRef, spec, undefined);
      }
    }
  }

  onCopyLinkLeave(): void {
    // Start timer to close sub-submenu after delay
    this.subSubmenuCloseTimer = setTimeout(() => {
      this.subSubmenuRef?.close();
      this.subSubmenuRef = null;
      this.subSubmenuCloseTimer = null;
    }, 300);
  }

  onSubSubmenuEnter(): void {
    // Cancel close timer when mouse enters sub-submenu
    if (this.subSubmenuCloseTimer) {
      clearTimeout(this.subSubmenuCloseTimer);
      this.subSubmenuCloseTimer = null;
    }
    // Also cancel submenu close timer
    if (this.submenuCloseTimer) {
      clearTimeout(this.submenuCloseTimer);
      this.submenuCloseTimer = null;
    }
  }

  onSubSubmenuLeave(): void {
    // Close sub-submenu immediately when mouse leaves it
    this.subSubmenuRef?.close();
    this.subSubmenuRef = null;
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
  <coar-submenu-item label="Export" icon="download">
    <coar-menu-item icon="file" (itemClick)="handleAction('exportPdf')">Export as PDF</coar-menu-item>
    <coar-menu-item icon="file" (itemClick)="handleAction('exportWord')">Export as Word</coar-menu-item>
    <coar-menu-item icon="file" (itemClick)="handleAction('exportExcel')">Export as Excel</coar-menu-item>
  </coar-submenu-item>
  <coar-submenu-item label="Share" icon="users">
    <coar-menu-item icon="chat" (itemClick)="handleAction('shareEmail')">Share via Email</coar-menu-item>
    <coar-menu-item icon="link" (itemClick)="handleAction('shareLink')">Copy Link</coar-menu-item>
    <coar-menu-item icon="slack" (itemClick)="handleAction('shareSlack')">Share to Slack</coar-menu-item>
  </coar-submenu-item>
  <coar-submenu-item label="Settings" icon="settings">
    <coar-menu-item icon="palette" (itemClick)="handleAction('theme')">Change Theme</coar-menu-item>
    <coar-menu-item icon="globe" (itemClick)="handleAction('language')">Language</coar-menu-item>
    <coar-menu-item icon="bell" (itemClick)="handleAction('notifications')">Notifications</coar-menu-item>
  </coar-submenu-item>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item icon="question" (itemClick)="handleMenuItemClick('help')">Help</coar-menu-item>
</coar-menu>`,

    contextMenu: `onContextMenu(event: MouseEvent): void {
  event.preventDefault();

  // Open context menu at click position
  const spec = Overlay.define((b) => {
    b.content((c) => c.fromTemplate(this.contextMenuTemplate));
    b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
    b.position({ placement: 'bottom-start', offset: 4 });
  }, coarMenuPreset);

  this.contextMenuRef = this.overlayService.open(spec, {});
}

// Open flyout submenu on hover
openShareSubmenu(event: Event): void {
  const target = event.target as HTMLElement;

  // Open submenu as child - maintains parent-child hierarchy
  const spec = Overlay.define((b) => {
    b.content((c) => c.fromTemplate(this.submenuTemplate));
    b.anchor({ kind: 'element', element: target });
    b.position({ placement: 'right-start', offset: 4 });
  }, coarMenuPreset);

  this.submenuRef = this.overlayService.openChild(
    this.contextMenuRef!,
    spec,
    {}
  );
}`,
  };
}
