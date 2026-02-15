import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export type CoarSpinnerSize = 'xs' | 's' | 'm' | 'l';

@Component({
  selector: 'coar-spinner',
  standalone: true,
  imports: [],
  templateUrl: './coar-spinner.component.html',
  styleUrl: './coar-spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[class.coar-spinner--xs]': 'size() === "xs"',
    '[class.coar-spinner--s]': 'size() === "s"',
    '[class.coar-spinner--m]': 'size() === "m"',
    '[class.coar-spinner--l]': 'size() === "l"',
    '[attr.aria-label]': 'label()',
  },
})
export class CoarSpinnerComponent {
  /** Spinner size */
  size = input<CoarSpinnerSize>('m');

  /** Accessible label */
  label = input<string>('Loading');
}
