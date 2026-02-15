import { Injectable, TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

import {
  createOverlayBuilder,
  coarModalPreset,
  type OverlayRef,
  CoarOverlayOpenBuilder,
} from '@cocoar/ui/overlay';

import { CoarDialogShellComponent } from './coar-dialog-shell.component';
import {
  type CoarDialogConfig,
  type CoarDialogRef,
  type CoarConfirmOptions,
} from './coar-dialog.types';

function wrapOverlayRef<TResult>(overlayRef: OverlayRef): CoarDialogRef<TResult> {
  return {
    close(result?: TResult): void {
      overlayRef.close(result);
    },
    get afterClosed$(): Observable<TResult | undefined> {
      return overlayRef.afterClosed$ as Observable<TResult | undefined>;
    },
  };
}

@Injectable({ providedIn: 'root' })
export class CoarDialogService {
  private readonly overlayBuilder: CoarOverlayOpenBuilder;

  constructor() {
    this.overlayBuilder = createOverlayBuilder(coarModalPreset);
  }

  openComponent<C, TResult = unknown>(
    component: Type<C>,
    config: CoarDialogConfig<TResult> = {},
    inputs?: Record<string, unknown>
  ): CoarDialogRef<TResult> {
    const builder = this.buildDialogOverlay(config);

    const overlayRef = builder
      .fromComponent(CoarDialogShellComponent)
      .open({
        dialogTitle: config.title ?? '',
        dialogSize: config.size ?? 'm',
        showCloseButton: config.showCloseButton ?? true,
        contentComponent: component,
        contentTemplate: null,
        contentContext: null,
        componentInputs: inputs ?? {},
        confirmMode: false,
        confirmMessage: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        confirmVariant: 'primary',
      });

    return wrapOverlayRef<TResult>(overlayRef);
  }

  openTemplate<TCtx, TResult = unknown>(
    template: TemplateRef<TCtx>,
    config: CoarDialogConfig<TResult> = {},
    context?: TCtx
  ): CoarDialogRef<TResult> {
    const builder = this.buildDialogOverlay(config);

    const overlayRef = builder
      .fromComponent(CoarDialogShellComponent)
      .open({
        dialogTitle: config.title ?? '',
        dialogSize: config.size ?? 'm',
        showCloseButton: config.showCloseButton ?? true,
        contentComponent: null,
        contentTemplate: template,
        contentContext: context ?? null,
        componentInputs: {},
        confirmMode: false,
        confirmMessage: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        confirmVariant: 'primary',
      });

    return wrapOverlayRef<TResult>(overlayRef);
  }

  confirm(options: CoarConfirmOptions): CoarDialogRef<boolean> {
    const config: CoarDialogConfig<boolean> = {
      title: options.title,
      size: 's',
      closeOnBackdropClick: true,
      closeOnEscape: true,
      showCloseButton: false,
    };

    const builder = this.buildDialogOverlay(config);

    const overlayRef = builder
      .fromComponent(CoarDialogShellComponent)
      .open({
        dialogTitle: options.title,
        dialogSize: 's',
        showCloseButton: false,
        contentComponent: null,
        contentTemplate: null,
        contentContext: null,
        componentInputs: {},
        confirmMode: true,
        confirmMessage: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        confirmVariant: options.confirmVariant ?? 'primary',
      });

    return wrapOverlayRef<boolean>(overlayRef);
  }

  private buildDialogOverlay<TResult>(config: CoarDialogConfig<TResult>): CoarOverlayOpenBuilder {
    let builder = this.overlayBuilder.fork();

    builder = builder.dismiss({
      outsideClick: config.closeOnBackdropClick ?? true,
      escapeKey: config.closeOnEscape ?? true,
    });

    if (config.ariaLabel || config.ariaDescribedBy) {
      builder = builder.a11y({
        role: 'dialog',
        label: config.ariaLabel,
        describedBy: config.ariaDescribedBy,
      });
    }

    if (config.panelClass) {
      builder = builder.panelClass(config.panelClass);
    }

    return builder;
  }
}
