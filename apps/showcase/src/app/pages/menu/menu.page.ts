import {
  Component,
  ViewChild,
  TemplateRef,
  inject,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';

import { coarMenuPreset, createOverlayBuilder, type OverlayRef } from '@cocoar/ui-overlay';
import {
  CoarCodeBlockComponent,
  CoarNoteComponent,
  CoarCardComponent,
} from '@cocoar/ui-components';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarMenuDividerComponent,
  CoarMenuHeadingComponent,
  CoarSubmenuItemComponent,
  CoarSubExpandComponent,
} from '@cocoar/ui-menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CoarCodeBlockComponent,
    CoarNoteComponent,
    CoarCardComponent,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarMenuDividerComponent,
    CoarMenuHeadingComponent,
    CoarSubmenuItemComponent,
    CoarSubExpandComponent,
  ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.css',
})
export class MenuPage {
  private readonly overlay = createOverlayBuilder();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('contextMenuTemplate') contextMenuTemplate!: TemplateRef<void>;

  private contextMenuRef: OverlayRef | null = null;

  protected readonly aimDebug = {
    enabled: false,
    shouldDelay: false,
    direction: 'right' as 'right' | 'left',
    previous: null as { x: number; y: number } | null,
    current: null as { x: number; y: number } | null,
    submenuRect: null as { left: number; top: number; right: number; bottom: number } | null,
    trianglePoints: '' as string,
    eventCount: 0,
    lastEventAt: 0,
  };

  constructor() {
    if (typeof window === 'undefined') return;

    const abort = new AbortController();
    this.destroyRef.onDestroy(() => abort.abort());

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    this.destroyRef.onDestroy(() => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    });

    const onAim = (event: Event) => {
      const e = event as CustomEvent<{
        shouldDelay: boolean;
        direction: 'right' | 'left';
        previous: { x: number; y: number } | null;
        current: { x: number; y: number } | null;
        submenuRect: { left: number; top: number; right: number; bottom: number } | null;
      }>;

      const detail = e.detail;
      if (!detail) return;

      this.aimDebug.enabled = true;
      this.aimDebug.eventCount++;
      this.aimDebug.lastEventAt = Date.now();
      this.aimDebug.shouldDelay = !!detail.shouldDelay;
      this.aimDebug.direction = detail.direction ?? 'right';
      this.aimDebug.previous = detail.previous;
      this.aimDebug.current = detail.current;
      this.aimDebug.submenuRect = detail.submenuRect;

      this.aimDebug.trianglePoints = this.computeTrianglePoints(
        detail.previous,
        detail.submenuRect,
        this.aimDebug.direction
      );

      // Render immediately so the triangle matches the current pointer move.
      this.cdr.detectChanges();

      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(() => {
        this.aimDebug.enabled = false;
        this.aimDebug.shouldDelay = false;
        this.aimDebug.previous = null;
        this.aimDebug.current = null;
        this.aimDebug.submenuRect = null;
        this.aimDebug.trianglePoints = '';
        this.cdr.detectChanges();
      }, 1500);
    };

