import { Observable } from 'rxjs';

export type CoarDialogSize = 's' | 'm' | 'l';

export interface CoarDialogConfig<_TResult = unknown> {
  title?: string;
  size?: CoarDialogSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  panelClass?: string | string[];
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface CoarDialogRef<TResult = unknown> {
  close(result?: TResult): void;
  readonly afterClosed$: Observable<TResult | undefined>;
}

export interface CoarConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}
