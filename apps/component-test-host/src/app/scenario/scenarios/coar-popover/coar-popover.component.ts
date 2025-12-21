import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CoarButtonComponent, CoarPopoverComponent } from '@cocoar/ui-components';

@Component({
  selector: 'app-ct-coar-popover-scenario',
  standalone: true,
  imports: [CoarPopoverComponent, CoarButtonComponent],
  templateUrl: './coar-popover.component.html',
  styleUrl: './coar-popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarPopoverScenarioComponent {
  triggerLabel = input<string>('Open popover');
  content = input<string>('Popover content');

  disabled = input<boolean>(false);
  openOnHover = input<boolean>(false);
  openOnClick = input<boolean>(true);
  interactive = input<boolean>(true);
}
