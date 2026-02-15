import { Observable } from 'rxjs';

export type CoarToastVariant = 'success' | 'error' | 'warning' | 'info';
export type CoarToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface CoarToastConfig {
  variant?: CoarToastVariant;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  position?: CoarToastPosition;
  showProgress?: boolean;
  action?: { label: string; callback: () => void };
}

export interface CoarToastRef {
  dismiss(): void;
  readonly afterDismissed$: Observable<void>;
}
