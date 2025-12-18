import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * CoarMenu: Shell component providing menu styling container.
 *
 * Responsibilities:
 * - Apply consistent menu styling via CSS variables
 * - Provide semantic menu container (<menu> or <div role="menu">)
 * - No logic - just a styled wrapper
 *
 * Use standalone for inline menus, or as content in CoarOverlayService for context menus/flyouts.
 *
 * @example
 * ```html
 * <coar-menu>
 *   <coar-menu-item>Action 1</coar-menu-item>
 *   <coar-menu-item>Action 2</coar-menu-item>
 *   <coar-menu-divider></coar-menu-divider>
 *   <coar-menu-item>Action 3</coar-menu-item>
 * </coar-menu>
 * ```
 */
@Component({
  selector: 'coar-menu',
  standalone: true,
  imports: [],
  templateUrl: './coar-menu.component.html',
  styleUrl: './coar-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    class: 'coar-menu',
  },
})
export class CoarMenuComponent {}
