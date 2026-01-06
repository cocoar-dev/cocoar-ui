import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { defineScenario } from '@cocoar/scenar-abstractions';
import {
  CoarMenuComponent,
  CoarMenuItemComponent,
  CoarSubmenuItemComponent,
  CoarMenuDividerComponent,
} from '@cocoar/ui-menu';
import { coarMenuPreset, createOverlayBuilder, type OverlayRef } from '@cocoar/ui-overlay';
import type { CoarMenuItemClickEvent } from '@cocoar/ui-menu';

/**
 * Scenario to test nested menu close behavior.
 *
 * Replicates the issue where clicking an item in a nested submenu
 * closes the root context menu but leaves the submenu flyout visible.
 *
 * Steps to reproduce:
 * 1. Right-click on the demo area to open context menu
 * 2. Hover over "Status" to open submenu flyout
 * 3. Click any item in the submenu (e.g., "New", "In Progress")
 * 4. Expected: Both root menu AND submenu close
 * 5. Actual (bug): Root menu closes, submenu stays visible
 */
@Component({
  standalone: true,
  selector: 'scenar-nested-menu-close-demo',
  imports: [
    CommonModule,
    CoarMenuComponent,
    CoarMenuItemComponent,
    CoarSubmenuItemComponent,
    CoarMenuDividerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h2>Nested Menu Close Test</h2>
      <p>Right-click on the area below to open a context menu with nested submenus.</p>
      <p>Then hover over "Status" or "Priority" and click an item in the submenu.</p>
      <p><strong>Expected:</strong> All menus should close.</p>

      <div
        class="context-demo-area"
        data-testid="context-demo-area"
        (contextmenu)="onContextMenu($event)"
        style="
          width: 100%;
          min-height: 400px;
          border: 2px dashed var(--coar-color-border, #ccc);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--coar-color-surface, #f5f5f5);
          cursor: context-menu;
        "
      >
        <div style="text-align: center; color: var(--coar-color-text-secondary, #666);">
          <p style="font-size: 18px; margin: 0;">Right-click here</p>
          <p style="font-size: 14px; margin: 8px 0 0 0;">to open context menu</p>
        </div>
      </div>

      <div
        class="status-display"
        style="margin-top: 20px; padding: 16px; background: var(--coar-color-surface, #f9f9f9); border-radius: 4px;"
      >
        <h3>Action Log:</h3>
        <ul data-testid="action-log">
          @for (action of actions; track $index) {
            <li>{{ action }}</li>
          }
          @if (actions.length === 0) {
            <li style="color: #999;">No actions yet</li>
          }
        </ul>
      </div>
    </div>

    <!-- Context Menu Template -->
    <ng-template #contextMenuTemplate let-itemName="itemName">
      <coar-menu>
        <coar-menu-item icon="plus" (itemClick)="handleAction('Create', itemName)">
          Create
        </coar-menu-item>

        <coar-menu-item icon="copy" (itemClick)="handleAction('Duplicate', itemName)">
          Duplicate
        </coar-menu-item>

        <coar-menu-divider />

        <!-- Status submenu (inline template - has access to itemName from parent) -->
        <coar-submenu-item label="Status" icon="settings">
          <ng-template>
            <coar-menu>
              <coar-menu-item (itemClick)="handleAction('Status: None', itemName)">
                None
              </coar-menu-item>
              <coar-menu-item (itemClick)="handleAction('Status: New', itemName)">
                New
              </coar-menu-item>
              <coar-menu-item (itemClick)="handleAction('Status: In Progress', itemName)">
                In Progress
              </coar-menu-item>
              <coar-menu-item (itemClick)="handleAction('Status: Done', itemName)">
                Done
              </coar-menu-item>
            </coar-menu>
          </ng-template>
        </coar-submenu-item>

        <!-- Priority submenu (external template with explicit data passing) -->
        <coar-submenu-item
          label="Priority"
          icon="important"
          [submenuTemplate]="prioritySubmenuTemplate"
          [submenuData]="{ itemName: itemName, source: 'explicit-data' }"
        >
        </coar-submenu-item>

        <!-- Nested submenu for more complex case -->
        <coar-submenu-item label="Advanced" icon="settings">
          <ng-template>
            <coar-menu>
              <coar-menu-item (itemClick)="handleAction('Advanced: Option 1', itemName)">
                Option 1
              </coar-menu-item>

              <coar-submenu-item label="More Options" icon="chevron-right">
                <ng-template>
                  <coar-menu>
                    <coar-menu-item (itemClick)="handleAction('Advanced: More: A', itemName)">
                      Sub-option A
                    </coar-menu-item>
                    <coar-menu-item (itemClick)="handleAction('Advanced: More: B', itemName)">
                      Sub-option B
                    </coar-menu-item>
                    <coar-menu-item (itemClick)="handleAction('Advanced: More: C', itemName)">
                      Sub-option C
                    </coar-menu-item>
                  </coar-menu>
                </ng-template>
              </coar-submenu-item>

              <coar-menu-item (itemClick)="handleAction('Advanced: Option 2', itemName)">
                Option 2
              </coar-menu-item>
            </coar-menu>
          </ng-template>
        </coar-submenu-item>

        <coar-menu-divider />

        <coar-menu-item icon="box-archive" (itemClick)="handleAction('Archive', itemName)">
          Archive
        </coar-menu-item>

        <coar-menu-item icon="trash" (itemClick)="handleAction('Delete', itemName)">
          Delete
        </coar-menu-item>
      </coar-menu>
    </ng-template>

    <!-- External submenu template - receives explicit data via [submenuData] -->
    <ng-template #prioritySubmenuTemplate let-itemName="itemName" let-source="source">
      <coar-menu>
        <coar-menu-item (itemClick)="handleAction('Priority: Low', itemName)">
          Low ({{ source }})
        </coar-menu-item>
        <coar-menu-item (itemClick)="handleAction('Priority: Medium', itemName)">
          Medium ({{ source }})
        </coar-menu-item>
        <coar-menu-item (itemClick)="handleAction('Priority: High', itemName)">
          High ({{ source }})
        </coar-menu-item>
        <coar-menu-item (itemClick)="handleAction('Priority: Critical', itemName)">
          Critical ({{ source }})
        </coar-menu-item>
      </coar-menu>
    </ng-template>
  `,
  styles: [
    `
      .demo-container {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      h2 {
        margin-top: 0;
        color: var(--coar-color-text, #000);
      }

      p {
        color: var(--coar-color-text-secondary, #666);
        line-height: 1.5;
      }
    `,
  ],
})
export class NestedMenuCloseComponent {
  private readonly overlay = createOverlayBuilder();

  @ViewChild('contextMenuTemplate', { read: TemplateRef })
  contextMenuTemplate!: TemplateRef<{ itemName: string }>;

  private contextMenu: OverlayRef | null = null;

  protected actions: string[] = [];

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Close existing menu if open
    this.contextMenu?.close();

    const opener = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
      .fromTemplate(this.contextMenuTemplate);

    this.contextMenu = opener.open({ itemName: 'Test Item #42' });

    this.addAction('Context menu opened for: Test Item #42');
  }

  handleAction(action: string, itemName?: string, _event?: CoarMenuItemClickEvent): void {
    this.addAction(`Action: ${action} (${itemName || 'no item'})`);
  }

  private addAction(action: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.actions = [`[${timestamp}] ${action}`, ...this.actions].slice(0, 10);
  }
}

export const nestedMenuClose = defineScenario<NestedMenuCloseComponent>({
  id: 'menu/nested-close-bug',
  title: 'Nested Menu Close Bug Reproduction',
  description: 'Test case for submenu flyouts staying open after clicking an item',
});
