import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'coar-breadcrumb-item',
  standalone: true,
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'coar-breadcrumb-item',
    '[class.coar-breadcrumb-item--active]': 'active()',
    '[attr.aria-current]': 'active() ? "page" : null',
  },
})
export class CoarBreadcrumbItemComponent {
  readonly active = input<boolean, unknown>(false, { transform: booleanAttribute });
}