    window.addEventListener('coar-menu-aim', onAim, { signal: abort.signal as AbortSignal });
  }

  private computeTrianglePoints(
    previous: { x: number; y: number } | null,
    submenuRect: { left: number; top: number; right: number; bottom: number } | null,
    direction: 'right' | 'left'
  ): string {
    if (!previous || !submenuRect) return '';

    // Keep in sync with the heuristic: wedge from previous point to submenu panel near edge.
    const edgeX = direction === 'right' ? submenuRect.left : submenuRect.right;
    const padY = 8;
    const a = { x: edgeX, y: submenuRect.top - padY };
    const b = { x: edgeX, y: submenuRect.bottom + padY };
    return `${previous.x},${previous.y} ${a.x},${a.y} ${b.x},${b.y}`;
  }

  handleMenuItemClick(_action: string) {
    // Menu item click handler
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    // Close existing context menu if open
    this.contextMenuRef?.close();

    const opener = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
      .fromTemplate(this.contextMenuTemplate);

    this.contextMenuRef = opener.open(undefined);
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

    withHeadings: `<coar-menu>
  <coar-menu-heading>Foundations</coar-menu-heading>
  <coar-menu-item icon="type" (itemClick)="handleMenuItemClick('typography')">Typography</coar-menu-item>
  <coar-menu-item icon="palette" (itemClick)="handleMenuItemClick('colors')">Colors</coar-menu-item>
  <coar-menu-item icon="grid" (itemClick)="handleMenuItemClick('spacing')">Spacing</coar-menu-item>

  <coar-menu-heading>Form Controls</coar-menu-heading>
  <coar-menu-item icon="input" (itemClick)="handleMenuItemClick('textInput')">Text Input</coar-menu-item>
  <coar-menu-item icon="dropdown" (itemClick)="handleMenuItemClick('select')">Select</coar-menu-item>
  <coar-menu-item icon="checkbox" (itemClick)="handleMenuItemClick('checkbox')">Checkbox</coar-menu-item>
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
  <coar-sub-flyout label="Export" icon="download">
    <ng-template>
      <coar-menu>
        <coar-menu-item icon="file" (itemClick)="handleAction('exportPdf')">Export as PDF</coar-menu-item>
        <coar-menu-item icon="file" (itemClick)="handleAction('exportWord')">Export as Word</coar-menu-item>
        <coar-menu-item icon="file" (itemClick)="handleAction('exportExcel')">Export as Excel</coar-menu-item>
      </coar-menu>
    </ng-template>
  </coar-sub-flyout>

  <coar-sub-flyout label="Share" icon="users">
    <ng-template>
      <coar-menu>
        <coar-menu-item icon="chat" (itemClick)="handleAction('shareEmail')">Share via Email</coar-menu-item>
        <coar-menu-item icon="link" (itemClick)="handleAction('shareLink')">Copy Link</coar-menu-item>
        <coar-menu-item icon="slack" (itemClick)="handleAction('shareSlack')">Share to Slack</coar-menu-item>
      </coar-menu>
    </ng-template>
  </coar-sub-flyout>

  <coar-sub-flyout label="Settings" icon="settings">
    <ng-template>
      <coar-menu>
        <coar-menu-item icon="palette" (itemClick)="handleAction('theme')">Change Theme</coar-menu-item>
        <coar-menu-item icon="globe" (itemClick)="handleAction('language')">Language</coar-menu-item>
        <coar-menu-item icon="bell" (itemClick)="handleAction('notifications')">Notifications</coar-menu-item>
      </coar-menu>
    </ng-template>
  </coar-sub-flyout>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item icon="question" (itemClick)="handleMenuItemClick('help')">Help</coar-menu-item>
</coar-menu>
`,

    accordion: `<coar-menu>
  <coar-sub-expand label="Filters" icon="settings">
    <ng-template>
      <coar-menu-item icon="plus" (itemClick)="handleAction('addFilter')">Add Filter</coar-menu-item>
      <coar-menu-item icon="copy" (itemClick)="handleAction('duplicateFilter')">Duplicate Filter</coar-menu-item>
      <coar-menu-item icon="trash" (itemClick)="handleAction('clearFilters')">Clear Filters</coar-menu-item>

      <coar-sub-expand label="Date Range" icon="date">
        <ng-template>
          <coar-menu-item icon="calendar" (itemClick)="handleAction('dateToday')">Today</coar-menu-item>
          <coar-menu-item icon="calendar" (itemClick)="handleAction('dateLast7')">Last 7 days</coar-menu-item>
          <coar-menu-item icon="calendar" (itemClick)="handleAction('dateLast30')">Last 30 days</coar-menu-item>
        </ng-template>
      </coar-sub-expand>

      <coar-sub-flyout label="Advanced" icon="settings">
        <ng-template>
          <coar-menu>
            <coar-menu-item icon="link" (itemClick)="handleAction('manageSavedFilters')">Manage saved filters</coar-menu-item>
            <coar-menu-item icon="copy" (itemClick)="handleAction('copyFilters')">Copy filters</coar-menu-item>
            <coar-menu-item icon="trash" (itemClick)="handleAction('resetFilters')">Reset to defaults</coar-menu-item>

            <coar-sub-expand label="Quick Presets" icon="plus">
              <ng-template>
                <coar-menu-item icon="file" (itemClick)="handleAction('presetOpenItems')">Open items</coar-menu-item>
                <coar-menu-item icon="file" (itemClick)="handleAction('presetOverdue')">Overdue</coar-menu-item>
                <coar-menu-item icon="file" (itemClick)="handleAction('presetAssignedToMe')">Assigned to me</coar-menu-item>
              </ng-template>
            </coar-sub-expand>
          </coar-menu>
        </ng-template>
      </coar-sub-flyout>
    </ng-template>
  </coar-sub-expand>

  <coar-sub-expand label="View" icon="file">
    <ng-template>
      <coar-menu-item icon="plus" (itemClick)="handleAction('saveView')">Save current view</coar-menu-item>
      <coar-menu-item icon="copy" (itemClick)="handleAction('duplicateView')">Duplicate view</coar-menu-item>

      <coar-sub-flyout label="Load View" icon="download">
        <ng-template>
          <coar-menu>
            <coar-menu-item icon="file" (itemClick)="handleAction('loadViewDefault')">Default</coar-menu-item>
            <coar-menu-item icon="file" (itemClick)="handleAction('loadViewCompact')">Compact</coar-menu-item>
            <coar-menu-item icon="file" (itemClick)="handleAction('loadViewDetailed')">Detailed</coar-menu-item>
          </coar-menu>
        </ng-template>
      </coar-sub-flyout>
    </ng-template>
  </coar-sub-expand>

  <coar-menu-item icon="refresh" (itemClick)="handleAction('refresh')">Refresh</coar-menu-item>
</coar-menu>`,

    kitchenSink: `<coar-menu>
  <coar-menu-heading>Quick Actions</coar-menu-heading>
  <coar-menu-item icon="plus">New File</coar-menu-item>
  <coar-menu-item icon="folder">Open Folder...</coar-menu-item>

  <coar-menu-heading>Edit</coar-menu-heading>
  <coar-menu-item icon="minus">Cut</coar-menu-item>
  <coar-menu-item icon="copy">Copy</coar-menu-item>
  <coar-menu-item [disabled]="true" icon="clipboard">Paste</coar-menu-item>

  <coar-menu-divider></coar-menu-divider>

  <coar-sub-expand label="View Options" icon="settings">
    <ng-template>
      <coar-menu-item icon="checkbox">Show Line Numbers</coar-menu-item>

      <coar-sub-flyout label="Theme" icon="palette">
        <ng-template>
          <coar-menu>
            <coar-menu-heading>Light Themes</coar-menu-heading>
            <coar-menu-item icon="sun">Light Default</coar-menu-item>

            <coar-menu-heading>Dark Themes</coar-menu-heading>
            <coar-menu-item icon="moon">Dark Default</coar-menu-item>
          </coar-menu>
        </ng-template>
      </coar-sub-flyout>

      <coar-sub-expand label="Layout" icon="grid">
        <ng-template>
          <coar-menu-item icon="file">Single Column</coar-menu-item>
          <coar-menu-item icon="file">Split View</coar-menu-item>
        </ng-template>
      </coar-sub-expand>
    </ng-template>
  </coar-sub-expand>

  <coar-sub-flyout label="Share" icon="users">
    <ng-template>
      <coar-menu>
        <coar-menu-item icon="chat">Email</coar-menu-item>

        <coar-menu-divider></coar-menu-divider>

        <coar-sub-expand label="Copy Link" icon="copy">
          <ng-template>
            <coar-menu-item icon="link">Plain URL</coar-menu-item>
            <coar-menu-item icon="link">Markdown</coar-menu-item>
          </ng-template>
        </coar-sub-expand>
      </coar-menu>
    </ng-template>
  </coar-sub-flyout>

  <coar-menu-divider></coar-menu-divider>

  <coar-menu-item icon="trash">Delete</coar-menu-item>
</coar-menu>`,

    contextMenu: `onContextMenu(event: MouseEvent): void {
  event.preventDefault();

  const overlay = createOverlayBuilder()
    .withPreset(coarMenuPreset)
    .anchor({ kind: 'point', x: event.clientX, y: event.clientY });

  this.contextMenuRef = overlay.fromTemplate(this.contextMenuTemplate).open(undefined);
}

// In the template, use <coar-sub-flyout> (alias of <coar-submenu-item>) with an inline <ng-template> (or [submenuTemplate]) to define flyouts.
// Hover dismissal and multi-level behavior are handled by the overlay system (hoverTree).`,
  };
}
