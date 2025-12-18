import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { COAR_MENU_CASCADE, CoarMenuCascade } from './coar-menu-cascade';
import { COAR_OVERLAY_REF } from '@cocoar/ui-overlay';

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
  templateUrl: './coar-menu.component.html',
  styleUrl: './coar-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    class: 'coar-menu',
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
export class CoarMenuComponent {}
