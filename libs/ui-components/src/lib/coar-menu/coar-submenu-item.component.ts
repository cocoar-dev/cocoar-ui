import {
  Component,
  ChangeDetectionStrategy,
  input,
  ViewChild,
  TemplateRef,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarMenuComponent } from './coar-menu.component';
import { type CoreIconName } from '../coar-icon/core-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CoarOverlayService,
  coarHoverMenuPreset,
  Overlay,
  COAR_MENU_PARENT,
} from '@cocoar/ui-overlay';
import { COAR_MENU_CASCADE, CoarMenuCascade } from './coar-menu-cascade';

/**
 * CoarSubmenuItem: Menu item that opens a submenu on hover.
 *
 * Responsibilities:
 * - Render parent item with icon and label
 * - Manage submenu overlay lifecycle
 * - Handle hover delays (300ms before closing)
 * - Support nested submenus (can contain other submenu-items)
 *
 * @example
 * ```html
 * <coar-submenu-item label="Share" icon="🔗">
 *   <coar-menu-item icon="✉️" (itemClick)="sendEmail()">Email</coar-menu-item>
 *   <coar-menu-item icon="🔗" (itemClick)="copyLink()">Copy Link</coar-menu-item>
 * </coar-submenu-item>
 * ```
 */
@Component({
  selector: 'coar-submenu-item',
  standalone: true,
  imports: [CommonModule, CoarIconComponent],
  template: `
    <div
      class="coar-submenu-item"
      [class.coar-submenu-item--disabled]="disabled()"
      [class.coar-submenu-item--open]="isOpen"
      [attr.role]="'menuitem'"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="isOpen"
      [attr.aria-disabled]="disabled()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (mouseenter)="onMouseEnter($event)"
      (click)="onClick($event)"
      (keydown.enter)="onKeyboardActivate($event)"
      (keydown.space)="onKeyboardActivate($event)"
    >
      @if (icon()) {
      <coar-icon [name]="icon()!" size="sm" class="coar-submenu-item__icon" aria-hidden="true" />
      }
      <span class="coar-submenu-item__label">{{ label() }}</span>
      <coar-icon
        name="chevron-right"
        size="xs"
        class="coar-submenu-item__arrow"
        aria-hidden="true"
      />
    </div>

    <ng-template #submenuTemplate>
      <ng-content />
    </ng-template>
  `,
  styleUrl: './coar-submenu-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: COAR_MENU_CASCADE,
      useFactory: () =>
        new CoarMenuCascade(inject(COAR_MENU_CASCADE, { optional: true, skipSelf: true })),
    },
  ],
})
export class CoarSubmenuItemComponent {
  private readonly overlayService = inject(CoarOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cascade = inject(COAR_MENU_CASCADE);
  private readonly parentOverlay = inject(COAR_MENU_PARENT, { optional: true });

  constructor() {
    console.log('[CoarSubmenuItemComponent] Created with parentOverlay:', this.parentOverlay);
    // Cleanup cascade when component is destroyed
    this.destroyRef.onDestroy(() => {
      this.cascade.destroy();
    });

    // Kept for compatibility with older patterns; now hover dismissal is handled by ui-overlay.
    this.cascade.registerCancelCloseTimer(() => void 0);
  }

  /** Label text for the menu item */
  readonly label = input.required<string>();

  /** Optional icon identifier */
  readonly icon = input<CoreIconName | undefined>(undefined);

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  @ViewChild('submenuTemplate') submenuTemplate!: TemplateRef<unknown>;

  private submenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  isOpen = false;

  onMouseEnter(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    console.log('[CoarSubmenuItem] onMouseEnter:', this.label(), {
      alreadyOpen: !!this.submenuRef,
      target: event.target,
      currentTarget: event.currentTarget,
    });

    // Open submenu if not already open
    if (!this.submenuRef) {
      this.openSubmenu(event.currentTarget as HTMLElement);
    }
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // For accessibility: toggle on click/Enter/Space
    if (this.submenuRef) {
      this.closeSubmenu();
    } else {
      this.openSubmenu(event.currentTarget as HTMLElement);
    }
  }

  onKeyboardActivate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.currentTarget as HTMLElement;
    if (this.submenuRef) {
      this.closeSubmenu();
    } else {
      this.openSubmenu(target);
    }
  }

  private openSubmenu(anchorElement: HTMLElement): void {
    console.log('[CoarSubmenuItem] Opening submenu:', this.label(), {
      hasParentOverlay: !!this.parentOverlay,
      anchorElement,
      anchorConnected: anchorElement.isConnected,
    });

    // All overlays use hoverTree preset for proper tree tracking
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.submenuTemplate));
      b.anchor({ kind: 'element', element: anchorElement });
      b.position({ placement: 'right-start', offset: -4, flip: true });
    }, coarHoverMenuPreset);

    if (this.parentOverlay) {
      // Inside an overlay: close siblings (direct children of parent) then open as child
      console.log('[CoarSubmenuItem] Closing parent children before opening:', this.label());

      // First, create the child overlay
      this.submenuRef = this.overlayService.openChild(this.parentOverlay, spec, undefined);

      // Then close siblings, excluding the newly opened one
      this.parentOverlay.closeChildren(this.submenuRef);

      console.log(
        '[CoarSubmenuItem] Anchor still connected after closeChildren?',
        anchorElement.isConnected
      );
    } else {
      // Inline menu: use cascade-level sibling closure
      console.log('[CoarSubmenuItem] Using cascade closeSiblings:', this.label());
      this.cascade.closeSiblings();
      this.submenuRef = this.overlayService.open(spec, undefined);
    }

    console.log('[CoarSubmenuItem] Submenu opened:', this.label(), this.submenuRef);

    // Expose the overlay ref to descendants so they can parent their own flyouts correctly.
    this.cascade.overlayRef = this.submenuRef;

    this.isOpen = true;

    const openedRef = this.submenuRef;

    openedRef.afterClosed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.cascade.overlayRef === openedRef) {
        this.cascade.overlayRef = null;
      }

      this.submenuRef = null;
      this.isOpen = false;
    });
  }

  // Parent overlay is resolved via COAR_OVERLAY_REF when rendered inside an overlay.

  private closeSubmenu(): void {
    this.submenuRef?.close();
    this.submenuRef = null;
    this.isOpen = false;
  }
}
