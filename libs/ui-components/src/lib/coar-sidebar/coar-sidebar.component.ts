import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';

/**
 * CoarSidebar: A three-part layout component for navigation sidebars.
 *
 * Provides three distinct slots via content projection:
 * - **Header** (`[coar-sidebar-header]`): Fixed at top, for logo/title/branding
 * - **Content** (default slot): Scrollable area for navigation menu or other content
 * - **Footer** (`[coar-sidebar-footer]`): Fixed at bottom, for actions/settings/user info
 *
 * Responsibilities:
 * - Provide consistent sidebar layout structure
 * - Apply design tokens for width, spacing, colors
 * - Handle scrolling behavior (only content area scrolls)
 * - Support left/right positioning
 *
 * @example
 * ```html
 * <coar-sidebar>
 *   <div coar-sidebar-header>
 *     <h2>Navigation</h2>
 *   </div>
 *
 *   <coar-menu borderless>
 *     <coar-menu-item routerLink="/home" routerLinkActive="active">Home</coar-menu-item>
 *     <coar-menu-item routerLink="/about" routerLinkActive="active">About</coar-menu-item>
 *   </coar-menu>
 *
 *   <div coar-sidebar-footer>
 *     <button>Settings</button>
 *   </div>
 * </coar-sidebar>
 * ```
 */
@Component({
  selector: 'coar-sidebar',
  standalone: true,
  imports: [CoarScrollbarDirective],
  templateUrl: './coar-sidebar.component.html',
  styleUrl: './coar-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'coar-sidebar',
    '[class.coar-sidebar--collapsed]': 'collapsed()',
    '[class.coar-sidebar--position-right]': 'position() === "right"',
  },
})
export class CoarSidebarComponent {
  /**
   * Sidebar position: left or right side of screen.
   * Default is 'left'.
   */
  readonly position = input<'left' | 'right'>('left');

  /**
   * Collapsed state for narrow/icon-only sidebar.
   * Use as boolean attribute: `<coar-sidebar collapsed>` or `[collapsed]="true"`
   */
  readonly collapsed = input(false, { transform: booleanAttribute });
}
