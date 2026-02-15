import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  ElementRef,
  input,
} from '@angular/core';
import { CoarBreadcrumbItemComponent } from './coar-breadcrumb-item.component';

@Component({
  selector: 'coar-breadcrumb',
  standalone: true,
  templateUrl: './coar-breadcrumb.component.html',
  styleUrl: './coar-breadcrumb.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'coar-breadcrumb',
  },
})
export class CoarBreadcrumbComponent {
  readonly separator = input<string>('/');
  readonly items = contentChildren(CoarBreadcrumbItemComponent, { read: ElementRef });

  constructor() {
    effect(() => {
      const sep = this.separator();
      const itemEls = this.items();
      itemEls.forEach((elRef) => {
        elRef.nativeElement.setAttribute('data-separator', sep);
      });
    });
  }
}
