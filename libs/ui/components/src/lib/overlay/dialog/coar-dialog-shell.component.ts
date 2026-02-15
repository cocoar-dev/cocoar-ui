import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  Type,
  inject,
  input,
} from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';

import { COAR_OVERLAY_REF } from '@cocoar/ui/overlay';
import { CoarButtonComponent } from '../../display/button/coar-button.component';
import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { type CoarDialogSize } from './coar-dialog.types';

@Component({
  selector: 'coar-dialog-shell',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet, CoarButtonComponent, CoarIconComponent],
  templateUrl: './coar-dialog-shell.component.html',
  styleUrl: './coar-dialog-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarDialogShellComponent {
  private readonly overlayRef = inject(COAR_OVERLAY_REF);

  readonly dialogTitle = input<string>('');
  readonly dialogSize = input<CoarDialogSize>('m');
  readonly showCloseButton = input<boolean>(true);

  readonly contentComponent = input<Type<unknown> | null>(null);
  readonly contentTemplate = input<TemplateRef<unknown> | null>(null);
  readonly contentContext = input<unknown>(null);
  readonly componentInputs = input<Record<string, unknown>>({});

  readonly confirmMode = input<boolean>(false);
  readonly confirmMessage = input<string>('');
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly confirmVariant = input<string>('primary');

  protected onClose(): void {
    this.overlayRef.close();
  }

  protected onConfirm(): void {
    this.overlayRef.close(true);
  }

  protected onCancel(): void {
    this.overlayRef.close(false);
  }
}
