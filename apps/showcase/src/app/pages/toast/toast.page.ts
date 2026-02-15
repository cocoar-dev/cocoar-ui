import { Component, inject, signal } from '@angular/core';

import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
  CoarToastService,
  type CoarToastPosition,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarNoteComponent,
  ],
  templateUrl: './toast.page.html',
  styleUrl: './toast.page.css',
})
export class ToastPage {
  private readonly toastService = inject(CoarToastService);

  importCode = `import { CoarToastService } from '@cocoar/ui/components';`;

  readonly position = signal<CoarToastPosition>('top-right');

  readonly positions: CoarToastPosition[] = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
  ];

  showSuccess(): void {
    this.toastService.success('Operation completed successfully.', {
      title: 'Success',
      position: this.position(),
    });
  }

  showError(): void {
    this.toastService.error('Something went wrong. Please try again.', {
      title: 'Error',
      position: this.position(),
    });
  }

  showWarning(): void {
    this.toastService.warning('Your session will expire in 5 minutes.', {
      title: 'Warning',
      position: this.position(),
    });
  }

  showInfo(): void {
    this.toastService.info('A new version is available.', {
      title: 'Info',
      position: this.position(),
    });
  }

  showNoTitle(): void {
    this.toastService.success('Settings saved successfully.', {
      position: this.position(),
    });
  }

  showPersistent(): void {
    this.toastService.error('This toast will not auto-dismiss. Close it manually.', {
      title: 'Persistent Error',
      duration: 0,
      position: this.position(),
    });
  }

  showCustomDuration(): void {
    this.toastService.info('This toast will disappear in 10 seconds.', {
      title: 'Custom Duration',
      duration: 10000,
      position: this.position(),
    });
  }

  showWithAction(): void {
    this.toastService.success('Item deleted.', {
      title: 'Deleted',
      position: this.position(),
      action: {
        label: 'Undo',
        callback: () => {
          this.toastService.info('Undo successful.', { position: this.position() });
        },
      },
    });
  }

  setPosition(pos: CoarToastPosition): void {
    this.position.set(pos);
  }

  dismissAll(): void {
    this.toastService.dismissAll();
  }

  codeExamples = {
    success: `this.toastService.success('Operation completed.', {
  title: 'Success',
});`,
    error: `this.toastService.error('Something went wrong.', {
  title: 'Error',
});`,
    action: `this.toastService.success('Item deleted.', {
  action: {
    label: 'Undo',
    callback: () => { /* undo logic */ },
  },
});`,
    persistent: `this.toastService.error('Manual dismiss required.', {
  duration: 0,
});`,
  };
}
