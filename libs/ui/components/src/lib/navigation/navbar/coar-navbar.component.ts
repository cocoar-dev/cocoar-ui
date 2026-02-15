import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'coar-navbar',
  standalone: true,
  templateUrl: './coar-navbar.component.html',
  styleUrl: './coar-navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'banner',
    'class': 'coar-navbar',
    '[class.coar-navbar--elevated]': 'elevated()',
    '[class.coar-navbar--bordered]': 'bordered()',
  },
})
export class CoarNavbarComponent {
  readonly elevated = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly bordered = input<boolean, unknown>(false, { transform: booleanAttribute });
}
