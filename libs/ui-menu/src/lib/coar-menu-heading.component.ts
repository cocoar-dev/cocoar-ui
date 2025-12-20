import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * CoarMenuHeading: Non-interactive section label for menu groups.
 *
 * Responsibilities:
 * - Display section/group heading text
 * - Provide visual separation between menu sections
 * - Non-interactive (no hover, no click, not focusable)
 *
 * @example
 * ```html
 * <coar-menu>
 *   <coar-menu-heading>Foundations</coar-menu-heading>
 *   <coar-menu-item routerLink="/typography">Typography</coar-menu-item>
 *   <coar-menu-item routerLink="/colors">Colors</coar-menu-item>
 *
 *   <coar-menu-heading>Form Controls</coar-menu-heading>
 *   <coar-menu-item routerLink="/text-input">Text Input</coar-menu-item>
 * </coar-menu>
 * ```
 */
@Component({
  selector: 'coar-menu-heading',
  standalone: true,
  imports: [],
  template: `
    <div class="coar-menu-heading">
      @if (label()) {
      {{ label() }}
      } @else {
      <ng-content />
      }
    </div>
  `,
  styleUrl: './coar-menu-heading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'coar-menu-heading-host',
  },
})
export class CoarMenuHeadingComponent {
  /** Optional explicit label text (alternative to content projection) */
  readonly label = input<string>();
}
