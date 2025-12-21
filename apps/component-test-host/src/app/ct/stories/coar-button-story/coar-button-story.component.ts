import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  ButtonSize,
  ButtonVariant,
  CoarButtonComponent,
  CoreIconName,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-ct-coar-button-story',
  standalone: true,
  imports: [CoarButtonComponent],
  templateUrl: './coar-button-story.component.html',
  styleUrl: './coar-button-story.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarButtonStoryComponent {
  label = input<string>('Button');

  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');

  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);

  ariaLabel = input<string>('');

  iconStart = input<CoreIconName | undefined>(undefined);
  iconEnd = input<CoreIconName | undefined>(undefined);
}
