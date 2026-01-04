import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  HostListener,
  inject,
} from '@angular/core';
import { CoarIconComponent } from '@cocoar/ui-components';
import { COAR_MENU_PARENT } from '@cocoar/ui-overlay';

/**
 * Event emitted when a menu item is clicked.
 * Provides control over menu closing behavior.
 */
export interface CoarMenuItemClickEvent {
  /** Call this to keep the menu open after clicking (prevents auto-close) */
  keepMenuOpen(): void;
  /** Original mouse event */
  event: MouseEvent;
}

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
 *
 * <!-- Prevent menu from closing on click: -->
 * <coar-menu-item (itemClick)="toggle($event)">Toggle Setting</coar-menu-item>
 *
 * toggle(event: CoarMenuItemClickEvent) {
 *   event.keepMenuOpen(); // Keep menu open
 *   this.setting = !this.setting;
 * }
 * ```
 */
@Component({
  selector: 'coar-menu-item',
  standalone: true,
  imports: [CoarIconComponent],
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
  private readonly parentOverlay = inject(COAR_MENU_PARENT, { optional: true });

  /** Item text content */
  readonly label = input<string>();

  /** Optional icon identifier (rendered via CoarIconComponent) */
  readonly icon = input<string | undefined>(undefined);

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  /** Emitted when user clicks/selects the item. Menu closes by default unless preventDefault() is called. */
  readonly itemClick = output<CoarMenuItemClickEvent>();

  /** Emitted when user hovers over item (for flyout trigger) */
  readonly itemHover = output<Event>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Always stop propagation to prevent overlay's outside-click handler
    event.stopPropagation();

    let shouldClose = true;

    const clickEvent: CoarMenuItemClickEvent = {
      event,
      keepMenuOpen: () => {
        shouldClose = false;
      },
    };

    this.itemClick.emit(clickEvent);

    // Close root overlay after Angular's change detection and OUTSIDE the hover area
    const parentOverlay = this.parentOverlay;
    if (shouldClose && parentOverlay) {
      setTimeout(() => {
        // Close the ROOT overlay to ensure the entire menu tree closes
        const root = parentOverlay.getRoot();
        root.close();
      }, 10);
    }
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

    let shouldClose = true;

    const clickEvent: CoarMenuItemClickEvent = {
      event: new MouseEvent('click'), // Synthetic event for keyboard
      keepMenuOpen: () => {
        shouldClose = false;
      },
    };

    this.itemClick.emit(clickEvent);

    const parentOverlay = this.parentOverlay;
    if (shouldClose && parentOverlay) {
      setTimeout(() => {
        // Close the ROOT overlay to ensure the entire menu tree closes
        const root = parentOverlay.getRoot();
        root.close();
      }, 10);
    }
  }
}
