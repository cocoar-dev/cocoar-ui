import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
} from '@angular/core';
import { Subject } from 'rxjs';

import { CoarToastContainerComponent, type InternalToast } from './coar-toast-container.component';
import { type CoarToastConfig, type CoarToastRef, type CoarToastPosition } from './coar-toast.types';

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 0;

@Injectable({ providedIn: 'root' })
export class CoarToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  private containerRef: ComponentRef<CoarToastContainerComponent> | null = null;
  private nextId = 0;

  success(message: string, config?: Partial<CoarToastConfig>): CoarToastRef {
    return this.show({ ...config, message, variant: 'success' });
  }

  error(message: string, config?: Partial<CoarToastConfig>): CoarToastRef {
    return this.show({ ...config, message, variant: 'error' });
  }

  warning(message: string, config?: Partial<CoarToastConfig>): CoarToastRef {
    return this.show({ ...config, message, variant: 'warning' });
  }

  info(message: string, config?: Partial<CoarToastConfig>): CoarToastRef {
    return this.show({ ...config, message, variant: 'info' });
  }

  show(config: CoarToastConfig): CoarToastRef {
    const container = this.getOrCreateContainer(config.position ?? 'top-right');
    const id = this.nextId++;
    const variant = config.variant ?? 'info';
    const duration = config.duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION);
    const afterDismissed$ = new Subject<void>();

    const internalToast: InternalToast = {
      id,
      variant,
      title: config.title ?? '',
      message: config.message,
      duration,
      dismissible: config.dismissible ?? true,
      showProgress: config.showProgress ?? true,
      action: config.action ?? null,
      onDismiss: () => {
        afterDismissed$.next();
        afterDismissed$.complete();
      },
    };

    container.instance.addToast(internalToast);
    container.instance.startAutoCloseForLatest();

    const ref: CoarToastRef = {
      dismiss: () => {
        container.instance.onDismissed(id);
      },
      afterDismissed$: afterDismissed$.asObservable(),
    };

    return ref;
  }

  dismissAll(): void {
    if (this.containerRef) {
      this.containerRef.instance.removeAll();
    }
  }

  private getOrCreateContainer(position: CoarToastPosition): ComponentRef<CoarToastContainerComponent> {
    if (!this.containerRef) {
      this.containerRef = createComponent(CoarToastContainerComponent, {
        environmentInjector: this.injector,
      });
      this.appRef.attachView(this.containerRef.hostView);
      document.body.appendChild(this.containerRef.location.nativeElement);
    }

    this.containerRef.instance.position.set(position);
    return this.containerRef;
  }
}
