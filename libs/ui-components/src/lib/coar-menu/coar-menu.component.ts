import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { COAR_MENU_CASCADE, CoarMenuCascade } from './coar-menu-cascade';
import { COAR_OVERLAY_REF } from '@cocoar/ui-overlay';
import { CoarMenuAimConfigDirective } from './coar-menu-aim-config.directive';

/**
 * CoarMenu: Shell component providing menu styling container.
 *
 * Responsibilities:
 * - Apply consistent menu styling via CSS variables
 * - Provide semantic menu container (<menu> or <div role="menu">)
 * - Provide root cascade for sibling submenu tracking
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
  hostDirectives: [
    {
      directive: CoarMenuAimConfigDirective,
      inputs: ['aimEnabled', 'aimDebugEnabled', 'aimSwitchDelayMs', 'aimSampleMaxAgeMs'],
    },
  ],
  templateUrl: './coar-menu.component.html',
  styleUrl: './coar-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    class: 'coar-menu',
    '[style.--coar-menu-icon-slot-display]': 'showIconColumn() ? null : "none"',
    '[style.--coar-menu-item-icon-slot-size]': 'showIconColumn() ? null : "0px"',
  },
  providers: [
    {
      provide: COAR_MENU_CASCADE,
      useFactory: () => {
        // Check if we're inside an overlay
        const inOverlay = inject(COAR_OVERLAY_REF, { optional: true });
        const parentCascade = inject(COAR_MENU_CASCADE, { optional: true, skipSelf: true });

        if (inOverlay && parentCascade) {
          // We're a menu inside a submenu overlay
          // Create a new cascade as a child of the parent, so sibling submenu-items
          // at this level can track each other
          return new CoarMenuCascade(parentCascade);
        }

        // For root menus (inline or context menu), create a new root cascade
        return new CoarMenuCascade(parentCascade);
      },
    },
  ],
})
export class CoarMenuComponent {
  /**
   * Controls whether the menu reserves and renders an icon column.
   *
   * Default is enabled to avoid layout shift for stateful icons (e.g. checkmarks).
   * Set to false for text-only menus (icons will not render).
   */
  readonly showIconColumn = input(true);
}
