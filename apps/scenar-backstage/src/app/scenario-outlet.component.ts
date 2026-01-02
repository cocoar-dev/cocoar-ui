import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EnvironmentInjector,
  Input,
  OnChanges,
  OnDestroy,
  Type,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';

import { ScenarErrorState } from './scenar-error-state';

@Component({
  selector: 'scenar-scenario-outlet',
  standalone: true,
  template: '<ng-container #container></ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarScenarioOutletComponent implements OnChanges, OnDestroy {
  private readonly errorState = inject(ScenarErrorState);

  @Input({ required: true }) component: Type<unknown> | null = null;
  @Input({ required: true }) environmentInjector!: EnvironmentInjector;
  @Input() inputs: Record<string, unknown> = {};

  @ViewChild('container', { read: ViewContainerRef, static: true })
  private readonly viewContainerRef!: ViewContainerRef;

  private componentRef: ComponentRef<unknown> | null = null;

  ngOnChanges(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }

  private render(): void {
    this.viewContainerRef.clear();
    this.componentRef?.destroy();
    this.componentRef = null;

    if (!this.component) return;

    try {
      this.errorState.clear();

      this.componentRef = this.viewContainerRef.createComponent(this.component, {
        environmentInjector: this.environmentInjector,
      });

      for (const [key, value] of Object.entries(this.inputs ?? {})) {
        this.componentRef.setInput(key, value);
      }

      this.componentRef.changeDetectorRef.detectChanges();
    } catch (err) {
      this.errorState.setError(err);
      this.viewContainerRef.clear();
      this.componentRef?.destroy();
      this.componentRef = null;
    }
  }
}
