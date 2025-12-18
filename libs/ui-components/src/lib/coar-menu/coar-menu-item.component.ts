import { Component, ChangeDetectionStrategy, input, output, HostListener } from '@angular/core';

/**
 * CoarMenuItem: Individual menu item with optional icon and submenu support.
 *
 * Responsibilities:
 * - Render item text and optional icon
 * - Handle click events
 * - Support disabled state
 * - Visual states: hover, active, focus
 * - Trigger submenu (accordion or flyout via parent menu logic)
 *
 * Does NOT manage overlay directly - parent menu handles flyout logic.
 *
 * @example
 * ```html
 * <coar-menu-item (itemClick)="onSave()">Save</coar-menu-item>
 * <coar-menu-item icon="copy">Copy</coar-menu-item>
 * <coar-menu-item [disabled]="true">Unavailable</coar-menu-item>
 * ```
 */
@Component({
  selector: 'coar-menu-item',
  standalone: true,
  imports: [],
  templateUrl: './coar-menu-item.component.html',
  styleUrl: './coar-menu-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menuitem',
    class: 'coar-menu-item',
    '[class.coar-menu-item--disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
  },
})
export class CoarMenuItemComponent {
  /** Item text content */
  readonly label = input<string>();

  /** Optional icon identifier (to be rendered via icon component) */
  readonly icon = input<string>();

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  /** Emitted when user clicks/selects the item */
  readonly itemClick = output<void>();

  /** Emitted when user hovers over item (for flyout trigger) */
  readonly itemHover = output<Event>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.itemClick.emit();
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (!this.disabled()) {
      this.itemHover.emit(event);
    }
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  onKeyboardActivate(): void {
    if (this.disabled()) {
      return;
    }
    this.itemClick.emit();
  }
}
