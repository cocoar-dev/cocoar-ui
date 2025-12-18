import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * CoarMenuDivider: Visual separator between menu items.
 *
 * Simple horizontal line for grouping menu items.
 *
 * @example
 * ```html
 * <coar-menu>
 *   <coar-menu-item>Cut</coar-menu-item>
 *   <coar-menu-item>Copy</coar-menu-item>
 *   <coar-menu-divider></coar-menu-divider>
 *   <coar-menu-item>Paste</coar-menu-item>
 * </coar-menu>
 * ```
 */
@Component({
  selector: 'coar-menu-divider',
  standalone: true,
  imports: [],
  template: '',
  styleUrl: './coar-menu-divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    class: 'coar-menu-divider',
  },
})
export class CoarMenuDividerComponent {}
