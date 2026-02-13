import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CoarDividerComponent } from '@cocoar/ui/components';

/**
 * A reusable section component for showcase pages.
 * Provides consistent structure with title, description, content area, and automatic dividers.
 *
 * @example
 * <showcase-section title="Basic Usage" description="Simple text input with label.">
 *   <div class="example-demo">...</div>
 *   <coar-code-block [code]="example" />
 * </showcase-section>
 */
@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CoarDividerComponent],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseSectionComponent {
  /** Section title (h3 heading) */
  title = input.required<string>();

  /** Optional description text below the title */
  description = input<string>('');

  /** Whether to show a divider after this section */
  showDivider = input<boolean>(true);

  /** Whether this is the first section (removes top padding) */
  first = input<boolean>(false);

  /** Whether this is the last section (hides divider) */
  last = input<boolean>(false);
}
