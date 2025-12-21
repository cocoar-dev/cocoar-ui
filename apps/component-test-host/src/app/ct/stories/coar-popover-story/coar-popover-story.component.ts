import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CoarButtonComponent, CoarPopoverComponent } from '@cocoar/ui-components';

@Component({
  selector: 'app-ct-coar-popover-story',
  standalone: true,
  imports: [CoarPopoverComponent, CoarButtonComponent],
  templateUrl: './coar-popover-story.component.html',
  styleUrl: './coar-popover-story.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarPopoverStoryComponent {
  triggerLabel = input<string>('Open popover');
  content = input<string>('Popover content');

  disabled = input<boolean>(false);
  openOnHover = input<boolean>(false);
  openOnClick = input<boolean>(true);
  interactive = input<boolean>(true);
}
