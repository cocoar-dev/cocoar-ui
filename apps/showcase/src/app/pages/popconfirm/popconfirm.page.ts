import { Component, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import {
  CoarPopconfirmDirective,
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarNoteComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-popconfirm',
  standalone: true,
  imports: [
    TitleCasePipe,
    CoarPopconfirmDirective,
    CoarButtonComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarNoteComponent,
  ],
  templateUrl: './popconfirm.page.html',
  styleUrl: './popconfirm.page.css',
})
export class PopconfirmPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-popconfirm.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-popconfirm.api.md';

  /** Demo state */
  itemDeleted = signal(false);
  actionLog = signal<string[]>([]);

  /** Placements */
  placements = ['top', 'bottom', 'left', 'right'] as const;

  /** Code examples */
  codeExamples = {
    basic: `<button coarButton
        [coarPopconfirm]="'Are you sure you want to delete this item?'"
        (confirmed)="onDelete()"
        (cancelled)="onCancel()">
  Delete Item
</button>`,

    withTitle: `<button coarButton
        variant="danger"
        coarPopconfirm="This action cannot be undone."
        popconfirmTitle="Delete permanently?"
        confirmText="Yes, delete"
        cancelText="Keep it"
        confirmVariant="danger"
        (confirmed)="onDelete()">
  Delete Forever
</button>`,

    placements: `<!-- Position the popconfirm relative to the trigger -->
<button coarButton coarPopconfirm="Confirm?" placement="top">Top</button>
<button coarButton coarPopconfirm="Confirm?" placement="bottom">Bottom</button>
<button coarButton coarPopconfirm="Confirm?" placement="left">Left</button>
<button coarButton coarPopconfirm="Confirm?" placement="right">Right</button>`,

    disabled: `<!-- Conditionally disable the popconfirm -->
<button coarButton
        coarPopconfirm="Delete this?"
        [popconfirmDisabled]="!canDelete"
        (confirmed)="onDelete()">
  Delete
</button>`,

    customButtons: `<button coarButton
        variant="secondary"
        coarPopconfirm="Discard unsaved changes?"
        confirmText="Discard"
        cancelText="Continue editing"
        confirmVariant="danger"
        (confirmed)="discardChanges()">
  Cancel
</button>`,
  };

  /** Handle confirm */
  onConfirm(action: string): void {
    this.actionLog.update((log) => [`✓ Confirmed: ${action}`, ...log.slice(0, 4)]);
    if (action === 'delete') {
      this.itemDeleted.set(true);
    }
  }

  /** Handle cancel */
  onCancel(action: string): void {
    this.actionLog.update((log) => [`✗ Cancelled: ${action}`, ...log.slice(0, 4)]);
  }

  /** Reset demo */
  resetDemo(): void {
    this.itemDeleted.set(false);
    this.actionLog.set([]);
  }
}
