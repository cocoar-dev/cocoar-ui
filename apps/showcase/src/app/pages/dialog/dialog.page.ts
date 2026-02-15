import { Component, inject, TemplateRef, viewChild } from '@angular/core';

import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDialogService,
  type CoarDialogSize,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-dialog-demo-content',
  standalone: true,
  template: `
    <div style="padding: var(--coar-spacing-s) 0;">
      <p style="font: var(--coar-body-m); color: var(--coar-text-neutral-primary); margin: 0;">
        This is a component rendered inside the dialog.
      </p>
    </div>
  `,
})
class DialogDemoContentComponent {}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CoarButtonComponent, CoarCardComponent, CoarCodeBlockComponent],
  templateUrl: './dialog.page.html',
  styleUrl: './dialog.page.css',
  exportAs: 'dialogPage',
})
export class DialogPage {
  private readonly dialogService = inject(CoarDialogService);
  private readonly templateDialogRef = viewChild<TemplateRef<unknown>>('templateContent');

  importCode = `import { CoarDialogService } from '@cocoar/ui/components';`;

  lastConfirmResult = '';

  openBasicDialog(): void {
    this.dialogService.openComponent(DialogDemoContentComponent, {
      title: 'Basic Dialog',
      size: 'm',
    });
  }

  openComponentDialog(): void {
    this.dialogService.openComponent(DialogDemoContentComponent, {
      title: 'Component Dialog',
      size: 'm',
    });
  }

  openTemplateDialog(): void {
    const tpl = this.templateDialogRef();
    if (tpl) {
      this.dialogService.openTemplate(tpl, {
        title: 'Template Dialog',
        size: 'm',
      });
    }
  }

  openConfirmDialog(): void {
    const ref = this.dialogService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });

    ref.afterClosed$.subscribe((result) => {
      this.lastConfirmResult = result ? 'Confirmed' : 'Cancelled';
    });
  }

  openSizeDialog(size: CoarDialogSize): void {
    this.dialogService.openComponent(DialogDemoContentComponent, {
      title: `Size: ${size}`,
      size,
    });
  }

  codeExamples = {
    basic: `const ref = this.dialogService.openComponent(MyComponent, {
  title: 'Basic Dialog',
  size: 'm',
});`,
    confirm: `const ref = this.dialogService.confirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  confirmText: 'Delete',
  confirmVariant: 'danger',
});

ref.afterClosed$.subscribe(result => {
  if (result) { /* confirmed */ }
});`,
    template: `this.dialogService.openTemplate(templateRef, {
  title: 'Template Dialog',
  size: 'm',
});`,
  };
}
